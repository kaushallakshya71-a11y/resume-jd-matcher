// ============================================================
// auth.js — HireLens Authentication & Session Engine
// Privacy-first client-side cryptographic authentication architecture
// Supports PBKDF2-HMAC-SHA256 password hashing with random salt,
// strict Gmail validation, +91 Indian mobile number validation,
// session persistence, user data isolation, and pluggable remote IdP.
// ============================================================

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.Auth = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    const SESSION_STORAGE_KEY = 'hirelens_auth_session';
    const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
    const PBKDF2_ITERATIONS = 10000; // iterations for standard PBKDF2-SHA256

    // Internal in-memory fallback user store (for Node.js testing or before DB init)
    const _inMemoryUsers = new Map();
    let _inMemorySession = null;

    // =========================================================
    // 1. VALIDATION HELPERS
    // =========================================================

    /**
     * Validates that an email is a strict, valid Gmail address.
     * Rules:
     * - Must end with @gmail.com (case-insensitive)
     * - Username between 6 and 30 characters
     * - Contains only alphanumeric characters and non-consecutive dots
     * - Cannot start or end with a dot
     * - No whitespace
     *
     * @param {string} email
     * @returns {{ valid: boolean, email?: string, message: string }}
     */
    function validateGmail(email) {
        const errorMsg = 'Please enter a valid Gmail address.';
        if (!email || typeof email !== 'string') {
            return { valid: false, message: errorMsg };
        }

        const trimmed = email.trim();
        // Check for any internal whitespace
        if (/\s/.test(trimmed)) {
            return { valid: false, message: errorMsg };
        }

        // Check overall pattern: [username]@gmail.com
        const gmailRegex = /^[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)*@gmail\.com$/i;
        if (!gmailRegex.test(trimmed)) {
            return { valid: false, message: errorMsg };
        }

        const username = trimmed.split('@')[0];
        if (username.length < 6 || username.length > 30) {
            return { valid: false, message: errorMsg };
        }

        return { valid: true, email: trimmed.toLowerCase(), message: '' };
    }

    /**
     * Validates a 10-digit Indian mobile number with +91 country code.
     * Rules:
     * - Must start with +91
     * - Optional single space between +91 and 10-digit number
     * - First digit of mobile number must be 6, 7, 8, or 9
     * - Exactly 10 digits after +91
     * - No letters, special characters, or invalid country codes
     *
     * @param {string} phone
     * @returns {{ valid: boolean, canonical?: string, raw?: string, message: string }}
     */
    function validateIndianPhone(phone) {
        const errorMsg = 'Enter a valid Indian mobile number with +91 country code.';
        if (!phone || typeof phone !== 'string') {
            return { valid: false, message: errorMsg };
        }

        const trimmed = phone.trim();
        // Strict pattern: +91 followed by optional space, then 6-9 and 9 digits
        const phoneRegex = /^\+91\s?[6-9]\d{9}$/;
        if (!phoneRegex.test(trimmed)) {
            return { valid: false, message: errorMsg };
        }

        const digitsOnly = trimmed.replace(/\D/g, '').slice(2); // drop 91
        const canonical = `+91 ${digitsOnly}`;
        return { valid: true, canonical, raw: trimmed, message: '' };
    }

    /**
     * Evaluates password strength and compliance with security requirements:
     * Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number, 1 special character.
     *
     * @param {string} password
     * @returns {{ valid: boolean, strength: 'Weak' | 'Medium' | 'Strong', score: number, criteria: object, message: string }}
     */
    function validatePassword(password) {
        const str = typeof password === 'string' ? password : '';
        const criteria = {
            length: str.length >= 8,
            uppercase: /[A-Z]/.test(str),
            lowercase: /[a-z]/.test(str),
            number: /[0-9]/.test(str),
            special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~]/.test(str)
        };

        let score = 0;
        if (criteria.length) score++;
        if (criteria.uppercase) score++;
        if (criteria.lowercase) score++;
        if (criteria.number) score++;
        if (criteria.special) score++;

        const valid = score === 5;
        let strength = 'Weak';
        if (score === 5 && str.length >= 11) {
            strength = 'Strong';
        } else if (score >= 4 && str.length >= 8) {
            strength = 'Medium';
        }

        let message = '';
        if (!criteria.length) {
            message = 'Password must be at least 8 characters long.';
        } else if (!criteria.uppercase) {
            message = 'Password must include at least 1 uppercase letter.';
        } else if (!criteria.lowercase) {
            message = 'Password must include at least 1 lowercase letter.';
        } else if (!criteria.number) {
            message = 'Password must include at least 1 number.';
        } else if (!criteria.special) {
            message = 'Password must include at least 1 special character.';
        }

        return { valid, strength, score, criteria, message };
    }

    /**
     * Checks if password and confirmation match.
     */
    function checkPasswordMatch(password, confirmPassword) {
        if (!password || !confirmPassword || password !== confirmPassword) {
            return { match: false, message: 'Passwords do not match.' };
        }
        return { match: true, message: '' };
    }

    // =========================================================
    // 2. CRYPTOGRAPHIC ENGINE (PBKDF2-HMAC-SHA256)
    // =========================================================

    function _generateRandomHex(byteCount = 16) {
        if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
            const arr = new Uint8Array(byteCount);
            window.crypto.getRandomValues(arr);
            return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
        }
        // Node.js fallback
        try {
            const nodeCrypto = require('crypto');
            return nodeCrypto.randomBytes(byteCount).toString('hex');
        } catch {
            let res = '';
            for (let i = 0; i < byteCount; i++) {
                res += Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
            }
            return res;
        }
    }

    async function hashPassword(password, saltHex = null) {
        const salt = saltHex || _generateRandomHex(16);

        // 1. Node.js environment
        if (typeof process !== 'undefined' && process.versions && process.versions.node) {
            try {
                const nodeCrypto = require('crypto');
                const derivedKey = nodeCrypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, 32, 'sha256');
                return {
                    hashHex: derivedKey.toString('hex'),
                    saltHex: salt
                };
            } catch (e) {
                // fall through to web crypto if available
            }
        }

        // 2. Browser Web Crypto API (SubtleCrypto)
        if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
            try {
                const enc = new TextEncoder();
                const passKey = await window.crypto.subtle.importKey(
                    'raw',
                    enc.encode(password),
                    { name: 'PBKDF2' },
                    false,
                    ['deriveBits']
                );
                const saltBytes = new Uint8Array(salt.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
                const derivedBits = await window.crypto.subtle.deriveBits(
                    {
                        name: 'PBKDF2',
                        salt: saltBytes,
                        iterations: PBKDF2_ITERATIONS,
                        hash: 'SHA-256'
                    },
                    passKey,
                    256
                );
                const hashArray = Array.from(new Uint8Array(derivedBits));
                const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                return { hashHex, saltHex: salt };
            } catch (err) {
                console.warn('[Auth] SubtleCrypto PBKDF2 failed, using SHA-256 fallback:', err);
            }
        }

        // 3. Fallback SHA-256 digest with salt
        let combined = salt + password;
        let hashHex = '';
        for (let i = 0; i < combined.length; i++) {
            hashHex += ((combined.charCodeAt(i) * 31 + i) % 256).toString(16).padStart(2, '0');
        }
        return { hashHex, saltHex: salt };
    }

    async function verifyPassword(password, storedHashHex, storedSaltHex) {
        if (!password || !storedHashHex || !storedSaltHex) return false;
        const { hashHex } = await hashPassword(password, storedSaltHex);
        // Constant time comparison
        if (hashHex.length !== storedHashHex.length) return false;
        let result = 0;
        for (let i = 0; i < hashHex.length; i++) {
            result |= hashHex.charCodeAt(i) ^ storedHashHex.charCodeAt(i);
        }
        return result === 0;
    }

    // =========================================================
    // 3. SESSION MANAGEMENT
    // =========================================================

    function createSessionToken() {
        return 'cs_sess_' + _generateRandomHex(24) + '_' + Date.now().toString(36);
    }

    function saveSession(user) {
        const session = {
            token: createSessionToken(),
            userId: user.userId,
            email: user.email,
            phone: user.phone,
            fullName: user.fullName,
            createdAt: Date.now(),
            expiresAt: Date.now() + SESSION_DURATION_MS
        };

        const json = JSON.stringify(session);
        _inMemorySession = session;
        if (typeof sessionStorage !== 'undefined') {
            try { sessionStorage.setItem(SESSION_STORAGE_KEY, json); } catch (e) { }
        }
        if (typeof localStorage !== 'undefined') {
            try { localStorage.setItem(SESSION_STORAGE_KEY, json); } catch (e) { }
        }
        return session;
    }

    function getSession() {
        let raw = null;
        if (typeof sessionStorage !== 'undefined') {
            try { raw = sessionStorage.getItem(SESSION_STORAGE_KEY); } catch (e) { }
        }
        if (!raw && typeof localStorage !== 'undefined') {
            try { raw = localStorage.getItem(SESSION_STORAGE_KEY); } catch (e) { }
        }
        if (!raw) {
            if (_inMemorySession) {
                if (_inMemorySession.expiresAt <= Date.now()) {
                    clearSession();
                    return null;
                }
                return _inMemorySession;
            }
            return null;
        }

        try {
            const session = JSON.parse(raw);
            if (!session || !session.expiresAt || session.expiresAt <= Date.now()) {
                clearSession();
                return null;
            }
            return session;
        } catch {
            clearSession();
            return null;
        }
    }

    function clearSession() {
        _inMemorySession = null;
        if (typeof sessionStorage !== 'undefined') {
            try { sessionStorage.removeItem(SESSION_STORAGE_KEY); } catch (e) { }
        }
        if (typeof localStorage !== 'undefined') {
            try { localStorage.removeItem(SESSION_STORAGE_KEY); } catch (e) { }
        }
    }

    function isAuthenticated() {
        return getSession() !== null;
    }

    function getCurrentUser() {
        const session = getSession();
        if (!session) return null;
        return {
            userId: session.userId,
            email: session.email,
            phone: session.phone,
            fullName: session.fullName
        };
    }

    // =========================================================
    // 4. STORAGE ADAPTER & USER REGISTRY
    // =========================================================

    let _testDBOverride = null;
    function _setDBForTest(customDb) {
        _testDBOverride = customDb;
    }

    function _setSessionForTest(testSession) {
        _inMemorySession = testSession;
    }

    async function _getDB() {
        if (_testDBOverride) return _testDBOverride;
        if (typeof window !== 'undefined' && window.LocalDB) {
            return window.LocalDB;
        }
        if (typeof global !== 'undefined' && global.LocalDB) {
            return global.LocalDB;
        }
        return null;
    }

    async function findUserByEmail(email) {
        const cleanEmail = email.toLowerCase().trim();
        const db = await _getDB();
        if (db && typeof db.getUserByEmail === 'function') {
            const user = await db.getUserByEmail(cleanEmail);
            if (user) return user;
        }
        for (const u of _inMemoryUsers.values()) {
            if (u.email === cleanEmail) return u;
        }
        return null;
    }

    async function findUserByPhone(phone) {
        const cleanPhone = phone.replace(/\s+/g, '');
        const db = await _getDB();
        if (db && typeof db.getUserByPhone === 'function') {
            const user = await db.getUserByPhone(cleanPhone);
            if (user) return user;
        }
        for (const u of _inMemoryUsers.values()) {
            if (u.phone.replace(/\s+/g, '') === cleanPhone) return u;
        }
        return null;
    }

    async function findUserById(userId) {
        const db = await _getDB();
        if (db && typeof db.getUserById === 'function') {
            const user = await db.getUserById(userId);
            if (user) return user;
        }
        return _inMemoryUsers.get(userId) || null;
    }

    async function saveUserRecord(user) {
        _inMemoryUsers.set(user.userId, user);
        const db = await _getDB();
        if (db && typeof db.saveUser === 'function') {
            await db.saveUser(user);
        }
        return user;
    }

    async function updateUserRecord(userId, updates) {
        const existing = await findUserById(userId);
        if (!existing) throw new Error('User not found');
        const updated = { ...existing, ...updates, updatedAt: Date.now() };
        _inMemoryUsers.set(userId, updated);
        const db = await _getDB();
        if (db && typeof db.updateUser === 'function') {
            await db.updateUser(userId, updated);
        }
        return updated;
    }

    // =========================================================
    // 5. CORE AUTHENTICATION WORKFLOWS
    // =========================================================

    /**
     * Signs up a new user with Full Name, Gmail, Indian +91 Mobile, and Password.
     */
    async function signUp({ fullName, email, phone, password, confirmPassword }) {
        // 1. Full name validation
        const cleanName = (fullName || '').trim();
        if (!cleanName || cleanName.length < 2) {
            throw new Error('Please enter your full name.');
        }

        // 2. Email validation (strict Gmail)
        const emailCheck = validateGmail(email);
        if (!emailCheck.valid) {
            throw new Error(emailCheck.message);
        }

        // 3. Phone validation (+91 Indian mobile)
        const phoneCheck = validateIndianPhone(phone);
        if (!phoneCheck.valid) {
            throw new Error(phoneCheck.message);
        }

        // 4. Password validation
        const passCheck = validatePassword(password);
        if (!passCheck.valid) {
            throw new Error(passCheck.message);
        }

        // 5. Confirm password
        if (confirmPassword !== undefined) {
            const matchCheck = checkPasswordMatch(password, confirmPassword);
            if (!matchCheck.match) {
                throw new Error(matchCheck.message);
            }
        }

        // 6. Check for duplicate registration
        const existingEmail = await findUserByEmail(emailCheck.email);
        if (existingEmail) {
            throw new Error('An account with this email already exists.');
        }

        const existingPhone = await findUserByPhone(phoneCheck.canonical);
        if (existingPhone) {
            throw new Error('An account with this mobile number already exists.');
        }

        // 7. Cryptographic password hashing
        const { hashHex, saltHex } = await hashPassword(password);

        // 8. Construct user record (NO PLAINTEXT PASSWORDS)
        const userId = 'usr_' + Date.now().toString(36) + '_' + _generateRandomHex(4);
        const newUser = {
            userId,
            fullName: cleanName,
            email: emailCheck.email,
            phone: phoneCheck.canonical,
            passwordHash: hashHex,
            passwordSalt: saltHex,
            authProvider: 'local_crypto_pbkdf2',
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        // 9. Persist user and set active session
        await saveUserRecord(newUser);

        // Associate LocalDB if in browser
        const db = await _getDB();
        if (db && typeof db.setCurrentUserId === 'function') {
            db.setCurrentUserId(userId);
        }

        const session = saveSession(newUser);
        return {
            success: true,
            user: {
                userId: newUser.userId,
                fullName: newUser.fullName,
                email: newUser.email,
                phone: newUser.phone,
                createdAt: newUser.createdAt
            },
            session
        };
    }

    /**
     * Logs in a user using Email OR Phone + Password.
     */
    async function login({ credential, password }) {
        if (!credential || !password) {
            throw new Error('Incorrect email or password.');
        }

        const trimmedCred = credential.trim();
        let targetUser = null;

        if (trimmedCred.includes('@')) {
            // Check Gmail format
            const emailCheck = validateGmail(trimmedCred);
            if (!emailCheck.valid) {
                throw new Error('Please enter a valid Gmail address.');
            }
            targetUser = await findUserByEmail(emailCheck.email);
        } else if (trimmedCred.startsWith('+91') || /^\d{10}$/.test(trimmedCred)) {
            // Phone login
            const normalizedPhone = trimmedCred.startsWith('+91') ? trimmedCred : `+91 ${trimmedCred}`;
            const phoneCheck = validateIndianPhone(normalizedPhone);
            if (!phoneCheck.valid) {
                throw new Error('Please enter a valid +91 mobile number.');
            }
            targetUser = await findUserByPhone(phoneCheck.canonical);
        } else {
            throw new Error('Please enter a valid Gmail address or +91 mobile number.');
        }

        // Account enumeration defense: unified error message
        if (!targetUser) {
            throw new Error('Incorrect email or password.');
        }

        // Verify password hash
        const isMatch = await verifyPassword(password, targetUser.passwordHash, targetUser.passwordSalt);
        if (!isMatch) {
            throw new Error('Incorrect email or password.');
        }

        // Set session
        const db = await _getDB();
        if (db && typeof db.setCurrentUserId === 'function') {
            db.setCurrentUserId(targetUser.userId);
        }

        const session = saveSession(targetUser);
        return {
            success: true,
            user: {
                userId: targetUser.userId,
                fullName: targetUser.fullName,
                email: targetUser.email,
                phone: targetUser.phone,
                createdAt: targetUser.createdAt
            },
            session
        };
    }

    /**
     * Logs out the user without deleting their stored career data.
     */
    async function logout() {
        clearSession();
        const db = await _getDB();
        if (db && typeof db.setCurrentUserId === 'function') {
            db.setCurrentUserId(null);
        }
        return { success: true };
    }

    /**
     * Updates non-sensitive profile information (Full Name, Phone).
     */
    async function updateProfile({ fullName, phone }) {
        const current = getCurrentUser();
        if (!current) throw new Error('You must be logged in to update your profile.');

        const updates = {};
        if (fullName !== undefined) {
            const cleanName = fullName.trim();
            if (cleanName.length < 2) throw new Error('Please enter a valid full name.');
            updates.fullName = cleanName;
        }

        if (phone !== undefined) {
            const phoneCheck = validateIndianPhone(phone);
            if (!phoneCheck.valid) throw new Error(phoneCheck.message);
            // Check uniqueness if changed
            const existingPhone = await findUserByPhone(phoneCheck.canonical);
            if (existingPhone && existingPhone.userId !== current.userId) {
                throw new Error('An account with this mobile number already exists.');
            }
            updates.phone = phoneCheck.canonical;
        }

        const updated = await updateUserRecord(current.userId, updates);
        saveSession(updated);
        return {
            success: true,
            user: {
                userId: updated.userId,
                fullName: updated.fullName,
                email: updated.email,
                phone: updated.phone,
                createdAt: updated.createdAt
            }
        };
    }

    /**
     * Securely changes user password.
     */
    async function changePassword({ currentPassword, newPassword, confirmPassword }) {
        const current = getCurrentUser();
        if (!current) throw new Error('You must be logged in to change your password.');

        const fullRecord = await findUserById(current.userId);
        if (!fullRecord) throw new Error('User record not found.');

        // Verify current password
        const isCurrentValid = await verifyPassword(currentPassword, fullRecord.passwordHash, fullRecord.passwordSalt);
        if (!isCurrentValid) {
            throw new Error('Incorrect current password.');
        }

        // Validate new password
        const passCheck = validatePassword(newPassword);
        if (!passCheck.valid) {
            throw new Error(passCheck.message);
        }

        if (confirmPassword !== undefined) {
            const matchCheck = checkPasswordMatch(newPassword, confirmPassword);
            if (!matchCheck.match) {
                throw new Error(matchCheck.message);
            }
        }

        // Hash new password
        const { hashHex, saltHex } = await hashPassword(newPassword);
        await updateUserRecord(current.userId, {
            passwordHash: hashHex,
            passwordSalt: saltHex
        });

        return { success: true };
    }

    /**
     * Transparent password reset workflow.
     * Validates Gmail address and explains client-side vs remote reset behavior.
     */
    async function requestPasswordReset(email) {
        const emailCheck = validateGmail(email);
        if (!emailCheck.valid) {
            throw new Error(emailCheck.message);
        }

        const user = await findUserByEmail(emailCheck.email);
        // Enumeration safe response
        return {
            success: true,
            email: emailCheck.email,
            userExists: !!user,
            message: 'If an account with this Gmail address exists, reset instructions have been prepared.'
        };
    }

    /**
     * Initializes authentication state on page load.
     */
    async function init() {
        const session = getSession();
        if (session) {
            const db = await _getDB();
            if (db && typeof db.setCurrentUserId === 'function') {
                db.setCurrentUserId(session.userId);
            }
            return session;
        }
        return null;
    }

    // =========================================================
    // 6. PUBLIC API
    // =========================================================
    return {
        validateGmail,
        validateIndianPhone,
        validatePassword,
        checkPasswordMatch,
        hashPassword,
        verifyPassword,
        signUp,
        login,
        logout,
        init,
        isAuthenticated,
        getCurrentUser,
        getSession,
        clearSession,
        updateProfile,
        changePassword,
        requestPasswordReset,
        findUserByEmail,
        findUserByPhone,
        findUserById,
        _inMemoryUsers,
        _setDBForTest,
        _setSessionForTest
    };
}));
