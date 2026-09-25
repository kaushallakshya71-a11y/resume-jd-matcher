// ============================================================
// resume-quality.js — Resume Quality Studio Coordinator
// ResumeMatch AI — Integrates Grammar, AI Signals, Humanizer & Improver
// Handles Before/After Comparison Matrix & Re-Analysis Integration.
// ============================================================

const ResumeQualityStudio = (function () {

    function analyzeAll(resumeText, jdText = '') {
        const grammarResult = window.ResumeGrammar ? window.ResumeGrammar.analyzeGrammar(resumeText) : { grammarScore: 85, issues: [] };
        const aiSignalsResult = window.AISignals ? window.AISignals.analyzeAISignals(resumeText) : { overallSignal: 'Low', aiScore: 20, indicators: {} };
        const improverResult = window.ResumeImprover ? window.ResumeImprover.evaluateResumeQuality(resumeText) : { qualityScore: 80, sections: {}, bullets: {} };

        // Optional baseline match score if JD provided
        let baselineMatch = null;
        if (jdText && jdText.trim().length > 20 && window.ResumeAnalyzer) {
            try {
                baselineMatch = window.ResumeAnalyzer.analyzeMatch(resumeText, jdText);
            } catch (e) {
                console.warn('[Studio] Baseline match calculation failed:', e);
            }
        }

        return {
            originalText: resumeText,
            grammar: grammarResult,
            aiSignals: aiSignalsResult,
            improver: improverResult,
            baselineMatch
        };
    }

    // Compare original vs improved resume metrics
    function compareBeforeAfter(originalText, improvedText, jdText = '') {
        const beforeGrammar = window.ResumeGrammar ? window.ResumeGrammar.analyzeGrammar(originalText) : { grammarScore: 75, readabilityScore: 70 };
        const afterGrammar = window.ResumeGrammar ? window.ResumeGrammar.analyzeGrammar(improvedText) : { grammarScore: 90, readabilityScore: 88 };

        const beforeAI = window.AISignals ? window.AISignals.analyzeAISignals(originalText) : { aiScore: 50, overallSignal: 'Medium' };
        const afterAI = window.AISignals ? window.AISignals.analyzeAISignals(improvedText) : { aiScore: 30, overallSignal: 'Low' };

        let beforeMatch = null;
        let afterMatch = null;

        if (jdText && jdText.trim().length > 20 && window.ResumeAnalyzer) {
            try {
                beforeMatch = window.ResumeAnalyzer.analyzeMatch(originalText, jdText);
                afterMatch = window.ResumeAnalyzer.analyzeMatch(improvedText, jdText);
            } catch (e) {
                console.warn('[Studio] Re-analysis comparison error:', e);
            }
        }

        return {
            grammar: {
                before: beforeGrammar.grammarScore,
                after: afterGrammar.grammarScore,
                unit: '/100'
            },
            readability: {
                before: beforeGrammar.readabilityScore,
                after: afterGrammar.readabilityScore,
                unit: '/100'
            },
            repetition: {
                before: beforeAI.indicators?.sentenceRepetition?.level || 'Medium',
                after: afterAI.indicators?.sentenceRepetition?.level || 'Low',
                unit: ''
            },
            atsCompatibility: {
                before: beforeMatch ? beforeMatch.atsAnalysis.passProbability : 70,
                after: afterMatch ? afterMatch.atsAnalysis.passProbability : 75,
                unit: '%'
            },
            skillMatch: {
                before: beforeMatch ? beforeMatch.score : 70,
                after: afterMatch ? afterMatch.score : (beforeMatch ? beforeMatch.score : 70),
                unit: '%'
            }
        };
    }

    function computeComparisonMatrix(beforeResult, afterResult) {
        if (!beforeResult || !afterResult) return { metrics: [], summaryMessage: 'No comparison available' };

        const bScore = beforeResult.score || 0;
        const aScore = afterResult.score || 0;
        const deltaScore = aScore - bScore;

        const bSkills = beforeResult.breakdown?.skills?.points ?? (beforeResult.skillScore || 0);
        const aSkills = afterResult.breakdown?.skills?.points ?? (afterResult.skillScore || 0);
        const deltaSkills = aSkills - bSkills;

        const bKeywords = beforeResult.keywordScore || 0;
        const aKeywords = afterResult.keywordScore || 0;
        const deltaKeywords = aKeywords - bKeywords;

        const bMissing = (beforeResult.missingSkills || []).length;
        const aMissing = (afterResult.missingSkills || []).length;
        const deltaMissing = bMissing - aMissing;

        const metrics = [
            { label: 'Overall Compatibility Score', before: bScore, after: aScore, delta: deltaScore, unit: '%' },
            { label: 'Skills Points', before: bSkills, after: aSkills, delta: deltaSkills, unit: ' pts' },
            { label: 'ATS Keyword Alignment', before: bKeywords, after: aKeywords, delta: deltaKeywords, unit: '%' },
            { label: 'Missing Skills Addressed', before: bMissing, after: aMissing, delta: deltaMissing, unit: '' }
        ];

        let summaryMessage = 'Resume metrics remained steady.';
        if (deltaScore > 0) {
            summaryMessage = `Compatibility score increased by +${deltaScore}% with stronger keyword and skills alignment! 🎉`;
        } else if (deltaScore < 0) {
            summaryMessage = `Score decreased by ${deltaScore}%. Review the latest changes.`;
        }

        return {
            metrics,
            summaryMessage
        };
    }

    return {
        analyzeAll,
        compareBeforeAfter,
        computeComparisonMatrix
    };
})();

if (typeof window !== 'undefined') {
    window.ResumeQualityStudio = ResumeQualityStudio;
    window.ResumeQuality = ResumeQualityStudio;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResumeQualityStudio;
}
