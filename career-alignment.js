// ============================================================
// career-alignment.js — Career Alignment Engine & Interview Ready v1.0.0
// HireLens — "Align your skills. Match your career."
// 100% Client-Side, Explainable Career Intelligence Engine
// ============================================================

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.CareerAlignment = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {

    // ------------------------------------------------------------
    // 1. ACTION PLAN ROADMAP TEMPLATES (Realistic & Practical)
    // ------------------------------------------------------------
    const SKILL_ROADMAP_LIBRARY = {
        'typescript': {
            priority: 'High',
            reason: 'Explicitly required for enterprise frontends and type-safe backend systems.',
            days: [
                { day: 'Day 1', topic: 'TypeScript Basics & Tooling', details: 'Install TS compiler, tsconfig setup, primitive types, type inference, union & intersection types.', exercise: 'Convert a 50-line JavaScript utility function to TypeScript.' },
                { day: 'Day 2', topic: 'Interfaces & Type Aliases', details: 'Optional properties, readonly modifiers, extending interfaces, function types, structural typing.', exercise: 'Define strict schemas for API request and response bodies.' },
                { day: 'Day 3', topic: 'Generics & Utility Types', details: 'Generic functions, constraints, Partial, Pick, Omit, Record, Readonly, and type narrowing.', exercise: 'Write a type-safe generic API fetch wrapper.' },
                { day: 'Day 4', topic: 'Framework Integration (React/Node)', details: 'Typed components, props, hooks (useState, useReducer, useRef), event handling.', exercise: 'Migrate a standard React component with form state to strict TypeScript.' },
                { day: 'Day 5', topic: 'Mini Project & Portfolio Verification', details: 'Build a fully typed mini-app with zero "any" types, linting, and build verification.', exercise: 'Publish code to GitHub with clean tsconfig and strict mode enabled.' }
            ],
            resource: 'Official TypeScript Handbook (typescriptlang.org/docs)'
        },
        'docker': {
            priority: 'High',
            reason: 'Standard industry requirement for reproducible development and containerized deployment.',
            days: [
                { day: 'Day 1', topic: 'Container Fundamentals', details: 'Containers vs VMs, Docker architecture, docker CLI basics (run, ps, stop, exec, rm).', exercise: 'Run Nginx and Postgres containers locally using CLI.' },
                { day: 'Day 2', topic: 'Dockerfile & Image Optimization', details: 'FROM, COPY, RUN, CMD, EXPOSE, multi-stage builds, .dockerignore best practices.', exercise: 'Write a multi-stage Dockerfile for a Node or Python app under 150MB.' },
                { day: 'Day 3', topic: 'Networking & Volumes', details: 'Bridge networks, port mapping, bind mounts vs managed volumes for persistent data.', exercise: 'Connect a web app container to a standalone PostgreSQL database container.' },
                { day: 'Day 4', topic: 'Docker Compose Orchestration', details: 'docker-compose.yml syntax, services, environment variables, dependencies, healthchecks.', exercise: 'Orchestrate a frontend, backend, and database stack with one "docker-compose up".' },
                { day: 'Day 5', topic: 'Production Readiness & CI Integration', details: 'Non-root users, vulnerability scanning, pushing to Docker Hub or ECR in CI pipeline.', exercise: 'Add a container build and test step in GitHub Actions.' }
            ],
            resource: 'Docker Curriculum & Official Docs (docker.com)'
        },
        'kubernetes': {
            priority: 'Medium',
            reason: 'Key for cloud-native orchestration, microservices scaling, and production reliability.',
            days: [
                { day: 'Day 1', topic: 'K8s Architecture & Pods', details: 'Control plane, nodes, pods, kubectl cheat sheet, Minikube / Kind local cluster setup.', exercise: 'Spin up a local cluster and deploy a single Nginx pod via YAML.' },
                { day: 'Day 2', topic: 'Deployments & ReplicaSets', details: 'Self-healing, declarative updates, rolling updates, rollbacks, resource limits.', exercise: 'Create a Deployment with 3 replicas and perform a zero-downtime rolling update.' },
                { day: 'Day 3', topic: 'Services & Networking', details: 'ClusterIP, NodePort, LoadBalancer, Service discovery, DNS within cluster.', exercise: 'Expose the Deployment to internal and external traffic via Service YAML.' },
                { day: 'Day 4', topic: 'ConfigMaps, Secrets & Volumes', details: 'Decoupling configuration, sensitive data encoding, mounting volumes into pods.', exercise: 'Inject DB credentials securely into an app pod using K8s Secrets.' },
                { day: 'Day 5', topic: 'Ingress & Health Probes', details: 'Liveness and Readiness probes, basic Ingress controller routing.', exercise: 'Configure health endpoints to prevent traffic routing to booting containers.' }
            ],
            resource: 'Kubernetes Official Interactive Tutorials (kubernetes.io)'
        },
        'graphql': {
            priority: 'Medium',
            reason: 'Frequently asked for modern client-driven APIs and microservice federation.',
            days: [
                { day: 'Day 1', topic: 'GraphQL vs REST Principles', details: 'Over-fetching, under-fetching, schema-first design, queries, mutations, subscriptions.', exercise: 'Explore a public GraphQL API (e.g. GitHub GraphQL API) via GraphiQL.' },
                { day: 'Day 2', topic: 'Schema Definition & Types', details: 'Types, fields, scalars, enums, inputs, non-null, ID type, relationship modeling.', exercise: 'Design a schema for an e-commerce catalog with Products and Reviews.' },
                { day: 'Day 3', topic: 'Resolvers & Backend Integration', details: 'Writing resolver functions (parent, args, context, info), connecting to database/ORM.', exercise: 'Implement an Apollo Server or Express-GraphQL server resolving nested data.' },
                { day: 'Day 4', topic: 'N+1 Problem & DataLoader', details: 'Understanding database batching, DataLoader implementation, query caching.', exercise: 'Optimize a nested author/posts query from N+1 database queries to 2 queries.' },
                { day: 'Day 5', topic: 'Client Integration (Apollo / TanStack)', details: 'useQuery, useMutation, optimistic UI updates, normalized cache management.', exercise: 'Connect a React UI to execute queries and update cache upon mutations.' }
            ],
            resource: 'How to GraphQL (howtographql.com)'
        },
        'aws': {
            priority: 'High',
            reason: 'Industry dominant cloud provider required for scalable cloud deployments.',
            days: [
                { day: 'Day 1', topic: 'Core Compute & IAM', details: 'IAM users/roles/policies, least privilege principle, EC2 instances, security groups.', exercise: 'Launch an EC2 instance securely with custom security group rules.' },
                { day: 'Day 2', topic: 'Storage (S3 & EBS)', details: 'S3 bucket policies, access control, presigned URLs, lifecycle rules, static hosting.', exercise: 'Implement a secure image upload endpoint generating S3 presigned URLs.' },
                { day: 'Day 3', topic: 'Serverless (Lambda & API Gateway)', details: 'Serverless architecture, event triggers, environment variables, execution timeout.', exercise: 'Create a serverless Lambda function connected to HTTP API Gateway.' },
                { day: 'Day 4', topic: 'Managed Databases (RDS & DynamoDB)', details: 'Relational RDS setup, VPC subnets, NoSQL DynamoDB partition and sort keys.', exercise: 'Connect a backend service to an RDS PostgreSQL instance securely.' },
                { day: 'Day 5', topic: 'Monitoring & CI/CD (CloudWatch & Secrets)', details: 'CloudWatch logs and alarms, AWS Secrets Manager, IAM role assumption in CI.', exercise: 'Instrument structured logging and view CloudWatch metrics under load.' }
            ],
            resource: 'AWS Free Tier & Well-Architected Framework'
        },
        'redis': {
            priority: 'Medium',
            reason: 'Essential in high-performance backends for caching, rate limiting, and session management.',
            days: [
                { day: 'Day 1', topic: 'Redis Data Structures', details: 'Strings, Hashes, Lists, Sets, Sorted Sets, TTL (Time-To-Live), key expiration.', exercise: 'Practice CLI commands for caching key-value pairs with 60-second expiration.' },
                { day: 'Day 2', topic: 'Caching Patterns', details: 'Cache-aside, write-through, write-behind, cache stampede mitigation.', exercise: 'Implement cache-aside pattern on a slow database query in Node.js/Python.' },
                { day: 'Day 3', topic: 'Session Storage & Token Blacklisting', details: 'Decoupled state, storing session tokens, fast JWT revocation checks.', exercise: 'Store user session data in Redis with automatic inactivity expiration.' },
                { day: 'Day 4', topic: 'Rate Limiting & Pub/Sub', details: 'Token bucket / sliding window rate limiting, Redis Pub/Sub channels.', exercise: 'Build an API rate limiter allowing max 100 requests per minute per IP.' },
                { day: 'Day 5', topic: 'Persistence & Eviction Policies', details: 'RDB snapshots vs AOF logs, allkeys-lru vs volatile-lru eviction configurations.', exercise: 'Configure memory limits and eviction behavior for production stability.' }
            ],
            resource: 'Redis University & Official Documentation (redis.io)'
        },
        'ci/cd': {
            priority: 'High',
            reason: 'Required across all modern engineering teams for continuous automated delivery.',
            days: [
                { day: 'Day 1', topic: 'CI/CD Foundations', details: 'Continuous Integration vs Continuous Delivery, pipeline stages, runner environments.', exercise: 'Map out the build, test, and release stages for your current project.' },
                { day: 'Day 2', topic: 'GitHub Actions Workflows', details: 'Workflows, jobs, steps, triggers (push, pull_request), actions checkout and setup.', exercise: 'Write a workflow that installs dependencies and runs linter on every PR.' },
                { day: 'Day 3', topic: 'Automated Testing Pipeline', details: 'Unit testing, matrix builds across Node/Python versions, test failure reporting.', exercise: 'Block PR merges if any unit test or test coverage threshold fails.' },
                { day: 'Day 4', topic: 'Environment Secrets & Build Artifacts', details: 'Repository secrets, environments, artifact uploading, build caching.', exercise: 'Cache npm/pip dependencies to reduce pipeline execution time by 50%.' },
                { day: 'Day 5', topic: 'Continuous Deployment (CD)', details: 'Automated deployment to staging/production upon merge to main, rollback checks.', exercise: 'Deploy to Render, Vercel, or cloud instance automatically on green builds.' }
            ],
            resource: 'GitHub Actions Documentation & CI/CD Best Practices'
        }
    };

    // Generic fallback roadmap for uncataloged skills
    function getGenericSkillRoadmap(skillName, priority = 'Medium') {
        const clean = titleCase(skillName);
        return {
            priority,
            reason: `Target job description emphasizes ${clean} as a key requirement.`,
            days: [
                { day: 'Day 1', topic: `${clean} Foundations & Environment`, details: `Study official documentation, architecture overview, core concepts, and set up local development tools for ${clean}.`, exercise: `Complete a verified "Hello World" or starter environment test using ${clean}.` },
                { day: 'Day 2', topic: `Core Syntax & Core Patterns in ${clean}`, details: `Understand essential APIs, data structures, state management, and conventions standard in ${clean}.`, exercise: `Implement 2-3 standard coding exercises or small functions utilizing ${clean}.` },
                { day: 'Day 3', topic: `Integration & Real-world Workflows`, details: `Connect ${clean} to your primary technical stack (databases, APIs, frontend UI, or build tools).`, exercise: `Write an integration module connecting ${clean} with existing codebase components.` },
                { day: 'Day 4', topic: `Error Handling, Edge Cases & Testing`, details: `Learn common debugging pitfalls, exception handling, and unit testing strategies for ${clean}.`, exercise: `Add comprehensive unit/integration test suite covering common edge cases.` },
                { day: 'Day 5', topic: `Portfolio Project & Practical Demonstration`, details: `Build a concrete mini-project or PR demonstrating production-level patterns in ${clean}.`, exercise: `Document architecture decisions and push clean commit history to your public GitHub.` }
            ],
            resource: `Official Documentation & Guides for ${clean}`
        };
    }

    // ------------------------------------------------------------
    // 2. SKILL GAP -> ACTION PLAN GENERATOR
    // ------------------------------------------------------------
    function generateSkillActionPlan(missingSkills = [], targetRole = 'Software Engineer', roleLevel = 'mid') {
        const plans = [];

        missingSkills.slice(0, 5).forEach((rawSkill, idx) => {
            const skillKey = (rawSkill || '').toLowerCase().trim();
            const libraryItem = SKILL_ROADMAP_LIBRARY[skillKey];

            if (libraryItem) {
                plans.push({
                    skill: titleCase(rawSkill),
                    priority: libraryItem.priority || (idx === 0 ? 'High' : 'Medium'),
                    reason: libraryItem.reason,
                    days: libraryItem.days,
                    resource: libraryItem.resource,
                    estimatedHours: '10–12 hours'
                });
            } else {
                const prio = idx === 0 ? 'High' : (idx < 3 ? 'Medium' : 'Low');
                const generic = getGenericSkillRoadmap(rawSkill, prio);
                plans.push({
                    skill: generic.skill || titleCase(rawSkill),
                    priority: generic.priority,
                    reason: generic.reason,
                    days: generic.days,
                    resource: generic.resource,
                    estimatedHours: '8–10 hours'
                });
            }
        });

        // If no missing skills, provide a mastery & leadership roadmap
        if (plans.length === 0) {
            plans.push({
                skill: 'System Design & High-Scale Architecture',
                priority: 'High',
                reason: 'Your resume meets all baseline technical requirements. Focus on high-level architecture to excel in senior interview rounds.',
                days: [
                    { day: 'Day 1', topic: 'Scalability Fundamentals', details: 'Vertical vs horizontal scaling, latency vs throughput, CAP theorem, ACID vs BASE.', exercise: 'Analyze bottlenecks in a single-instance monolithic architecture.' },
                    { day: 'Day 2', topic: 'Caching & Database Sharding', details: 'Multi-tier caching, write-through vs write-back, database read replicas, horizontal partitioning.', exercise: 'Design a caching strategy for 100k requests/second user feed.' },
                    { day: 'Day 3', topic: 'Asynchronous Messaging & Queues', details: 'Message brokers (Kafka, RabbitMQ), idempotency, at-least-once delivery, event-driven systems.', exercise: 'Design an asynchronous notification system handling email/SMS bursts.' },
                    { day: 'Day 4', topic: 'Microservices & API Gateways', details: 'Service discovery, circuit breakers, rate limiting, distributed tracing, observability.', exercise: 'Diagram fault-tolerant microservices communications using Circuit Breaker pattern.' },
                    { day: 'Day 5', topic: 'Comprehensive System Design Mock', details: 'Complete a full 45-minute design of TinyURL, Uber backend, or Distributed File Storage.', exercise: 'Practice drawing system architecture diagrams and discussing trade-offs out loud.' }
                ],
                resource: 'System Design Primer (GitHub) & Designing Data-Intensive Applications',
                estimatedHours: '15 hours'
            });
        }

        return plans;
    }

    // ------------------------------------------------------------
    // 3. INTERVIEW READY GENERATOR (Tailored & Connected)
    // ------------------------------------------------------------
    function generateInterviewReady(resumeText = '', jdText = '', strongSkills = [], missingSkills = [], targetRole = 'Software Developer', roleLevel = 'mid') {
        const technicalTopics = [];
        const likelyQuestions = [];
        const projectQuestions = [];
        const resumeQuestions = [];
        const missingSkillQuestions = [];
        const behavioralQuestions = [];

        // 1. Technical Topics to Revise
        const topSkills = strongSkills.slice(0, 4);
        if (topSkills.length > 0) {
            topSkills.forEach(s => {
                const name = titleCase(s);
                technicalTopics.push({
                    topic: `${name} Architecture & Optimization`,
                    focusAreas: [`Deep understanding of ${name} internals and lifecycle`, `State management and concurrency patterns`, `Memory footprint and performance profiling`],
                    importance: 'Directly verified from your resume matches'
                });
            });
        } else {
            technicalTopics.push({
                topic: 'Core Language Fundamentals & Data Structures',
                focusAreas: ['Time and space complexity (Big O)', 'Hash maps, trees, and linked lists in practice', 'Concurrency and memory safety'],
                importance: 'Baseline engineering evaluation'
            });
        }

        // Add System Design / Architecture topic
        technicalTopics.push({
            topic: 'System Design & Scalable Architecture',
            focusAreas: ['Database indexing and query execution plans', 'REST / GraphQL API contract design and backward compatibility', 'Caching layers and failure recovery'],
            importance: roleLevel === 'senior' ? 'Critical for Senior assessment' : 'High differentiator for Mid-level roles'
        });

        // 2. Likely Interview Questions (Target Role specific)
        likelyQuestions.push({
            category: 'Role Competency',
            question: `As a ${targetRole}, how do you ensure high code quality and test coverage when working under aggressive sprint deadlines?`,
            whyAsked: 'Evaluates your engineering discipline, trade-off awareness, and pragmatic approach to technical debt.',
            answerStrategy: 'Explain automated testing, CI pipelines, modular code structure, and communicating risks transparently to stakeholders.',
            outline: '1. Automated test pyramid (unit + integration). 2. Pragmatic prioritization. 3. Documenting trade-offs.'
        });

        likelyQuestions.push({
            category: 'Architecture & Scalability',
            question: 'Can you walk through how you would architect a production system to handle sudden 10x traffic spikes without crashing?',
            whyAsked: 'Tests distributed systems comprehension and practical understanding of bottlenecks.',
            answerStrategy: 'Start from client, traverse CDN, API Gateway, stateless compute tier, asynchronous queues, and database read-replicas/caching.',
            outline: '1. Stateless app tier with horizontal auto-scaling. 2. Redis/CDN caching. 3. Message queues for non-blocking work.'
        });

        // 3. Project-Related Questions (Connecting to candidate resume context)
        const hasReact = /\breact\b/i.test(resumeText);
        const hasPython = /\bpython\b/i.test(resumeText);
        const hasNode = /\bnode(\.js)?\b/i.test(resumeText);
        const hasDb = /\b(sql|postgres|mongodb|mysql)\b/i.test(resumeText);

        if (hasReact) {
            projectQuestions.push({
                category: 'Frontend Engineering',
                question: 'In your frontend projects, what strategies did you use to prevent unnecessary component re-renders and reduce bundle size?',
                whyAsked: 'Assesses whether you build production-ready frontends or only basic prototypes.',
                answerStrategy: 'Discuss React.memo, useMemo, useCallback trade-offs, code splitting with dynamic imports, and bundle analysis.',
                outline: '1. Profiling with React DevTools. 2. Code splitting at route level. 3. Proper state colocation.'
            });
        }

        if (hasNode || hasPython) {
            const stack = hasNode ? 'Node.js' : 'Python';
            projectQuestions.push({
                category: 'Backend Robustness',
                question: `In your ${stack} services, how do you handle asynchronous error propagation, unhandled rejections, and structured logging?`,
                whyAsked: 'Recruiters and engineers want to know if you build resilient services that can be easily debugged in production.',
                answerStrategy: 'Mention centralized error middleware, structured JSON logs with correlation IDs, and proper health checks.',
                outline: '1. Central error middleware. 2. Request correlation IDs. 3. Graceful shutdown on SIGTERM.'
            });
        }

        if (hasDb) {
            projectQuestions.push({
                category: 'Database & Data Access',
                question: 'Describe an instance where a database query or schema structure caused latency, and how you diagnosed and resolved it.',
                whyAsked: 'Tests practical database debugging ability beyond basic ORM usage.',
                answerStrategy: 'Walk through using EXPLAIN ANALYZE, adding composite indexes, avoiding N+1 queries, or introducing caching.',
                outline: '1. Identification via slow query logs. 2. Query execution plan inspection. 3. Indexing or caching solution.'
            });
        }

        if (projectQuestions.length === 0) {
            projectQuestions.push({
                category: 'Engineering Projects',
                question: 'Pick the most technically complex feature listed on your resume. What was the hardest architectural constraint you solved?',
                whyAsked: 'Allows you to demonstrate technical depth, ownership, and engineering maturity on your own terms.',
                answerStrategy: 'Frame the response around business constraints, initial challenges, the technical decision made, and measurable impact.',
                outline: '1. Context & technical constraint. 2. Options considered. 3. Why the chosen solution worked.'
            });
        }

        // 4. Resume-Based Questions (Specific to experience)
        resumeQuestions.push({
            category: 'Resume Ownership',
            question: 'Looking at your most recent role on your resume, what was your specific technical ownership versus team contributions?',
            whyAsked: 'Verifies that bullet points represent your authentic hands-on contributions rather than passive team achievements.',
            answerStrategy: 'Be honest and precise. Highlight what you personally designed, coded, tested, and shipped.',
            outline: '1. Personal deliverable. 2. How you collaborated with team. 3. Production outcome.'
        });

        resumeQuestions.push({
            category: 'Technical Evolution',
            question: 'How has your approach to software architecture and testing changed compared to when you started your career?',
            whyAsked: 'Gauges self-awareness, technical growth, and learning trajectory.',
            answerStrategy: 'Reflect on learning the value of readability over cleverness, automated testing, and maintainability.',
            outline: '1. Early mindset (make it work). 2. Current mindset (make it maintainable, observable, and testable).'
        });

        // 5. Missing-Skill Questions (Adaptability & Learning Velocity)
        if (missingSkills.length > 0) {
            const topMissing = titleCase(missingSkills[0]);
            missingSkillQuestions.push({
                category: 'Skill Ramp-up & Adaptability',
                question: `The job description emphasizes ${topMissing}, which is not prominent on your resume. How would you ramp up quickly and contribute within your first 30 days?`,
                whyAsked: 'Hiring managers rarely find 100% matches. They look for candidates with strong foundational velocity who can pick up tools rapidly.',
                answerStrategy: 'Highlight your underlying engineering fundamentals, previous instances of ramping up on unfamiliar stacks, and your structured 5-day learning discipline.',
                outline: `1. Relate ${topMissing} to similar concepts you already master. 2. Share past quick-learning success. 3. Proactive 30-day ramp plan.`
            });

            if (missingSkills.length > 1) {
                const secondMissing = titleCase(missingSkills[1]);
                missingSkillQuestions.push({
                    category: 'Technology Evaluation',
                    question: `Why do you think this role utilizes ${secondMissing}? What are its key strengths compared to alternative technologies?`,
                    whyAsked: 'Tests if you understand the business and technical rationale behind the company stack.',
                    answerStrategy: 'Acknowledge why companies adopt this technology (ecosystem, performance, type-safety, concurrency) even if you are newly learning it.',
                    outline: '1. Industry strengths of the tool. 2. Why it fits this role. 3. Excitement to leverage it.'
                });
            }
        } else {
            missingSkillQuestions.push({
                category: 'Broad Technical Horizon',
                question: 'What is an emerging technology or architectural pattern outside your current day-to-day stack that you have recently researched?',
                whyAsked: 'Checks whether you stay curious and continuously learn without waiting for workplace assignments.',
                answerStrategy: 'Discuss an interesting tool, library, or paradigm (e.g. Rust, WebAssembly, Vector Databases, Event-Driven Architecture) and what problem it solves.',
                outline: '1. The technology. 2. What problem it solves. 3. Where you see its practical value.'
            });
        }

        // 6. Behavioral Questions (STAR format: Situation, Task, Action, Result)
        behavioralQuestions.push({
            category: 'Conflict Resolution (STAR)',
            question: 'Tell me about a time you had a technical disagreement with a team member or lead regarding code structure or library choice.',
            whyAsked: 'Evaluates humility, communication, objective decision-making, and absence of ego.',
            answerStrategy: 'Use STAR. Describe an objective debate, how you gathered data or created a quick benchmark, and prioritized team consensus.',
            outline: 'S: The project & disagreement. T: Need to reach decision. A: Ran benchmark / focused on customer impact. R: Unified team path.'
        });

        behavioralQuestions.push({
            category: 'Handling Setbacks (STAR)',
            question: 'Describe a production bug or unexpected outage caused by code you deployed. How did you handle the situation?',
            whyAsked: 'Assesses accountability, composure under pressure, and post-mortem mindset.',
            answerStrategy: 'Own the issue without shifting blame. Focus on fast rollback/mitigation first, then root cause analysis, then permanent prevention.',
            outline: 'S: Outage context. T: Immediate stabilization. A: Rollback + root-cause fix. R: Added automated regression test & blameless post-mortem.'
        });

        return {
            technicalTopics,
            likelyQuestions,
            projectQuestions,
            resumeQuestions,
            missingSkillQuestions,
            behavioralQuestions,
            totalQuestions: likelyQuestions.length + projectQuestions.length + resumeQuestions.length + missingSkillQuestions.length + behavioralQuestions.length
        };
    }

    // ------------------------------------------------------------
    // 4. EXPLAINABLE MATCHING ("Why this score?")
    // ------------------------------------------------------------
    function generateExplainableBreakdown(matchResult = {}, resumeText = '', jdText = '') {
        const categories = [];

        // 1. Skills Dimension
        const matchedSkills = matchResult.strongMatches || [];
        const partialSkills = matchResult.partialMatches || [];
        const missingSkills = matchResult.missingSkills || [];
        const totalSkills = matchedSkills.length + partialSkills.length + missingSkills.length || 1;
        const skillScore = matchResult.breakdown?.skills?.points ?? Math.round((matchedSkills.length / totalSkills) * 40);

        categories.push({
            name: 'Hard & Technical Skills',
            points: skillScore,
            maxPoints: 40,
            status: skillScore >= 30 ? 'Strong Alignment' : (skillScore >= 20 ? 'Moderate Fit' : 'Requires Bridge'),
            statusClass: skillScore >= 30 ? 'matched' : (skillScore >= 20 ? 'partial' : 'missing'),
            explanation: `The target role specifies ${totalSkills} core technologies. Your resume directly demonstrates ${matchedSkills.length} exact skills, shows related proficiency in ${partialSkills.length} skills, and has gaps in ${missingSkills.length} skills.`,
            matched: matchedSkills.map(s => ({
                item: titleCase(s),
                reason: 'Explicitly found in your resume text with direct keyword and contextual alignment.'
            })),
            partiallyMatched: partialSkills.map(s => ({
                item: titleCase(s),
                reason: 'Related ecosystem proficiency demonstrated (e.g. complementary framework, runtime, or sibling tool).'
            })),
            missing: missingSkills.map(s => ({
                item: titleCase(s),
                reason: 'Explicitly requested in the job description but not detected in your resume text.'
            }))
        });

        // 2. Experience & Seniority Dimension
        const expScore = matchResult.breakdown?.experience?.points ?? 14;
        const targetRole = matchResult.targetRole || 'Software Engineer';
        const roleLevel = matchResult.roleLevel || 'mid';

        categories.push({
            name: 'Experience & Seniority',
            points: expScore,
            maxPoints: 20,
            status: expScore >= 16 ? 'Seniority Aligned' : (expScore >= 12 ? 'Applicable Match' : 'Experience Stretch'),
            statusClass: expScore >= 16 ? 'matched' : (expScore >= 12 ? 'partial' : 'missing'),
            explanation: `The position targets a ${roleLevel}-level ${targetRole}. Your career timeline and project scopes demonstrate relevant hands-on engineering tenure.`,
            matched: [
                { item: `${titleCase(roleLevel)} Role Scope`, reason: `Experience phrasing and project responsibilities align with expectations for ${roleLevel} contributors.` }
            ],
            partiallyMatched: expScore < 18 ? [
                { item: 'Leadership / Mentoring Signals', reason: 'Role description welcomes team leadership or mentoring, which could be more prominently quantified.' }
            ] : [],
            missing: expScore < 12 ? [
                { item: 'Direct Years of Experience Requirement', reason: 'Job description specifies higher years of experience than explicitly detected in dated roles.' }
            ] : []
        });

        // 3. Domain & Architecture Relevance
        const domainScore = matchResult.breakdown?.domain?.points ?? 11;
        categories.push({
            name: 'Domain & Architectural Fit',
            points: domainScore,
            maxPoints: 15,
            status: domainScore >= 12 ? 'High Relevance' : (domainScore >= 9 ? 'General Alignment' : 'Domain Gap'),
            statusClass: domainScore >= 12 ? 'matched' : (domainScore >= 9 ? 'partial' : 'missing'),
            explanation: 'Evaluates architectural patterns (APIs, distributed systems, state management, databases, cloud services) shared between your resume and the target JD.',
            matched: [
                { item: 'Modern Web & API Architecture', reason: 'Demonstrated experience constructing web services, clients, and data pipelines.' }
            ],
            partiallyMatched: domainScore < 14 ? [
                { item: 'Specialized Domain Terminology', reason: 'Target job references specific domain workflows that are only partially reflected in resume project descriptions.' }
            ] : [],
            missing: domainScore < 8 ? [
                { item: 'Core Industry Domain Experience', reason: 'Job specifies niche industry background (e.g. Fintech, Healthcare, Security) not explicitly highlighted.' }
            ] : []
        });

        // 4. Soft Skills & Communication
        const softScore = matchResult.breakdown?.softSkills?.points ?? 12;
        categories.push({
            name: 'Soft Skills & Ownership',
            points: softScore,
            maxPoints: 15,
            status: softScore >= 12 ? 'Demonstrated' : (softScore >= 8 ? 'Basic Coverage' : 'Needs Quantification'),
            statusClass: softScore >= 12 ? 'matched' : (softScore >= 8 ? 'partial' : 'missing'),
            explanation: 'Scans for ownership signals, cross-functional collaboration, Agile participation, problem-solving, and communication verbs.',
            matched: [
                { item: 'Collaboration & Ownership', reason: 'Bullet points show teamwork, cross-functional delivery, and proactive contribution.' }
            ],
            partiallyMatched: softScore < 13 ? [
                { item: 'Stakeholder Communication', reason: 'Phrasing can be upgraded to highlight presenting to clients, product managers, or cross-team partners.' }
            ] : [],
            missing: softScore < 7 ? [
                { item: 'Documented Initiative & Problem-Solving', reason: 'Bullets primarily list assigned tasks rather than personal initiatives or customer problem resolution.' }
            ] : []
        });

        // 5. ATS & Document Formatting
        const atsScore = matchResult.breakdown?.ats?.points ?? 8;
        const atsRisks = matchResult.atsAnalysis?.formatRisks || [];
        categories.push({
            name: 'ATS Formatting & Cleanliness',
            points: atsScore,
            maxPoints: 10,
            status: atsRisks.length === 0 ? 'Optimal ATS Format' : (atsRisks.length <= 1 ? 'Minor ATS Warnings' : 'ATS Risks Detected'),
            statusClass: atsRisks.length === 0 ? 'matched' : (atsRisks.length <= 1 ? 'partial' : 'missing'),
            explanation: 'Evaluates machine-readability: clear standard headings, parseable text, absence of complex tables, appropriate character volume, and contact detection.',
            matched: [
                { item: 'Standard Section Hierarchy', reason: 'Resume contains parseable headers and clear chronological work experience.' }
            ],
            partiallyMatched: atsRisks.map(r => ({
                item: r,
                reason: 'May cause parsing discrepancies or dropped fields in older legacy corporate ATS systems.'
            })),
            missing: atsScore < 6 ? [
                { item: 'Text-Selectable Standard Layout', reason: 'High likelihood of parsing degradation due to layout complexity or text brevity.' }
            ] : []
        });

        return {
            categories,
            compositeScore: matchResult.score || 0,
            verdict: matchResult.verdict || 'Compatibility Assessed',
            verdictDisclaimer: 'This score is a transparent, deterministic compatibility estimate based on text parsing. It is designed to guide resume optimization, not to predict hiring outcomes.'
        };
    }

    // ------------------------------------------------------------
    // 5. MASTER CAREER ALIGNMENT ENGINE REPORT (10 Dimensions)
    // ------------------------------------------------------------
    function generateCareerAlignmentReport(resumeText = '', jdText = '', matchResult = {}) {
        if (!resumeText || !jdText) {
            return null;
        }

        const score = matchResult.score || 0;
        const strongMatches = matchResult.strongMatches || [];
        const missingSkills = matchResult.missingSkills || [];
        const partialMatches = matchResult.partialMatches || [];
        const targetRole = matchResult.targetRole || 'Software Engineer';
        const roleLevel = matchResult.roleLevel || 'mid';

        // 1. Overall Job Alignment
        let alignmentVerdict = 'Strong Alignment';
        let alignmentSummary = 'Your resume aligns closely with the core requirements of this role. Minor tailoring will make your application stand out.';
        let alignmentClass = 'high';

        if (score < 50) {
            alignmentVerdict = 'Significant Bridge Needed';
            alignmentSummary = 'Your resume shows foundational skills, but is missing critical technologies explicitly emphasized in this job description.';
            alignmentClass = 'low';
        } else if (score < 72) {
            alignmentVerdict = 'Moderate Alignment';
            alignmentSummary = 'You meet several key requirements, but bridging priority skill gaps and tailoring bullet points will substantially increase competitiveness.';
            alignmentClass = 'mid';
        }

        // 2. Required Skills Found & 3. Required Skills Missing & 4. Preferred Skills Found
        const jdReqs = matchResult.jdRequirements || { mustHave: [], preferred: [], qualifications: [], responsibilities: [] };
        
        // Map detected skills against Must-Have vs Preferred
        const mustHaveFound = [];
        const mustHaveMissing = [];
        const preferredFound = [];
        const preferredMissing = [];

        strongMatches.forEach(skill => {
            const isPref = jdReqs.preferred.some(p => p.toLowerCase().includes(skill.toLowerCase()));
            if (isPref) preferredFound.push(titleCase(skill));
            else mustHaveFound.push(titleCase(skill));
        });

        missingSkills.forEach(skill => {
            const isPref = jdReqs.preferred.some(p => p.toLowerCase().includes(skill.toLowerCase()));
            if (isPref) preferredMissing.push(titleCase(skill));
            else mustHaveMissing.push(titleCase(skill));
        });

        // 5. Experience / Qualification Alignment
        const expAlignment = {
            targetRole,
            roleLevel: titleCase(roleLevel),
            status: score >= 65 ? 'Qualified Match' : 'Stretch Candidate',
            notes: score >= 65
                ? 'Your project complexity and stack breadth match expectations for this role seniority.'
                : 'Role expectations require deeper hands-on demonstration of specialized architectural patterns.'
        };

        // 6. ATS Risks
        const atsRisks = matchResult.atsAnalysis?.formatRisks || [];
        if (resumeText.length < 400 && !atsRisks.includes('Resume text is very short')) {
            atsRisks.push('Resume text is very short — add detailed project bullets');
        }

        // 7. Resume Improvement Opportunities
        const improvementOpportunities = [];
        if (matchResult.breakdown?.skills?.points < 30) {
            improvementOpportunities.push({
                area: 'Skill Highlighting',
                recommendation: 'Incorporate missing technologies you have worked with into your Skills and Project descriptions.'
            });
        }
        if (resumeText.split('\n').filter(l => l.trim().startsWith('-') || l.trim().startsWith('•')).length < 5) {
            improvementOpportunities.push({
                area: 'Bullet Point Density',
                recommendation: 'Format experience into distinct bullet points starting with strong action verbs (e.g. Architected, Optimized, Shipped).'
            });
        }
        improvementOpportunities.push({
            area: 'Quantified Impact',
            recommendation: 'Ensure your existing achievements mention truthful metrics (e.g. latency reduced, users served, PRs reviewed) without inventing numbers.'
        });

        // 8. Priority Skill Gaps
        const priorityGaps = missingSkills.slice(0, 4).map((s, idx) => {
            const isMust = mustHaveMissing.includes(titleCase(s));
            return {
                skill: titleCase(s),
                priority: isMust || idx === 0 ? 'High' : (idx < 2 ? 'Medium' : 'Low'),
                reason: isMust ? 'Explicit must-have requirement in target role' : 'Valued technical competence for stack versatility'
            };
        });

        // 9. Personalized Action Plan (Day-by-Day Roadmaps)
        const actionPlan = generateSkillActionPlan(missingSkills, targetRole, roleLevel);

        // 10. Interview Preparation Areas ("Interview Ready")
        const interviewReady = generateInterviewReady(resumeText, jdText, strongMatches, missingSkills, targetRole, roleLevel);

        // Explainable "Why this score?"
        const explainability = generateExplainableBreakdown(matchResult, resumeText, jdText);

        return {
            overallAlignment: {
                score,
                verdict: alignmentVerdict,
                summary: alignmentSummary,
                classType: alignmentClass
            },
            skillsFound: {
                mustHave: mustHaveFound,
                preferred: preferredFound,
                totalFound: strongMatches.length
            },
            skillsMissing: {
                mustHave: mustHaveMissing,
                preferred: preferredMissing,
                totalMissing: missingSkills.length
            },
            partialMatches: partialMatches.map(titleCase),
            experienceAlignment: expAlignment,
            atsRisks,
            improvementOpportunities,
            priorityGaps,
            actionPlan,
            interviewReady,
            explainability,
            generatedAt: new Date().toISOString()
        };
    }

    // ------------------------------------------------------------
    // 6. EXPORT / PUBLIC API
    // ------------------------------------------------------------
    function titleCase(str) {
        return (str || '').replace(/\b\w/g, l => l.toUpperCase());
    }

    return {
        generateSkillActionPlan,
        generateInterviewReady,
        generateExplainableBreakdown,
        generateCareerAlignmentReport,
        SKILL_ROADMAP_LIBRARY,
        titleCase
    };
}));
