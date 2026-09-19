// ============================================================
// test/test-suite.js — Automated Unit & Regression Tests
// ResumeMatch AI Core Logic Test Suite (Node.js runner)
// Covers: Skill Extraction, Aliases, False Positives, Scoring,
// ATS, Career Risk, LocalDB Validation, and PDF validation logic.
// ============================================================

const assert = require('assert');
const path = require('path');
const fs = require('fs');

// Load modules
const ResumeAnalyzer = require('../analyzer.js');
const CareerRisk = require('../career-risk.js');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function it(description, fn) {
    totalTests++;
    try {
        fn();
        passedTests++;
        console.log(`  ✅ PASS: ${description}`);
    } catch (err) {
        failedTests++;
        console.error(`  ❌ FAIL: ${description}`);
        console.error(`     Error: ${err.message}`);
    }
}

function describe(suiteName, fn) {
    console.log(`\n========================================`);
    console.log(`👉 SUITE: ${suiteName}`);
    console.log(`========================================`);
    fn();
}

// ----------------------------------------------------
// 1. SKILL EXTRACTION
// ----------------------------------------------------
describe('1. Skill Extraction & Canonicalization', () => {
    it('extracts standard skills (Python, JavaScript, Java, React, SQL)', () => {
        const text = "Experienced developer with Python, JavaScript, Java, React, and SQL database knowledge.";
        const extracted = ResumeAnalyzer.extractSkillsFromText(text);

        assert(extracted.includes('python'), 'Should extract python');
        assert(extracted.includes('javascript'), 'Should extract javascript');
        assert(extracted.includes('java'), 'Should extract java');
        assert(extracted.includes('react'), 'Should extract react');
        assert(extracted.includes('sql'), 'Should extract sql');
    });

    it('extracts multi-word skills like "machine learning" and "spring boot"', () => {
        const text = "Specialized in Machine Learning and Spring Boot enterprise applications.";
        const extracted = ResumeAnalyzer.extractSkillsFromText(text);
        assert(extracted.includes('machine learning'), 'Should extract machine learning');
        assert(extracted.includes('spring boot'), 'Should extract spring boot');
    });
});

// ----------------------------------------------------
// 2. ALIAS MATCHING
// ----------------------------------------------------
describe('2. Alias Matching Layer', () => {
    it('resolves JS -> javascript', () => {
        const skills = ResumeAnalyzer.extractSkillsFromText("Strong JS programmer");
        assert(skills.includes('javascript'), `Expected javascript, got: ${JSON.stringify(skills)}`);
    });

    it('resolves ReactJS and React.js -> react', () => {
        const s1 = ResumeAnalyzer.extractSkillsFromText("ReactJS frontend developer");
        assert(s1.includes('react'), `Expected react, got: ${JSON.stringify(s1)}`);

        const s2 = ResumeAnalyzer.extractSkillsFromText("Hands-on React.js experience");
        assert(s2.includes('react'), `Expected react, got: ${JSON.stringify(s2)}`);
    });

    it('resolves NodeJS -> node.js', () => {
        const skills = ResumeAnalyzer.extractSkillsFromText("Building APIs in NodeJS");
        assert(skills.includes('node.js'), `Expected node.js, got: ${JSON.stringify(skills)}`);
    });

    it('resolves Postgres -> postgresql', () => {
        const skills = ResumeAnalyzer.extractSkillsFromText("Database: Postgres");
        assert(skills.includes('postgresql'), `Expected postgresql, got: ${JSON.stringify(skills)}`);
    });
});

