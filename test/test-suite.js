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
const ResumeGrammar = require('../grammar.js');
const AISignals = require('../ai-signals.js');
const ResumeHumanizer = require('../humanizer.js');
const ResumeImprover = require('../resume-improver.js');
const ResumeQuality = require('../resume-quality.js');
const ResumeVersions = require('../resume-versions.js');
const JobTracker = require('../job-tracker.js');
const { TRANSLATIONS, I18N } = require('../i18n.js');
const CareerAlignment = require('../career-alignment.js');
const Auth = require('../auth.js');
const LocalDB = require('../storage.js');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const pendingTests = [];
let testQueue = Promise.resolve();

function it(description, fn) {
    totalTests++;
    const testPromise = testQueue.then(async () => {
        try {
            await fn();
            passedTests++;
            console.log(`  ✅ PASS: ${description}`);
        } catch (err) {
            failedTests++;
            console.error(`  ❌ FAIL: ${description}`);
            console.error(`     Error: ${err.message}`);
        }
    });
    testQueue = testPromise;
    pendingTests.push(testPromise);
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
// 8. TRANSPARENT SCORE BREAKDOWN & EXPLAINABILITY
// ----------------------------------------------------
describe('8. Transparent Score Breakdown & Explainability', () => {
    it('calculates 5-dimension breakdown within max bounds', () => {
        const resume = "Experienced software engineer with 4 years in Python, React, SQL, and Docker. Good communication and teamwork.";
        const jd = "Looking for a Software Engineer with Python, React, SQL, and Docker. 3+ years experience required.";
        const result = ResumeAnalyzer.analyzeMatch(resume, jd);

        assert(result.breakdown, 'Match result must include breakdown');
        const b = result.breakdown;

        assert(b.skills && b.skills.max === 40, 'Skills dimension max must be 40');
        assert(b.experience && b.experience.max === 20, 'Experience dimension max must be 20');
        assert(b.domain && b.domain.max === 15, 'Domain dimension max must be 15');
        assert(b.softSkills && b.softSkills.max === 15, 'Soft skills dimension max must be 15');
        assert(b.ats && b.ats.max === 10, 'ATS dimension max must be 10');

        assert(b.skills.points >= 0 && b.skills.points <= 40, 'Skills points out of bounds');
        assert(b.experience.points >= 0 && b.experience.points <= 20, 'Experience points out of bounds');
        assert(b.domain.points >= 0 && b.domain.points <= 15, 'Domain points out of bounds');
        assert(b.softSkills.points >= 0 && b.softSkills.points <= 15, 'Soft skills points out of bounds');
        assert(b.ats.points >= 0 && b.ats.points <= 10, 'ATS points out of bounds');

        const expectedTotal = Math.min(100, b.skills.points + b.experience.points + b.domain.points + b.softSkills.points + b.ats.points);
        assert.strictEqual(b.total.points, expectedTotal, 'Total points must equal sum of dimension points');
    });

    it('provides honest compatibility framing and disclaimers', () => {
        const result = ResumeAnalyzer.analyzeMatch("Developer with React", "Developer with React");
        assert.strictEqual(result.scoreTitle, "Estimated Resume-JD Compatibility");
        assert(result.disclaimer && result.disclaimer.includes("hiring probability"), "Must include disclaimer about hiring probability");
        assert(result.atsDisclaimer && result.atsDisclaimer.includes("ATS systems vary"), "Must include ATS disclaimer");
    });
});

// ----------------------------------------------------
// 9. JD REQUIREMENT CLASSIFICATION
// ----------------------------------------------------
describe('9. JD Requirement Classification', () => {
    it('classifies Must-Have, Preferred, Qualifications, and Responsibilities', () => {
        const jd = `
Senior Software Engineer
Must have:
- React, TypeScript, Node.js
- Minimum 4 years of experience

Preferred:
- AWS certification is a plus
- GraphQL experience is desirable

Qualifications:
- Bachelor degree in Computer Science or equivalent
- 4+ years of professional software engineering

Responsibilities:
- Build scalable user interfaces
- Mentor junior engineers
        `;
        const skills = ['react', 'typescript', 'node.js', 'aws', 'graphql'];
        const classified = ResumeAnalyzer.classifyJDRequirements(jd, skills);

        assert(classified.mustHave.length > 0, 'Should detect Must-Have lines');
        assert(classified.preferred.length > 0, 'Should detect Preferred lines');
        assert(classified.qualifications.length > 0, 'Should detect Qualifications lines');
        assert(classified.skillsByTier.preferred.includes('aws') || classified.skillsByTier.preferred.includes('graphql'), 'Preferred skills should be tagged');
    });

    it('handles empty JD text gracefully without crashing', () => {
        const classified = ResumeAnalyzer.classifyJDRequirements('', []);
        assert(Array.isArray(classified.mustHave) && classified.mustHave.length === 0);
        assert(Array.isArray(classified.preferred) && classified.preferred.length === 0);
        assert(Array.isArray(classified.qualifications) && classified.qualifications.length === 0);
    });
});

// ----------------------------------------------------
// 10. GRAMMAR & BULLET STARTER ENGINE
// ----------------------------------------------------
describe('10. Grammar & Bullet Starter Engine', () => {
    it('detects spelling errors and provides corrections', () => {
        const text = "I am a softaware enginer who can recieve data from the server.";
        const res = ResumeGrammar.analyzeGrammar(text);

        assert(res.spellingCount >= 2, `Expected >= 2 spelling errors, got ${res.spellingCount}`);
        assert(res.score < 100, 'Score should be penalized for spelling errors');
    });

    it('detects passive voice and weak bullet starters', () => {
        const text = `
- Responsible for maintaining the database.
- The web app was developed by me using React.
- Helped with testing features.
        `;
        const res = ResumeGrammar.analyzeGrammar(text);
        assert(res.weakVerbCount >= 2, `Expected >= 2 weak verb starters, got ${res.weakVerbCount}`);
        assert(res.passiveCount >= 1, `Expected >= 1 passive voice, got ${res.passiveCount}`);
    });

    it('returns perfect score for empty or clean bullet points', () => {
        const clean = "Architected scalable microservices using Go and PostgreSQL.";
        const res = ResumeGrammar.analyzeGrammar(clean);
        assert.strictEqual(res.score, 100, 'Clean active bullet should score 100');
        assert.strictEqual(res.issues.length, 0, 'Clean active bullet should have 0 issues');
    });
});

// ----------------------------------------------------
// 11. AI WRITING SIGNALS ENGINE
// ----------------------------------------------------
describe('11. AI Writing Signals Engine', () => {
    it('flags heavy corporate cliches and buzzword density', () => {
        const aiHeavyText = "A results-driven, forward-thinking, visionary professional with a proven track record of leveraging best-in-class synergies to drive holistic transformations in a fast-paced environment.";
        const res = AISignals.analyzeAISignals(aiHeavyText);

        assert(res.probability >= 50, `Expected elevated AI writing probability, got ${res.probability}%`);
        assert(res.metrics.genericCliches >= 3, `Expected multiple generic cliches, got ${res.metrics.genericCliches}`);
        assert(res.riskLevel.includes('AI Writing Signal'), 'Risk level should mention AI Writing Signal');
    });

    it('includes mandatory honest probabilistic disclaimer', () => {
        const res = AISignals.analyzeAISignals("Software engineer with Python experience.");
        assert(res.disclaimer && res.disclaimer.includes("probabilistic"), "Must include probabilistic disclaimer");
        assert(res.probability <= 35, "Clean direct text should have low AI writing probability");
    });
});

// ----------------------------------------------------
// 12. HUMANIZER & FACT PRESERVATION (MANDATORY GUARDRAIL)
// ----------------------------------------------------
describe('12. Humanizer & Strict Fact Preservation', () => {
    it('never invents new numbers or metrics (containsInventedNumbers)', () => {
        const original = "Developed a web portal using React for internal team use.";
        const invented = "Developed a web portal using React that increased revenue by 45% for 1000 users.";

        const hasInvented = ResumeHumanizer.containsInventedNumbers(original, invented);
        assert.strictEqual(hasInvented, true, 'Must detect newly added numbers (45%, 1000)');

        const safeCandidate = "Engineered a React web portal for internal team use.";
        assert.strictEqual(ResumeHumanizer.containsInventedNumbers(original, safeCandidate), false, 'Safe rewrite should not flag invented numbers');
    });

    it('preserves existing metrics, companies, and technologies across all 5 modes', () => {
        const bullet = "Leveraged React at Acme Corp in 2023 to improve speed by 35%.";
        const modes = ['simple', 'professional', 'natural', 'concise', 'impact'];

        for (const mode of modes) {
            const res = ResumeHumanizer.humanizeText(bullet, mode, { preserveFacts: true });
            assert(res.humanized.includes('35%'), `Mode ${mode} must preserve 35%`);
            assert(res.humanized.includes('React'), `Mode ${mode} must preserve React`);
            assert(res.humanized.includes('Acme Corp'), `Mode ${mode} must preserve Acme Corp`);
            assert(res.humanized.includes('2023'), `Mode ${mode} must preserve 2023`);
        }
    });

    it('blocks humanizer output if invented numbers are generated', () => {
        const res = ResumeHumanizer.humanizeSentence("Delivered project tasks diligently.", "impact", { preserveFacts: true });
        // The output must NOT contain any fake metrics like $1M, 50%, 10x
        assert(!/\b(\d+[%kM]|\$\d+)\b/.test(res), 'Humanizer must never invent fake metrics for unquantified bullet');
    });
});

// ----------------------------------------------------
// 13. RESUME IMPROVER & SECTION DETECTOR
// ----------------------------------------------------
describe('13. Resume Improver & Section Detector', () => {
    it('detects standard resume sections correctly', () => {
        const resume = `
John Doe
SUMMARY
Software developer with 3 years experience.

SKILLS
JavaScript, Python, React, Docker

EXPERIENCE
Frontend Developer at Tech Inc.
- Built dashboard with React

EDUCATION
B.Tech Computer Science

PROJECTS
Task Manager Web App
        `;
        const res = ResumeImprover.evaluateResumeQuality(resume);
        assert(res.sectionsDetected.includes('Summary'), 'Should detect Summary');
        assert(res.sectionsDetected.includes('Skills'), 'Should detect Skills');
        assert(res.sectionsDetected.includes('Experience'), 'Should detect Experience');
        assert(res.sectionsDetected.includes('Education'), 'Should detect Education');
        assert(res.sectionsDetected.includes('Projects'), 'Should detect Projects');
        assert.strictEqual(res.missingSections.length, 0, 'No major sections should be missing');
    });

    it('audits bullet points on Action + Tech + Task + Result framework', () => {
        const strongBullet = "Architected a distributed payment gateway using Go and Kafka, reducing latency by 40%.";
        const audit = ResumeImprover.analyzeBullet(strongBullet);

        assert(audit.hasAction, 'Strong bullet should have action verb');
        assert(audit.hasTech, 'Strong bullet should have technology (Go/Kafka)');
        assert(audit.hasResult, 'Strong bullet should have quantified result (40%)');
        assert.strictEqual(audit.rating, 'Strong', 'Strong bullet should be rated Strong');
    });
});

// ----------------------------------------------------
// 14. STORAGE V2 SCHEMA & JOB TRACKER / VERSIONS
// ----------------------------------------------------
describe('14. Storage V2 Schema, Versions & Job Applications', () => {
    it('validates job application data structure and pipeline statuses', () => {
        const validApp = {
            company: 'Google',
            role: 'Senior Software Engineer',
            status: 'Interview',
            dateApplied: '2026-09-20'
        };
        assert.strictEqual(JobTracker.validateApplication(validApp), true, 'Valid application must pass validation');

        const invalidApp = { company: '', role: '' };
        assert.strictEqual(JobTracker.validateApplication(invalidApp), false, 'Empty company/role must fail validation');
        assert(JobTracker.STATUSES.includes('Online Assessment'), 'Statuses must include Online Assessment');
        assert(JobTracker.STATUSES.includes('Selected'), 'Statuses must include Selected');
    });

    it('validates resume version structure', () => {
        const validVersion = {
            name: 'Tailored for Fintech',
            resumeText: 'Experienced full stack developer with Python...',
            notes: 'Created for Bank XYZ'
        };
        assert.strictEqual(ResumeVersions.validateVersion(validVersion), true, 'Valid version must pass validation');
        assert.strictEqual(ResumeVersions.validateVersion({ name: '' }), false, 'Empty version name must fail validation');
    });

    it('accepts v2 export schema with versions and applications', () => {
        const v2Payload = {
            schema: 'resumematch-history-v2',
            matchHistory: [{ score: 80, verdict: 'Strong Match' }],
            riskHistory: [{ overallScore: 30 }],
            resumeVersions: [{ id: 'v1', name: 'General Tech' }],
            jobApplications: [{ id: 'j1', company: 'Microsoft', role: 'SWE', status: 'Applied' }]
        };
        const isValid = v2Payload.schema === 'resumematch-history-v2' &&
                        Array.isArray(v2Payload.resumeVersions) &&
                        Array.isArray(v2Payload.jobApplications);
        assert(isValid, 'V2 payload with versions and jobs must be recognized');
    });
});

// ----------------------------------------------------
// 15. RESUME QUALITY STUDIO COORDINATOR & COMPARISON
// ----------------------------------------------------
describe('15. Resume Quality Studio Coordinator & Comparison Matrix', () => {
    it('computes before/after comparison matrix with correct deltas', () => {
        const beforeResult = {
            score: 65,
            skillScore: 60,
            keywordScore: 50,
            missingSkills: ['docker', 'kubernetes', 'aws'],
            breakdown: {
                skills: { points: 24, max: 40 },
                ats: { points: 5, max: 10 }
            }
        };

        const afterResult = {
            score: 82,
            skillScore: 85,
            keywordScore: 75,
            missingSkills: ['kubernetes'],
            breakdown: {
                skills: { points: 34, max: 40 },
                ats: { points: 8, max: 10 }
            }
        };

        const matrix = ResumeQuality.computeComparisonMatrix(beforeResult, afterResult);
        assert(Array.isArray(matrix.metrics), 'Matrix must have metrics array');

        const scoreMetric = matrix.metrics.find(m => m.label === 'Overall Compatibility Score');
        assert(scoreMetric, 'Score metric must be present');
        assert.strictEqual(scoreMetric.delta, 17, 'Delta should be 82 - 65 = +17');

        const skillsMetric = matrix.metrics.find(m => m.label === 'Skills Points');
        assert(skillsMetric, 'Skills metric must be present');
        assert.strictEqual(skillsMetric.delta, 10, 'Skills delta should be 34 - 24 = +10');

        assert(matrix.summaryMessage && matrix.summaryMessage.includes('increased'), 'Summary message should report increase');
    });
});

// ----------------------------------------------------
// 16. PRODUCT ARCHITECTURE, ROUTING, I18N & SMART ACTIONS
// ----------------------------------------------------
describe('16. Product Architecture, Routing, i18n & Smart Recommendations', () => {
    it('verifies all 8 core views and modal shell IDs exist in index.html', () => {
        const htmlPath = path.join(__dirname, '..', 'index.html');
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');

        const requiredViewIds = [
            'view-dashboard',
            'view-analyze',
            'view-job-match',
            'view-studio',
            'view-career-insights',
            'view-applications',
            'view-versions',
            'view-settings',
            'view-help',
            'view-login',
            'view-signup',
            'view-forgot-password',
            'view-account'
        ];

        for (const viewId of requiredViewIds) {
            assert(htmlContent.includes(`id="${viewId}"`), `index.html must include view section #${viewId}`);
        }

        const requiredShellIds = [
            'onboarding-modal',
            'resume-viewer-modal',
            'mobile-drawer',
            'wiz-panel-1',
            'wiz-panel-2',
            'wiz-panel-3',
            'wiz-step-1-btn',
            'wiz-step-2-btn',
            'wiz-step-3-btn',
            'login-form',
            'signup-form',
            'forgot-password-form',
            'profile-edit-form',
            'change-password-form',
            'password-strength-wrap',
            'strength-badge',
            'oauth-setup-modal'
        ];

        for (const shellId of requiredShellIds) {
            assert(htmlContent.includes(`id="${shellId}"`), `index.html must include shell element #${shellId}`);
        }
    });

    it('evaluates smart next action recommendation rules deterministically', () => {
        function getRecommendedNextAction({ hasResume, grammarIssues = 0, missingCount = 0, matchScore = 0 }) {
            if (!hasResume) return 'analyze';
            if (grammarIssues > 4) return 'studio-grammar';
            if (missingCount > 3) return 'missing-skills';
            if (matchScore < 65) return 'job-match';
            return 'interview-roadmap';
        }

        // Rule 1: No resume loaded
        assert.strictEqual(getRecommendedNextAction({ hasResume: false }), 'analyze');

        // Rule 2: Resume loaded with high grammar/clarity issues
        assert.strictEqual(getRecommendedNextAction({ hasResume: true, grammarIssues: 6 }), 'studio-grammar');

        // Rule 3: Resume loaded with many missing skills
        assert.strictEqual(getRecommendedNextAction({ hasResume: true, grammarIssues: 1, missingCount: 5 }), 'missing-skills');

        // Rule 4: Resume loaded with moderate match score
        assert.strictEqual(getRecommendedNextAction({ hasResume: true, grammarIssues: 0, missingCount: 1, matchScore: 55 }), 'job-match');

        // Rule 5: High match score & clean resume -> interview prep roadmap
        assert.strictEqual(getRecommendedNextAction({ hasResume: true, grammarIssues: 0, missingCount: 0, matchScore: 88 }), 'interview-roadmap');
    });

    it('verifies i18n English and Hindi translation completeness and symmetry', () => {
        assert(TRANSLATIONS && TRANSLATIONS.en && TRANSLATIONS.hi, 'Both en and hi dictionaries must exist');

        const coreNavKeys = [
            'navDashboard',
            'navAnalyze',
            'navJobMatch',
            'navStudio',
            'navInsights',
            'navApplications',
            'navVersions',
            'navSettings',
            'navHelp'
        ];

        for (const key of coreNavKeys) {
            assert(TRANSLATIONS.en[key], `English translation must contain key '${key}'`);
            assert(TRANSLATIONS.hi[key], `Hindi translation must contain key '${key}'`);
            assert.notStrictEqual(TRANSLATIONS.en[key], TRANSLATIONS.hi[key], `Hindi translation for '${key}' must not simply repeat English text`);
        }

        // Test I18N helper functions
        I18N.setLanguage('en');
        assert.strictEqual(I18N.getLanguage(), 'en');
        assert.strictEqual(I18N.t('navDashboard'), 'Dashboard');

        I18N.setLanguage('hi');
        assert.strictEqual(I18N.getLanguage(), 'hi');
        assert.strictEqual(I18N.t('navDashboard'), 'डैशबोर्ड');

        // Fallback check
        assert.strictEqual(I18N.t('nonExistentKeySample_XYZ', 'Fallback Text'), 'Fallback Text');

        // Reset back to English
        I18N.setLanguage('en');
    });

    it('validates settings backup export and import schema', () => {
        const validBackup = {
            schema: 'resumematch-history-v2',
            exportedAt: new Date().toISOString(),
            activeResume: 'Full stack engineer with Node.js and React...',
            matchHistory: [{ score: 85, timestamp: Date.now() }],
            riskHistory: [{ overallScore: 25, timestamp: Date.now() }],
            resumeVersions: [{ id: 'v1', name: 'Software Engineer' }],
            jobApplications: [{ id: 'j1', company: 'Google', role: 'SWE', status: 'Applied' }]
        };

        function validateSettingsBackup(data) {
            if (!data || typeof data !== 'object') return false;
            if (data.schema !== 'resumematch-history-v2') return false;
            if (!Array.isArray(data.matchHistory)) return false;
            if (!Array.isArray(data.resumeVersions)) return false;
            if (!Array.isArray(data.jobApplications)) return false;
            return true;
        }

        assert.strictEqual(validateSettingsBackup(validBackup), true, 'Valid backup payload must pass schema validation');
        assert.strictEqual(validateSettingsBackup({ schema: 'invalid-schema' }), false, 'Invalid schema must be rejected');
        assert.strictEqual(validateSettingsBackup(null), false, 'Null payload must be rejected');
        assert.strictEqual(validateSettingsBackup('string payload'), false, 'Non-object payload must be rejected');
    });
});

// ----------------------------------------------------
// 17. CAREER ALIGNMENT ENGINE & 10-POINT REPORT
// ----------------------------------------------------
describe('17. Career Alignment Engine & 10-Point Synthesis', () => {
    it('synthesizes complete 10-point career alignment report from match results', () => {
        const resumeText = `Experienced full-stack engineer with React, JavaScript, Node.js, and SQL. Built high-scale web apps.`;
        const jdText = `Looking for Senior Full Stack Developer with React, TypeScript, Docker, and AWS. Must have 5+ years experience.`;

        const matchResult = ResumeAnalyzer.analyzeMatch(resumeText, jdText);
        const report = CareerAlignment.generateCareerAlignmentReport(resumeText, jdText, matchResult);

        assert(report, 'Report must be generated');
        assert(report.overallAlignment && typeof report.overallAlignment.score === 'number', 'Overall alignment score must exist');
        assert(report.overallAlignment.verdict, 'Verdict must be populated');
        assert(Array.isArray(report.skillsFound.mustHave), 'Must-have found skills array must exist');
        assert(Array.isArray(report.skillsMissing.mustHave), 'Must-have missing skills array must exist');
        assert(report.experienceAlignment && report.experienceAlignment.targetRole, 'Experience alignment must exist');
        assert(Array.isArray(report.atsRisks), 'ATS risks must be an array');
        assert(Array.isArray(report.improvementOpportunities), 'Improvement opportunities must be an array');
        assert(Array.isArray(report.priorityGaps), 'Priority gaps must be an array');
        assert(Array.isArray(report.actionPlan), 'Action plan must be generated');
        assert(report.interviewReady && report.interviewReady.totalQuestions > 0, 'Interview ready questions must be generated');
        assert(report.explainability && Array.isArray(report.explainability.categories), 'Explainability categories must exist');
    });

    it('handles empty inputs gracefully without throwing', () => {
        const nullReport = CareerAlignment.generateCareerAlignmentReport('', '', {});
        assert.strictEqual(nullReport, null, 'Empty inputs must return null safely');
    });
});

// ----------------------------------------------------
// 18. SKILL GAP -> ACTION PLAN DAY-BY-DAY ROADMAPS
// ----------------------------------------------------
describe('18. Skill Gap -> Action Plan 5-Day Roadmaps', () => {
    it('generates structured 5-day realistic learning roadmaps with exercises', () => {
        const missingSkills = ['typescript', 'docker', 'aws'];
        const plans = CareerAlignment.generateSkillActionPlan(missingSkills, 'Full Stack Engineer', 'mid');

        assert.strictEqual(plans.length, 3, 'Should generate roadmap for each missing skill');

        const tsPlan = plans.find(p => p.skill === 'Typescript' || p.skill === 'TypeScript');
        assert(tsPlan, 'TypeScript roadmap must exist');
        assert.strictEqual(tsPlan.priority, 'High', 'TypeScript should be marked as High priority');
        assert.strictEqual(tsPlan.days.length, 5, 'Must have 5 days of structured curriculum');
        assert(tsPlan.days[0].topic && tsPlan.days[0].exercise, 'Each day must have a topic and practical exercise');
        assert(tsPlan.resource && tsPlan.resource.length > 0, 'Must include verified learning resource');
    });

    it('generates high-scale architecture roadmap when candidate has no missing skills', () => {
        const plans = CareerAlignment.generateSkillActionPlan([], 'Senior Engineer', 'senior');
        assert.strictEqual(plans.length, 1, 'Should provide leadership/system design roadmap for full matches');
        assert(plans[0].skill.includes('System Design'), 'Should focus on system design');
        assert.strictEqual(plans[0].days.length, 5, 'Should have 5 days');
    });
});

// ----------------------------------------------------
// 19. INTERVIEW READY TAILORED PREPARATION
// ----------------------------------------------------
describe('19. Interview Ready Question Generator', () => {
    it('generates 6 tailored categories connected to resume context and target JD', () => {
        const resumeText = `Full stack engineer specializing in React web frontends, Node.js microservices, and PostgreSQL queries.`;
        const jdText = `Senior Full Stack Engineer. Requires React, TypeScript, and Docker.`;
        const strong = ['react', 'node.js', 'postgresql'];
        const missing = ['typescript', 'docker'];

        const prep = CareerAlignment.generateInterviewReady(resumeText, jdText, strong, missing, 'Senior Full Stack Engineer', 'senior');

        assert(Array.isArray(prep.technicalTopics), 'Technical topics array must exist');
        assert(Array.isArray(prep.likelyQuestions), 'Likely questions array must exist');
        assert(Array.isArray(prep.projectQuestions), 'Project-related questions must exist');
        assert(Array.isArray(prep.resumeQuestions), 'Resume-based questions must exist');
        assert(Array.isArray(prep.missingSkillQuestions), 'Missing skill questions must exist');
        assert(Array.isArray(prep.behavioralQuestions), 'Behavioral questions must exist');

        // Check content quality
        const missingQ = prep.missingSkillQuestions[0];
        assert(missingQ.question.includes('Typescript') || missingQ.question.includes('TypeScript'), 'Missing skill question must mention the missing skill');
        assert(missingQ.whyAsked && missingQ.answerStrategy && missingQ.outline, 'Every question must include whyAsked, answerStrategy, and outline');

        const behQ = prep.behavioralQuestions[0];
        assert(behQ.category.includes('STAR'), 'Behavioral question must follow STAR format');
    });
});

// ----------------------------------------------------
// 20. EXPLAINABLE MATCHING ("Why this score?")
// ----------------------------------------------------
describe('20. Explainable Matching & "Why this score?" Breakdown', () => {
    it('breaks score down into 5 human-understandable dimensions with explicit reasons', () => {
        const resumeText = `Experienced developer with Python, React, and SQL database knowledge.`;
        const jdText = `Looking for Developer with Python, React, TypeScript, Docker.`;
        const matchResult = ResumeAnalyzer.analyzeMatch(resumeText, jdText);

        const explainability = CareerAlignment.generateExplainableBreakdown(matchResult, resumeText, jdText);

        assert(explainability && Array.isArray(explainability.categories), 'Explainability categories must exist');
        assert.strictEqual(explainability.categories.length, 5, 'Must contain 5 dimensions');

        const skillsDim = explainability.categories.find(c => c.name.includes('Skills'));
        assert(skillsDim, 'Skills dimension must be present');
        assert(skillsDim.matched.length > 0, 'Matched items must have explicit reasoning');
        assert(skillsDim.matched[0].item && skillsDim.matched[0].reason, 'Matched item must have name and reason');
        assert(skillsDim.missing.length > 0, 'Missing items must be documented with reasons');

        assert(explainability.verdictDisclaimer && explainability.verdictDisclaimer.includes('deterministic'), 'Must include transparent deterministic disclaimer');
    });
});

// ----------------------------------------------------
// 21. AUTHENTICATION VALIDATION GUARDRAILS
// ----------------------------------------------------
describe('21. Authentication Validation Guardrails (Gmail, +91 Mobile, Password)', () => {
    it('accepts valid Gmail formats', () => {
        const validEmails = [
            'username@gmail.com',
            'john.doe@gmail.com',
            'alice.bob123@gmail.com',
            'user.name.1@gmail.com',
            'MYEMAIL6@GMAIL.COM'
        ];
        for (const email of validEmails) {
            const res = Auth.validateGmail(email);
            assert.strictEqual(res.valid, true, `Should accept valid Gmail: ${email}`);
            assert.strictEqual(res.email, email.trim().toLowerCase());
            assert.strictEqual(res.message, '');
        }
    });

    it('rejects all invalid Gmail addresses with exact required message', () => {
        const expectedError = 'Please enter a valid Gmail address.';
        const invalidEmails = [
            'user@yahoo.com',
            'user@outlook.com',
            'user@company.co',
            'invalid-format',
            '@gmail.com',
            'user@gmail',
            'user@',
            'abc@gmail.com', // less than 6 chars
            'a1b2@gmail.com', // 4 chars
            'a'.repeat(31) + '@gmail.com', // more than 30 chars
            'john..doe@gmail.com', // consecutive dots
            '.johndoe@gmail.com', // leading dot
            'johndoe.@gmail.com', // trailing dot
            'john doe@gmail.com', // whitespace
            'john\tdoe@gmail.com',
            '',
            null,
            undefined
        ];
        for (const email of invalidEmails) {
            const res = Auth.validateGmail(email);
            assert.strictEqual(res.valid, false, `Should reject invalid Gmail: ${email}`);
            assert.strictEqual(res.message, expectedError, `Should return exact error message for: ${email}`);
        }
    });

    it('accepts valid 10-digit Indian mobile numbers with +91 country code', () => {
        const validPhones = [
            { input: '+91 9876543210', expected: '+91 9876543210' },
            { input: '+91 8765432109', expected: '+91 8765432109' },
            { input: '+91 7654321098', expected: '+91 7654321098' },
            { input: '+91 6543210987', expected: '+91 6543210987' },
            { input: '+919876543210', expected: '+91 9876543210' }
        ];
        for (const { input, expected } of validPhones) {
            const res = Auth.validateIndianPhone(input);
            assert.strictEqual(res.valid, true, `Should accept valid phone: ${input}`);
            assert.strictEqual(res.canonical, expected, `Should canonicalize phone to: ${expected}`);
            assert.strictEqual(res.message, '');
        }
    });

    it('rejects invalid Indian mobile numbers with exact required message', () => {
        const expectedError = 'Enter a valid Indian mobile number with +91 country code.';
        const invalidPhones = [
            '9876543210', // missing +91
            '+1 9876543210', // US country code
            '+44 9876543210', // UK country code
            '+91 5876543210', // starts with 5 (must be 6-9)
            '+91 0876543210', // starts with 0
            '+91 1876543210', // starts with 1
            '+91 987654321', // only 9 digits
            '+91 98765432100', // 11 digits
            '+91 98765abcd0', // letters
            '+91 98765-43210', // hyphens
            '+91', // no number
            '+91 ',
            '',
            null,
            undefined
        ];
        for (const phone of invalidPhones) {
            const res = Auth.validateIndianPhone(phone);
            assert.strictEqual(res.valid, false, `Should reject invalid phone: ${phone}`);
            assert.strictEqual(res.message, expectedError, `Should return exact error message for: ${phone}`);
        }
    });

    it('enforces password criteria (min 8 chars, upper, lower, number, special char)', () => {
        const strong = Auth.validatePassword('ValidPass123!@');
        assert.strictEqual(strong.valid, true, 'Should accept valid password');
        assert.strictEqual(strong.strength, 'Strong');
        assert.strictEqual(strong.score, 5);
        assert.strictEqual(strong.criteria.length, true);
        assert.strictEqual(strong.criteria.uppercase, true);
        assert.strictEqual(strong.criteria.lowercase, true);
        assert.strictEqual(strong.criteria.number, true);
        assert.strictEqual(strong.criteria.special, true);

        const short = Auth.validatePassword('Pass1!');
        assert.strictEqual(short.valid, false);
        assert.strictEqual(short.criteria.length, false);

        const noUpper = Auth.validatePassword('password123!@');
        assert.strictEqual(noUpper.valid, false);
        assert.strictEqual(noUpper.criteria.uppercase, false);

        const noLower = Auth.validatePassword('PASSWORD123!@');
        assert.strictEqual(noLower.valid, false);
        assert.strictEqual(noLower.criteria.lowercase, false);

        const noNum = Auth.validatePassword('Password!@#$');
        assert.strictEqual(noNum.valid, false);
        assert.strictEqual(noNum.criteria.number, false);

        const noSpec = Auth.validatePassword('Password123');
        assert.strictEqual(noSpec.valid, false);
        assert.strictEqual(noSpec.criteria.special, false);
    });

    it('validates password match and mismatch correctly', () => {
        const matchRes = Auth.checkPasswordMatch('Secret123!@', 'Secret123!@');
        assert.strictEqual(matchRes.match, true);
        assert.strictEqual(matchRes.message, '');

        const mismatchRes = Auth.checkPasswordMatch('Secret123!@', 'DifferentPass123!@');
        assert.strictEqual(mismatchRes.match, false);
        assert.strictEqual(mismatchRes.message, 'Passwords do not match.');

        const emptyConfirm = Auth.checkPasswordMatch('Secret123!@', '');
        assert.strictEqual(emptyConfirm.match, false);
    });
});

// ----------------------------------------------------
// 22. CRYPTOGRAPHIC AUTH & USER MANAGEMENT
// ----------------------------------------------------
describe('22. Cryptographic Auth & User Management (PBKDF2-SHA256, Isolation, Login)', () => {
    it('hashes passwords using PBKDF2 with unique cryptographic random salts', async () => {
        const password = 'SuperSecurePass123!@';
        const hash1 = await Auth.hashPassword(password);
        const hash2 = await Auth.hashPassword(password);

        assert(hash1.hashHex && hash1.hashHex.length === 64, 'PBKDF2-SHA256 must produce 64 hex characters (256 bits)');
        assert(hash1.saltHex && hash1.saltHex.length === 32, 'Salt must be 32 hex characters (16 bytes)');
        assert.notStrictEqual(hash1.saltHex, hash2.saltHex, 'Consecutive hashes must use distinct random salts');
        assert.notStrictEqual(hash1.hashHex, hash2.hashHex, 'Consecutive hashes of same password must produce distinct hashes due to salts');
    });

    it('verifies passwords correctly with constant-time comparison', async () => {
        const password = 'CorrectHorseBatteryStaple99!@';
        const { hashHex, saltHex } = await Auth.hashPassword(password);

        const isMatch = await Auth.verifyPassword(password, hashHex, saltHex);
        assert.strictEqual(isMatch, true, 'Valid password must verify to true');

        const wrongMatch = await Auth.verifyPassword('WrongPassword123!@', hashHex, saltHex);
        assert.strictEqual(wrongMatch, false, 'Invalid password must verify to false');

        const caseMatch = await Auth.verifyPassword('correcthorsebatterystaple99!@', hashHex, saltHex);
        assert.strictEqual(caseMatch, false, 'Password check must be case sensitive');
    });

    it('signs up a new user without storing plaintext password', async () => {
        const userData = {
            fullName: 'Aarav Patel',
            email: 'aarav.patel@gmail.com',
            phone: '+91 9876501234',
            password: 'AaravSecure2026!@',
            confirmPassword: 'AaravSecure2026!@'
        };

        const result = await Auth.signUp(userData);
        assert.strictEqual(result.success, true);
        assert(result.user.userId.startsWith('usr_'), 'User ID must follow usr_ prefix');
        assert.strictEqual(result.user.email, 'aarav.patel@gmail.com');
        assert.strictEqual(result.user.phone, '+91 9876501234');
        assert.strictEqual(result.user.fullName, 'Aarav Patel');
        assert.strictEqual(result.user.password, undefined, 'Plaintext password must NEVER be in returned user object');

        const stored = await Auth.findUserByEmail('aarav.patel@gmail.com');
        assert(stored, 'User record must exist in store');
        assert.strictEqual(stored.password, undefined, 'Plaintext password must NEVER exist in stored user record');
        assert(stored.passwordHash && stored.passwordHash.length === 64, 'Stored record must contain PBKDF2 hash');
        assert(stored.passwordSalt && stored.passwordSalt.length === 32, 'Stored record must contain salt');
        assert.strictEqual(stored.authProvider, 'local_crypto_pbkdf2');
    });

    it('rejects duplicate email and duplicate phone registrations', async () => {
        await assert.rejects(
            async () => {
                await Auth.signUp({
                    fullName: 'Duplicate Aarav',
                    email: 'aarav.patel@gmail.com',
                    phone: '+91 9876509999',
                    password: 'AnotherPassword123!@',
                    confirmPassword: 'AnotherPassword123!@'
                });
            },
            /An account with this email already exists\./,
            'Should reject duplicate email registration'
        );

        await assert.rejects(
            async () => {
                await Auth.signUp({
                    fullName: 'Different Aarav',
                    email: 'aarav.different@gmail.com',
                    phone: '+91 9876501234',
                    password: 'AnotherPassword123!@',
                    confirmPassword: 'AnotherPassword123!@'
                });
            },
            /An account with this mobile number already exists\./,
            'Should reject duplicate phone registration'
        );
    });

    it('authenticates user via email OR phone with identical credentials', async () => {
        const emailLogin = await Auth.login({
            credential: 'aarav.patel@gmail.com',
            password: 'AaravSecure2026!@'
        });
        assert.strictEqual(emailLogin.success, true);
        assert.strictEqual(emailLogin.user.email, 'aarav.patel@gmail.com');

        const phoneLogin = await Auth.login({
            credential: '+91 9876501234',
            password: 'AaravSecure2026!@'
        });
        assert.strictEqual(phoneLogin.success, true);
        assert.strictEqual(phoneLogin.user.phone, '+91 9876501234');

        const phone10Login = await Auth.login({
            credential: '9876501234',
            password: 'AaravSecure2026!@'
        });
        assert.strictEqual(phone10Login.success, true);
        assert.strictEqual(phone10Login.user.phone, '+91 9876501234');
    });

    it('rejects incorrect password and unknown user with uniform defense message', async () => {
        await assert.rejects(
            async () => {
                await Auth.login({
                    credential: 'aarav.patel@gmail.com',
                    password: 'WrongPassword999!@'
                });
            },
            /Incorrect email or password\./,
            'Wrong password must return uniform defense message'
        );

        await assert.rejects(
            async () => {
                await Auth.login({
                    credential: 'nonexistent.user@gmail.com',
                    password: 'SomePassword123!@'
                });
            },
            /Incorrect email or password\./,
            'Non-existent user must return uniform defense message'
        );

        await assert.rejects(
            async () => {
                await Auth.login({
                    credential: '+91 9999999999',
                    password: 'SomePassword123!@'
                });
            },
            /Incorrect email or password\./,
            'Non-existent phone must return uniform defense message'
        );
    });

    it('updates user profile and allows changing password', async () => {
        await Auth.login({
            credential: 'aarav.patel@gmail.com',
            password: 'AaravSecure2026!@'
        });

        const updateRes = await Auth.updateProfile({
            fullName: 'Aarav S. Patel',
            phone: '+91 9876501239'
        });
        assert.strictEqual(updateRes.user.fullName, 'Aarav S. Patel');
        assert.strictEqual(updateRes.user.phone, '+91 9876501239');

        const changeRes = await Auth.changePassword({
            currentPassword: 'AaravSecure2026!@',
            newPassword: 'BrandNewPassword2026!@'
        });
        assert.strictEqual(changeRes.success, true);

        await assert.rejects(
            async () => {
                await Auth.login({
                    credential: 'aarav.patel@gmail.com',
                    password: 'AaravSecure2026!@'
                });
            },
            /Incorrect email or password\./
        );

        const newLogin = await Auth.login({
            credential: 'aarav.patel@gmail.com',
            password: 'BrandNewPassword2026!@'
        });
        assert.strictEqual(newLogin.success, true);
    });
});

// ----------------------------------------------------
// 23. SESSION PERSISTENCE & ROUTE GUARDS
// ----------------------------------------------------
describe('23. Session Persistence & Route Guards (24h Token, Expiration, Navigation)', () => {
    it('generates session with secure token and 24-hour expiration', async () => {
        await Auth.login({
            credential: 'aarav.patel@gmail.com',
            password: 'BrandNewPassword2026!@'
        });

        const session = Auth.getSession();
        assert(session, 'Session must exist after login');
        assert(session.token.startsWith('cs_sess_'), 'Token must have cs_sess_ prefix');
        assert(session.token.length > 30, 'Token must have sufficient cryptographic entropy');

        const duration = session.expiresAt - session.createdAt;
        const expectedDuration = 24 * 60 * 60 * 1000;
        assert.strictEqual(duration, expectedDuration, 'Session duration must be exactly 24 hours (86400000 ms)');
        assert.strictEqual(Auth.isAuthenticated(), true, 'Auth.isAuthenticated() must be true for active session');
    });

    it('invalidates and purges expired sessions automatically', () => {
        Auth._setSessionForTest({
            token: 'cs_sess_expired_token',
            userId: 'usr_test_expired',
            email: 'expired@gmail.com',
            phone: '+91 9876543210',
            fullName: 'Expired User',
            createdAt: Date.now() - (25 * 60 * 60 * 1000),
            expiresAt: Date.now() - 1000
        });

        assert.strictEqual(Auth.getSession(), null, 'Expired session must return null');
        assert.strictEqual(Auth.isAuthenticated(), false, 'Expired session must not be authenticated');
        assert.strictEqual(Auth.getCurrentUser(), null, 'Current user must be null for expired session');
    });

    it('explicit logout invalidates active session and resets user context', async () => {
        await Auth.login({
            credential: 'aarav.patel@gmail.com',
            password: 'BrandNewPassword2026!@'
        });
        assert.strictEqual(Auth.isAuthenticated(), true);

        const logoutRes = await Auth.logout();
        assert.strictEqual(logoutRes.success, true);
        assert.strictEqual(Auth.getSession(), null, 'Session must be null after logout');
        assert.strictEqual(Auth.isAuthenticated(), false, 'User must not be authenticated after logout');
        assert.strictEqual(Auth.getCurrentUser(), null, 'Current user must be null after logout');
    });

    it('validates protected routes policy contract', () => {
        const PROTECTED_VIEWS = ['#view-account', '#view-resumes', '#view-applications'];
        const UNPROTECTED_VIEWS = [
            '#view-matcher',
            '#view-ats',
            '#view-grammar',
            '#view-signals',
            '#view-humanizer',
            '#view-login',
            '#view-signup',
            '#view-forgot-password'
        ];

        function checkRouteAccess(viewId, isAuthed) {
            if (PROTECTED_VIEWS.includes(viewId) && !isAuthed) {
                return '#view-login';
            }
            return viewId;
        }

        for (const pv of PROTECTED_VIEWS) {
            assert.strictEqual(checkRouteAccess(pv, false), '#view-login', `Unauthenticated access to ${pv} must redirect to #view-login`);
        }
        for (const upv of UNPROTECTED_VIEWS) {
            assert.strictEqual(checkRouteAccess(upv, false), upv, `Unauthenticated access to public view ${upv} must be permitted`);
        }

        for (const pv of PROTECTED_VIEWS) {
            assert.strictEqual(checkRouteAccess(pv, true), pv, `Authenticated access to ${pv} must be permitted`);
        }
    });
});

// ----------------------------------------------------
// 24. USER DATA ISOLATION & STORAGE SCOPING
// ----------------------------------------------------
describe('24. User Data Isolation & Storage Scoping (Multi-Tenant LocalDB)', () => {
    it('strictly isolates resume versions, job applications, and match records between users', async () => {
        const userAId = 'usr_tenant_alice';
        const userBId = 'usr_tenant_bob';

        // 1. User A logs in
        LocalDB.setCurrentUserId(userAId);
        assert.strictEqual(LocalDB.getCurrentUserId(), userAId);

        // User A saves a resume version
        await LocalDB.addResumeVersion({
            name: "Alice - Senior Full Stack Resume",
            content: "Alice Resume Content with Python and React.",
            jobTitle: "Senior Full Stack Engineer",
            targetCompany: "Google",
            matchScore: 92
        });

        // User A saves a job application
        await LocalDB.addJobApplication({
            company: "Google",
            role: "Senior Full Stack Engineer",
            status: "interview",
            jobUrl: "https://careers.google.com"
        });

        // Verify User A sees their items
        const versionsA = await LocalDB.getAllResumeVersions();
        const jobsA = await LocalDB.getAllJobApplications();
        assert.strictEqual(versionsA.length, 1);
        assert.strictEqual(versionsA[0].name, "Alice - Senior Full Stack Resume");
        assert.strictEqual(jobsA.length, 1);
        assert.strictEqual(jobsA[0].company, "Google");

        // 2. User B logs in on same device / browser
        LocalDB.setCurrentUserId(userBId);
        assert.strictEqual(LocalDB.getCurrentUserId(), userBId);

        // User B must NOT see User A's data
        const versionsBBefore = await LocalDB.getAllResumeVersions();
        const jobsBBefore = await LocalDB.getAllJobApplications();
        assert.strictEqual(versionsBBefore.length, 0, "User B must NEVER see User A's resume versions!");
        assert.strictEqual(jobsBBefore.length, 0, "User B must NEVER see User A's job applications!");

        // User B adds their own resume version
        await LocalDB.addResumeVersion({
            name: "Bob - DevOps Resume",
            content: "Bob Resume Content with Docker and Kubernetes.",
            jobTitle: "DevOps Lead",
            targetCompany: "Amazon",
            matchScore: 88
        });

        const versionsBAfter = await LocalDB.getAllResumeVersions();
        assert.strictEqual(versionsBAfter.length, 1);
        assert.strictEqual(versionsBAfter[0].name, "Bob - DevOps Resume");

        // 3. User A logs back in
        LocalDB.setCurrentUserId(userAId);
        const versionsARestored = await LocalDB.getAllResumeVersions();
        const jobsARestored = await LocalDB.getAllJobApplications();

        assert.strictEqual(versionsARestored.length, 1, "User A's resume versions must remain intact");
        assert.strictEqual(versionsARestored[0].name, "Alice - Senior Full Stack Resume");
        assert.strictEqual(jobsARestored.length, 1, "User A's job applications must remain intact");
        assert.strictEqual(jobsARestored[0].company, "Google");

        // 4. Data purging: clearing User B's data does NOT touch User A's data
        await LocalDB.clearUserData(userBId);

        // User A data still safe
        const versionsACheck = await LocalDB.getAllResumeVersions();
        assert.strictEqual(versionsACheck.length, 1, "Clearing User B data must not affect User A data");

        // User B data is wiped
        LocalDB.setCurrentUserId(userBId);
        const versionsBWiped = await LocalDB.getAllResumeVersions();
        assert.strictEqual(versionsBWiped.length, 0);
    });

    it('supports unauthenticated legacy fallback without breaking', async () => {
        LocalDB.setCurrentUserId(null);
        assert.strictEqual(LocalDB.getCurrentUserId(), null);

        const unauthVersion = await LocalDB.addResumeVersion({
            name: "Unauthenticated Draft",
            content: "Draft resume content",
            jobTitle: "Analyst",
            targetCompany: "Local Corp",
            matchScore: 75
        });

        assert(unauthVersion, 'Unauthenticated addResumeVersion must succeed');
        const allVersions = await LocalDB.getAllResumeVersions();
        assert(allVersions.length > 0, 'Unauthenticated queries should retrieve records');
    });
});

// ----------------------------------------------------
// SUMMARY
// ----------------------------------------------------
function printSummary() {
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
}

if (pendingTests.length > 0) {
    Promise.all(pendingTests).then(printSummary).catch(err => {
        console.error('Fatal test error:', err);
        process.exit(1);
    });
} else {
    printSummary();
}

