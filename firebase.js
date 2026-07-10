// ============================================================
// firebase.js — Firebase Auth + Firestore Integration
// ResumeMatch AI — History, Stats & Google Sign-In
// ============================================================

const FirebaseDB = (function () {

    // =========================================================
    // 🔧 FIREBASE CONFIG — Replace with your project's config
    // Get it from: Firebase Console → Project Settings → Your Apps → Web App
    // =========================================================
    const FIREBASE_CONFIG = {
        apiKey: "YOUR_API_KEY",
        authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
        projectId: "YOUR_PROJECT_ID",
        storageBucket: "YOUR_PROJECT_ID.appspot.com",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
        appId: "YOUR_APP_ID"
    };

    let auth, db, currentUser = null;
    let isConfigured = false;

    // =========================================================
    // INIT
    // =========================================================
    function init() {
        // Check if config placeholder is still present
        if (FIREBASE_CONFIG.apiKey === 'YOUR_API_KEY') {
            console.warn('[FirebaseDB] Config not set. Database features disabled.');
            _renderUnauthState('not-configured');
            return;
        }

        try {
            if (!firebase.apps.length) {
                firebase.initializeApp(FIREBASE_CONFIG);
            }
            auth = firebase.auth();
            db   = firebase.firestore();
            isConfigured = true;

            auth.onAuthStateChanged(user => {
                currentUser = user;
                if (user) {
                    _ensureUserProfile(user);
                    _renderAuthState(user);
                    loadHistory();
                } else {
                    _renderUnauthState();
                    _clearHistoryPanel();
                }
            });
        } catch (e) {
            console.error('[FirebaseDB] Init error:', e);
        }
    }

    // =========================================================
    // AUTH
    // =========================================================
    async function signInWithGoogle() {
        if (!isConfigured) return;
        const provider = new firebase.auth.GoogleAuthProvider();
        try {
            await auth.signInWithPopup(provider);
        } catch (e) {
            console.error('[FirebaseDB] Sign-in error:', e);
            if (window.showToast) window.showToast('Sign-in failed. Please try again.', 'error');
        }
    }

    async function signOut() {
        if (!isConfigured) return;
        await auth.signOut();
        if (window.showToast) window.showToast('Signed out successfully.', 'success');
        _clearHistoryPanel();
    }

    async function _ensureUserProfile(user) {
        try {
            const ref = db.collection('users').doc(user.uid);
            const snap = await ref.get();
            if (!snap.exists) {
                await ref.set({
                    displayName: user.displayName || '',
                    email: user.email || '',
                    photoURL: user.photoURL || '',
                    joinedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        } catch (e) {
            console.error('[FirebaseDB] Profile error:', e);
        }
    }

    // =========================================================
    // SAVE — Match Analysis
    // =========================================================
    async function saveMatchAnalysis(result, resumeText, jdText) {
        if (!isConfigured || !currentUser) {
            if (window.showToast) window.showToast('Sign in to save your analysis history! 🔑', 'info');
            return;
        }
        try {
            const doc = {
                score: result.score || 0,
                verdict: result.verdict || '',
                verdictClass: result.verdictClass || '',
                missingSkills: (result.missingSkills || []).slice(0, 8),
                strongMatches: (result.strongMatches || []).slice(0, 8),
                targetRole: result.options?.targetRole || result.targetRole || '',
                atsPassProbability: result.atsAnalysis?.passProbability || 0,
                atsPassLabel: result.atsAnalysis?.passLabel || '',
                resumeSnippet: (resumeText || '').substring(0, 2000),
                jdSnippet: (jdText || '').substring(0, 2000),
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await db.collection('users').doc(currentUser.uid)
                    .collection('matchHistory').add(doc);

            await _updateStats('match', result.score || 0, result.missingSkills || []);
            loadHistory();
        } catch (e) {
            console.error('[FirebaseDB] Save match error:', e);
            if (window.showToast) window.showToast('Could not save to history. Try again.', 'error');
        }
    }

    // =========================================================
    // SAVE — Career Risk Analysis
    // =========================================================
    async function saveRiskAnalysis(result, inputs) {
        if (!isConfigured || !currentUser) {
            if (window.showToast) window.showToast('Sign in to save your risk history! 🔑', 'info');
            return;
        }
        try {
            const doc = {
                overallScore: result.overallScore || 0,
                riskCategory: result.riskCategory || '',
                currentRole: inputs.currentRole || '',
                yearsOfExperience: inputs.yearsOfExperience || 0,
                salaryGrowth: result.salaryGrowth || '',
                automationRisk: result.automationRisk || 0,
                topRiskFactors: (result.topRiskFactors || []).slice(0, 3).map(f => ({ label: f.label, detail: f.detail })),
                projection: result.projection || '',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            await db.collection('users').doc(currentUser.uid)
                    .collection('riskHistory').add(doc);

            await _updateStats('risk', null, []);
            loadHistory();
        } catch (e) {
            console.error('[FirebaseDB] Save risk error:', e);
            if (window.showToast) window.showToast('Could not save to history. Try again.', 'error');
        }
    }

    // =========================================================
    // UPDATE AGGREGATE STATS
    // =========================================================
    async function _updateStats(type, score, missingSkills) {
        if (!isConfigured || !currentUser) return;
        try {
            const ref = db.collection('users').doc(currentUser.uid)
                          .collection('meta').doc('stats');
            const snap = await ref.get();
            const existing = snap.exists ? snap.data() : {};

            const updates = {
                lastActive: firebase.firestore.FieldValue.serverTimestamp()
            };

            if (type === 'match') {
                const prevTotal = existing.totalMatchAnalyses || 0;
                const prevAvg   = existing.avgMatchScore || 0;
                updates.totalMatchAnalyses = prevTotal + 1;
                updates.avgMatchScore = Math.round((prevAvg * prevTotal + score) / (prevTotal + 1));

                // Merge top missing skills (keep top 10 unique)
                const prev = existing.topMissingSkills || [];
                const merged = [...new Set([...missingSkills.map(s => s.toLowerCase()), ...prev])].slice(0, 10);
                updates.topMissingSkills = merged;
            } else if (type === 'risk') {
                updates.totalRiskAnalyses = (existing.totalRiskAnalyses || 0) + 1;
            }

            await ref.set(updates, { merge: true });
        } catch (e) {
            console.error('[FirebaseDB] Stats error:', e);
        }
    }

    // =========================================================
    // LOAD HISTORY
    // =========================================================
    async function loadHistory() {
        if (!isConfigured || !currentUser) return;
        try {
            const [matchSnap, riskSnap, statsSnap] = await Promise.all([
                db.collection('users').doc(currentUser.uid)
                    .collection('matchHistory')
                    .orderBy('createdAt', 'desc').limit(15).get(),
                db.collection('users').doc(currentUser.uid)
                    .collection('riskHistory')
                    .orderBy('createdAt', 'desc').limit(15).get(),
                db.collection('users').doc(currentUser.uid)
                    .collection('meta').doc('stats').get()
            ]);

            const matchHistory = matchSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            const riskHistory  = riskSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            const stats        = statsSnap.exists ? statsSnap.data() : {};

            _renderHistoryPanel(matchHistory, riskHistory, stats);
        } catch (e) {
            console.error('[FirebaseDB] Load history error:', e);
        }
    }

    // =========================================================
    // RENDER — Auth Widget
    // =========================================================
    function _renderAuthState(user) {
        const widget = document.getElementById('auth-widget');
        if (!widget) return;

        widget.innerHTML = `
            <div class="auth-user-row">
                <button class="auth-history-btn" id="auth-history-toggle" title="View History">
                    📚 <span class="auth-history-label">History</span>
                </button>
                <div class="auth-avatar-wrap">
                    <img class="auth-avatar" src="${user.photoURL || ''}" alt="${user.displayName || 'User'}"
                         onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2232%22 height=%2232%22><rect width=%2232%22 height=%2232%22 rx=%2216%22 fill=%22%23d97706%22/><text x=%2216%22 y=%2221%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2214%22 font-weight=%22700%22>${(user.displayName || 'U')[0].toUpperCase()}</text></svg>'">
                    <div class="auth-user-details">
                        <span class="auth-user-name">${(user.displayName || 'User').split(' ')[0]}</span>
                    </div>
                </div>
                <button class="auth-signout-btn" id="auth-signout-btn" title="Sign out">⏏ Sign out</button>
            </div>
        `;
        document.getElementById('auth-signout-btn')?.addEventListener('click', signOut);
        document.getElementById('auth-history-toggle')?.addEventListener('click', _toggleHistoryPanel);
    }

    function _renderUnauthState(mode = 'signed-out') {
        const widget = document.getElementById('auth-widget');
        if (!widget) return;

        if (mode === 'not-configured') {
            widget.innerHTML = `
                <div class="auth-not-configured" title="Add your Firebase config to firebase.js">
                    🔧 Configure Firebase
                </div>`;
        } else {
            widget.innerHTML = `
                <button class="auth-signin-btn" id="auth-signin-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign in to Save History
                </button>
            `;
            document.getElementById('auth-signin-btn')?.addEventListener('click', signInWithGoogle);
        }
    }

    // =========================================================
    // RENDER — History Sidebar
    // =========================================================
    function _toggleHistoryPanel() {
        const panel = document.getElementById('history-sidebar');
        const overlay = document.getElementById('history-overlay');
        if (!panel) return;
        const isOpen = panel.classList.toggle('open');
        overlay?.classList.toggle('open', isOpen);
    }

    function _clearHistoryPanel() {
        const panel = document.getElementById('history-sidebar');
        const overlay = document.getElementById('history-overlay');
        if (panel) panel.classList.remove('open');
        if (overlay) overlay.classList.remove('open');
        // Reset to sign-in prompt
        const panelBody = document.getElementById('history-sidebar');
        if (panelBody) panelBody.innerHTML = _buildSignedOutPanelHTML();
    }

    function _buildSignedOutPanelHTML() {
        return `
            <div class="history-panel-header">
                <div class="history-panel-title">📚 Your History</div>
                <button class="history-close-btn" onclick="document.getElementById('history-sidebar').classList.remove('open');document.getElementById('history-overlay').classList.remove('open')">✕</button>
            </div>
            <div class="history-signin-prompt">
                <div class="hsp-icon">🔑</div>
                <p>Sign in with Google to save and access your analysis history across devices.</p>
                <button class="history-google-signin" id="history-signin-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign in with Google
                </button>
            </div>
        `;
    }

    function _renderHistoryPanel(matchHistory, riskHistory, stats) {
        const panel = document.getElementById('history-sidebar');
        if (!panel) return;

        const totalMatch = stats.totalMatchAnalyses || 0;
        const totalRisk  = stats.totalRiskAnalyses  || 0;
        const avgScore   = stats.avgMatchScore || 0;
        const topGaps    = (stats.topMissingSkills || []).slice(0, 5);

        function scoreColor(s) {
            return s >= 70 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444';
        }

        function formatDate(ts) {
            if (!ts) return '';
            try {
                const d = ts.toDate ? ts.toDate() : new Date(ts);
                return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
            } catch { return ''; }
        }

        const matchItems = matchHistory.length === 0
            ? '<div class="history-empty">No match analyses yet.<br>Run your first analysis to see it here!</div>'
            : matchHistory.map(item => `
                <div class="history-item" data-resume="${encodeURIComponent(item.resumeSnippet || '')}" data-jd="${encodeURIComponent(item.jdSnippet || '')}">
                    <div class="history-item-header">
                        <span class="history-score-badge" style="background:${scoreColor(item.score)}22;color:${scoreColor(item.score)};border:1px solid ${scoreColor(item.score)}44">${item.score}%</span>
                        <span class="history-verdict">${item.verdict || 'Analysis'}</span>
                    </div>
                    ${item.targetRole ? `<div class="history-role-tag">🎯 ${item.targetRole}</div>` : ''}
                    <div class="history-item-meta">
                        <span>📅 ${formatDate(item.createdAt)}</span>
                        <span>🤖 ATS: ${item.atsPassProbability || 0}%</span>
                    </div>
                    ${item.missingSkills && item.missingSkills.length > 0 ? `
                    <div class="history-skill-chips">
                        ${item.missingSkills.slice(0, 4).map(s => `<span class="history-skill-chip">+ ${s}</span>`).join('')}
                    </div>` : ''}
                    <button class="history-restore-btn" onclick="window.FirebaseDB.restoreMatchInputs(this)">↩ Restore Inputs</button>
                </div>
            `).join('');

        const riskItems = riskHistory.length === 0
            ? '<div class="history-empty">No risk analyses yet.<br>Try the Career Risk IQ tool!</div>'
            : riskHistory.map(item => {
                const rColor = item.riskCategory === 'Safe Zone' ? '#10b981'
                             : item.riskCategory === 'Warning Zone' ? '#f59e0b' : '#ef4444';
                const rIcon  = item.riskCategory === 'Safe Zone' ? '✅'
                             : item.riskCategory === 'Warning Zone' ? '⚠️' : '🚨';
                return `
                    <div class="history-item">
                        <div class="history-item-header">
                            <span class="history-score-badge" style="background:${rColor}22;color:${rColor};border:1px solid ${rColor}44">${item.overallScore}%</span>
                            <span class="history-verdict">${rIcon} ${item.riskCategory || ''}</span>
                        </div>
                        ${item.currentRole ? `<div class="history-role-tag">👤 ${item.currentRole} ${item.yearsOfExperience ? `(${item.yearsOfExperience}y)` : ''}</div>` : ''}
                        <div class="history-item-meta">
                            <span>📅 ${formatDate(item.createdAt)}</span>
                            <span>🤖 ${item.automationRisk}% auto risk</span>
                        </div>
                        <div class="history-item-meta" style="margin-top:4px">
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

            <div class="history-stats-bar">
                <div class="history-stat">
                    <div class="history-stat-num">${totalMatch + totalRisk}</div>
                    <div class="history-stat-label">Total Analyses</div>
                </div>
                <div class="history-stat">
                    <div class="history-stat-num" style="color:${scoreColor(avgScore)}">${avgScore > 0 ? avgScore + '%' : '—'}</div>
                    <div class="history-stat-label">Avg Match Score</div>
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

            <div class="history-tabs">
                <button class="history-tab active" id="htab-match" onclick="window.FirebaseDB.switchHistoryTab('match')">📄 Match (${matchHistory.length})</button>
                <button class="history-tab" id="htab-risk" onclick="window.FirebaseDB.switchHistoryTab('risk')">⚠️ Risk (${riskHistory.length})</button>
            </div>

            <div id="history-match-list" class="history-list">${matchItems}</div>
            <div id="history-risk-list" class="history-list hidden">${riskItems}</div>
        `;

        document.getElementById('history-close-btn')?.addEventListener('click', () => {
            panel.classList.remove('open');
            document.getElementById('history-overlay')?.classList.remove('open');
        });
    }

    // =========================================================
    // PUBLIC — Switch tab in history panel
    // =========================================================
    function switchHistoryTab(tab) {
        document.getElementById('history-match-list')?.classList.toggle('hidden', tab !== 'match');
        document.getElementById('history-risk-list')?.classList.toggle('hidden', tab !== 'risk');
        document.getElementById('htab-match')?.classList.toggle('active', tab === 'match');
        document.getElementById('htab-risk')?.classList.toggle('active', tab === 'risk');
    }

    // =========================================================
    // PUBLIC — Restore inputs from history item
    // =========================================================
    function restoreMatchInputs(btn) {
        const item = btn.closest('.history-item');
        if (!item) return;

        const resumeText = decodeURIComponent(item.dataset.resume || '');
        const jdText     = decodeURIComponent(item.dataset.jd || '');

        const resumeTA = document.getElementById('resume-input');
        const jdTA     = document.getElementById('jd-input');

        if (resumeTA) {
            resumeTA.value = resumeText;
            resumeTA.dispatchEvent(new Event('input'));
        }
        if (jdTA) {
            jdTA.value = jdText;
            jdTA.dispatchEvent(new Event('input'));
        }

        if (window.switchTool) window.switchTool('matcher');
        document.getElementById('history-sidebar')?.classList.remove('open');
        document.getElementById('history-overlay')?.classList.remove('open');

        if (window.showToast) window.showToast('Inputs restored! ✅ Re-run the analysis for a fresh result.', 'success');
    }

    // =========================================================
    // PUBLIC API
    // =========================================================
    return {
        init,
        signInWithGoogle,
        signOut,
        saveMatchAnalysis,
        saveRiskAnalysis,
        loadHistory,
        switchHistoryTab,
        restoreMatchInputs,
        get currentUser() { return currentUser; },
        get isConfigured() { return isConfigured; }
    };

})();

window.FirebaseDB = FirebaseDB;
