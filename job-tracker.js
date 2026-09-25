// ============================================================
// job-tracker.js — Local Job Application Tracker
// ResumeMatch AI — Client-Side Application Pipeline via IndexedDB
// Tracks Company, Role, JD Snippet, Resume Version, Match Score,
// Status (Saved, Applied, OA, Interview, Rejected, Selected) & Notes.
// ============================================================

const JobTracker = (function () {

    const STATUSES = ['Saved', 'Applied', 'Online Assessment', 'Interview', 'Rejected', 'Selected'];

    async function getDB() {
        if (!window.LocalDB) throw new Error('LocalDB not available');
        return window.LocalDB;
    }

    async function addApplication(data) {
        if (!data || typeof data !== 'object') throw new Error('Invalid application data');
        const company = (data.company || '').trim().slice(0, 100);
        const role = (data.role || '').trim().slice(0, 100);
        if (!company || !role) throw new Error('Company and Role are required.');

        const record = {
            company,
            role,
            jdSnippet: String(data.jdSnippet || '').slice(0, 2000),
            resumeVersion: String(data.resumeVersion || 'Default').slice(0, 80),
            matchScore: Math.min(100, Math.max(0, Number(data.matchScore) || 0)),
            status: STATUSES.includes(data.status) ? data.status : 'Saved',
            appliedDate: data.appliedDate || new Date().toISOString().split('T')[0],
            interviewDate: data.interviewDate || '',
            notes: String(data.notes || '').slice(0, 1000),
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        const db = await getDB();
        return await db.addJobApplication(record);
    }

    async function getAllApplications() {
        const db = await getDB();
        return await db.getAllJobApplications();
    }

    async function updateApplication(id, updates) {
        if (!updates || typeof updates !== 'object') throw new Error('Invalid update data');
        const safeUpdates = { ...updates, updatedAt: Date.now() };
        if (safeUpdates.status && !STATUSES.includes(safeUpdates.status)) {
            safeUpdates.status = 'Saved';
        }
        const db = await getDB();
        return await db.updateJobApplication(id, safeUpdates);
    }

    async function deleteApplication(id) {
        const db = await getDB();
        return await db.deleteJobApplication(id);
    }

    async function getStatusCounts() {
        const apps = await getAllApplications();
        const counts = {
            Total: apps.length,
            Saved: 0,
            Applied: 0,
            'Online Assessment': 0,
            Interview: 0,
            Rejected: 0,
            Selected: 0
        };
        apps.forEach(a => {
            if (counts[a.status] !== undefined) counts[a.status]++;
        });
        return counts;
    }

    function validateApplication(data) {
        if (!data || typeof data !== 'object') return false;
        const company = (data.company || '').trim();
        const role = (data.role || '').trim();
        return company.length > 0 && role.length > 0;
    }

    return {
        STATUSES,
        addApplication,
        getAllApplications,
        updateApplication,
        deleteApplication,
        getStatusCounts,
        validateApplication
    };
})();

if (typeof window !== 'undefined') {
    window.JobTracker = JobTracker;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = JobTracker;
}
