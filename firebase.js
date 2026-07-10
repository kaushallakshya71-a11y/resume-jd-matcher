// ============================================================
// db.js (was firebase.js) — 100% Free Local Database
// Uses IndexedDB (via localStorage fallback) — no account,
// no sign-in, no internet required, no billing ever.
// ============================================================

const FirebaseDB = (function () {

    const DB_NAME    = 'resumematch_ai';
    const DB_VERSION = 1;
    const STORES     = { match: 'matchHistory', risk: 'riskHistory', stats: 'stats' };
    const MAX_ITEMS  = 50; // max history items to keep per type

    let _db = null; // IndexedDB instance

    // =========================================================
    // OPEN IndexedDB
    // =========================================================
    function _openDB() {
        return new Promise((resolve, reject) => {
            if (_db) { resolve(_db); return; }

            const req = indexedDB.open(DB_NAME, DB_VERSION);

            req.onupgradeneeded = e => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(STORES.match)) {
                    const ms = db.createObjectStore(STORES.match, { keyPath: 'id', autoIncrement: true });
                    ms.createIndex('createdAt', 'createdAt', { unique: false });
                }
                if (!db.objectStoreNames.contains(STORES.risk)) {
                    const rs = db.createObjectStore(STORES.risk, { keyPath: 'id', autoIncrement: true });
                    rs.createIndex('createdAt', 'createdAt', { unique: false });
                }
                if (!db.objectStoreNames.contains(STORES.stats)) {
                    db.createObjectStore(STORES.stats, { keyPath: 'key' });
                }
            };

            req.onsuccess = e => { _db = e.target.result; resolve(_db); };
            req.onerror   = e => reject(e.target.error);
        });
    }

    // =========================================================
    // GENERIC HELPERS
    // =========================================================
    async function _add(storeName, data) {
        const db  = await _openDB();
        return new Promise((resolve, reject) => {
            const tx  = db.transaction(storeName, 'readwrite');
            const req = tx.objectStore(storeName).add(data);
            req.onsuccess = () => resolve(req.result);
            req.onerror   = e => reject(e.target.error);
        });
    }

    async function _getAll(storeName) {
        const db  = await _openDB();
        return new Promise((resolve, reject) => {
            const tx  = db.transaction(storeName, 'readonly');
            const req = tx.objectStore(storeName).getAll();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror   = e => reject(e.target.error);
        });
    }

    async function _delete(storeName, id) {
        const db  = await _openDB();
        return new Promise((resolve, reject) => {
            const tx  = db.transaction(storeName, 'readwrite');
            const req = tx.objectStore(storeName).delete(id);
            req.onsuccess = () => resolve();
            req.onerror   = e => reject(e.target.error);
        });
    }

    async function _getStats() {
        const db  = await _openDB();
        return new Promise((resolve, reject) => {
            const tx  = db.transaction(STORES.stats, 'readonly');
            const req = tx.objectStore(STORES.stats).get('main');
            req.onsuccess = () => resolve(req.result || { key: 'main' });
            req.onerror   = e => reject(e.target.error);
        });
    }

    async function _putStats(data) {
        const db  = await _openDB();
        return new Promise((resolve, reject) => {
            const tx  = db.transaction(STORES.stats, 'readwrite');
            const req = tx.objectStore(STORES.stats).put({ key: 'main', ...data });
            req.onsuccess = () => resolve();
            req.onerror   = e => reject(e.target.error);
        });
    }

    // =========================================================
    // TRIM old records to keep storage lean
    // =========================================================
    async function _trim(storeName) {
        const all = await _getAll(storeName);
        if (all.length > MAX_ITEMS) {
            // Sort oldest first; delete oldest
            all.sort((a, b) => a.createdAt - b.createdAt);
            const toDelete = all.slice(0, all.length - MAX_ITEMS);
            for (const item of toDelete) await _delete(storeName, item.id);
        }
    }

    // =========================================================
    // INIT — just render the widget, no auth needed
    // =========================================================
    function init() {
        _openDB().catch(e => console.warn('[LocalDB] IndexedDB unavailable, using fallback:', e));
        _renderWidget();
        loadHistory();
    }

    // =========================================================
    // SAVE — Match Analysis
    // =========================================================
    async function saveMatchAnalysis(result, resumeText, jdText) {
        try {
            const doc = {
                score:             result.score || 0,
                verdict:           result.verdict || '',
                verdictClass:      result.verdictClass || '',
                missingSkills:     (result.missingSkills  || []).slice(0, 8),
                strongMatches:     (result.strongMatches  || []).slice(0, 8),
                targetRole:        result.options?.targetRole || '',
                atsPassProbability:result.atsAnalysis?.passProbability || 0,
                atsPassLabel:      result.atsAnalysis?.passLabel || '',
                resumeSnippet:     (resumeText || '').substring(0, 2000),
                jdSnippet:         (jdText     || '').substring(0, 2000),
                createdAt:         Date.now()
            };

            await _add(STORES.match, doc);
            await _trim(STORES.match);
            await _updateStats('match', result.score || 0, result.missingSkills || []);
            await loadHistory();

            if (window.showToast) window.showToast('Saved to local history! 📚', 'success');
        } catch (e) {
            console.error('[LocalDB] Save match error:', e);
        }
    }

    // =========================================================
    // SAVE — Career Risk Analysis
    // =========================================================
    async function saveRiskAnalysis(result, inputs) {
        try {
            const doc = {
                overallScore:      result.overallScore || 0,
                riskCategory:      result.riskCategory || '',
                currentRole:       inputs.currentRole  || '',
                yearsOfExperience: inputs.yearsOfExperience || 0,
                salaryGrowth:      result.salaryGrowth  || '',
                automationRisk:    result.automationRisk || 0,
                topRiskFactors:    (result.topRiskFactors || []).slice(0, 3)
                                       .map(f => ({ label: f.label, detail: f.detail })),
                projection:        result.projection || '',
                createdAt:         Date.now()
            };

            await _add(STORES.risk, doc);
            await _trim(STORES.risk);
            await _updateStats('risk', null, []);
            await loadHistory();

            if (window.showToast) window.showToast('Risk analysis saved! 📚', 'success');
        } catch (e) {
            console.error('[LocalDB] Save risk error:', e);
        }
    }

    // =========================================================
    // UPDATE AGGREGATE STATS
    // =========================================================
    async function _updateStats(type, score, missingSkills) {
        try {
            const s = await _getStats();

            if (type === 'match') {
                const prevTotal = s.totalMatchAnalyses || 0;
                const prevAvg   = s.avgMatchScore     || 0;
                s.totalMatchAnalyses = prevTotal + 1;
                s.avgMatchScore = Math.round((prevAvg * prevTotal + score) / (prevTotal + 1));

                const prev   = s.topMissingSkills || [];
                const merged = [...new Set([
                    ...missingSkills.map(x => x.toLowerCase()),
                    ...prev
                ])].slice(0, 10);
                s.topMissingSkills = merged;
            } else {
                s.totalRiskAnalyses = (s.totalRiskAnalyses || 0) + 1;
            }

            s.lastActive = Date.now();
            await _putStats(s);
        } catch (e) {
            console.error('[LocalDB] Stats error:', e);
        }
    }

    // =========================================================
    // LOAD HISTORY → render panel
    // =========================================================
    async function loadHistory() {
        try {
            const [allMatch, allRisk, stats] = await Promise.all([
                _getAll(STORES.match),
                _getAll(STORES.risk),
                _getStats()
            ]);

            // Sort newest first, cap at 15 for display
            const matchHistory = allMatch.sort((a, b) => b.createdAt - a.createdAt).slice(0, 15);
            const riskHistory  = allRisk.sort((a, b)  => b.createdAt - a.createdAt).slice(0, 15);

            _renderHistoryPanel(matchHistory, riskHistory, stats);
        } catch (e) {
            console.error('[LocalDB] Load history error:', e);
        }
    }

    // =========================================================
    // RENDER — Header widget (no login needed)
    // =========================================================
    function _renderWidget() {
        const widget = document.getElementById('auth-widget');
        if (!widget) return;

        widget.innerHTML = `
            <button class="auth-history-btn" id="auth-history-toggle" title="View Your Saved History">
                📚 <span class="auth-history-label">History</span>
            </button>
        `;
        document.getElementById('auth-history-toggle')
            ?.addEventListener('click', _toggleHistoryPanel);
    }

    // =========================================================
    // RENDER — History Sidebar
    // =========================================================
    function _toggleHistoryPanel() {
        const panel   = document.getElementById('history-sidebar');
        const overlay = document.getElementById('history-overlay');
        if (!panel) return;
        const isOpen = panel.classList.toggle('open');
        overlay?.classList.toggle('open', isOpen);
    }

    function _renderHistoryPanel(matchHistory, riskHistory, stats) {
        const panel = document.getElementById('history-sidebar');
        if (!panel) return;

        const totalMatch = stats.totalMatchAnalyses || 0;
        const totalRisk  = stats.totalRiskAnalyses  || 0;
        const avgScore   = stats.avgMatchScore       || 0;
        const topGaps    = (stats.topMissingSkills   || []).slice(0, 6);

        function scoreColor(s) {
            return s >= 70 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444';
        }

        function formatDate(ts) {
            if (!ts) return '';
            try {
                return new Date(ts).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                });
            } catch { return ''; }
        }

        const matchItems = matchHistory.length === 0
            ? '<div class="history-empty">No match analyses yet.<br>Run your first analysis to see it here!</div>'
            : matchHistory.map(item => `
                <div class="history-item"
                     data-resume="${encodeURIComponent(item.resumeSnippet || '')}"
                     data-jd="${encodeURIComponent(item.jdSnippet || '')}">
                    <div class="history-item-header">
                        <span class="history-score-badge"
                              style="background:${scoreColor(item.score)}22;
                                     color:${scoreColor(item.score)};
                                     border:1px solid ${scoreColor(item.score)}44">
                            ${item.score}%
                        </span>
                        <span class="history-verdict">${item.verdict || 'Analysis'}</span>
                    </div>
                    ${item.targetRole ? `<div class="history-role-tag">🎯 ${item.targetRole}</div>` : ''}
                    <div class="history-item-meta">
                        <span>📅 ${formatDate(item.createdAt)}</span>
                        ${item.atsPassProbability ? `<span>🤖 ATS: ${item.atsPassProbability}%</span>` : ''}
                    </div>
                    ${item.missingSkills?.length > 0 ? `
                    <div class="history-skill-chips">
                        ${item.missingSkills.slice(0, 4).map(s => `<span class="history-skill-chip">+ ${s}</span>`).join('')}
                    </div>` : ''}
                    <button class="history-restore-btn"
                            onclick="window.FirebaseDB.restoreMatchInputs(this)">
                        ↩ Restore Inputs
                    </button>
                </div>
            `).join('');

        const riskItems = riskHistory.length === 0
            ? '<div class="history-empty">No risk analyses yet.<br>Try the Career Risk IQ tool!</div>'
            : riskHistory.map(item => {
                const rColor = item.riskCategory === 'Safe Zone'    ? '#10b981'
                             : item.riskCategory === 'Warning Zone' ? '#f59e0b' : '#ef4444';
                const rIcon  = item.riskCategory === 'Safe Zone'    ? '✅'
                             : item.riskCategory === 'Warning Zone' ? '⚠️' : '🚨';
                return `
                    <div class="history-item">
                        <div class="history-item-header">
                            <span class="history-score-badge"
                                  style="background:${rColor}22;color:${rColor};border:1px solid ${rColor}44">
                                ${item.overallScore}%
                            </span>
                            <span class="history-verdict">${rIcon} ${item.riskCategory || ''}</span>
                        </div>
                        ${item.currentRole ? `<div class="history-role-tag">👤 ${item.currentRole}${item.yearsOfExperience ? ` (${item.yearsOfExperience}y)` : ''}</div>` : ''}
                        <div class="history-item-meta">
                            <span>📅 ${formatDate(item.createdAt)}</span>
                            <span>🤖 ${item.automationRisk}% auto risk</span>
                        </div>
                        <div class="history-item-meta">
                            <span>💰 Salary: ${item.salaryGrowth || 'N/A'}</span>
                        </div>
                    </div>
                `;
            }).join('');

        panel.innerHTML = `
            <div class="history-panel-header">
                <div class="history-panel-title">📚 Your History</div>
                <button class="history-close-btn" id="history-close-btn">✕</button>
            </div>

            <!-- Stats Bar -->
            <div class="history-stats-bar">
                <div class="history-stat">
                    <div class="history-stat-num">${totalMatch + totalRisk}</div>
                    <div class="history-stat-label">Total Saved</div>
                </div>
                <div class="history-stat">
                    <div class="history-stat-num"
                         style="color:${scoreColor(avgScore)}">
                        ${avgScore > 0 ? avgScore + '%' : '—'}
                    </div>
                    <div class="history-stat-label">Avg Score</div>
                </div>
                <div class="history-stat">
                    <div class="history-stat-num">${totalRisk}</div>
                    <div class="history-stat-label">Risk Checks</div>
                </div>
            </div>

            ${topGaps.length > 0 ? `
            <div class="history-top-gaps">
                <div class="history-top-gaps-label">🔥 Your Most Common Skill Gaps</div>
                <div class="history-skill-chips">
                    ${topGaps.map(s => `<span class="history-skill-chip">${s}</span>`).join('')}
                </div>
            </div>` : ''}

            <!-- Tab Switcher -->
            <div class="history-tabs">
                <button class="history-tab active" id="htab-match"
                        onclick="window.FirebaseDB.switchHistoryTab('match')">
                    📄 Match (${matchHistory.length})
                </button>
                <button class="history-tab" id="htab-risk"
                        onclick="window.FirebaseDB.switchHistoryTab('risk')">
                    ⚠️ Risk (${riskHistory.length})
                </button>
            </div>

            <div id="history-match-list" class="history-list">${matchItems}</div>
            <div id="history-risk-list" class="history-list hidden">${riskItems}</div>

            <!-- Storage note -->
            <div class="history-local-note">
                🔒 Stored locally on this device · No account needed · 100% free
            </div>
        `;

        document.getElementById('history-close-btn')?.addEventListener('click', () => {
            panel.classList.remove('open');
            document.getElementById('history-overlay')?.classList.remove('open');
        });
    }

    // =========================================================
    // PUBLIC — Switch tab
    // =========================================================
    function switchHistoryTab(tab) {
        document.getElementById('history-match-list')?.classList.toggle('hidden', tab !== 'match');
        document.getElementById('history-risk-list')?.classList.toggle('hidden', tab !== 'risk');
        document.getElementById('htab-match')?.classList.toggle('active', tab === 'match');
        document.getElementById('htab-risk')?.classList.toggle('active',  tab === 'risk');
    }

    // =========================================================
    // PUBLIC — Restore inputs from a history card
    // =========================================================
    function restoreMatchInputs(btn) {
        const item = btn.closest('.history-item');
        if (!item) return;

        const resumeText = decodeURIComponent(item.dataset.resume || '');
        const jdText     = decodeURIComponent(item.dataset.jd     || '');

        const resumeTA = document.getElementById('resume-input');
        const jdTA     = document.getElementById('jd-input');

        if (resumeTA) { resumeTA.value = resumeText; resumeTA.dispatchEvent(new Event('input')); }
        if (jdTA)     { jdTA.value     = jdText;     jdTA.dispatchEvent(new Event('input'));     }

        if (window.switchTool) window.switchTool('matcher');
        document.getElementById('history-sidebar')?.classList.remove('open');
        document.getElementById('history-overlay')?.classList.remove('open');

        if (window.showToast) window.showToast('Inputs restored! ✅ Re-run the analysis for fresh results.', 'success');
    }

    // =========================================================
    // PUBLIC API (same interface as before, no auth needed)
    // =========================================================
    return {
        init,
        saveMatchAnalysis,
        saveRiskAnalysis,
        loadHistory,
        switchHistoryTab,
        restoreMatchInputs,
        // stub out auth methods so app.js calls don't break
        signInWithGoogle: () => {},
        signOut: () => {},
        get currentUser() { return { uid: 'local' }; },
        get isConfigured() { return true; }
    };

})();

window.FirebaseDB = FirebaseDB;
