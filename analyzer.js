// ============================================================
// analyzer.js — Skill Taxonomy, Scoring Engine & Matching v4
// ResumeMatch AI — Client-Side Rule-Based Matching Engine
// Preserves all 9 modules: Smart Match Score, Skills Gap, ATS,
// Company Optimization, Resume Tips, Career Roadmap,
// Interview Prep, Video/Soft Skills, Final Verdict.
// ============================================================

// ==============================
// 1. STRUCTURED SKILL TAXONOMY
// ==============================
const SKILL_TAXONOMY = {
    frontend: {
        label: "Frontend Development",
        skills: [
            "html", "html5", "css", "css3", "javascript", "js", "typescript", "ts",
            "react", "reactjs", "react.js", "vue", "vuejs", "vue.js", "angular", "angularjs",
            "svelte", "nextjs", "next.js", "nuxt", "gatsby", "redux", "zustand", "mobx",
            "tailwind", "tailwindcss", "bootstrap", "sass", "scss", "less", "styled-components",
            "webpack", "vite", "rollup", "parcel", "babel", "eslint", "prettier",
            "responsive design", "figma", "webflow", "jquery", "ajax", "dom", "spa", "pwa"
        ]
    },
    backend: {
        label: "Backend Development",
        skills: [
            "node", "nodejs", "node.js", "express", "expressjs", "nestjs", "fastapi",
            "django", "flask", "spring", "spring boot", "laravel", "rails", "ruby on rails",
            "php", "python", "java", "golang", "go", "rust", "c", "c++", "c#", ".net", "asp.net",

            "graphql", "rest", "restful", "rest api", "grpc", "websockets", "microservices",
            "api", "authentication", "oauth", "jwt", "mvc", "orm"
        ]
    },
    databases: {
        label: "Databases",
        skills: [
            "sql", "mysql", "postgresql", "postgres", "sqlite", "oracle", "mssql", "sql server",
            "mongodb", "mongoose", "redis", "firebase", "firestore", "dynamodb", "cassandra",
            "elasticsearch", "neo4j", "supabase", "prisma", "sequelize", "typeorm",
            "database design", "nosql", "data modeling", "stored procedures", "indexing", "query optimization"
        ]
    },
    devops: {
        label: "Cloud & DevOps",
        skills: [
            "aws", "amazon web services", "azure", "gcp", "google cloud", "heroku", "digitalocean",
            "docker", "kubernetes", "k8s", "terraform", "ansible", "jenkins", "github actions",
            "gitlab ci", "circleci", "travis ci", "ci/cd", "devops", "linux", "bash",
            "shell scripting", "nginx", "apache", "load balancing", "cloudflare",
            "s3", "ec2", "lambda", "cloudwatch", "iam", "vpc"
        ]
    },
    data: {
        label: "Data Science & AI",
        skills: [
            "python", "pandas", "numpy", "scipy", "matplotlib", "seaborn", "plotly",
            "machine learning", "ml", "deep learning", "dl", "neural networks", "nlp",
            "tensorflow", "keras", "pytorch", "scikit-learn", "sklearn", "xgboost",
            "data analysis", "data visualization", "statistics", "r", "jupyter", "notebook",
            "power bi", "tableau", "excel", "data pipeline", "etl", "feature engineering",
            "model deployment", "mlops", "bigquery", "spark", "hadoop", "databricks"
        ]
    },
    mobile: {
        label: "Mobile Development",
        skills: [
            "ios", "android", "react native", "flutter", "dart", "swift", "objective-c",
            "kotlin", "java android", "xamarin", "ionic", "expo", "app development",
            "mobile ui", "push notifications", "app store", "play store"
        ]
    },
    tools: {
        label: "Tools & Practices",
        skills: [
            "git", "github", "gitlab", "bitbucket", "version control", "agile", "scrum",
            "kanban", "jira", "confluence", "trello", "notion", "slack", "linear",
            "tdd", "unit testing", "integration testing", "jest", "mocha", "pytest",
            "cypress", "selenium", "playwright", "postman", "swagger", "openapi", "code review",
            "pair programming", "debugging", "performance optimization", "seo"
        ]
    },
    soft: {
        label: "Soft Skills",
        skills: [
            "communication", "teamwork", "leadership", "problem solving", "critical thinking",
            "time management", "adaptability", "creativity", "collaboration", "presentation",
            "mentoring", "project management", "stakeholder management", "documentation",
            "analytical thinking", "attention to detail", "self-motivated", "fast learner"
        ]
    },
    design: {
        label: "UI/UX Design",
        skills: [
            "figma", "adobe xd", "sketch", "invision", "ui design", "ux design",
            "user research", "wireframing", "prototyping", "design systems", "usability testing",
            "accessibility", "wcag", "information architecture", "user flows", "heuristic evaluation",
            "canva", "illustrator", "photoshop", "zeplin"
        ]
    },
    certs: {
        label: "Certifications",
        skills: [
            "aws certified", "google certified", "azure certified", "pmp", "prince2",
            "scrum master", "csm", "safe", "comptia", "ccna", "cissp", "ceh",
            "google analytics", "hubspot", "salesforce certified", "data science certification"
        ]
    }
};

// ==============================
// 2. CANONICAL ALIASES & RELATIONS
// ==============================
const ALIASES = {
    "js": "javascript",
    "ts": "typescript",
    "react.js": "react",
    "reactjs": "react",
    "vue.js": "vue",
    "vuejs": "vue",
    "node.js": "node.js",
    "nodejs": "node.js",
    "node": "node.js",
    "next.js": "nextjs",
    "next js": "nextjs",
    "postgres": "postgresql",
    "postgre sql": "postgresql",
    "sklearn": "scikit-learn",
    "k8s": "kubernetes",
    "ml": "machine learning",
    "dl": "deep learning",
    "nlp": "natural language processing",
    "rest api": "rest api",
    "rest": "rest api",
    "restful": "rest api",
    "amazon web services": "aws",
    "google cloud": "gcp",
    "google cloud platform": "gcp",
    "ci/cd": "ci/cd",
    "continuous integration": "ci/cd",
    "tdd": "unit testing",
    "test driven development": "unit testing",
    "oop": "object oriented programming",
    "nosql": "mongodb",
    "golang": "go",
    "c plus plus": "c++",
    "cpp": "c++",
    "c sharp": "c#",
    "csharp": "c#"
};

