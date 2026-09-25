// ============================================================
// career-risk.js — Rule-Based Career Risk Signals Engine
// Informational career health assessment based on user inputs.
// Modules: Learning Adaptability, Consistency Stability,
// Skill Decay, Market Mismatch, Career Direction Clarity
// ============================================================


const CareerRisk = (function () {

    // -------------------------------------------------------
    //  MARKET TREND DATA
    // -------------------------------------------------------
    const HIGH_DEMAND_SKILLS = [
        'ai', 'machine learning', 'ml', 'deep learning', 'llm', 'generative ai', 'genai',
        'python', 'rust', 'typescript', 'golang', 'go',
        'kubernetes', 'docker', 'terraform', 'aws', 'azure', 'gcp', 'cloud',
        'react', 'nextjs', 'next.js', 'node', 'fastapi',
        'data engineering', 'spark', 'kafka', 'airflow', 'dbt',
        'cybersecurity', 'devsecops', 'zero trust',
        'product management', 'system design', 'distributed systems',
        'graphql', 'grpc', 'microservices', 'serverless', 'edge computing',
        'blockchain', 'solidity', 'web3',
        'ux', 'figma', 'design systems', 'accessibility'
    ];

    const DECLINING_SKILLS = [
        'jquery', 'angularjs', 'backbone', 'silverlight', 'flash',
        'cobol', 'fortran', 'vb.net', 'visual basic',
        'svn', 'cvs', 'mercurial',
        'objective-c', 'pascal', 'delphi',
        'soap', 'xml rpc', 'wsdl',
        'mapreduce', 'hadoop hdfs', 'pig', 'hive',
        'perl', 'coldfusion', 'asp classic'
    ];

    const AUTOMATION_RISK_BY_ROLE = {
        'data entry': 90, 'qa manual testing': 70, 'basic accounting': 75,
        'customer support': 65, 'content moderation': 80,
        'software developer': 20, 'software engineer': 18, 'full stack': 15,
        'frontend developer': 22, 'backend developer': 20,
        'data scientist': 15, 'ml engineer': 12, 'ai engineer': 10,
        'devops': 18, 'cloud engineer': 16, 'sre': 18,
        'product manager': 10, 'ux designer': 20, 'ui designer': 25,
        'architect': 8, 'tech lead': 8, 'engineering manager': 5,
        'scrum master': 35, 'project manager': 30,
        'data analyst': 40, 'business analyst': 38,
        'database administrator': 50, 'network engineer': 35,
        'cyber security': 12, 'security engineer': 12,
        'default': 35
    };

    const SALARY_GROWTH_MATRIX = {
        low: { high_demand: 'High', mixed: 'Moderate', low_demand: 'Low' },
        mid: { high_demand: 'High', mixed: 'Moderate', low_demand: 'Low' },
        senior: { high_demand: 'High', mixed: 'Moderate', low_demand: 'Moderate' },
        lead: { high_demand: 'High', mixed: 'High', low_demand: 'Moderate' },
        exec: { high_demand: 'High', mixed: 'High', low_demand: 'Moderate' }
    };

    const ALT_CAREER_PATHS = {
        frontend: ['UI Engineer → Product Manager', 'Frontend → Full Stack Engineer', 'UI Dev → UX Engineer', 'Frontend → Developer Advocate'],
        backend: ['Backend → Solutions Architect', 'Backend → Platform Engineer', 'Backend → ML Engineer', 'Backend → CTO (Startup)'],
        data: ['Data Analyst → Data Scientist', 'Data Engineer → ML Engineer', 'Data Scientist → AI Product Manager', 'Data → Analytics Consultant'],
        devops: ['DevOps → SRE (Google/Netflix)', 'DevOps → Cloud Architect', 'DevOps → Platform Engineering Lead', 'DevOps → Security Engineer'],
        general: ['Senior IC → Engineering Manager', 'Developer → Technical Program Manager', 'Engineer → Startup Founder', 'Dev → Developer Advocate / Educator'],
        design: ['UI Designer → Product Designer', 'Designer → UX Researcher', 'Designer → Product Manager', 'Designer → Design Lead'],
        pm: ['PM → CPO (Chief Product Officer)', 'PM → Startup Founder', 'PM → VC / Angel Investor', 'PM → Strategy Consultant']
    };

    // -------------------------------------------------------
    //  HELPERS
    // -------------------------------------------------------
    function normalize(text) {
        return (text || '').toLowerCase().trim();
    }

    function parseSkillList(raw) {
        if (!raw) return [];
        return raw.split(/[,\n;]+/).map(s => normalize(s)).filter(Boolean);
    }

    function matchesKeyword(text, keywords) {
        return keywords.some(kw => text.includes(kw));
    }

    function getAutomationRisk(role) {
        const r = normalize(role);
        for (const [key, val] of Object.entries(AUTOMATION_RISK_BY_ROLE)) {
            if (r.includes(key)) return val;
        }
        return AUTOMATION_RISK_BY_ROLE['default'];
    }

    function detectDomain(role, skills) {
        const combined = normalize(role) + ' ' + skills.join(' ');
        if (/frontend|ui|react|vue|angular|css/.test(combined)) return 'frontend';
        if (/backend|api|server|node|django|spring|database|sql/.test(combined)) return 'backend';
        if (/data|ml|machine learning|python|analytics|etl|spark/.test(combined)) return 'data';
        if (/devops|sre|cloud|kubernetes|docker|terraform|infra/.test(combined)) return 'devops';
        if (/design|figma|ux|ui designer|wireframe/.test(combined)) return 'design';
        if (/product manager|pm|roadmap|stakeholder/.test(combined)) return 'pm';
        return 'general';
    }

    function sanitizeExperience(years) {
        const n = parseFloat(years);
        if (isNaN(n) || n < 0) return 0;
        if (n > 40) return 40;
        return n;
    }

    // -------------------------------------------------------
    //  MODULE 1 — LEARNING ADAPTABILITY INDEX (0–100)
    // -------------------------------------------------------
    function calcLearningAdaptability(input) {
        let score = 50;
        const reasons = [];
        const activity = normalize(input.learningActivity);

        if (activity.includes('daily') || activity.includes('every day')) {
            score += 35; reasons.push('Active daily learner — excellent adaptability signal.');
        } else if (activity.includes('weekly') || activity.includes('few times a week')) {
            score += 20; reasons.push('Regular weekly learning — above-average adaptability.');
        } else if (activity.includes('monthly') || activity.includes('occasionally')) {
            score += 0; reasons.push('Occasional learning — average adaptability, room to improve.');
        } else if (activity.includes('rarely') || activity.includes('seldom')) {
            score -= 20; reasons.push('Infrequent learning activity detected — adaptability at risk.');
        } else if (activity.includes('never') || activity.includes('none') || activity === '') {
            score -= 35; reasons.push('No recorded learning activity — serious adaptability concern.');
        }

        const skills = input.skills;
        const highDemandCount = skills.filter(s => HIGH_DEMAND_SKILLS.some(h => s.includes(h))).length;
        if (highDemandCount >= 5) { score += 15; reasons.push(`${highDemandCount} high-demand market skills found — strong future readiness.`); }
        else if (highDemandCount >= 2) { score += 5; reasons.push(`${highDemandCount} market-relevant skills detected.`); }
        else { score -= 10; reasons.push('Few high-demand skills detected — consider upskilling in emerging tech.'); }

        const goal = normalize(input.careerGoal);
        if (goal && goal.length > 5) { score += 5; reasons.push('Clear career goal defined — directional clarity boosts adaptability.'); }

        return { score: Math.min(100, Math.max(0, Math.round(score))), reasons };
    }

    // -------------------------------------------------------
    //  MODULE 2 — CONSISTENCY STABILITY SCORE
    // -------------------------------------------------------
    function calcConsistencyStability(input) {
        const activity = normalize(input.learningActivity);
        const exp = sanitizeExperience(input.yearsOfExperience);

        let level = 'Medium';
        let analysis = '';
        let dropPatterns = [];

        if (activity.includes('daily') || activity.includes('weekly')) {
            level = 'High';
            analysis = 'Consistent, regular learning rhythm detected. You are building sustainable career habits.';
        } else if (activity.includes('monthly') || activity.includes('occasionally')) {
            level = 'Medium';
            analysis = 'Learning happens in bursts. Inactivity gaps may slow compounding skill growth.';
            dropPatterns.push('Periodic inactivity gaps between learning sessions');
        } else {
            level = 'Low';
            analysis = 'Significant learning inactivity detected. Skill stagnation is a real risk at this pace.';
            dropPatterns.push('Long inactivity gaps detected');
            dropPatterns.push('No structured learning routine in place');
        }

        if (exp > 5 && level === 'Low') {
            dropPatterns.push('Experienced professional with no active upskilling — accelerated obsolescence risk');
        }

        return { level, analysis, dropPatterns };
    }

    // -------------------------------------------------------
    //  MODULE 3 — SKILL DECAY & RELEVANCE INDEX
    // -------------------------------------------------------
    function calcSkillDecay(input) {
        const skills = input.skills;
        const outdated = skills.filter(s => DECLINING_SKILLS.some(d => s.includes(d)));
        const relevant = skills.filter(s => HIGH_DEMAND_SKILLS.some(h => s.includes(h)));
        const neutral = skills.filter(s => !outdated.includes(s) && !relevant.includes(s));

        let decayScore = 0;
        if (outdated.length > 0) decayScore = Math.min(100, outdated.length * 20);

        const relevanceRatio = skills.length > 0 ? Math.round((relevant.length / skills.length) * 100) : 0;

        let verdict = '';
        if (decayScore === 0 && relevanceRatio >= 50) {
            verdict = 'Excellent skill relevance. Your stack aligns well with current market demand.';
        } else if (decayScore > 0 || relevanceRatio < 30) {
            verdict = 'Some skills show early signs of market decline. Consider phasing them out in your resume.';
        } else {
            verdict = 'Skill set is reasonably relevant but could benefit from targeted additions.';
        }

        return { outdated, relevant, neutral, decayScore, relevanceRatio, verdict };
    }

    // -------------------------------------------------------
    //  MODULE 4 — MARKET TREND MISMATCH
    // -------------------------------------------------------
    function calcMarketMismatch(input) {
        const automationRisk = getAutomationRisk(input.currentRole);
        const skills = input.skills;
        const highDemandCount = skills.filter(s => HIGH_DEMAND_SKILLS.some(h => s.includes(h))).length;
        const ratio = skills.length > 0 ? highDemandCount / skills.length : 0;

        let demandLevel = ratio >= 0.5 ? 'high_demand' : ratio >= 0.25 ? 'mixed' : 'low_demand';
        const expLevel = normalize(input.experienceLevel) || 'mid';
        const salaryGrowth = (SALARY_GROWTH_MATRIX[expLevel] || SALARY_GROWTH_MATRIX['mid'])[demandLevel];

        let sustainability = '';
        if (automationRisk < 25 && ratio >= 0.4) sustainability = 'High — role is well-positioned for the next 5–10 years.';
        else if (automationRisk < 50 && ratio >= 0.2) sustainability = 'Moderate — role is viable but requires steady upskilling.';
        else sustainability = 'Lower — significant market shifts may impact this role in 2–4 years.';

        return { automationRisk, salaryGrowth, sustainability, demandLevel };
    }

    // -------------------------------------------------------
    //  MODULE 5 — CAREER DIRECTION CLARITY
    // -------------------------------------------------------
    function calcDirectionClarity(input) {
        const goal = normalize(input.careerGoal);
        const role = normalize(input.currentRole);
        const skills = input.skills;
        const domain = detectDomain(role, skills);

        let clarity = 'Unclear';
        let assessment = '';
        let goalAlignment = [];

        if (!goal || goal.length < 5) {
            clarity = 'Undefined';
            assessment = 'No career goal specified. Directionless skill accumulation is a key stagnation risk.';
            goalAlignment.push('Define a clear 2-year career target immediately.');
        } else if (goal.includes(domain) || skills.some(s => goal.includes(s))) {
            clarity = 'Clear';
            assessment = 'Your goal aligns with your current skill domain. You are on a focused path.';
            goalAlignment.push('Continue deepening expertise in your identified domain.');
            goalAlignment.push('Start working on the 1–2 skill gaps separating you from your goal.');
        } else {
            clarity = 'Partially Aligned';
            assessment = 'Goal and current skill set have some mismatch. You may need a deliberate pivot plan.';
            goalAlignment.push('Identify bridge skills needed to transition toward your stated goal.');
            goalAlignment.push('Consider a structured 90-day pivot plan with measurable milestones.');
        }

        const altPaths = ALT_CAREER_PATHS[domain] || ALT_CAREER_PATHS['general'];
        return { clarity, assessment, goalAlignment, altPaths, domain };
    }

    // -------------------------------------------------------
    //  FINAL RISK SCORER
    // -------------------------------------------------------
    function calcOverallRisk(m1, m2, m3, m4, m5) {
        let risk = 0;

        // Learning Adaptability: higher score = lower risk
        risk += Math.round((100 - m1.score) * 0.25);

        // Consistency: Low = 30, Medium = 15, High = 0
        if (m2.level === 'Low') risk += 30;
        else if (m2.level === 'Medium') risk += 15;

        // Skill Decay: 0–100, weighted 0.15
        risk += Math.round(m3.decayScore * 0.15);

        // Automation Risk: weighted 0.20
        risk += Math.round(m4.automationRisk * 0.20);

        // Direction Clarity
        if (m5.clarity === 'Undefined') risk += 20;
        else if (m5.clarity === 'Partially Aligned') risk += 10;

        return Math.min(100, Math.max(0, Math.round(risk)));
    }

    function getRiskCategory(score) {
        if (score <= 35) return 'Safe Zone';
        if (score <= 65) return 'Warning Zone';
        return 'High Risk Zone';
    }

    function getTopRiskFactors(m1, m2, m3, m4, m5, overallScore) {
        const factors = [];
        if (m1.score < 40) factors.push({ label: 'Low Learning Adaptability', detail: 'Infrequent upskilling significantly raises long-term obsolescence risk.' });
        if (m2.level === 'Low') factors.push({ label: 'Poor Learning Consistency', detail: 'No structured learning routine — skill decay accelerates without regular practice.' });
        if (m3.outdated.length > 0) factors.push({ label: `Outdated Skills: ${m3.outdated.slice(0, 3).join(', ')}`, detail: 'These technologies have declining market demand and should be downplayed.' });
        if (m4.automationRisk > 50) factors.push({ label: `High Automation Risk (${m4.automationRisk}%)`, detail: 'Your current role has significant exposure to AI and automation-driven displacement.' });
        if (m5.clarity === 'Undefined') factors.push({ label: 'No Defined Career Goal', detail: 'Without a direction, skill acquisition becomes scattered and fails to compound.' });
        if (m3.relevanceRatio < 30) factors.push({ label: 'Low Market Skill Relevance', detail: 'Less than 30% of your skills align with current high-demand market trends.' });

        return factors.slice(0, 3);
    }

    function getProjection(score, m4, m5) {
        if (score <= 35) {
            return `Current indicators suggest a relatively resilient career profile. Continued development in high-demand areas can maintain a healthy career trajectory over the next 1–2 years. Estimated role sustainability is ${m4.sustainability.split('—')[0].trim().toLowerCase()}.`;
        } else if (score <= 65) {
            return `Career indicators suggest moderate vulnerability signals. Proactive upskilling in high-demand tools over the next 6–12 months is advisable to avoid skill decay. Role sustainability indicator: ${m4.sustainability.split('—')[0].trim().toLowerCase()}.`;
        } else {
            return `Signals suggest noticeable stagnation exposure based on current inputs. Focusing on high-demand market skills and establishing a clear career target can meaningfully lower this vulnerability. Direction clarity was assessed as ${m5.clarity.toLowerCase()}.`;
        }
    }


    function getRecoveryRoadmap(score, m1, m3, m5) {
        const months1to3 = [];
        const months3to6 = [];
        const months6to12 = [];

        months1to3.push('Audit your current skill set against top 10 job descriptions in your target role.');
        months1to3.push('Identify 1–2 high-demand skills to add (prioritize Python, TypeScript, Cloud, or AI basics if applicable).');
        months1to3.push('Establish a daily 30-minute learning habit — use Coursera, Udemy, or YouTube.');

        if (m3.outdated.length > 0) {
            months1to3.push(`Begin phasing out ${m3.outdated[0]} from your primary resume description and shift to modern alternatives.`);
        }

        months3to6.push('Complete at least one certifiable course or build a portfolio project showcasing new skills.');
        months3to6.push('Update LinkedIn and resume with new skills and project outcomes.');
        months3to6.push('Start engaging with community (GitHub, Reddit, Discord, local meetups) in your target domain.');

        if (m5.clarity === 'Undefined' || m5.clarity === 'Partially Aligned') {
            months3to6.push('Define your 2-year career goal in writing. Share it with a mentor for accountability.');
        }

        months6to12.push('Apply to 2–3 stretch roles that align with your updated skill profile.');
        months6to12.push('Explore mentorship, technical blogging, or open source contributions to build visibility.');
        months6to12.push('Reassess your Career Risk Score — aim to move from Warning/High Risk to Safe Zone.');
        months6to12.push('Negotiate salary or promotion based on demonstrated new skill contributions.');

        return { months1to3, months3to6, months6to12 };
    }

    function getImmediateActions(m1, m2, m3, m4, m5) {
        const actions = [];
        if (m2.level === 'Low' || m2.level === 'Medium') {
            actions.push('📅 Schedule 30 minutes of structured learning every day — start tomorrow.');
        }
        if (m3.outdated.length > 0) {
            actions.push(`🗑 Remove or de-emphasize ${m3.outdated.slice(0, 2).join(' and ')} from your resume header skills.`);
        }
        if (m5.clarity === 'Undefined') {
            actions.push('🎯 Write down your 2-year career goal today. Be specific (e.g., "Become a Senior ML Engineer at a product company").');
        }
        if (m1.score < 50) {
            actions.push('📚 Enroll in one structured course in a high-demand skill this week (AWS, Python, TypeScript, Docker).');
        }
        if (m4.automationRisk > 50) {
            actions.push('🤖 Start learning AI-augmented workflows in your domain to stay ahead of automation.');
        }
        actions.push('🔗 Update your LinkedIn profile with your latest skills, projects, and career goal headline.');
        return actions.slice(0, 5);
    }

    function getConfidenceLevel(input) {
        let points = 0;
        if (input.currentRole && input.currentRole.trim().length > 2) points++;
        if (input.yearsOfExperience > 0) points++;
        if (input.skills.length >= 3) points++;
        if (input.learningActivity && input.learningActivity !== '') points++;
        if (input.careerGoal && input.careerGoal.trim().length > 3) points++;
        if (points <= 2) return 'Low';
        if (points <= 4) return 'Medium';
        return 'High';
    }

    // -------------------------------------------------------
    //  PUBLIC API
    // -------------------------------------------------------
    function analyze(rawInput) {
        const input = {
            currentRole: rawInput.currentRole || '',
            experienceLevel: rawInput.experienceLevel || 'mid',
            yearsOfExperience: sanitizeExperience(rawInput.yearsOfExperience),
            skills: parseSkillList(rawInput.skills),
            learningActivity: rawInput.learningActivity || '',
            careerGoal: rawInput.careerGoal || '',
            industry: rawInput.industry || 'tech'
        };

        const m1 = calcLearningAdaptability(input);
        const m2 = calcConsistencyStability(input);
        const m3 = calcSkillDecay(input);
        const m4 = calcMarketMismatch(input);
        const m5 = calcDirectionClarity(input);

        const overallScore = calcOverallRisk(m1, m2, m3, m4, m5);
        const riskCategory = getRiskCategory(overallScore);
        const topRiskFactors = getTopRiskFactors(m1, m2, m3, m4, m5, overallScore);
        const projection = getProjection(overallScore, m4, m5);
        const roadmap = getRecoveryRoadmap(overallScore, m1, m3, m5);
        const immediateActions = getImmediateActions(m1, m2, m3, m4, m5);
        const confidence = getConfidenceLevel(input);

        const individualSignals = {
            technologyRelevance: {
                title: "Technology Relevance",
                score: m3.relevanceRatio || 50,
                level: m3.relevanceRatio >= 50 ? 'Strong' : m3.relevanceRatio >= 25 ? 'Moderate' : 'Needs Modernization',
                details: `${m3.relevant.length} high-demand skills, ${m3.outdated.length} declining technologies.`
            },
            learningConsistency: {
                title: "Learning Consistency",
                score: m2.level === 'High' ? 85 : m2.level === 'Medium' ? 60 : 30,
                level: m2.level,
                details: m2.assessment || 'Cadence of upskilling and career investment.'
            },
            skillDecay: {
                title: "Skill Decay",
                score: m3.decayScore || 0,
                level: m3.decayScore < 30 ? 'Low Decay' : m3.decayScore < 60 ? 'Moderate Decay' : 'High Decay',
                details: m3.verdict || 'Evaluation of legacy or depreciated tech stack components.'
            },
            skillDiversification: {
                title: "Skill Diversification",
                score: Math.min(100, Math.round((input.skills.length / 8) * 100)),
                level: input.skills.length >= 6 ? 'Diverse' : input.skills.length >= 3 ? 'Moderate' : 'Narrow',
                details: `${input.skills.length} skills listed across technical domains.`
            },
            careerDirection: {
                title: "Career Direction",
                score: m5.clarity === 'Clear' ? 90 : m5.clarity === 'Partially Aligned' ? 55 : 25,
                level: m5.clarity,
                details: m5.assessment || 'Clarity of 2-year goal and alignment with skillset.'
            }
        };

        return {
            overallScore,
            riskCategory,
            topRiskFactors,
            projection,
            automationRisk: m4.automationRisk,
            salaryGrowth: m4.salaryGrowth,
            sustainability: m4.sustainability,
            altPaths: m5.altPaths,
            roadmap,
            immediateActions,
            confidence,
            individualSignals,
            disclaimer: "This analysis is informational and based on the provided inputs. It is not a guaranteed prediction of future career outcomes.",
            modules: {
                learningAdaptability: m1,
                consistencyStability: m2,
                skillDecay: m3,
                marketMismatch: m4,
                directionClarity: m5
            }
        };
    }

    return { analyze };
})();

if (typeof window !== 'undefined') {
    window.CareerRisk = CareerRisk;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CareerRisk;
}

