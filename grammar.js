// ============================================================
// grammar.js — Rule-Based Grammar, Spelling & Style Engine
// ResumeMatch AI — Client-Side Grammar & Tone Analyzer
// Analyzes grammar, spelling, tense, passive voice, repeated words,
// punctuation, and professional tone with sentence-by-sentence suggestions.
// ============================================================

const ResumeGrammar = (function () {

    // Common resume & technical spelling corrections
    const SPELLING_DICT = {
        'softaware': 'software',
        'enginer': 'engineer',
        'recieve': 'receive',
        'experiance': 'experience',
        'seperate': 'separate',
        'recieved': 'received',
        'teh': 'the',
        'sucessful': 'successful',
        'maintainance': 'maintenance',
        'programing': 'programming',
        'developement': 'development',
        'responsibilty': 'responsibility',
        'responsibile': 'responsible',
        'enviroment': 'environment',
        'referance': 'reference',
        'acheive': 'achieve',
        'acheived': 'achieved',
        'occurance': 'occurrence',
        'colaborate': 'collaborate',
        'colaborated': 'collaborated',
        'impliment': 'implement',
        'implimented': 'implemented',
        'integreate': 'integrate',
        'integreated': 'integrated',
        'architechture': 'architecture',
        'performence': 'performance',
        'databse': 'database',
        'frondend': 'frontend',
        'baclend': 'backend',
        'dependancy': 'dependency',
        'independant': 'independent',
        'managment': 'management',
        'optimise': 'optimize',
        'analise': 'analyze'
    };

    // Concise replacements for wordy phrases
    const CONCISE_DICT = {
        'in order to': 'to',
        'due to the fact that': 'because',
        'at this point in time': 'currently',
        'utilize': 'use',
        'utilized': 'used',
        'utilizing': 'using',
        'for the purpose of': 'to',
        'in the event that': 'if',
        'with reference to': 'regarding',
        'has the ability to': 'can',
        'was responsible for': 'managed / led',
        'responsible for': 'led',
        'helped with': 'collaborated on',
        'worked on': 'developed'
    };

    // Passive voice patterns to active voice hints
    const PASSIVE_PATTERNS = [
        { regex: /\bwas developed by\b/gi, fix: 'developed' },
        { regex: /\bwere engineered by\b/gi, fix: 'engineered' },
        { regex: /\bwas created by\b/gi, fix: 'created' },
        { regex: /\bwas implemented by\b/gi, fix: 'implemented' },
        { regex: /\bwas built by\b/gi, fix: 'built' },
        { regex: /\bwere managed by\b/gi, fix: 'managed' },
        { regex: /\bwas responsible for\b/gi, fix: 'led / managed' }
    ];

    // Weak starting verbs for resume bullet points
    const WEAK_STARTERS = [
        { regex: /^worked on\s+/i, fix: 'Engineered ' },
        { regex: /^helped with\s+/i, fix: 'Collaborated on ' },
        { regex: /^responsible for\s+/i, fix: 'Managed ' },
        { regex: /^assisted in\s+/i, fix: 'Facilitated ' },
        { regex: /^handled\s+/i, fix: 'Orchestrated ' },
        { regex: /^did\s+/i, fix: 'Executed ' },
        { regex: /^develop\s+(application|system|feature|service|pipeline|tool|website|app)\b/i, fix: 'Developed an ' }
    ];

    function splitIntoSentences(text) {
        if (!text || typeof text !== 'string') return [];
        return text
            .split(/\r?\n+/)
            .map(line => line.trim())
            .filter(line => line.length > 0);
    }

    function analyzeGrammar(text) {
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return {
                grammarScore: 100,
                issuesCount: 0,
                issues: [],
                readabilityScore: 100,
                summary: 'No text provided for grammar check.'
            };
        }

        const lines = splitIntoSentences(text);
        const issues = [];
        let issueId = 1;

        lines.forEach((line, lineIndex) => {
            const trimmed = line.replace(/^[-*•\d.]+\s*/, '').trim();
            if (trimmed.length < 5) return;

            // 1. Check spelling mistakes
            const words = trimmed.split(/[\s,;:()]+/);
            words.forEach(word => {
                const lower = word.toLowerCase();
                if (SPELLING_DICT[lower]) {
                    const corrected = SPELLING_DICT[lower];
                    const repRegex = new RegExp(`\\b${word}\\b`, 'g');
                    const suggestedLine = trimmed.replace(repRegex, corrected);
                    issues.push({
                        id: `gram-${issueId++}`,
                        type: 'spelling',
                        category: 'Spelling',
                        original: trimmed,
                        suggestion: suggestedLine,
                        explanation: `Spelling correction: "${word}" → "${corrected}".`,
                        lineIndex
                    });
                }
            });

            // 2. Check repeated words (e.g. "the the", "in in")
            const repeatedMatch = trimmed.match(/\b([a-zA-Z]{2,})\s+\1\b/i);
            if (repeatedMatch) {
                const dupWord = repeatedMatch[1];
                const fixed = trimmed.replace(new RegExp(`\\b${dupWord}\\s+${dupWord}\\b`, 'i'), dupWord);
                issues.push({
                    id: `gram-${issueId++}`,
                    type: 'repeated',
                    category: 'Repeated Words',
                    original: trimmed,
                    suggestion: fixed,
                    explanation: `Duplicate word detected: "${dupWord}". Removed duplicate.`,
                    lineIndex
                });
            }

            // 3. Passive voice checks
            PASSIVE_PATTERNS.forEach(pat => {
                if (pat.regex.test(trimmed)) {
                    const fixed = trimmed.replace(pat.regex, pat.fix);
                    issues.push({
                        id: `gram-${issueId++}`,
                        type: 'passive',
                        category: 'Passive Voice',
                        original: trimmed,
                        suggestion: fixed,
                        explanation: `Active voice is stronger on resumes: prefer "${pat.fix}" over passive construction.`,
                        lineIndex
                    });
                }
            });

            // 4. Weak bullet starters
            WEAK_STARTERS.forEach(starter => {
                if (starter.regex.test(trimmed)) {
                    const fixed = trimmed.replace(starter.regex, starter.fix);
                    issues.push({
                        id: `gram-${issueId++}`,
                        type: 'weak_verb',
                        category: 'Action Verbs',
                        original: trimmed,
                        suggestion: fixed,
                        explanation: `Begin bullet points with dynamic, impact-oriented action verbs.`,
                        lineIndex
                    });
                }
            });

            // 5. Wordy phrases
            Object.keys(CONCISE_DICT).forEach(wordy => {
                const wRegex = new RegExp(`\\b${wordy}\\b`, 'i');
                if (wRegex.test(trimmed)) {
                    const concise = CONCISE_DICT[wordy];
                    const fixed = trimmed.replace(wRegex, concise);
                    issues.push({
                        id: `gram-${issueId++}`,
                        type: 'concise',
                        category: 'Conciseness',
                        original: trimmed,
                        suggestion: fixed,
                        explanation: `Simplify "${wordy}" to "${concise}" for punchy resume phrasing.`,
                        lineIndex
                    });
                }
            });

            // 6. Lowercase sentence starters
            if (/^[a-z]/.test(trimmed) && trimmed.length > 10) {
                const fixed = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
                issues.push({
                    id: `gram-${issueId++}`,
                    type: 'punctuation',
                    category: 'Capitalization',
                    original: trimmed,
                    suggestion: fixed,
                    explanation: 'Capitalize the first letter of each bullet point or sentence.',
                    lineIndex
                });
            }
        });

        // Deduplicate issues
        const uniqueIssues = [];
        const seen = new Set();
        for (const iss of issues) {
            const key = `${iss.original}__${iss.suggestion}`;
            if (!seen.has(key)) {
                seen.add(key);
                uniqueIssues.push(iss);
            }
        }

        // Calculate Grammar & Style Score
        const penaltyPerIssue = 4.5;
        const rawScore = 100 - (uniqueIssues.length * penaltyPerIssue);
        const grammarScore = uniqueIssues.length === 0 ? 100 : Math.max(30, Math.min(100, Math.round(rawScore)));

        // Readability estimate
        const wordCount = text.split(/\s+/).filter(Boolean).length || 1;
        const avgSentenceLength = wordCount / Math.max(lines.length, 1);
        let readabilityScore = 85;
        if (avgSentenceLength > 25) readabilityScore = 65;
        else if (avgSentenceLength > 20) readabilityScore = 75;
        else if (avgSentenceLength > 12) readabilityScore = 88;
        else readabilityScore = 92;

        const spellingCount = uniqueIssues.filter(i => i.type === 'spelling').length;
        const weakVerbCount = uniqueIssues.filter(i => i.type === 'weak_verb' || i.category === 'Action Verbs').length;
        const passiveCount = uniqueIssues.filter(i => i.type === 'passive').length;
        const wordinessCount = uniqueIssues.filter(i => i.type === 'concise' || i.category === 'Conciseness').length;

        return {
            score: grammarScore,
            grammarScore,
            totalIssues: uniqueIssues.length,
            issuesCount: uniqueIssues.length,
            issues: uniqueIssues,
            spellingCount,
            weakVerbCount,
            passiveCount,
            wordinessCount,
            readabilityScore,
            summary: uniqueIssues.length === 0
                ? 'Excellent! No major grammar or spelling issues detected.'
                : `Found ${uniqueIssues.length} phrasing or grammar suggestions to improve resume clarity.`
        };
    }

    return {
        analyzeGrammar,
        SPELLING_DICT,
        CONCISE_DICT
    };
})();

if (typeof window !== 'undefined') {
    window.ResumeGrammar = ResumeGrammar;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResumeGrammar;
}