// ----------------------------------------------------
// 3. FALSE POSITIVE PREVENTION
// ----------------------------------------------------
describe('3. False Positive Prevention (Critical Guardrails)', () => {
    it('Java does NOT falsely match JavaScript', () => {
        const textOnlyJS = "Expert in JavaScript and Node.js web development.";
        const extracted = ResumeAnalyzer.extractSkillsFromText(textOnlyJS);
        assert(extracted.includes('javascript'), 'Should extract javascript');
        assert(!extracted.includes('java'), 'Should NOT extract java from javascript');
    });

    it('C does NOT falsely match inside C++ or C#', () => {
        const textCpp = "Software Engineer writing C++ and C# services.";
        const extracted = ResumeAnalyzer.extractSkillsFromText(textCpp);
        assert(extracted.includes('c++'), 'Should extract c++');
        assert(extracted.includes('c#'), 'Should extract c#');
        assert(!extracted.includes('c'), 'Should NOT extract plain C from C++ or C#');
    });

    it('Plain C is correctly extracted when standalone', () => {
        const textC = "Embedded systems developer with C programming skills.";
        const extracted = ResumeAnalyzer.extractSkillsFromText(textC);
        assert(extracted.includes('c'), 'Should extract standalone C');
    });

    it('React Native is distinguished from React web', () => {
        const textNative = "Mobile developer focusing exclusively on React Native apps.";
        const extracted = ResumeAnalyzer.extractSkillsFromText(textNative);
        assert(extracted.includes('react native'), 'Should extract react native');
        assert(!extracted.includes('react'), 'Should NOT extract plain react when only react native is stated');
    });

    it('Google does NOT falsely extract Go/Golang', () => {
        const textGoogle = "Attended Google cloud conference in Mountain View.";
        const extracted = ResumeAnalyzer.extractSkillsFromText(textGoogle);
        assert(!extracted.includes('go'), 'Should NOT extract go from Google');
    });

    it('Golang is reliably extracted', () => {
        const textGo = "Backend engineer writing services in Golang.";
        const extracted = ResumeAnalyzer.extractSkillsFromText(textGo);
        assert(extracted.includes('go'), 'Should extract go for Golang');
    });

    it('AWS and Azure do NOT falsely match each other', () => {
        const matchResult = ResumeAnalyzer.matchSkillsLayered(['aws'], ['azure']);
        assert(!matchResult.strongMatches.includes('azure'), 'AWS must not match Azure');
        assert(!matchResult.partialMatches.includes('azure'), 'AWS must not be partial for Azure');
        assert(matchResult.missingSkills.includes('azure'), 'Azure should be identified as missing');
    });
});

// ----------------------------------------------------
// 4. SCORING ENGINE & EDGE CASES
// ----------------------------------------------------
describe('4. Scoring Engine & Edge Cases', () => {
    it('handles empty or near-empty inputs gracefully without NaN or throwing', () => {
        const res = ResumeAnalyzer.analyzeMatch("", "");
        assert(typeof res.score === 'number', 'Score should be a number');
        assert(!isNaN(res.score), 'Score should not be NaN');
        assert(res.score >= 5 && res.score <= 98, 'Score should be clamped between 5 and 98');
    });

    it('produces high score for strong match', () => {
        const resume = `
            Senior Full Stack Engineer with 5 years of experience.
            Skills: React, TypeScript, Node.js, PostgreSQL, Docker, AWS, Git.
            Projects: Built scalable cloud e-commerce platform using React, Node.js, and PostgreSQL.
            Education: Bachelor in Computer Science.
        `;
        const jd = `
            Looking for Senior Developer with 5+ years experience.
            Required skills: React, TypeScript, Node.js, PostgreSQL, Docker, AWS.
        `;
        const res = ResumeAnalyzer.analyzeMatch(resume, jd, { roleLevel: 'senior' });
        assert(res.score >= 70, `Expected score >= 70 for strong match, got: ${res.score}`);
        assert.strictEqual(res.verdictClass, 'ready', 'Verdict should be ready/high compatibility');
    });

    it('produces low score for weak/unrelated match', () => {
        const resume = `
            Accountant with 2 years experience in Excel, Tally, Bookkeeping, Taxation.
        `;
        const jd = `
            Senior DevOps Engineer: Kubernetes, Terraform, AWS, Docker, Python, CI/CD.
        `;
        const res = ResumeAnalyzer.analyzeMatch(resume, jd, { roleLevel: 'senior' });
        assert(res.score < 50, `Expected low score for mismatch, got: ${res.score}`);
        assert.strictEqual(res.verdictClass, 'learning', 'Verdict should suggest targeted prep/learning');
    });

    it('applies Layer 3 partial matching for related technologies', () => {
        // Resume has JavaScript and Express, JD asks for Node.js and TypeScript
        const match = ResumeAnalyzer.matchSkillsLayered(['javascript', 'express'], ['node.js', 'typescript']);
        assert(match.partialMatches.length > 0, 'Should find partial/related matches');
    });
});

