// ============================================================
// resume-improver.js — Resume Section & Bullet Quality Analyzer
// ResumeMatch AI — Client-Side Resume Structure & Bullet Evaluator
// Analyzes sections (Summary, Experience, Projects, Skills, etc.)
// and bullets using Action + Technology + Task + Result framework.
// ============================================================

const ResumeImprover = (function () {

    const SECTIONS = [
        { id: 'summary', name: 'Summary', regex: /\b(summary|professional summary|profile|about me|objective)\b/i, required: false },
        { id: 'skills', name: 'Skills', regex: /\b(skills|technical skills|technologies|competencies|core competencies|toolset)\b/i, required: true },
        { id: 'experience', name: 'Experience', regex: /\b(experience|work experience|employment history|professional experience|work history)\b/i, required: true },
        { id: 'projects', name: 'Projects', regex: /\b(projects|key projects|personal projects|technical projects|academic projects)\b/i, required: true },
        { id: 'education', name: 'Education', regex: /\b(education|academic background|qualifications|degrees)\b/i, required: true },
        { id: 'certifications', name: 'Certifications', regex: /\b(certifications|certificates|licenses|accreditations)\b/i, required: false },
        { id: 'achievements', name: 'Achievements', regex: /\b(achievements|awards|honors|accomplishments)\b/i, required: false },
        { id: 'internships', name: 'Internships', regex: /\b(internships|internship experience|trainee)\b/i, required: false }
    ];

    const ACTION_VERBS = [
        'developed', 'engineered', 'built', 'designed', 'architected', 'implemented',
        'spearheaded', 'orchestrated', 'led', 'managed', 'optimized', 'accelerated',
        'automated', 'deployed', 'scaled', 'refactored', 'reduced', 'increased',
        'improved', 'created', 'authored', 'established', 'integrated', 'streamlined'
    ];

    function analyzeSections(text) {
        if (!text || typeof text !== 'string') return { detected: [], missing: [], signals: [] };

        const lines = text.split(/\r?\n/).map(l => l.trim());
        const detected = [];
        const missing = [];
        const signals = [];

        SECTIONS.forEach(sec => {
            const foundLineIdx = lines.findIndex(l => sec.regex.test(l) && l.length < 50);
            if (foundLineIdx !== -1) {
                // Check section body length
                let bodyLines = 0;
                for (let i = foundLineIdx + 1; i < Math.min(lines.length, foundLineIdx + 15); i++) {
                    if (lines[i].length > 5) bodyLines++;
                }

                let status = 'strong';
                let label = '✓ Detected';
                if (bodyLines <= 1) {
                    status = 'weak';
                    label = '⚠ Minimal Content';
                }

                detected.push(sec.id);
                signals.push({
                    id: sec.id,
                    name: sec.name,
                    status,
                    label,
                    required: sec.required,
                    feedback: status === 'weak' ? 'Section has very brief content; consider elaborating.' : 'Well structured section.'
                });
            } else {
                missing.push(sec.id);
                signals.push({
                    id: sec.id,
                    name: sec.name,
                    status: sec.required ? 'missing' : 'optional',
                    label: sec.required ? '✗ Missing' : '○ Optional',
                    required: sec.required,
                    feedback: sec.required ? 'Recommended standard section for ATS readability.' : 'Optional section; add if applicable to your profile.'
                });
            }
        });

        return { detected, missing, signals };
    }

    function analyzeBullets(text) {
        if (!text || typeof text !== 'string') return { total: 0, strong: 0, weak: 0, bullets: [] };

        const lines = text.split(/\r?\n/).map(l => l.trim());
        const bulletLines = lines.filter(l => /^[-*•\d.]+\s+[A-Za-z]/.test(l) || (l.length > 25 && l.length < 250 && !l.endsWith(':')));

        const assessments = [];
        let strongCount = 0;
        let weakCount = 0;

        bulletLines.slice(0, 20).forEach((bullet, i) => {
            const clean = bullet.replace(/^[-*•\d.]+\s*/, '').trim();
            const words = clean.split(/\s+/).filter(Boolean);
            const lower = clean.toLowerCase();

            // Check 1: Action Verb
            const firstWord = words[0]?.toLowerCase() || '';
            const hasActionVerb = ACTION_VERBS.some(v => firstWord.startsWith(v) || lower.includes(v));

            // Check 2: Measurable Result / Numbers
            const hasMetric = /\b\d+(\.\d+)?%?|\$\d+|\b\d+\s*(x|times|users|ms|sec|req|clients|members)\b/i.test(clean);

            // Check 3: Length
            const isRunOn = words.length > 35;
            const isTooShort = words.length < 7;

            // Check 4: Passive phrasing
            const isPassive = /\b(was|were)\s+(developed|created|managed|responsible|handled)\b/i.test(clean);

            let quality = 'medium';
            const suggestions = [];

            if (!hasActionVerb) suggestions.push('Start with a strong action verb (e.g. Engineered, Spearheaded, Built).');
            if (isPassive) suggestions.push('Shift from passive to active voice.');
            if (isRunOn) suggestions.push('Bullet is overly long (>35 words). Break into two concise points.');
            if (isTooShort) suggestions.push('Bullet is brief; describe the task and technology used.');
            if (!hasMetric) suggestions.push('Consider adding a real measurable result if available (e.g. scale, speedup, or user impact).');

            if (hasActionVerb && hasMetric && !isRunOn && !isPassive) {
                quality = 'strong';
                strongCount++;
            } else if (!hasActionVerb || isPassive || isTooShort) {
                quality = 'weak';
                weakCount++;
            } else {
                quality = 'medium';
                strongCount++;
            }

            assessments.push({
                id: `b-${i + 1}`,
                original: bullet,
                quality,
                hasActionVerb,
                hasMetric,
                isRunOn,
                isPassive,
                suggestions
            });
        });

        return {
            total: bulletLines.length,
            strong: strongCount,
            weak: weakCount,
            bullets: assessments
        };
    }

    function analyzeBullet(bullet) {
        const clean = (bullet || '').replace(/^[-*•\d.]+\s*/, '').trim();
        const words = clean.split(/\s+/).filter(Boolean);
        const lower = clean.toLowerCase();
        const firstWord = words[0]?.toLowerCase() || '';
        const hasAction = ACTION_VERBS.some(v => firstWord.startsWith(v) || lower.includes(v));
        const hasMetric = /\b\d+(\.\d+)?%?|\$\d+|\b\d+\s*(x|times|users|ms|sec|req|clients|members)\b/i.test(clean);
        const hasTech = /\b(go|kafka|react|python|sql|java|docker|aws|node|typescript|javascript|c\+\+|kubernetes|graphql|spring|flask)\b/i.test(clean);
        const rating = hasAction && (hasMetric || hasTech) ? 'Strong' : hasAction ? 'Moderate' : 'Weak';

        return {
            hasAction,
            hasActionVerb: hasAction,
            hasMetric,
            hasResult: hasMetric,
            hasTech,
            rating,
            clean
        };
    }

    function evaluateResumeQuality(text) {
        const sections = analyzeSections(text);
        const bullets = analyzeBullets(text);

        // Calculate overall quality score (0-100)
        let score = 50;
        const requiredDetected = sections.signals.filter(s => s.required && s.status !== 'missing').length;
        score += requiredDetected * 8; // Max ~32 pts

        const strongBulletRatio = bullets.total > 0 ? (bullets.strong / bullets.total) : 0.5;
        score += Math.round(strongBulletRatio * 20); // Max ~20 pts

        const clampedScore = Math.min(100, Math.max(25, score));

        const detectedNames = sections.signals.filter(s => s.status !== 'missing').map(s => s.name);
        const missingNames = sections.signals.filter(s => s.required && s.status === 'missing').map(s => s.name);

        return {
            qualityScore: clampedScore,
            score: clampedScore,
            sections,
            bullets,
            sectionsDetected: detectedNames,
            missingSections: missingNames,
            bulletReview: {
                totalBullets: bullets.total,
                strongBullets: bullets.strong,
                weakBullets: bullets.weak
            },
            recommendations: [
                ...missingNames.map(m => `Add a dedicated "${m}" section for ATS scanners.`),
                ...(bullets.weak > 0 ? [`Strengthen ${bullets.weak} bullet points by starting with direct action verbs and including metrics.`] : [])
            ]
        };
    }

    return {
        analyzeSections,
        analyzeBullets,
        analyzeBullet,
        evaluateResumeQuality,
        SECTIONS,
        ACTION_VERBS
    };
})();

if (typeof window !== 'undefined') {
    window.ResumeImprover = ResumeImprover;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResumeImprover;
}