// Explicit safe relationships for Layer 3 partial matching
const RELATED_SKILLS = {
    "react": ["nextjs", "redux", "javascript", "typescript"],
    "nextjs": ["react", "typescript", "javascript"],
    "javascript": ["typescript", "node.js", "react", "vue", "html", "css"],
    "typescript": ["javascript", "node.js", "react", "angular", "nestjs"],
    "node.js": ["express", "nestjs", "javascript", "typescript"],
    "express": ["node.js", "javascript"],
    "python": ["django", "flask", "fastapi", "pandas", "numpy"],
    "django": ["python", "rest api"],
    "flask": ["python"],
    "fastapi": ["python"],
    "java": ["spring boot"],
    "spring boot": ["java"],
    "c#": [".net", "asp.net"],
    "sql": ["postgresql", "mysql", "sqlite"],
    "postgresql": ["sql"],
    "mysql": ["sql"],
    "docker": ["kubernetes"],
    "kubernetes": ["docker"],
    "aws": ["cloud"],
    "flutter": ["dart"]
};

// False positive pairs that must NEVER match
const DISALLOWED_MATCHES = [
    ["java", "javascript"],
    ["c", "c++"],
    ["c", "c#"],
    ["react", "react native"],
    ["aws", "azure"],
    ["aws", "gcp"],
    ["azure", "gcp"],
    ["go", "google"],
    ["sql", "mysql"],
    ["sql", "postgresql"]
];

function areSkillsIncompatible(s1, s2) {
    const a = (s1 || '').toLowerCase().trim();
    const b = (s2 || '').toLowerCase().trim();
    return DISALLOWED_MATCHES.some(([x, y]) =>
        (a === x && b === y) || (a === y && b === x)
    );
}

// Canonical name helper
function canonicalizeSkill(skill) {
    const s = (skill || '').toLowerCase().trim();
    return ALIASES[s] || s;
}

// ==============================
// 3. LEARNING RESOURCES METADATA
// ==============================
const LEARNING_RESOURCES = {
    "TypeScript": {
        name: "Official TypeScript Handbook",
        platform: "typescriptlang.org",
        type: "Free",
        topic: "TypeScript",
        url: "https://www.typescriptlang.org/docs/handbook/intro.html",
        verifiedDate: "2025-01"
    },
    "Docker": {
        name: "Docker Documentation & Getting Started",
        platform: "Docker Docs",
        type: "Free",
        topic: "Containerization",
        url: "https://docs.docker.com/get-started/",
        verifiedDate: "2025-01"
    },
    "Kubernetes": {
        name: "Kubernetes Basics & Tutorials",
        platform: "kubernetes.io",
        type: "Free",
        topic: "Container Orchestration",
        url: "https://kubernetes.io/docs/tutorials/kubernetes-basics/",
        verifiedDate: "2025-01"
    },
    "AWS": {
        name: "AWS Skill Builder Free Tier",
        platform: "Amazon Web Services",
        type: "Free",
        topic: "Cloud Architecture",
        url: "https://skillbuilder.aws/",
        verifiedDate: "2025-01"
    },
    "React": {
        name: "Official React Documentation",
        platform: "react.dev",
        type: "Free",
        topic: "Frontend UI",
        url: "https://react.dev/learn",
        verifiedDate: "2025-01"
    },
    "Next.js": {
        name: "Next.js Interactive Learn Course",
        platform: "nextjs.org",
        type: "Free",
        topic: "Full Stack React",
        url: "https://nextjs.org/learn",
        verifiedDate: "2025-01"
    },
    "Python": {
        name: "Python Official Tutorial",
        platform: "python.org",
        type: "Free",
        topic: "Programming Fundamentals",
        url: "https://docs.python.org/3/tutorial/",
        verifiedDate: "2025-01"
    },
    "Machine Learning": {
        name: "Practical Deep Learning for Coders",
        platform: "fast.ai",
        type: "Free",
        topic: "Machine Learning & AI",
        url: "https://course.fast.ai/",
        verifiedDate: "2025-01"
    },
    "GraphQL": {
        name: "How to GraphQL Fullstack Tutorial",
        platform: "howtographql.com",
        type: "Free",
        topic: "APIs & Data Fetching",
        url: "https://www.howtographql.com/",
        verifiedDate: "2025-01"
    },
    "PostgreSQL": {
        name: "PostgreSQL Tutorial & Exercises",
        platform: "postgresqltutorial.com",
        type: "Free",
        topic: "Relational Databases",
        url: "https://www.postgresqltutorial.com/",
        verifiedDate: "2025-01"
    },
    "Figma": {
        name: "Figma Learn & Design Resources",
        platform: "figma.com",
        type: "Free",
        topic: "UI/UX Design",
        url: "https://help.figma.com/hc/en-us/categories/360002051613",
        verifiedDate: "2025-01"
    },
    "Go": {
        name: "A Tour of Go",
        platform: "go.dev",
        type: "Free",
        topic: "Backend Systems",
        url: "https://go.dev/tour/",
        verifiedDate: "2025-01"
    },
    "Rust": {
        name: "The Rust Programming Language Book",
        platform: "rust-lang.org",
        type: "Free",
        topic: "Systems Programming",
        url: "https://doc.rust-lang.org/book/",
        verifiedDate: "2025-01"
    },
    "Redis": {
        name: "Redis University & Documentation",
        platform: "redis.io",
        type: "Free",
        topic: "In-Memory Caching",
        url: "https://redis.io/docs/latest/develop/get-started/",
        verifiedDate: "2025-01"
    },
    "MongoDB": {
        name: "MongoDB University Free Courses",
        platform: "learn.mongodb.com",
        type: "Free",
        topic: "NoSQL Databases",
        url: "https://learn.mongodb.com/",
        verifiedDate: "2025-01"
    },
    "Spring Boot": {
        name: "Spring Boot Quickstart Guide",
        platform: "spring.io",
        type: "Free",
        topic: "Java Enterprise",
        url: "https://spring.io/quickstart",
        verifiedDate: "2025-01"
    },
    "Flutter": {
        name: "Flutter Official Getting Started",
        platform: "flutter.dev",
        type: "Free",
        topic: "Cross-Platform Mobile",
        url: "https://docs.flutter.dev/get-started/install",
        verifiedDate: "2025-01"
    },
    "Terraform": {
        name: "HashiCorp Terraform Tutorials",
        platform: "developer.hashicorp.com",
        type: "Free",
        topic: "Infrastructure as Code",
        url: "https://developer.hashicorp.com/terraform/tutorials",
        verifiedDate: "2025-01"
    },
    "GitHub Actions": {
        name: "GitHub Actions Quickstart & Docs",
        platform: "docs.github.com",
        type: "Free",
        topic: "CI/CD Automation",
        url: "https://docs.github.com/en/actions/quickstart",
        verifiedDate: "2025-01"
    }
};

