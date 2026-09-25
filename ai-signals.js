// ============================================================
// ai-signals.js — Probabilistic AI Writing Signals Engine
// ResumeMatch AI — Writing Style & Uniformity Analyzer
// Evaluates generic phrasing, buzzword density, sentence uniformity,
// and personal specificity. Strictly informational with no false certainty.
// ============================================================

const AISignals = (function () {

    // Common AI-cliché phrases frequent in generative model outputs
    const AI_CLICHES = [
        'results-driven',
        'proven track record',
        'fast-paced environment',
        'visionary professional',
        'forward-thinking',
        'best-in-class',
        'holistic transformations',
        'spearheaded cross-functional', 'leveraged cutting-edge', 'state-of-the-art',
        'testament to', 'delve into', 'beacon of', 'paradigm shift',
        'seamless integration', 'holistic approach', 'pivotal role in driving',
        'results-driven professional with a proven track record',
        'dynamic and forward-thinking', 'fostered an environment of',
        'synergized efforts', 'revolutionized the way', 'unwavering commitment',
        'harnessing the power of', 'deep dive', 'game-changer',
        'navigated complex challenges', 'instrumental in facilitating',
        'meticulously designed and implemented', 'demonstrated ability to thrive',
        'collaborated with cross-functional stakeholders to optimize'
    ];

    // Corporate buzzwords that trigger elevated buzzword density
    const BUZZWORDS = [
        'synergy', 'synergies', 'holistic', 'pivotal', 'transformative',
        'transformations', 'revolutionized', 'exponential', 'paradigm', 'robust', 'seamless',
        'cutting-edge', 'groundbreaking', 'unparalleled', 'disruptive',
        'hyper-growth', 'bandwidth', 'streamline', 'streamlined', 'impactful',
        'scalable', 'orchestrated', 'catalyst', 'ever-evolving', 'leveraging'
    ];

    function analyzeAISignals(text) {
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return {
                overallSignal: 'Insufficient Text',
                signalClass: 'low',
                aiScore: 0,
                disclaimer: 'AI detection is probabilistic and may produce false positives or false negatives. This result reflects stylistic patterns and does not prove authorship.',
                indicators: {
                    genericPhrasing: { level: 'Low', score: 0, details: 'No text provided.' },
                    sentenceRepetition: { level: 'Low', score: 0, details: 'No text provided.' },
                    buzzwordDensity: { level: 'Low', score: 0, details: 'No text provided.' },
                    sentenceUniformity: { level: 'Low', score: 0, details: 'No text provided.' },
                    personalSpecificity: { level: 'High', score: 0, details: 'No text provided.' }
                },
                explanation: 'Please provide resume text to evaluate writing style signals.'
            };
        }

        const lower = text.toLowerCase();
        const sentences = text
            .split(/[.\n;]+/)
            .map(s => s.trim())
            .filter(s => s.length > 15);

        const totalSentences = Math.max(sentences.length, 1);
        const words = lower.split(/\s+/).filter(Boolean);
        const totalWords = Math.max(words.length, 1);

        // 1. Generic Phrasing / AI Cliches
        let clicheHits = 0;
        const matchedCliches = [];
        AI_CLICHES.forEach(cliche => {
            if (lower.includes(cliche)) {
                clicheHits++;
                matchedCliches.push(cliche);
            }
        });
        const clicheScore = Math.min(100, Math.round((clicheHits / Math.max(totalSentences * 0.4, 1)) * 100));
        const genericLevel = clicheScore >= 60 ? 'High' : clicheScore >= 30 ? 'Medium' : 'Low';

        // 2. Buzzword Density
        let buzzwordCount = 0;
        words.forEach(w => {
            const clean = w.replace(/[^a-z-]/g, '');
            if (BUZZWORDS.includes(clean)) buzzwordCount++;
        });
        const buzzwordRatio = (buzzwordCount / totalWords) * 100;
        const buzzwordScore = Math.min(100, Math.round(buzzwordRatio * 15));
        const buzzwordLevel = buzzwordScore >= 60 ? 'High' : buzzwordScore >= 25 ? 'Medium' : 'Low';

        // 3. Sentence Length Uniformity (Low standard deviation = High uniformity)
        const lengths = sentences.map(s => s.split(/\s+/).filter(Boolean).length);
        const avgLen = lengths.reduce((a, b) => a + b, 0) / lengths.length;
        const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLen, 2), 0) / lengths.length;
        const stdDev = Math.sqrt(variance);

        // If sentences are very uniform (stdDev < 4 and more than 3 sentences), AI uniformity signal is high
        let uniformityScore = 20;
        if (sentences.length >= 3) {
            if (stdDev < 3.5) uniformityScore = 80;
            else if (stdDev < 6.0) uniformityScore = 50;
            else uniformityScore = 25;
        }
        const uniformityLevel = uniformityScore >= 70 ? 'High' : uniformityScore >= 40 ? 'Medium' : 'Low';

        // 4. Sentence Structure Repetition (e.g. repeated sentence opening words)
        const starters = sentences.map(s => s.split(/\s+/)[0]?.toLowerCase()).filter(Boolean);
        const starterCounts = {};
        starters.forEach(st => starterCounts[st] = (starterCounts[st] || 0) + 1);
        const maxRepetition = Math.max(...Object.values(starterCounts), 1);
        const repRatio = maxRepetition / Math.max(starters.length, 1);
        const repetitionScore = Math.min(100, Math.round(repRatio * 100));
        const repetitionLevel = repetitionScore >= 50 ? 'High' : repetitionScore >= 30 ? 'Medium' : 'Low';

        // 5. Personal Specificity (Numbers, specific metrics, company names, tools)
        const hasNumbers = (text.match(/\b\d+(\.\d+)?%?|\$\d+/g) || []).length;
        const specificScore = Math.min(100, Math.round((hasNumbers / Math.max(totalSentences * 0.5, 1)) * 100));
        const specificityLevel = specificScore >= 60 ? 'High' : specificScore >= 30 ? 'Medium' : 'Low';

        // Weighted Overall AI Signal (Higher = more generic/uniform/buzzword-heavy)
        const compositeScore = Math.round(
            clicheScore * 0.35 +
            buzzwordScore * 0.25 +
            uniformityScore * 0.20 +
            repetitionScore * 0.10 +
            (100 - specificScore) * 0.10
        );

        let overallSignal, signalClass;
        if (compositeScore >= 65) {
            overallSignal = 'Higher AI-like writing signals detected';
            signalClass = 'high';
        } else if (compositeScore >= 40) {
            overallSignal = 'Moderate AI-like writing signals detected';
            signalClass = 'medium';
        } else {
            overallSignal = 'Lower AI-like writing signals detected (Natural / Specific)';
            signalClass = 'low';
        }

        const explanationParts = [];
        if (genericLevel === 'High') explanationParts.push(`Contains ${clicheHits} standard generic phrases common in AI templates.`);
        if (buzzwordLevel === 'High') explanationParts.push(`High density of corporate buzzwords (${buzzwordCount} detected).`);
        if (uniformityLevel === 'High') explanationParts.push('Sentence lengths exhibit very high structural uniformity.');
        if (specificityLevel === 'Low') explanationParts.push('Low count of concrete personal numbers or real-world project specifics.');
        if (explanationParts.length === 0) explanationParts.push('Phrasing appears authentic with varied sentence structures and specific context.');

        return {
            probability: compositeScore,
            aiScore: compositeScore,
            riskLevel: compositeScore >= 65 ? 'High AI Writing Signal' : compositeScore >= 40 ? 'Moderate AI Writing Signal' : 'Low AI Writing Signal',
            overallSignal,
            signalClass,
            disclaimer: 'AI detection is probabilistic and may produce false positives or false negatives. This result reflects stylistic patterns and does not prove authorship.',
            foundCliches: matchedCliches,
            metrics: {
                genericCliches: clicheHits,
                buzzwordDensity: parseFloat(buzzwordRatio.toFixed(1)),
                sentenceUniformity: uniformityScore,
                personalSpecificity: specificScore
            },
            indicators: {
                genericPhrasing: {
                    level: genericLevel,
                    score: clicheScore,
                    details: matchedCliches.length > 0 ? `Detected: ${matchedCliches.slice(0, 3).join(', ')}` : 'Low cliché usage'
                },
                sentenceRepetition: {
                    level: repetitionLevel,
                    score: repetitionScore,
                    details: `${maxRepetition} bullets share similar starting words`
                },
                buzzwordDensity: {
                    level: buzzwordLevel,
                    score: buzzwordScore,
                    details: `${buzzwordCount} buzzwords found (${buzzwordRatio.toFixed(1)}% of vocabulary)`
                },
                sentenceUniformity: {
                    level: uniformityLevel,
                    score: uniformityScore,
                    details: `Sentence length std dev: ${stdDev.toFixed(1)} words`
                },
                personalSpecificity: {
                    level: specificityLevel,
                    score: specificScore,
                    details: `${hasNumbers} specific metrics or numeric impact markers found`
                }
            },
            explanation: explanationParts.join(' ')
        };
    }

    return {
        analyzeAISignals,
        AI_CLICHES,
        BUZZWORDS
    };
})();

if (typeof window !== 'undefined') {
    window.AISignals = AISignals;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AISignals;
}
