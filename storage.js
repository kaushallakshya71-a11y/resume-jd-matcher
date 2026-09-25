// ============================================================
// storage.js — Local History Database (IndexedDB)
// ResumeMatch AI — Client-Side Storage, No Account Required
// Renamed from firebase.js. Zero Firebase/Firestore dependency.
// ============================================================

const LocalDB = (function () {

    const DB_NAME    = 'resumematch_ai';
    const DB_VERSION = 3;
    const STORES     = {
        match: 'matchHistory',
        risk: 'riskHistory',
        stats: 'stats',
        versions: 'resumeVersions',
        jobs: 'jobApplications',
        users: 'users'
    };
    const MAX_ITEMS  = 50;
    const MAX_IMPORT_BYTES = 5 * 1024 * 1024; // 5 MB import limit

    let _db = null;
    let _currentUserId = null;

    function setCurrentUserId(uid) {
        _currentUserId = uid || null;
    }

    function getCurrentUserId() {
        return _currentUserId;
    }

    const _inMemoryStores = {
        users: new Map(),
        matchHistory: [],
        riskHistory: [],
        stats: new Map(),
        resumeVersions: [],
        jobApplications: []
    };

    function _createInMemoryDB() {
        return {
            transaction(storeName, mode) {
                return {
                    objectStore(name) {
                        return {
                            indexNames: { contains: (idx) => idx === 'email' || idx === 'phone' || idx === 'userId' },
                            index(idxName) {
                                return {
                                    get(val) {
                                        const req = { onsuccess: null, onerror: null, result: null };
                                        setTimeout(() => {
                                            if (name === STORES.users && idxName === 'email') {
                                                for (const u of _inMemoryStores.users.values()) {
                                                    if (u.email === val) { req.result = u; break; }
                                                }
                                            }
                                            if (req.onsuccess) req.onsuccess();
                                        }, 0);
                                        return req;
                                    }
                                };
                            },
                            add(data) {
                                const req = { onsuccess: null, onerror: null, result: null };
                                setTimeout(() => {
                                    if (name === STORES.users) {
                                        _inMemoryStores.users.set(data.userId, data);
                                        req.result = data.userId;
                                    } else {
                                        const item = { ...data, id: data.id || Date.now() + Math.random() };
                                        _inMemoryStores[name].push(item);
                                        req.result = item.id;
                                    }
                                    if (req.onsuccess) req.onsuccess();
                                }, 0);
                                return req;
                            },
                            put(data) {
                                const req = { onsuccess: null, onerror: null, result: null };
                                setTimeout(() => {
                                    if (name === STORES.users) {
                                        _inMemoryStores.users.set(data.userId, data);
                                        req.result = data.userId;
                                    } else if (name === STORES.stats) {
                                        _inMemoryStores.stats.set(data.key, data);
                                        req.result = data.key;
                                    } else {
                                        const list = _inMemoryStores[name];
                                        const idx = list.findIndex(x => x.id === data.id);
                                        if (idx >= 0) list[idx] = data;
                                        else list.push(data);
                                        req.result = data.id;
                                    }
                                    if (req.onsuccess) req.onsuccess();
                                }, 0);
                                return req;
                            },
                            get(id) {
                                const req = { onsuccess: null, onerror: null, result: null };
                                setTimeout(() => {
                                    if (name === STORES.users) {
                                        req.result = _inMemoryStores.users.get(id) || null;
                                    } else if (name === STORES.stats) {
                                        req.result = _inMemoryStores.stats.get(id) || null;
                                    } else {
                                        req.result = _inMemoryStores[name].find(x => x.id === id) || null;
                                    }
                                    if (req.onsuccess) req.onsuccess();
                                }, 0);
                                return req;
                            },
                            getAll() {
                                const req = { onsuccess: null, onerror: null, result: null };
                                setTimeout(() => {
                                    if (name === STORES.users) {
                                        req.result = Array.from(_inMemoryStores.users.values());
                                    } else if (name === STORES.stats) {
                                        req.result = Array.from(_inMemoryStores.stats.values());
                                    } else {
                                        req.result = [..._inMemoryStores[name]];
                                    }
                                    if (req.onsuccess) req.onsuccess();
                                }, 0);
                                return req;
                            },
                            delete(id) {
                                const req = { onsuccess: null, onerror: null };
                                setTimeout(() => {
                                    if (name === STORES.users) {
                                        _inMemoryStores.users.delete(id);
                                    } else if (name === STORES.stats) {
                                        _inMemoryStores.stats.delete(id);
                                    } else {
                                        _inMemoryStores[name] = _inMemoryStores[name].filter(x => x.id !== id);
                                    }
                                    if (req.onsuccess) req.onsuccess();
                                }, 0);
                                return req;
                            },
                            clear() {
                                const req = { onsuccess: null, onerror: null };
                                setTimeout(() => {
                                    if (name === STORES.users) _inMemoryStores.users.clear();
                                    else if (name === STORES.stats) _inMemoryStores.stats.clear();
                                    else _inMemoryStores[name] = [];
                                    if (req.onsuccess) req.onsuccess();
                                }, 0);
                                return req;
                            }
                        };
                    }
                };
            }
        };
    }

    // =========================================================
    // OPEN IndexedDB
    // =========================================================
    function _openDB() {
        return new Promise((resolve, reject) => {
            if (_db) { resolve(_db); return; }
            if (typeof window === 'undefined' || !window.indexedDB) {
                _db = _createInMemoryDB();
                resolve(_db);
                return;
            }
            const req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = e => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(STORES.users)) {
                    const us = db.createObjectStore(STORES.users, { keyPath: 'userId' });
                    us.createIndex('email', 'email', { unique: true });
                    us.createIndex('phone', 'phone', { unique: true });
                }
                if (!db.objectStoreNames.contains(STORES.match)) {
                    const ms = db.createObjectStore(STORES.match, { keyPath: 'id', autoIncrement: true });
                    ms.createIndex('createdAt', 'createdAt', { unique: false });
                    ms.createIndex('userId', 'userId', { unique: false });
                } else {
                    const ms = req.transaction.objectStore(STORES.match);
                    if (!ms.indexNames.contains('userId')) {
                        ms.createIndex('userId', 'userId', { unique: false });
                    }
                }
                if (!db.objectStoreNames.contains(STORES.risk)) {
                    const rs = db.createObjectStore(STORES.risk, { keyPath: 'id', autoIncrement: true });
                    rs.createIndex('createdAt', 'createdAt', { unique: false });
                    rs.createIndex('userId', 'userId', { unique: false });
                } else {
                    const rs = req.transaction.objectStore(STORES.risk);
                    if (!rs.indexNames.contains('userId')) {
                        rs.createIndex('userId', 'userId', { unique: false });
                    }
                }
                if (!db.objectStoreNames.contains(STORES.stats)) {
                    db.createObjectStore(STORES.stats, { keyPath: 'key' });
                }
                if (!db.objectStoreNames.contains(STORES.versions)) {
                    const vs = db.createObjectStore(STORES.versions, { keyPath: 'id', autoIncrement: true });
                    vs.createIndex('updatedAt', 'updatedAt', { unique: false });
                    vs.createIndex('userId', 'userId', { unique: false });
                } else {
                    const vs = req.transaction.objectStore(STORES.versions);
                    if (!vs.indexNames.contains('userId')) {
                        vs.createIndex('userId', 'userId', { unique: false });
                    }
                }
                if (!db.objectStoreNames.contains(STORES.jobs)) {
                    const js = db.createObjectStore(STORES.jobs, { keyPath: 'id', autoIncrement: true });
                    js.createIndex('updatedAt', 'updatedAt', { unique: false });
                    js.createIndex('status', 'status', { unique: false });
                    js.createIndex('userId', 'userId', { unique: false });
                } else {
                    const js = req.transaction.objectStore(STORES.jobs);
                    if (!js.indexNames.contains('userId')) {
                        js.createIndex('userId', 'userId', { unique: false });
                    }
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
        const db = await _openDB();
        if (storeName !== STORES.users && storeName !== STORES.stats) {
            if (!data.userId) {
                data.userId = _currentUserId || 'legacy';
            }
        }
        return new Promise((resolve, reject) => {
            const tx  = db.transaction(storeName, 'readwrite');
            const req = tx.objectStore(storeName).add(data);
            req.onsuccess = () => resolve(req.result);
            req.onerror   = e => reject(e.target.error);
        });
    }

    async function _getAll(storeName) {
        const db = await _openDB();
        return new Promise((resolve, reject) => {
            const tx  = db.transaction(storeName, 'readonly');
            const req = tx.objectStore(storeName).getAll();
            req.onsuccess = () => {
                const all = req.result || [];
                if (_currentUserId && storeName !== STORES.users && storeName !== STORES.stats) {
                    resolve(all.filter(item => item.userId === _currentUserId));
                } else {
                    resolve(all);
                }
            };
            req.onerror   = e => reject(e.target.error);
        });
    }

    async function _get(storeName, id) {
        const db = await _openDB();
        return new Promise((resolve, reject) => {
            const tx  = db.transaction(storeName, 'readonly');
            const req = tx.objectStore(storeName).get(id);
            req.onsuccess = () => resolve(req.result || null);
            req.onerror   = e => reject(e.target.error);
        });
    }

    async function _put(storeName, data) {
        const db = await _openDB();
        if (storeName !== STORES.users && storeName !== STORES.stats) {
            if (!data.userId) {
                data.userId = _currentUserId || 'legacy';
            }
        }
        return new Promise((resolve, reject) => {
            const tx  = db.transaction(storeName, 'readwrite');
            const req = tx.objectStore(storeName).put(data);
            req.onsuccess = () => resolve(req.result);
            req.onerror   = e => reject(e.target.error);
        });
    }

    async function _delete(storeName, id) {
        const db = await _openDB();
        return new Promise((resolve, reject) => {
            const tx  = db.transaction(storeName, 'readwrite');
            const req = tx.objectStore(storeName).delete(id);
            req.onsuccess = () => resolve();
            req.onerror   = e => reject(e.target.error);
        });
    }

    async function _clear(storeName) {
        const db = await _openDB();
        return new Promise((resolve, reject) => {
            const tx  = db.transaction(storeName, 'readwrite');
            const req = tx.objectStore(storeName).clear();
            req.onsuccess = () => resolve();
            req.onerror   = e => reject(e.target.error);
        });
    }

    async function _getStats() {
        const db = await _openDB();
        const key = _currentUserId ? `stats_${_currentUserId}` : 'main';
        return new Promise((resolve, reject) => {
            const tx  = db.transaction(STORES.stats, 'readonly');
            const req = tx.objectStore(STORES.stats).get(key);
            req.onsuccess = () => resolve(req.result || { key });
            req.onerror   = e => reject(e.target.error);
        });
    }

    async function _putStats(data) {
        const db = await _openDB();
        const key = _currentUserId ? `stats_${_currentUserId}` : 'main';
        return new Promise((resolve, reject) => {
            const tx  = db.transaction(STORES.stats, 'readwrite');
            const req = tx.objectStore(STORES.stats).put({ key, ...data });
            req.onsuccess = () => resolve();
            req.onerror   = e => reject(e.target.error);
        });
    }

    // =========================================================
    // USER REPOSITORY (MULTI-USER ISOLATION)
    // =========================================================
    async function saveUser(user) {
        return await _put(STORES.users, user);
    }

    async function getUserById(userId) {
        return await _get(STORES.users, userId);
    }

    async function getUserByEmail(email) {
        const clean = (email || '').toLowerCase().trim();
        const db = await _openDB();
        return new Promise((resolve) => {
            try {
                const tx = db.transaction(STORES.users, 'readonly');
                const store = tx.objectStore(STORES.users);
                if (!store.indexNames.contains('email')) {
                    resolve(null);
                    return;
                }
                const req = store.index('email').get(clean);
                req.onsuccess = () => resolve(req.result || null);
                req.onerror = () => resolve(null);
            } catch {
                resolve(null);
            }
        });
    }

    async function getUserByPhone(phone) {
        const cleanPhone = (phone || '').replace(/\s+/g, '');
        const all = await _getAll(STORES.users);
        return all.find(u => u.phone && u.phone.replace(/\s+/g, '') === cleanPhone) || null;
    }

    async function updateUser(userId, updates) {
        const existing = await getUserById(userId);
        if (!existing) throw new Error('User not found');
        const updated = { ...existing, ...updates, userId, updatedAt: Date.now() };
        await _put(STORES.users, updated);
        return updated;
    }

    async function getAllUsers() {
        return await _getAll(STORES.users);
    }

    async function clearUserData(userId) {
        const target = userId || _currentUserId;
        if (!target) return;
        const db = await _openDB();
        const promises = [STORES.match, STORES.risk, STORES.versions, STORES.jobs].map(s => {
            return new Promise((resolve) => {
                try {
                    const tx = db.transaction(s, 'readwrite');
                    const store = tx.objectStore(s);
                    const req = store.getAll();
                    req.onsuccess = () => {
                        const items = req.result || [];
                        const delPromises = [];
                        for (const item of items) {
                            if (item.userId === target) {
                                delPromises.push(new Promise(resDel => {
                                    const dReq = store.delete(item.id);
                                    if (dReq && typeof dReq.onsuccess !== 'undefined') {
                                        dReq.onsuccess = resDel;
                                        dReq.onerror = resDel;
                                    } else {
                                        resDel();
                                    }
                                }));
                            }
                        }
                        Promise.all(delPromises).then(resolve);
                    };
                    req.onerror = () => resolve();
                } catch (e) {
                    console.warn('[LocalDB] clearUserData error:', e);
                    resolve();
                }
            });
        });
        await Promise.all(promises);
    }

    // Trim oldest records to stay within MAX_ITEMS
    async function _trim(storeName) {
        const all = await _getAll(storeName);
        if (all.length > MAX_ITEMS) {
            all.sort((a, b) => a.createdAt - b.createdAt);
            const toDelete = all.slice(0, all.length - MAX_ITEMS);
            for (const item of toDelete) await _delete(storeName, item.id);
        }
    }

    // Safe text escape to prevent XSS when rendering into innerHTML
    function _esc(str) {
        if (typeof str !== 'string') return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // =========================================================
    // INIT
    // =========================================================
    function init() {
        _openDB().catch(e => {
            console.warn('[LocalDB] IndexedDB unavailable:', e.message);
            if (window.showToast) {
                window.showToast('Browser storage unavailable. History will not be saved this session.', 'warn');
            }
        });
        _renderWidget();
        loadHistory();
    }

    // =========================================================
    // SAVE — Match Analysis
    // =========================================================
    async function saveMatchAnalysis(result, resumeText, jdText) {
        try {
            const doc = {
                score:              result.score || 0,
                verdict:            result.verdict || '',
                verdictClass:       result.verdictClass || '',
                missingSkills:      (result.missingSkills  || []).slice(0, 8),
                strongMatches:      (result.strongMatches  || []).slice(0, 8),
                targetRole:         result.options?.targetRole || '',
                atsPassProbability: result.atsAnalysis?.passProbability || 0,
                atsPassLabel:       result.atsAnalysis?.passLabel || '',
                // Store only plain text snippets (not raw HTML)
                resumeSnippet:      (resumeText || '').substring(0, 2000),
                jdSnippet:          (jdText     || '').substring(0, 2000),
                createdAt:          Date.now()
            };

            await _add(STORES.match, doc);
            await _trim(STORES.match);
            await _updateStats('match', result.score || 0, result.missingSkills || []);
            await loadHistory();

            if (window.showToast) window.showToast('Saved to local history! 📚', 'success');
        } catch (e) {
            console.error('[LocalDB] Save match error:', e);
            if (window.showToast) window.showToast('Could not save to history. Browser storage may be full.', 'warn');
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
                                       .map(f => ({ label: String(f.label || ''), detail: String(f.detail || '') })),
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
            if (window.showToast) window.showToast('Could not save to history. Browser storage may be full.', 'warn');
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
                const prevAvg   = s.avgMatchScore      || 0;
                s.totalMatchAnalyses = prevTotal + 1;
                s.avgMatchScore = Math.round((prevAvg * prevTotal + score) / (prevTotal + 1));
                const prev   = s.topMissingSkills || [];
                const merged = [...new Set([
                    ...missingSkills.map(x => String(x).toLowerCase()),
                    ...prev
                ])].slice(0, 10);
                s.topMissingSkills = merged;
            } else {
                s.totalRiskAnalyses = (s.totalRiskAnalyses || 0) + 1;
            }
            s.lastActive = Date.now();
            await _putStats(s);
        } catch (e) {
            console.error('[LocalDB] Stats update error:', e);
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
            const matchHistory = allMatch.sort((a, b) => b.createdAt - a.createdAt).slice(0, 15);
            const riskHistory  = allRisk.sort((a, b)  => b.createdAt - a.createdAt).slice(0, 15);
            _renderHistoryPanel(matchHistory, riskHistory, stats);
        } catch (e) {
            console.error('[LocalDB] Load history error:', e);
        }
    }

    // =========================================================
    // EXPORT HISTORY — downloads resume-match-history.json
    // =========================================================
    async function exportHistory() {
        try {
            const [matchHistory, riskHistory, stats, resumeVersions, jobApplications] = await Promise.all([
                _getAll(STORES.match),
                _getAll(STORES.risk),
                _getStats(),
                _getAll(STORES.versions),
                _getAll(STORES.jobs)
            ]);
            const payload = {
                exportedAt: new Date().toISOString(),
                appVersion: '3.1',
                schema: 'resumematch-history-v1',
                matchHistory,
                riskHistory,
                resumeVersions: resumeVersions || [],
                jobApplications: jobApplications || [],
                stats
            };
            const json = JSON.stringify(payload, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href     = url;
            a.download = `resume-match-history-${new Date().toISOString().slice(0,10)}.json`;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
            if (window.showToast) window.showToast('History exported! ✅', 'success');
        } catch (e) {
            console.error('[LocalDB] Export error:', e);
            if (window.showToast) window.showToast('Export failed. Please try again.', 'error');
        }
    }

    // =========================================================
    // IMPORT HISTORY — validates and merges JSON backup
    // =========================================================
    async function importHistory(file) {
        if (!file) return;

        // File size check
        if (file.size > MAX_IMPORT_BYTES) {
            if (window.showToast) window.showToast('Import file is too large (max 5 MB).', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = async e => {
            try {
                const raw = e.target.result;
                let parsed;
                try {
                    parsed = JSON.parse(raw);
                } catch {
                    if (window.showToast) window.showToast('Invalid file: not valid JSON.', 'error');
                    return;
                }

                // Schema validation
                if (!parsed || typeof parsed !== 'object') {
                    if (window.showToast) window.showToast('Invalid import file structure.', 'error');
                    return;
                }
                if (parsed.schema !== 'resumematch-history-v1' && parsed.schema !== 'resumematch-history-v2') {
                    if (window.showToast) window.showToast('Unrecognised import format. Only ResumeMatch AI exports are supported.', 'error');
                    return;
                }
                if (!Array.isArray(parsed.matchHistory) || !Array.isArray(parsed.riskHistory)) {
                    if (window.showToast) window.showToast('Import file is missing expected data.', 'error');
                    return;
                }
                // Sanitise and import match records
                let importedCount = 0;
                for (const item of parsed.matchHistory.slice(0, MAX_ITEMS)) {
                    if (typeof item !== 'object' || item === null) continue;
                    const safe = {
                        score:              Math.min(100, Math.max(0, Number(item.score) || 0)),
                        verdict:            String(item.verdict || '').slice(0, 100),
                        verdictClass:       String(item.verdictClass || '').slice(0, 50),
                        missingSkills:      Array.isArray(item.missingSkills) ? item.missingSkills.map(s => String(s).slice(0, 100)).slice(0, 8) : [],
                        strongMatches:      Array.isArray(item.strongMatches)  ? item.strongMatches.map(s => String(s).slice(0, 100)).slice(0, 8)  : [],
                        targetRole:         String(item.targetRole || '').slice(0, 200),
                        atsPassProbability: Math.min(100, Math.max(0, Number(item.atsPassProbability) || 0)),
                        atsPassLabel:       String(item.atsPassLabel || '').slice(0, 100),
                        resumeSnippet:      String(item.resumeSnippet || '').slice(0, 2000),
                        jdSnippet:          String(item.jdSnippet    || '').slice(0, 2000),
                        createdAt:          Number(item.createdAt) || Date.now()
                    };
                    await _add(STORES.match, safe);
                    importedCount++;
                }
                for (const item of parsed.riskHistory.slice(0, MAX_ITEMS)) {
                    if (typeof item !== 'object' || item === null) continue;
                    const safe = {
                        overallScore:      Math.min(100, Math.max(0, Number(item.overallScore) || 0)),
                        riskCategory:      String(item.riskCategory || '').slice(0, 100),
                        currentRole:       String(item.currentRole  || '').slice(0, 200),
                        yearsOfExperience: Math.min(60, Math.max(0, Number(item.yearsOfExperience) || 0)),
                        salaryGrowth:      String(item.salaryGrowth || '').slice(0, 50),
                        automationRisk:    Math.min(100, Math.max(0, Number(item.automationRisk) || 0)),
                        topRiskFactors:    Array.isArray(item.topRiskFactors)
                            ? item.topRiskFactors.slice(0, 3).map(f => ({
                                label:  String(f?.label  || '').slice(0, 100),
                                detail: String(f?.detail || '').slice(0, 300)
                              }))
                            : [],
                        projection:        String(item.projection || '').slice(0, 500),
                        createdAt:         Number(item.createdAt) || Date.now()
                    };
                    await _add(STORES.risk, safe);
                }

                // Import resume versions if provided
                if (Array.isArray(parsed.resumeVersions)) {
                    for (const v of parsed.resumeVersions.slice(0, MAX_ITEMS)) {
                        if (!v || typeof v !== 'object') continue;
                        await _add(STORES.versions, {
                            name: String(v.name || 'Imported Version').slice(0, 80),
                            content: String(v.content || '').slice(0, 50000),
                            targetDomain: String(v.targetDomain || 'General').slice(0, 50),
                            createdAt: Number(v.createdAt) || Date.now(),
                            updatedAt: Number(v.updatedAt) || Date.now()
                        });
                    }
                }

                // Import job applications if provided
                if (Array.isArray(parsed.jobApplications)) {
                    for (const j of parsed.jobApplications.slice(0, MAX_ITEMS)) {
                        if (!j || typeof j !== 'object') continue;
                        await _add(STORES.jobs, {
                            company: String(j.company || 'Unknown').slice(0, 100),
                            role: String(j.role || 'Unknown').slice(0, 100),
                            jdSnippet: String(j.jdSnippet || '').slice(0, 2000),
                            resumeVersion: String(j.resumeVersion || 'Default').slice(0, 80),
                            matchScore: Math.min(100, Math.max(0, Number(j.matchScore) || 0)),
                            status: String(j.status || 'Saved').slice(0, 50),
                            appliedDate: String(j.appliedDate || ''),
                            interviewDate: String(j.interviewDate || ''),
                            notes: String(j.notes || '').slice(0, 1000),
                            createdAt: Number(j.createdAt) || Date.now(),
                            updatedAt: Number(j.updatedAt) || Date.now()
                        });
                    }
                }

                await loadHistory();
                if (window.showToast) window.showToast(`Imported ${importedCount} match records successfully! ✅`, 'success');
            } catch (err) {
                console.error('[LocalDB] Import error:', err);
                if (window.showToast) window.showToast('Import failed. The file may be corrupted.', 'error');
            }
        };
        reader.onerror = () => {
            if (window.showToast) window.showToast('Could not read the file.', 'error');
        };
        reader.readAsText(file);
    }

    // =========================================================
    // RESUME VERSIONS CRUD
    // =========================================================
    async function addResumeVersion(record) { return await _add(STORES.versions, record); }
    async function getAllResumeVersions() {
        const all = await _getAll(STORES.versions);
        return all.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    }
    async function updateResumeVersion(id, updates) {
        const existing = await _get(STORES.versions, id);
        if (!existing) throw new Error('Resume version not found');
        return await _put(STORES.versions, { ...existing, ...updates, id });
    }
    async function deleteResumeVersion(id) { return await _delete(STORES.versions, id); }

    // =========================================================
    // JOB APPLICATIONS CRUD
    // =========================================================
    async function addJobApplication(record) { return await _add(STORES.jobs, record); }
    async function getAllJobApplications() {
        const all = await _getAll(STORES.jobs);
        return all.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    }
    async function updateJobApplication(id, updates) {
        const existing = await _get(STORES.jobs, id);
        if (!existing) throw new Error('Job application not found');
        return await _put(STORES.jobs, { ...existing, ...updates, id });
    }
    async function deleteJobApplication(id) { return await _delete(STORES.jobs, id); }

    // =========================================================
    // RENDER — Header widget
    // =========================================================
    function _renderWidget() {
        const widget = document.getElementById('auth-widget');
        if (!widget) return;
        widget.innerHTML = `
            <button class="auth-history-btn" id="auth-history-toggle"
                    aria-label="View Your Saved History" title="View Your Saved History">
                📚 <span class="auth-history-label">History</span>
            </button>
        `;
        document.getElementById('auth-history-toggle')?.addEventListener('click', _toggleHistoryPanel);
    }

    function _toggleHistoryPanel() {
        const panel   = document.getElementById('history-sidebar');
        const overlay = document.getElementById('history-overlay');
        if (!panel) return;
        const isOpen = panel.classList.toggle('open');
        overlay?.classList.toggle('open', isOpen);
        if (isOpen) {
            // Focus first focusable element for keyboard accessibility
            setTimeout(() => {
                panel.querySelector('button, [tabindex="0"]')?.focus();
            }, 150);
        }
    }

    // =========================================================
    // RENDER — History Sidebar Panel
    // =========================================================
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
                return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
            } catch { return ''; }
        }

        // Use _esc() on all user-sourced data to prevent XSS
        const matchItems = matchHistory.length === 0
            ? '<div class="history-empty">No match analyses yet.<br>Run your first analysis to see it here!</div>'
            : matchHistory.map(item => `
                <div class="history-item"
                     data-resume="${_esc(encodeURIComponent(item.resumeSnippet || ''))}"
                     data-jd="${_esc(encodeURIComponent(item.jdSnippet || ''))}">
                    <div class="history-item-header">
                        <span class="history-score-badge"
                              style="background:${scoreColor(item.score)}22;color:${scoreColor(item.score)};border:1px solid ${scoreColor(item.score)}44">
                            ${_esc(String(item.score))}%
                        </span>
                        <span class="history-verdict">${_esc(item.verdict || 'Analysis')}</span>
                    </div>
                    ${item.targetRole ? `<div class="history-role-tag">🎯 ${_esc(item.targetRole)}</div>` : ''}
                    <div class="history-item-meta">
                        <span>📅 ${_esc(formatDate(item.createdAt))}</span>
                        ${item.atsPassProbability ? `<span>ATS: ${_esc(String(item.atsPassProbability))}%</span>` : ''}
                    </div>
                    ${item.missingSkills?.length > 0 ? `
                    <div class="history-skill-chips">
                        ${item.missingSkills.slice(0, 4).map(s => `<span class="history-skill-chip">+ ${_esc(s)}</span>`).join('')}
                    </div>` : ''}
                    <button class="history-restore-btn" aria-label="Restore these inputs"
                            onclick="window.LocalDB.restoreMatchInputs(this)">
                        ↩ Restore Inputs
                    </button>
                </div>
            `).join('');

        const riskItems = riskHistory.length === 0
            ? '<div class="history-empty">No risk analyses yet.<br>Try the Career Risk Signals tool!</div>'
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
                                ${_esc(String(item.overallScore))}%
                            </span>
                            <span class="history-verdict">${rIcon} ${_esc(item.riskCategory || '')}</span>
                        </div>
                        ${item.currentRole ? `<div class="history-role-tag">👤 ${_esc(item.currentRole)}${item.yearsOfExperience ? ` (${_esc(String(item.yearsOfExperience))}y)` : ''}</div>` : ''}
                        <div class="history-item-meta">
                            <span>📅 ${_esc(formatDate(item.createdAt))}</span>
                            <span>🤖 ${_esc(String(item.automationRisk))}% automation risk</span>
                        </div>
                        <div class="history-item-meta">
                            <span>💰 Salary outlook: ${_esc(item.salaryGrowth || 'N/A')}</span>
                        </div>
                    </div>
                `;
            }).join('');

        panel.innerHTML = `
            <div class="history-panel-header">
                <div class="history-panel-title">📚 Your History</div>
                <button class="history-close-btn" id="history-close-btn" aria-label="Close history panel">✕</button>
            </div>

            <div class="history-stats-bar" role="region" aria-label="Analysis statistics">
                <div class="history-stat">
                    <div class="history-stat-num">${totalMatch + totalRisk}</div>
                    <div class="history-stat-label">Total Saved</div>
                </div>
                <div class="history-stat">
                    <div class="history-stat-num" style="color:${scoreColor(avgScore)}">
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
                    ${topGaps.map(s => `<span class="history-skill-chip">${_esc(s)}</span>`).join('')}
                </div>
            </div>` : ''}

            <div class="history-tabs" role="tablist">
                <button class="history-tab active" id="htab-match" role="tab" aria-selected="true"
                        onclick="window.LocalDB.switchHistoryTab('match')">
                    📄 Match (${matchHistory.length})
                </button>
                <button class="history-tab" id="htab-risk" role="tab" aria-selected="false"
                        onclick="window.LocalDB.switchHistoryTab('risk')">
                    ⚠️ Risk (${riskHistory.length})
                </button>
            </div>

            <div id="history-match-list" class="history-list" role="tabpanel">${matchItems}</div>
            <div id="history-risk-list" class="history-list hidden" role="tabpanel">${riskItems}</div>

            <div class="history-actions-bar">
                <button class="history-action-btn" id="history-export-btn" aria-label="Export history as JSON">
                    ⬇ Export
                </button>
                <label class="history-action-btn history-import-label" title="Import a previously exported history file">
                    ⬆ Import
                    <input type="file" id="history-import-input" accept=".json" style="display:none" aria-label="Import history JSON file">
                </label>
            </div>

            <div class="history-local-note">
                💾 History is stored locally in <strong>this browser only</strong>.
                Clearing site data or switching browsers will remove it.
                Use Export to back up your history.
            </div>
        `;

        // Wire up close button
        document.getElementById('history-close-btn')?.addEventListener('click', () => {
            panel.classList.remove('open');
            document.getElementById('history-overlay')?.classList.remove('open');
        });

        // Wire up export button
        document.getElementById('history-export-btn')?.addEventListener('click', exportHistory);

        // Wire up import input
        document.getElementById('history-import-input')?.addEventListener('change', e => {
            const file = e.target.files[0];
            if (file) importHistory(file);
            e.target.value = ''; // reset so same file can be re-selected
        });
    }

    // =========================================================
    // PUBLIC — Switch tab
    // =========================================================
    function switchHistoryTab(tab) {
        document.getElementById('history-match-list')?.classList.toggle('hidden', tab !== 'match');
        document.getElementById('history-risk-list')?.classList.toggle('hidden', tab !== 'risk');
        const matchBtn = document.getElementById('htab-match');
        const riskBtn  = document.getElementById('htab-risk');
        matchBtn?.classList.toggle('active', tab === 'match');
        riskBtn?.classList.toggle('active',  tab === 'risk');
        matchBtn?.setAttribute('aria-selected', tab === 'match' ? 'true' : 'false');
        riskBtn?.setAttribute('aria-selected',  tab === 'risk'  ? 'true' : 'false');
    }

    // =========================================================
    // PUBLIC — Restore inputs from a history card
    // =========================================================
    function restoreMatchInputs(btn) {
        const item = btn.closest('.history-item');
        if (!item) return;
        const resumeText = decodeURIComponent(item.dataset.resume || '');
        const jdText     = decodeURIComponent(item.dataset.jd     || '');
        const resumeTA   = document.getElementById('resume-input');
        const jdTA       = document.getElementById('jd-input');
        if (resumeTA) { resumeTA.value = resumeText; resumeTA.dispatchEvent(new Event('input')); }
        if (jdTA)     { jdTA.value     = jdText;     jdTA.dispatchEvent(new Event('input'));     }
        if (window.switchTool) window.switchTool('matcher');
        document.getElementById('history-sidebar')?.classList.remove('open');
        document.getElementById('history-overlay')?.classList.remove('open');
        if (window.showToast) window.showToast('Inputs restored! ✅ Re-run the analysis for fresh results.', 'success');
    }

    // =========================================================
    // PUBLIC API
    // =========================================================
    return {
        init,
        setCurrentUserId,
        getCurrentUserId,
        saveUser,
        getUserById,
        getUserByEmail,
        getUserByPhone,
        updateUser,
        getAllUsers,
        clearUserData,
        saveMatchAnalysis,
        saveRiskAnalysis,
        loadHistory,
        exportHistory,
        importHistory,
        switchHistoryTab,
        restoreMatchInputs,
        addResumeVersion,
        getAllResumeVersions,
        updateResumeVersion,
        deleteResumeVersion,
        addJobApplication,
        getAllJobApplications,
        updateJobApplication,
        deleteJobApplication
    };

})();

// Expose under LocalDB name; also keep FirebaseDB as alias for backward compat
if (typeof window !== 'undefined') {
    window.LocalDB   = LocalDB;
    window.FirebaseDB = LocalDB; // backward-compat alias — will be removed in future version
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = LocalDB;
}