function formatLearningResource(resOrTitle) {
    if (!resOrTitle) return 'Self-study and official documentation';
    if (typeof resOrTitle === 'object' && resOrTitle.platform) {
        return `${resOrTitle.platform} (${resOrTitle.type}) — ${resOrTitle.name}`;
    }
    const fromMap = LEARNING_RESOURCES[resOrTitle];
    if (fromMap) {
        return `${fromMap.platform} (${fromMap.type}) — ${fromMap.name}`;
    }
    return String(resOrTitle);
}

// Next-role suggestions by current role level
const NEXT_ROLES = {
    entry: ["Junior Developer", "Associate Engineer", "Software Engineer I"],
    mid: ["Senior Developer", "Tech Lead", "Software Engineer II / III"],
    senior: ["Staff Engineer", "Engineering Manager", "Principal Engineer"],
    lead: ["Director of Engineering", "VP Engineering", "CTO (Startup)"],
    exec: ["Board Advisor", "CTO", "Chief Architect"]
};

// Company optimization profiles
const COMPANY_PROFILES = {
    startup: {
        label: "Startup / High-Growth",
        tone: "entrepreneurial, fast-paced",
        resumeLength: "1 page (concise & punchy)",
        focusAreas: ["Ownership mindset", "Full-stack versatility", "Speed of delivery", "Self-starter attitude"],
        toneKeywords: ["built from scratch", "ownership", "shipped", "scaled", "zero to one", "cross-functional"],
        avoid: ["corporate jargon", "committee processes", "excessively formal language"],
        tips: [
            "Emphasize products you owned end-to-end",
            "Highlight speed: 'Shipped MVP in 3 weeks'",
            "Show startup or side project experience",
            "Use clear, direct, outcome-focused language",
            "Focus on impact and revenue/user metrics over process"
        ]
    },
    mnc: {
        label: "Enterprise / Global MNC",
        tone: "professional, process-oriented",
        resumeLength: "1–2 pages",
        focusAreas: ["Process compliance", "Team collaboration", "Scalability", "Stakeholder management"],
        toneKeywords: ["collaborated", "led cross-functional", "implemented", "optimized", "managed stakeholders"],
        avoid: ["informal language", "vague metrics", "missing dates"],
        tips: [
            "Align with company values (check their mission and engineering standards)",
            "Quantify everything: 'Reduced operational costs by 30%'",
            "Show team leadership, peer reviews, and cross-team alignment",
            "Mention compliance, security awareness, and process improvement",
            "Use industry-standard terminology"
        ]
    },
    product: {
        label: "Product-Led Tech Company",
        tone: "user-centric, impact-driven",
        resumeLength: "1 page (outcome-focused)",
        focusAreas: ["Product thinking", "User impact", "A/B testing", "Data-driven decisions"],
        toneKeywords: ["user engagement", "retention", "conversion", "A/B tested", "improved UX", "shipped feature"],
        avoid: ["too technical without business context", "listing tools without outcomes"],
        tips: [
            "Frame technical decisions in terms of user impact and customer value",
            "Mention metrics: DAU, retention, latency reduction, conversion rates",
            "Show product intuition alongside deep technical skills",
            "Highlight close collaboration with Product Managers and Designers",
            "Discuss A/B tests or architectural trade-offs you evaluated"
        ]
    }
};

// =====================
//  TEXT PARSING HELPERS
// =====================
function normalizeText(text) {
    return (text || '').toLowerCase().replace(/[^\w\s.+#/]/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractYearsOfExperience(text) {
    const patterns = [
        /(\d+)\+?\s*years?\s*of\s*experience/gi,
        /(\d+)\+?\s*years?\s*experience/gi,
        /experience\s*of\s*(\d+)\+?\s*years?/gi,
        /(\d+)\+?\s*yrs?\s*exp/gi,
    ];
    let maxYears = 0;
    for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(text)) !== null) {
            const years = parseInt(match[1], 10);
            if (years > maxYears && years < 50) maxYears = years;
        }
    }
    return maxYears;
}

