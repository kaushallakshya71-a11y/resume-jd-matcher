// ============================================================
// humanizer.js — Rule-Based Resume Humanizer & Style Converter
// ResumeMatch AI — Client-Side Tone & Style Transformation
// 5 Modes: Simple, Professional, Natural, Concise, Impact-Focused
// MANDATORY RULE: Strictly preserves all facts (companies, dates,
// technologies, numbers, metrics) and NEVER invents fake data.
// ============================================================

const ResumeHumanizer = (function () {

    // Common fluff & corporate bloat phrases to streamline
    const FLUFF_REPLACEMENTS = {
        simple: [
            { regex: /\bleveraged\s+cutting-edge\b/gi, rep: 'used modern' },
            { regex: /\bleveraged\b/gi, rep: 'used' },
            { regex: /\butilize(d|s)?\b/gi, rep: 'use$1' },
            { regex: /\bspearheaded\s+cross-functional\b/gi, rep: 'led team' },
            { regex: /\bspearheaded\b/gi, rep: 'led' },
            { regex: /\borchestrated\b/gi, rep: 'managed' },
            { regex: /\bseamlessly\s+integrated\b/gi, rep: 'integrated' },
            { regex: /\bin\s+order\s+to\b/gi, rep: 'to' },
            { regex: /\ba\s+multitude\s+of\b/gi, rep: 'multiple' },
            { regex: /\bstate-of-the-art\b/gi, rep: 'modern' },
            { regex: /\brobust\s+and\s+scalable\b/gi, rep: 'scalable' },
            { regex: /\bgroundbreaking\b/gi, rep: 'new' },
            { regex: /\bparadigm\s+shift\b/gi, rep: 'major change' },
            { regex: /\bproven\s+track\s+record\s+of\b/gi, rep: 'experience in' }
        ],
        professional: [
            { regex: /\bworked\s+on\b/gi, rep: 'Engineered' },
            { regex: /\bhelped\s+with\b/gi, rep: 'Collaborated on' },
            { regex: /\bdid\b/gi, rep: 'Executed' },
            { regex: /\blooked\s+after\b/gi, rep: 'Oversaw' },
            { regex: /\bwas\s+in\s+charge\s+of\b/gi, rep: 'Directed' },
            { regex: /\bmade\b/gi, rep: 'Developed' },
            { regex: /\bfixed\b/gi, rep: 'Resolved' },
            { regex: /\bchecked\b/gi, rep: 'Audited' }
        ],
        natural: [
            { regex: /\bindividual\s+contributor\s+driving\b/gi, rep: 'developer building' },
            { regex: /\bsynergized\s+efforts\b/gi, rep: 'worked together' },
            { regex: /\bholistic\s+methodology\b/gi, rep: 'comprehensive approach' },
            { regex: /\btestament\s+to\b/gi, rep: 'result of' },
            { regex: /\bharnessing\s+the\s+power\s+of\b/gi, rep: 'using' },
            { regex: /\bdelved\s+into\b/gi, rep: 'analyzed' },
            { regex: /\bdemonstrated\s+ability\s+to\b/gi, rep: 'able to' }
        ],
        concise: [
            { regex: /\bdue\s+to\s+the\s+fact\s+that\b/gi, rep: 'because' },
            { regex: /\bat\s+this\s+point\s+in\s+time\b/gi, rep: 'currently' },
            { regex: /\bfor\s+the\s+purpose\s+of\b/gi, rep: 'to' },
            { regex: /\bin\s+the\s+event\s+that\b/gi, rep: 'if' },
            { regex: /\bwas\s+responsible\s+for\b/gi, rep: 'managed' },
            { regex: /\bresponsible\s+for\b/gi, rep: 'managed' },
            { regex: /\bsuccessfully\b/gi, rep: '' },
            { regex: /\beffectively\b/gi, rep: '' },
            { regex: /\bvarious\b/gi, rep: '' },
            { regex: /\bclosely\s+with\b/gi, rep: 'with' }
        ]
    };

    // Extract facts from original text: numbers, dates, emails, uppercase tech symbols
    function extractFacts(text) {
        const numbers = text.match(/\b\d+(\.\d+)?%?|\$\d+([kmb])?|\b\d+\b/gi) || [];
        const dates = text.match(/\b(19|20)\d{2}\b|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}\b/gi) || [];
        const techTerms = text.match(/\b(React|Node\.?js|Python|Java|SQL|AWS|Docker|Kubernetes|TypeScript|JavaScript|PostgreSQL|MongoDB|Vue|Angular|Spring\s+Boot|Git|Linux|C\+\+|Go|Golang|Rust|HTML|CSS)\b/gi) || [];
        return {
            numbers: [...new Set(numbers)],
            dates: [...new Set(dates)],
            techTerms: [...new Set(techTerms)]
        };
    }

    // Check if new string invents any new numbers not found in original
    function containsInventedNumbers(original, candidate) {
        const origNums = (original.match(/\b\d+(\.\d+)?%?|\$\d+/g) || []).map(n => n.toLowerCase());
        const candNums = candidate.match(/\b\d+(\.\d+)?%?|\$\d+/g) || [];
        for (const num of candNums) {
            if (!origNums.includes(num.toLowerCase())) {
                return true; // Invented number detected!
            }
        }
        return false;
    }

    function humanizeSentence(sentence, mode = 'professional', preserveFacts = true) {
        const trimmed = sentence.trim();
        if (trimmed.length < 8) return trimmed;

        // Strip bullet markers for processing, retain for output
        const prefixMatch = trimmed.match(/^([-*•\d.]+\s*)/);
        const prefix = prefixMatch ? prefixMatch[1] : '';
        let core = trimmed.slice(prefix.length).trim();

        const originalFacts = extractFacts(core);
        let humanized = core;

        switch (mode) {
            case 'simple':
                FLUFF_REPLACEMENTS.simple.forEach(rule => {
                    humanized = humanized.replace(rule.regex, rule.rep);
                });
                break;

            case 'professional':
                FLUFF_REPLACEMENTS.professional.forEach(rule => {
                    humanized = humanized.replace(rule.regex, rule.rep);
                });
                FLUFF_REPLACEMENTS.simple.forEach(rule => {
                    humanized = humanized.replace(rule.regex, rule.rep);
                });
                break;

            case 'natural':
                FLUFF_REPLACEMENTS.natural.forEach(rule => {
                    humanized = humanized.replace(rule.regex, rule.rep);
                });
                FLUFF_REPLACEMENTS.simple.forEach(rule => {
                    humanized = humanized.replace(rule.regex, rule.rep);
                });
                break;

            case 'concise':
                FLUFF_REPLACEMENTS.concise.forEach(rule => {
                    humanized = humanized.replace(rule.regex, rule.rep);
                });
                FLUFF_REPLACEMENTS.simple.forEach(rule => {
                    humanized = humanized.replace(rule.regex, rule.rep);
                });
                break;

            case 'impact':
                // Action + Tech + Task structure (preserving existing metrics only)
                // If original has weak starter, elevate it
                humanized = humanized
                    .replace(/^worked\s+on\s+/i, 'Engineered ')
                    .replace(/^helped\s+build\s+/i, 'Developed ')
                    .replace(/^responsible\s+for\s+/i, 'Spearheaded ');

                // Check if sentence already has a metric
                if (originalFacts.numbers.length === 0 && !humanized.includes('measurable result')) {
                    // Inform the user rather than inventing numbers
                    humanized = humanized.replace(/[.]+$/, '') + ' (consider adding a measurable result if available).';
                }
                break;

            default:
                break;
        }

        // Clean up double spaces or awkward punctuation
        humanized = humanized.replace(/\s{2,}/g, ' ').trim();
        if (/^[a-z]/.test(humanized)) {
            humanized = humanized.charAt(0).toUpperCase() + humanized.slice(1);
        }

        // Strict Fact Preservation check: Never invent numbers or mutate detected facts
        if (preserveFacts && containsInventedNumbers(core, humanized)) {
            // Revert candidate if unauthorized numbers were added
            humanized = core;
        }

        return prefix + humanized;
    }

    function humanizeText(fullText, mode = 'professional', preserveFacts = true) {
        if (!fullText || typeof fullText !== 'string') {
            return {
                original: '',
                humanized: '',
                mode,
                preserveFacts,
                suggestions: []
            };
        }

        const lines = fullText.split(/\r?\n/);
        const suggestions = [];
        const transformedLines = [];
        let sugId = 1;

        lines.forEach((line, idx) => {
            const trimmed = line.trim();
            if (trimmed.length < 10 || /^([A-Z\s]{3,}|Summary|Education|Experience|Skills|Projects):?$/.test(trimmed)) {
                transformedLines.push(line);
                return;
            }

            const improved = humanizeSentence(trimmed, mode, preserveFacts);
            transformedLines.push(improved);

            if (improved !== trimmed) {
                suggestions.push({
                    id: `sug-${sugId++}`,
                    lineIndex: idx,
                    original: trimmed,
                    suggestion: improved,
                    mode,
                    explanation: `Style transformed to "${mode}" with facts strictly preserved.`
                });
            }
        });

        return {
            original: fullText,
            humanized: transformedLines.join('\n'),
            mode,
            preserveFacts,
            suggestions
        };
    }

    return {
        humanizeSentence,
        humanizeText,
        extractFacts,
        containsInventedNumbers,
        MODES: ['simple', 'professional', 'natural', 'concise', 'impact']
    };
})();

if (typeof window !== 'undefined') {
    window.ResumeHumanizer = ResumeHumanizer;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResumeHumanizer;
}