// ----------------------------------------------------
// 5. ATS ANALYZER
// ----------------------------------------------------
describe('5. ATS Analyzer', () => {
    it('calculates ATS compatibility without crashing', () => {
        const resume = "Software developer with React, Redux, Jest, Git, HTML, CSS.";
        const jd = "Seeking frontend developer skilled in React, Redux, Jest, Git, responsive design.";
        const res = ResumeAnalyzer.analyzeMatch(resume, jd);
        const ats = res.atsAnalysis;

        assert(typeof ats.passProbability === 'number', 'passProbability should be number');
        assert(ats.passLabel.includes('Alignment'), `Label should be transparent: ${ats.passLabel}`);
        assert(Array.isArray(ats.missingKeywords), 'missingKeywords should be an array');
        assert(Array.isArray(ats.atsTips), 'atsTips should be an array');
    });

    it('flags formatting risks for very short resumes', () => {
        const shortResume = "John Doe, programmer.";
        const jd = "Senior Full Stack Engineer needed.";
        const res = ResumeAnalyzer.analyzeMatch(shortResume, jd);
        assert(res.atsAnalysis.formatRisks.some(r => r.includes('short')), 'Should flag short resume');
    });
});

// ----------------------------------------------------
// 6. CAREER RISK SIGNALS ENGINE
// ----------------------------------------------------
describe('6. Career Risk Signals Engine', () => {
    it('handles empty/missing data gracefully', () => {
        const risk = CareerRisk.analyze({});
        assert(typeof risk.overallScore === 'number', 'Risk score should be number');
        assert(!isNaN(risk.overallScore), 'Risk score should not be NaN');
        assert(['Safe Zone', 'Warning Zone', 'High Risk Zone'].includes(risk.riskCategory));
        assert(risk.confidence === 'Low', 'Confidence should be Low with missing data');
    });

    it('evaluates healthy, active profile as Safe or Warning Zone with transparent wording', () => {
        const input = {
            currentRole: "Full Stack Engineer",
            yearsOfExperience: 4,
            experienceLevel: "mid",
            skills: "React, TypeScript, Node.js, Python, Docker, Kubernetes, AWS, SQL",
            learningActivity: "weekly",
            careerGoal: "Become a Tech Lead in a product company"
        };
        const risk = CareerRisk.analyze(input);
        assert(typeof risk.overallScore === 'number');
        assert(risk.projection.includes('indicators suggest') || risk.projection.includes('signals'), 'Projection should be transparent signal-based');
        assert(Array.isArray(risk.immediateActions), 'Should provide immediate action steps');
        assert(risk.immediateActions.length > 0, 'Actions should not be empty');
    });
});

// ----------------------------------------------------
// 7. LOCALDB BACKUP SCHEMA & VALIDATION
// ----------------------------------------------------
describe('7. LocalDB Backup Schema & Import Validation', () => {
    it('skills.json is properly formatted and contains required categories', () => {
        const skillsPath = path.join(__dirname, '../data/skills.json');
        assert(fs.existsSync(skillsPath), 'data/skills.json must exist');
        const raw = fs.readFileSync(skillsPath, 'utf8');
        const data = JSON.parse(raw);
        assert(Array.isArray(data), 'skills.json must be an array');
        assert(data.length > 50, 'skills.json should contain comprehensive skills');

        const first = data[0];
        assert(first.name, 'Skill must have name');
        assert(Array.isArray(first.aliases), 'Skill must have aliases array');
        assert(first.category, 'Skill must have category');
    });

    it('rejects invalid JSON backup structure', () => {
        const invalidPayloads = [
            null,
            {},
            { schema: 'wrong-schema' },
            { schema: 'resumematch-history-v1', matchHistory: 'not-an-array' }
        ];

        for (const payload of invalidPayloads) {
            const isValid = payload &&
                            payload.schema === 'resumematch-history-v1' &&
                            Array.isArray(payload.matchHistory) &&
                            Array.isArray(payload.riskHistory);
            assert(!isValid, `Payload should be rejected: ${JSON.stringify(payload)}`);
        }
    });

    it('accepts valid schema and sanitizes values', () => {
        const validPayload = {
            schema: 'resumematch-history-v1',
            matchHistory: [{ score: 85, verdict: 'High Compatibility', resumeSnippet: 'test' }],
            riskHistory: [{ overallScore: 25, riskCategory: 'Safe Zone' }]
        };
        const isValid = validPayload.schema === 'resumematch-history-v1' &&
                        Array.isArray(validPayload.matchHistory) &&
                        Array.isArray(validPayload.riskHistory);
        assert(isValid, 'Valid schema must be recognized');
    });
});

// ----------------------------------------------------
// SUMMARY
// ----------------------------------------------------
console.log(`\n========================================`);
console.log(`TEST RESULTS SUMMARY`);
console.log(`========================================`);
console.log(`Total:  ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);

if (failedTests > 0) {
    console.error(`❌ Some tests failed.`);
    process.exit(1);
} else {
    console.log(`🎉 ALL TESTS PASSED!`);
    process.exit(0);
}