// ==============================
// 4. LAYERED SKILL EXTRACTION
// ==============================
function extractSkillsFromText(text) {
    if (!text || typeof text !== 'string') return [];
    const normalized = normalizeText(text);
    const found = new Set();

    // Collect all candidate skills, ordered longest first
    const allSkills = [];
    Object.values(SKILL_TAXONOMY).forEach(cat => {
        cat.skills.forEach(skill => allSkills.push(skill));
    });
    allSkills.sort((a, b) => b.length - a.length);

    for (const rawSkill of allSkills) {
        const skill = rawSkill.toLowerCase();

        // Special boundary handling for skills with non-word symbols (c++, c#, c)
        if (skill === 'c++') {
            if (/(?:^|[^\w+#])c\+\+(?=[^\w+#]|$)/i.test(normalized)) {
                found.add('c++');
            }
            continue;
        }

        if (skill === 'c#') {
            if (/(?:^|[^\w+#])c#(?=[^\w+#]|$)/i.test(normalized)) {
                found.add('c#');
            }
            continue;
        }

        if (skill === 'c') {
            // Must NOT match inside C++ or C#
            const withoutCppOrCsharp = normalized.replace(/c\+\+/gi, ' ').replace(/c#/gi, ' ');
            if (/(?:^|[^\w+#])c(?=[^\w+#]|$)/i.test(withoutCppOrCsharp)) {
                found.add('c');
            }
            continue;
        }


        if (skill === 'go') {
            // Unconditional match for "golang"
            if (/\bgolang\b/i.test(normalized)) {
                found.add('go');
            } else {
                // For standalone "go", only match when accompanied by technical context
                // (prevents ordinary verbs like "let's go" or "Google" from matching)
                const goWithContext = /(?:^|[^a-zA-Z0-9])go(?=\s+(?:lang|language|programming|developer|engineer|code|backend)|[^a-zA-Z0-9]|$)/i;
                const isGeneralVerb = /\b(let'?s\s+go|go\s+to|will\s+go|i\s+go|we\s+go)\b/i.test(normalized);
                if (goWithContext.test(normalized) && !isGeneralVerb && /\b(tech|developer|backend|stack|skills|software)\b/i.test(normalized)) {
                    found.add('go');
                }
            }
            continue;
        }

        if (skill === 'java') {
            // Must NOT match "javascript"
            const javaRegex = /\bjava(?!\s*script)\b/i;
            if (javaRegex.test(normalized)) {
                found.add('java');
            }
            continue;
        }

        if (skill === 'react') {
            // Must NOT match "react native" (unless "react" is independently mentioned)
            const hasReactNative = /\breact\s+native\b/i.test(normalized);
            const reactWithoutNative = /\breact(?!\s+native)\b/i.test(normalized);
            if (reactWithoutNative) {
                found.add('react');
            }
            if (hasReactNative) {
                found.add('react native');
            }
            continue;
        }

        // Standard regex for other skills
        const escaped = skill.replace(/[.+#]/g, '\\$&');
        const regex = new RegExp(`\\b${escaped}\\b`, 'i');
        if (regex.test(normalized)) {
            const canonical = canonicalizeSkill(skill);
            found.add(canonical);
        }
    }

    return [...found];
}

function detectDomain(skills) {
    const domainScores = {};
    for (const [domain, { skills: domainSkills }] of Object.entries(SKILL_TAXONOMY)) {
        domainScores[domain] = skills.filter(s => domainSkills.includes(s) || domainSkills.includes(canonicalizeSkill(s))).length;
    }
    return Object.entries(domainScores).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([d]) => d);
}

function detectEducation(resumeText) {
    const text = (resumeText || '').toLowerCase();
    let eduScore = 50; // baseline
    if (text.match(/\b(phd|doctorate|ph\.d)\b/)) eduScore = 100;
    else if (text.match(/\b(master|mtech|msc|mba|m\.tech|m\.sc|m\.e)\b/)) eduScore = 90;
    else if (text.match(/\b(bachelor|btech|bsc|be|b\.tech|b\.sc|b\.e|b\.com|bca)\b/)) eduScore = 75;
    else if (text.match(/\b(diploma|polytechnic|associate)\b/)) eduScore = 60;
    else if (text.match(/\b(12th|hsc|secondary|high school)\b/)) eduScore = 40;
    return eduScore;
}

function detectProjectRelevance(resumeText, jdText) {
    const resumeNorm = normalizeText(resumeText);
    const jdWords = normalizeText(jdText).split(/\s+/).filter(w => w.length > 4);
    const hasProjectSection = /\b(projects?|portfolio|built|developed|created|implemented)\b/i.test(resumeText);
    if (!hasProjectSection) return 35;
    const projectMatches = jdWords.filter(w => resumeNorm.includes(w)).length;
    return Math.min(100, 40 + (projectMatches / Math.max(jdWords.length, 1)) * 100);
}

// ==============================
// 5. LAYERED MATCHING ALGORITHM
// ==============================
function matchSkillsLayered(resumeSkills, allJdSkills) {
    const strongMatches = [];
    const partialMatches = [];
    const missingSkills = [];
    const exactMatches = [];
    const aliasMatches = [];
    const relatedMatches = [];
    const missingDetails = [];

    const canonResume = resumeSkills.map(canonicalizeSkill);

    for (const rawJdSkill of allJdSkills) {
        const jdSkill = canonicalizeSkill(rawJdSkill);

        // Disallow collision items from false matching
        const resumeHasExact = canonResume.includes(jdSkill);
        if (resumeHasExact) {
            // Layer 1 — Exact match
            strongMatches.push(jdSkill);
            exactMatches.push({ skill: jdSkill, layer: 'exact', label: '✓ Exact' });
            continue;
        }

        // Layer 2 — Alias match
        let matchedAlias = null;
        const aliasMatch = resumeSkills.some(rs => {
            if (areSkillsIncompatible(rs, jdSkill)) return false;
            if (canonicalizeSkill(rs) === jdSkill) {
                matchedAlias = rs;
                return true;
            }
            return false;
        });

        if (aliasMatch) {
            strongMatches.push(jdSkill);
            aliasMatches.push({
                raw: matchedAlias,
                skill: jdSkill,
                layer: 'alias',
                label: `✓ Alias → ${titleCase(jdSkill)}`
            });
            continue;
        }

        // Layer 3 — Safe Related Skill Handling (explicit mapping only)
        const allowedRelated = RELATED_SKILLS[jdSkill] || [];
        let matchedRelated = null;
        const hasRelated = canonResume.some(rs => {
            if (areSkillsIncompatible(rs, jdSkill)) return false;
            if (allowedRelated.includes(rs) || (RELATED_SKILLS[rs] || []).includes(jdSkill)) {
                matchedRelated = rs;
                return true;
            }
            return false;
        });

        if (hasRelated) {
            partialMatches.push(jdSkill);
            relatedMatches.push({
                skill: jdSkill,
                matchedWith: matchedRelated,
                layer: 'related',
                label: `◐ Related (${titleCase(matchedRelated)})`
            });
        } else {
            missingSkills.push(jdSkill);
            missingDetails.push({ skill: jdSkill, layer: 'missing', label: '✗ Missing' });
        }
    }

    return { strongMatches, partialMatches, missingSkills, exactMatches, aliasMatches, relatedMatches, missingDetails };
}

// ==============================
// 5B. JD REQUIREMENT CLASSIFICATION
// ==============================
function classifyJDRequirements(jdText, allJdSkills = []) {
    const lines = (jdText || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const mustHave = [];
    const preferred = [];
    const qualifications = [];
    const responsibilities = [];

    const mustKeywords = /\b(must|required|essential|minimum|mandatory|core|critical|proven experience in)\b/i;
    const prefKeywords = /\b(preferred|plus|nice to have|bonus|advantage|good to have|desirable|optional|ideal)\b/i;
    const qualKeywords = /\b(degree|b\.?tech|b\.?e\.?|b\.?s\.?|m\.?s\.?|m\.?tech|master|phd|bachelor|diploma|certification|certified|years of experience|yoe)\b/i;
    const respKeywords = /\b(responsibilities|duties|what you will do|day-to-day|role overview)\b/i;

    let inResp = false;
    for (const line of lines) {
        const lower = line.toLowerCase();
        if (respKeywords.test(lower)) { inResp = true; continue; }
        if (/\b(requirements|qualifications|what we are looking for|skills)\b/i.test(lower)) { inResp = false; continue; }

        if (qualKeywords.test(lower)) {
            if (line.length > 5 && line.length < 160) qualifications.push(line.replace(/^[-*•\d.]+\s*/, ''));
        } else if (mustKeywords.test(lower)) {
            if (line.length > 5 && line.length < 160) mustHave.push(line.replace(/^[-*•\d.]+\s*/, ''));
        } else if (prefKeywords.test(lower)) {
            if (line.length > 5 && line.length < 160) preferred.push(line.replace(/^[-*•\d.]+\s*/, ''));
        } else if (inResp && /^[-*•]/.test(line)) {
            if (line.length > 10 && line.length < 180 && responsibilities.length < 6) {
                responsibilities.push(line.replace(/^[-*•\d.]+\s*/, ''));
            }
        }
    }

    const skillsByTier = {
        mustHave: [],
        preferred: []
    };

    allJdSkills.forEach(s => {
        const skill = s.toLowerCase();
        const isPref = preferred.some(p => p.toLowerCase().includes(skill));
        if (isPref) skillsByTier.preferred.push(s);
        else skillsByTier.mustHave.push(s);
    });

    return {
        mustHave: mustHave.slice(0, 8),
        preferred: preferred.slice(0, 8),
        qualifications: qualifications.slice(0, 6),
        responsibilities: responsibilities.slice(0, 6),
        skillsByTier
    };
}

// ==============================
// 6. CORE SCORING ENGINE
// ==============================
function analyzeMatch(resumeText, jdText, options = {}) {
    const { roleLevel = 'mid', industry = 'tech', prioritySkills = [], targetRole = '', targetCompany = '' } = options;

    const resumeSkills = extractSkillsFromText(resumeText);
    const jdSkills = extractSkillsFromText(jdText);
    const resumeYears = extractYearsOfExperience(resumeText);
    const jdYears = extractYearsOfExperience(jdText);
    const resumeDomains = detectDomain(resumeSkills);
    const jdDomains = detectDomain(jdSkills);
    const educationScore = detectEducation(resumeText);
    const projectScore = Math.round(detectProjectRelevance(resumeText, jdText));

    // Merge priority skills
    const normalizedPriority = prioritySkills.map(s => canonicalizeSkill(s)).filter(Boolean);
    const allJdSkills = [...new Set([...jdSkills, ...normalizedPriority])];

    // Layered matching
    const { strongMatches, partialMatches, missingSkills, exactMatches, aliasMatches, relatedMatches, missingDetails } = matchSkillsLayered(resumeSkills, allJdSkills);

    const extraSkills = resumeSkills.filter(s => !allJdSkills.includes(s) && !allJdSkills.includes(canonicalizeSkill(s))).slice(0, 8);

    // Score calculation
    const totalJdSkills = allJdSkills.length || 1;
    const priorityMatched = normalizedPriority.filter(s => strongMatches.includes(s) || partialMatches.includes(s)).length;
    const priorityBoost = normalizedPriority.length > 0 ? (priorityMatched / normalizedPriority.length) * 10 : 0;
    const skillScore = Math.min(100, ((strongMatches.length + partialMatches.length * 0.5) / totalJdSkills) * 100 + priorityBoost);

    // Experience — adjusted by roleLevel
    const roleLevelYearsMap = { entry: 1, mid: 3, senior: 5, lead: 7, exec: 10 };
    const expectedYears = jdYears > 0 ? jdYears : (roleLevelYearsMap[roleLevel] || 3);
    let expScore = 100;
    if (resumeYears > 0) {
        expScore = resumeYears >= expectedYears ? 100 : Math.max(20, (resumeYears / expectedYears) * 100);
    } else if (roleLevel === 'entry') {
        expScore = 80;
    } else {
        expScore = 50;
    }

    const domainOverlap = jdDomains.filter(d => resumeDomains.includes(d)).length;
    const domainScore = (domainOverlap / Math.max(jdDomains.length, 1)) * 100;

    const jdWords = normalizeText(jdText).split(' ').filter(w => w.length > 3);
    const resumeWords = normalizeText(resumeText).split(' ');
    const keywordHits = jdWords.filter(w => resumeWords.includes(w)).length;
    const keywordScore = Math.min(100, (keywordHits / Math.max(jdWords.length, 1)) * 150);

    // Soft skills detection
    const standardSoft = ['communication', 'teamwork', 'leadership', 'problem solving', 'collaboration', 'mentoring', 'presentation', 'adaptability'];
    const matchedSoftSkills = standardSoft.filter(s => new RegExp(`\\b${s}\\b`, 'i').test(resumeText));
    const softSkillScore = Math.min(100, Math.round((matchedSoftSkills.length / 3) * 100));

    // Transparent breakdown calculation (Requirement 4)
    // Skills (40), Experience (20), Domain (15), Soft Skills (15), ATS Keywords (10) -> Total 100
    const skillsPts = Math.round((skillScore / 100) * 40);
    const expPts = Math.round((expScore / 100) * 20);
    const domainPts = Math.round((domainScore / 100) * 15);
    const softPts = Math.round((softSkillScore / 100) * 15);
    const atsPts = Math.round((keywordScore / 100) * 10);
    const totalPts = Math.min(100, skillsPts + expPts + domainPts + softPts + atsPts);

    const breakdown = {
        skills: { points: skillsPts, max: 40, label: "Skills" },
        experience: { points: expPts, max: 20, label: "Experience" },
        domain: { points: domainPts, max: 15, label: "Domain" },
        softSkills: { points: softPts, max: 15, label: "Soft Skills" },
        ats: { points: atsPts, max: 10, label: "ATS" },
        total: { points: totalPts, max: 100, label: "Total" }
    };

    // Final weighted score
    const finalScore = Math.round(
        skillScore * 0.40 +
        expScore * 0.20 +
        domainScore * 0.15 +
        keywordScore * 0.10 +
        educationScore * 0.08 +
        projectScore * 0.07
    );
    const clampedScore = Math.min(98, Math.max(5, finalScore));

    // Transparent verdict
    let verdict, verdictClass, verdictIcon, jobReady;
    if (clampedScore >= 75) {
        verdict = "High Compatibility! 🎉"; verdictClass = "ready"; verdictIcon = "🚀"; jobReady = "Strong Alignment";
    } else if (clampedScore >= 50) {
        verdict = "Moderate Compatibility — Minor Gaps"; verdictClass = "improve"; verdictIcon = "⚡"; jobReady = "Partial Alignment";
    } else {
        verdict = "Low Initial Match — Targeted Prep Needed"; verdictClass = "learning"; verdictIcon = "📚"; jobReady = "Gaps Identified";
    }

    // Strengths & Weaknesses
    const strengthsWeaknesses = analyzeStrengthsWeaknesses({
        skillScore, expScore, domainScore, keywordScore, educationScore, projectScore,
        strongMatches, partialMatches, missingSkills, resumeYears, expectedYears
    });

    // 9 Modules
    const skillsGap = generateSkillsGap(missingSkills, partialMatches, jdText);
    const atsAnalysis = analyzeATS(resumeText, jdText, allJdSkills);
    const companyOpt = generateCompanyOptimization(targetCompany, targetRole, roleLevel, jdText, industry);
    const tips = generateResumeTips(strongMatches, partialMatches, missingSkills, resumeText, jdText, resumeYears, expectedYears, options);
    const roadmap = generateRoadmap(missingSkills, partialMatches, roleLevel);
    const interviewPrep = generateInterviewPrep(strongMatches, missingSkills, targetRole, roleLevel);
    const softSkillsTips = generateSoftSkillsTips(resumeText, roleLevel);
    const jdRequirements = classifyJDRequirements(jdText, allJdSkills);

    return {
        score: clampedScore,
        rawScore: finalScore,
        scoreTitle: "Estimated Resume-JD Compatibility",
        disclaimer: "This score estimates how closely the provided resume aligns with the job description. It is not a hiring probability or guarantee of selection.",
        atsDisclaimer: "ATS systems vary between companies and software platforms. This result is an estimate based on resume structure, keywords, formatting, and job-description alignment.",
        breakdown,
        exactMatches,
        aliasMatches,
        relatedMatches,
        missingDetails,
        jdRequirements,
        skillScore: Math.round(skillScore),
        expScore: Math.round(expScore),
        domainScore: Math.round(domainScore),
        keywordScore: Math.round(keywordScore),
        educationScore: Math.round(educationScore),
        projectScore: Math.round(projectScore),
        softSkillScore: Math.round(softSkillScore),
        verdict,
        verdictClass,
        verdictIcon,
        jobReady,
        strongMatches,
        partialMatches,
        missingSkills,
        extraSkills,
        resumeYears,
        expectedYears,
        resumeDomains,
        jdDomains,
        strengthsWeaknesses,
        skillsGap,
        atsAnalysis,
        companyOpt,
        tips,
        roadmap,
        interviewPrep,
        softSkillsTips,
        options
    };
}

// ==============================
// 7. MODULE SUB-GENERATORS
// ==============================
function analyzeStrengthsWeaknesses(res) {
    const strengths = [];
    const weaknesses = [];

    if (res.skillScore >= 65) strengths.push({ label: `Strong Skill Overlap (${res.skillScore}%)`, score: res.skillScore, detail: `${res.strongMatches.length} required skills matched directly from the job description.` });
    else weaknesses.push({ label: `Key Skill Gaps (${res.skillScore}%)`, score: res.skillScore, detail: `${res.missingSkills.length} required skills are missing or not explicitly stated in your resume.` });

    if (res.expScore >= 75) strengths.push({ label: `Experience Requirement Met (${res.expScore}%)`, score: res.expScore, detail: `Your detected ${res.resumeYears}y experience aligns with the ${res.expectedYears}y target.` });
    else weaknesses.push({ label: `Experience Alignment (${res.expScore}%)`, score: res.expScore, detail: `Role expects ~${res.expectedYears}y, resume reflects ${res.resumeYears}y. Highlight high-impact projects to compensate.` });

    if (res.keywordScore >= 60) strengths.push({ label: `ATS Keyword Alignment (${res.keywordScore}%)`, score: res.keywordScore, detail: 'High keyword density found matching the core job description requirements.' });
    else weaknesses.push({ label: `ATS Keyword Density (${res.keywordScore}%)`, score: res.keywordScore, detail: 'Resume lacks several specific terms and tool names found in the job description.' });

    if (res.domainScore >= 60) strengths.push({ label: `Domain Alignment (${res.domainScore}%)`, score: res.domainScore, detail: 'Your technical focus closely matches the target domain.' });
    else if (res.domainScore < 40) weaknesses.push({ label: `Cross-Domain Shift (${res.domainScore}%)`, score: res.domainScore, detail: 'Target role emphasizes a different technical domain. Emphasize transferable skills.' });

    while (strengths.length < 3) strengths.push({ label: 'Foundational Competence', score: 60, detail: 'Core professional formatting and clear baseline skills present.' });
    while (weaknesses.length < 3) weaknesses.push({ label: 'Tailoring Opportunity', score: 45, detail: 'Further customize your summary and bullet points for this specific role.' });

    return { strengths: strengths.slice(0, 3), weaknesses: weaknesses.slice(0, 3) };
}

function generateSkillsGap(missingSkills, partialSkills, jdText) {
    const jdNorm = normalizeText(jdText);
    const skillFreq = {};
    missingSkills.forEach(skill => {
        const count = (jdNorm.match(new RegExp(`\\b${skill.replace(/[.+#]/g, '\\$&')}\\b`, 'gi')) || []).length;
        skillFreq[skill] = count;
    });

    const highPriority = [];
    const mediumPriority = [];
    const optional = [];

    missingSkills.forEach(skill => {
        const freq = skillFreq[skill] || 0;
        const isDevops = SKILL_TAXONOMY.devops?.skills.includes(skill);
        const isCore = SKILL_TAXONOMY.backend?.skills.includes(skill) || SKILL_TAXONOMY.frontend?.skills.includes(skill);

        let improvement = '';
        const tc = titleCase(skill);
        const res = LEARNING_RESOURCES[tc];
        if (res) {
            improvement = `Explore ${formatLearningResource(res)}`;
        } else if (isCore) {
            improvement = `Build a hands-on project demonstrating ${tc} in your portfolio.`;
        } else if (isDevops) {
            improvement = `Complete a deployment lab or container setup with ${tc}.`;
        } else {
            improvement = `Review documentation for ${tc} and add a concrete usage example.`;
        }

        const entry = { skill: tc, freq, improvement };
        if (freq >= 2 || (isCore && freq >= 1)) highPriority.push(entry);
        else if (freq === 1 || isDevops) mediumPriority.push(entry);
        else optional.push(entry);
    });

    const partialEntries = partialSkills.map(skill => ({
        skill: titleCase(skill),
        improvement: `Your resume partially matches ${titleCase(skill)}. Clarify exact version, responsibilities, or project metrics.`,
    }));

    return { highPriority, mediumPriority, optional, partialEntries };
}

function generateCompanyOptimization(targetCompany, targetRole, roleLevel, jdText = '', industry = 'tech') {
    let companyType = 'product';

    const company = (targetCompany || '').toLowerCase();
    const jdNorm = (jdText || '').toLowerCase();

    const startupKeywords = ['startup', 'early stage', 'seed', 'series a', 'series b', 'founding', 'fast-paced', 'equity', '0 to 1', 'wear multiple hats'];
    const mncKeywords = ['google', 'microsoft', 'amazon', 'meta', 'apple', 'ibm', 'accenture', 'tcs', 'infosys', 'wipro', 'cognizant', 'capgemini', 'deloitte', 'pwc', 'kpmg', 'fortune', 'enterprise', 'global', 'stakeholder'];
    const productKeywords = ['flipkart', 'swiggy', 'zomato', 'uber', 'ola', 'meesho', 'razorpay', 'paytm', 'phonepe', 'cred', 'groww', 'zerodha', 'dream11', 'product-led', 'saas'];

    if (startupKeywords.some(k => company.includes(k) || jdNorm.includes(k))) companyType = 'startup';
    else if (mncKeywords.some(k => company.includes(k) || jdNorm.includes(k))) companyType = 'mnc';
    else if (productKeywords.some(k => company.includes(k) || jdNorm.includes(k))) companyType = 'product';

    const profile = COMPANY_PROFILES[companyType];
    const nextRoles = NEXT_ROLES[roleLevel] || NEXT_ROLES.mid;

    return {
        companyType,
        profile,
        nextRoles,
        targetRole,
        targetCompany,
        industry,
        disclaimer: "Resume alignment suggestions — these represent stylistic formatting advice, not a guarantee of employer hiring outcomes.",
        structureSuggestions: [
            `Suggested Length: ${profile.resumeLength}`,
            `Tone: ${profile.tone}`,
            `Emphasize: ${profile.focusAreas[0]} and ${profile.focusAreas[1]}`,
            `Downplay: ${profile.avoid[0]}`
        ]
    };
}

function generateResumeTips(strong, partial, missing, resumeText, jdText, rYears, jYears, options = {}) {
    const tips = [];
    const roleLabel = { entry: 'Entry Level', mid: 'Mid Level', senior: 'Senior', lead: 'Lead/Manager', exec: 'Executive' }[options.roleLevel || 'mid'] || 'this role';

    if (missing.length > 0) {
        tips.push({
            icon: "🎯",
            title: "Incorporate Missing Requirements",
            body: `If you have experience with these skills, explicitly add them: <strong>${missing.slice(0, 5).map(titleCase).join(', ')}</strong>. Contextualize them within real project bullets.`
        });
    }
    if (partial.length > 0) {
        tips.push({
            icon: "✍️",
            title: "Clarify Related Competencies",
            body: `These skills were detected via related competencies: <strong>${partial.slice(0, 5).map(titleCase).join(', ')}</strong>. Specify exact tools and libraries used.`
        });
    }
    if (jYears > 0 && rYears < jYears) {
        tips.push({
            icon: "📅",
            title: `Address Experience Difference for ${roleLabel}`,
            body: `The posting mentions <strong>${jYears}+ years</strong>. Emphasize complexity, leadership, and end-to-end deliverables to demonstrate seniority.`
        });
    }
    if (!resumeText.match(/\d+%|\d+x|\$\d+|increased|reduced|improved|delivered|\d+ (users|clients|projects)/i)) {
        tips.push({
            icon: "📈",
            title: "Quantify Bullet Points with Numbers",
            body: `Recruiters and hiring managers look for measurable results. Example: 'Reduced API response times by 35%' or 'Managed a fleet of 12 microservices'.`
        });
    }
    tips.push({
        icon: "🤖",
        title: "ATS-Friendly Document Formatting",
        body: `Use a clean single-column structure. Avoid complex multi-column tables, graphics, or nested text boxes. Keep standard section headers.`
    });
    return tips;
}

function generateRoadmap(missingSkills, partialSkills, roleLevel) {
    const phase1 = [];
    const phase2 = [];
    const phase3 = [];

    const topMissing = missingSkills.slice(0, 6);
    topMissing.forEach((skill, i) => {
        const tc = titleCase(skill);
        const res = formatLearningResource(LEARNING_RESOURCES[tc]);
        if (i < 2) {
            phase1.push({ skill: tc, resource: res, action: "Hands-on foundation & starter tutorial" });
        } else if (i < 4) {
            phase2.push({ skill: tc, resource: res, action: "Build portfolio integration with full test coverage" });
        } else {
            phase3.push({ skill: tc, resource: res, action: "Advanced architecture & production patterns" });
        }
    });

    if (phase1.length === 0) {
        phase1.push({ skill: "System Design & Architecture", resource: "System Design Primer (GitHub)", action: "Study scalable distributed system trade-offs" });
    }
    if (phase2.length === 0) {
        phase2.push({ skill: "Testing & CI/CD", resource: "GitHub Actions Official Docs", action: "Automate testing and deployment pipelines" });
    }

    const nextRoles = NEXT_ROLES[roleLevel] || NEXT_ROLES.mid;
    return { phase1, phase2, phase3, nextRoles };
}

function analyzeATS(resumeText, jdText, allJdSkills) {
    const resumeNorm = normalizeText(resumeText);
    const jdNorm = normalizeText(jdText);

    // Extract notable keywords (length > 3)
    const jdKeywords = [...new Set(
        jdNorm.split(/\s+/).filter(w => w.length > 3 && !['with', 'from', 'have', 'that', 'this', 'will', 'your', 'about'].includes(w))
    )].slice(0, 40);

    const keywordList = jdKeywords.map(word => ({
        word,
        inResume: new RegExp(`\\b${word}\\b`, 'i').test(resumeNorm)
    }));

    const found = keywordList.filter(k => k.inResume).length;
    const total = keywordList.length || 1;
    const passProbability = Math.round((found / total) * 100);

    const formatRisks = [];
    if (resumeText.includes('\t\t') || resumeText.includes('    |')) formatRisks.push('Possible multi-column table detected');
    if (resumeText.length < 300) formatRisks.push('Resume text is very short');
    if (!resumeText.match(/@[\w.-]+\.\w+/)) formatRisks.push('No email address detected');

    const missingKeywords = keywordList.filter(k => !k.inResume).map(k => k.word).slice(0, 8);
    const overusedWords = ['passionate', 'synergy', 'hardworking', 'go-getter', 'detail-oriented', 'team player'].filter(w =>
        new RegExp(`\\b${w}\\b`, 'i').test(resumeNorm)
    );

    const atsTips = [
        "Use exact keywords from the job description where they truthfully match your experience.",
        "Keep standard headings like 'Skills', 'Experience', and 'Education'.",
        "Save your resume as a clean, text-selectable PDF rather than a scanned image.",
        "Avoid icons, header tables, or unusual symbols for bullet points."
    ];

    return {
        passProbability,
        passLabel: passProbability >= 70 ? 'High Alignment (Estimated)' : passProbability >= 45 ? 'Moderate Alignment' : 'Low Alignment (Review Suggested)',
        passClass: passProbability >= 70 ? 'pass' : passProbability >= 45 ? 'maybe' : 'fail',
        formatRisks,
        missingKeywords,
        overusedWords,
        atsTips,
        keywordList: keywordList.slice(0, 20)
    };
}

function generateInterviewPrep(strongSkills, missingSkills, targetRole, roleLevel) {
    const questions = [];

    const addQ = (category, difficulty, question, tip) => {
        questions.push({ category, difficulty, question, tip });
    };

    addQ("Core Technical", "Medium", "Can you explain how you handle state management or data flow in your primary stack?", "Walk through a real problem you solved, trade-offs considered, and how you measured success.");
    addQ("System Design", roleLevel === 'senior' ? 'Hard' : 'Medium', "How would you design a scalable service that handles sudden traffic spikes?", "Focus on caching layers, database bottlenecks, asynchronous queues, and monitoring.");
    addQ("Behavioral", "Medium", "Tell me about a time a project ran behind schedule or faced unexpected technical blockers.", "Use the STAR method: Situation, Task, Action you took, and measurable Result.");

    if (strongSkills.length > 0) {
        const topSkill = titleCase(strongSkills[0]);
        addQ("Skill Deep-Dive", "Medium", `What are the most common performance or debugging pitfalls you encounter when using ${topSkill}?`, `Share specific real-world experiences rather than generic textbook answers.`);
    }

    if (missingSkills.length > 0) {
        const missingSkill = titleCase(missingSkills[0]);
        addQ("Adaptability", "Medium", `This role requires ${missingSkill}. How do you approach quickly learning and becoming productive with a new technology?`, `Highlight your fundamentals, debugging discipline, and previous fast ramps.`);
    }

    return { questions };
}

function generateSoftSkillsTips(resumeText, roleLevel) {
    const hasSoftSkills = /\b(communication|leadership|teamwork|collaboration|mentoring|presentation)\b/i.test(resumeText);
    const videoTips = [
        "State your name, core domain, and 1–2 highlighted accomplishments in under 30 seconds.",
        "Frame achievements around business impact and customer benefits.",
        "Maintain good lighting, clear audio, and a quiet background."
    ];
    return { videoTips, hasSoftSkills };
}

function titleCase(str) {
    return (str || '').replace(/\b\w/g, l => l.toUpperCase());
}

// Global Browser Export
const ResumeAnalyzer = {
    SKILL_TAXONOMY,
    ALIASES,
    RELATED_SKILLS,
    LEARNING_RESOURCES,
    COMPANY_PROFILES,
    analyzeMatch,
    extractSkillsFromText,
    matchSkillsLayered,
    canonicalizeSkill,
    classifyJDRequirements,
    formatLearningResource,
    titleCase
};

if (typeof window !== 'undefined') {
    window.ResumeAnalyzer = ResumeAnalyzer;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResumeAnalyzer;
}
