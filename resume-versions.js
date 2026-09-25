// ============================================================
// resume-versions.js — Local Resume Version Management
// ResumeMatch AI — Client-Side Version Control via IndexedDB
// Allows users to create, rename, duplicate, update, delete,
// and switch between tailored resume versions (e.g. SDE vs Data Analyst).
// ============================================================

const ResumeVersions = (function () {

    async function getDB() {
        if (!window.LocalDB) throw new Error('LocalDB not available');
        return window.LocalDB;
    }

    async function createVersion(name, content, targetDomain = 'General') {
        const safeName = (name || 'Untitled Version').trim().slice(0, 80);
        const safeContent = (content || '').trim().slice(0, 50000);
        if (!safeContent) throw new Error('Resume content cannot be empty.');

        const record = {
            name: safeName,
            content: safeContent,
            targetDomain: (targetDomain || 'General').slice(0, 50),
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        const db = await getDB();
        return await db.addResumeVersion(record);
    }

    async function getAllVersions() {
        const db = await getDB();
        return await db.getAllResumeVersions();
    }

    async function renameVersion(id, newName) {
        const safeName = (newName || '').trim().slice(0, 80);
        if (!safeName) throw new Error('Version name cannot be empty.');
        const db = await getDB();
        return await db.updateResumeVersion(id, { name: safeName, updatedAt: Date.now() });
    }

    async function updateVersion(id, content) {
        const safeContent = (content || '').trim().slice(0, 50000);
        if (!safeContent) throw new Error('Resume content cannot be empty.');
        const db = await getDB();
        return await db.updateResumeVersion(id, { content: safeContent, updatedAt: Date.now() });
    }

    async function duplicateVersion(id) {
        const db = await getDB();
        const all = await db.getAllResumeVersions();
        const target = all.find(v => v.id === id);
        if (!target) throw new Error('Version not found.');

        const duplicate = {
            name: `${target.name} (Copy)`,
            content: target.content,
            targetDomain: target.targetDomain,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        return await db.addResumeVersion(duplicate);
    }

    async function deleteVersion(id) {
        const db = await getDB();
        return await db.deleteResumeVersion(id);
    }

    function validateVersion(data) {
        if (!data || typeof data !== 'object') return false;
        const name = (data.name || '').trim();
        return name.length > 0;
    }

    async function getVersionById(id) {
        const db = await getDB();
        const all = await db.getAllResumeVersions();
        return all.find(v => v.id === id) || null;
    }

    return {
        createVersion,
        getAllVersions,
        getVersionById,
        renameVersion,
        updateVersion,
        duplicateVersion,
        deleteVersion,
        validateVersion
    };
})();

if (typeof window !== 'undefined') {
    window.ResumeVersions = ResumeVersions;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResumeVersions;
}
