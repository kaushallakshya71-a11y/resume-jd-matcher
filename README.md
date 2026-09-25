# 🎯 HireLens — Align your skills. Match your career.

> **AI-Powered Career Alignment & Job-Readiness Platform**  
> *100% Client-Side, Privacy-First Architecture with Explainable Matching, Skill Gap Roadmaps, Fact-Preserving Resume Optimization, and Tailored Interview Prep.*

---

## 🚀 Live Demo & Local Development
* **Local Web Server**: `http://localhost:4173/` (or run `npm run dev`)
* **Test Suite**: `npm test` (**52 / 52 Automated Tests Passing — 100%**)
* **Production Build**: 100% Pure Vanilla Web Stack (HTML5, Vanilla CSS Design System, Modular ES6 JavaScript, IndexedDB v2)

---

## 💡 The Problem & The HireLens Solution

### The Job Seeker's Dilemma
> *"Job seekers often know their skills, but don't know how closely their resume matches a specific target job or what they should improve next."*

Most commercial tools fail job seekers in three major ways:
1. **Black-Box Mystery Scores**: They return an arbitrary number (e.g. *"64%"*) with zero explanation of *why* or how the recruiter/ATS will actually evaluate the candidate.
2. **Hallucinated "AI" Lies**: Generative AI tools invent metrics, percentages, revenue figures, and dates that applicants never achieved, putting candidates at risk of fraud in background checks.
3. **Data Exploitation**: Resumes containing personal phone numbers, addresses, and employment history are uploaded to remote cloud servers and corporate AI models without transparency.

### The HireLens Solution
HireLens transforms this broken experience into a unified, transparent career journey:
$$\text{Resume} \longrightarrow \text{Target Job} \longrightarrow \text{Career Fit Analysis} \longrightarrow \text{Skill Gap Detection} \longrightarrow \text{Personalized Action Plan} \longrightarrow \text{Resume Optimization} \longrightarrow \text{Interview Preparation} \longrightarrow \text{Application Tracking}$$

---

## 🔒 100% Client-Side Privacy Guarantee

```
┌────────────────────────────────────────────────────────────────────────┐
│                        HIRELENS PRIVACY MANIFESTO                      │
├────────────────────────────────────────────────────────────────────────┤
│  • Your resume stays on your device. Always.                           │
│  • Zero remote AI API calls (no OpenAI, Gemini, or third-party keys).   │
│  • Zero cloud telemetry or tracking scripts.                           │
│  • In-browser PDF extraction via PDF.js.                               │
│  • All data persisted locally in browser IndexedDB v2 & LocalStorage.  │
│  • Single-click JSON backup export, schema validation, and wipe.       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Core Product Features

### 1. 🎯 Career Alignment Engine (10-Point Report)
Generates an understandable, explainable career alignment assessment:
1. **Overall Job Alignment**: Transparent composite fit with honest non-commercial framing.
2. **Required Skills Found**: Must-have proficiencies detected with textual context.
3. **Required Skills Missing**: Explicit job requirements not found on the resume.
4. **Preferred Skills Found**: Value-add proficiencies that differentiate the applicant.
5. **Experience & Qualification Alignment**: Seniority, years of experience, and role alignment.
6. **ATS Formatting Risks**: Machine readability audit (tables, character volume, contact info).
7. **Resume Improvement Opportunities**: Bullet point density, action verb strength, and unquantified accomplishments.
8. **Priority Skill Gaps**: Missing skills ranked by urgency (`High`, `Medium`, `Low`) with reasons.
9. **Personalized Action Plan**: Practical 5-day learning roadmaps with hands-on exercises.
10. **Interview Preparation Areas**: Role-specific technical, resume-based, and behavioral questions.

### 2. 💡 Explainable Matching ("Why this score?")
Eliminates opaque scoring by categorizing findings into:
* **✓ Matched** (with exact detection context)
* **~ Partially Matched** (with related technology explanation)
* **✗ Missing** (with target job requirement citation)
Across five dimensions: *Technical Skills (40 pts)*, *Experience Alignment (20 pts)*, *Domain Fit (15 pts)*, *Soft Skills & Ownership (15 pts)*, and *ATS Cleanliness (10 pts)*.

### 3. 📅 Skill Gap $\longrightarrow$ Action Plan
Converts missing requirements into structured, realistic 5-day roadmaps:
* **Day 1**: Tooling, environment setup, and fundamental concepts.
* **Day 2**: Core syntax and patterns.
* **Day 3**: Integration with existing stack (React, Node.js, Python, Databases).
* **Day 4**: Error handling, edge cases, and automated testing.
* **Day 5**: Mini-project build and public GitHub portfolio verification.
Includes estimated study hours and verified, free documentation resources.

### 4. 🎤 "Interview Ready" System
Connects the candidate's actual resume, detected gaps, and the target role into 6 tailored question sets:
* **Core Technical Topics to Revise**: Deep architecture, concurrency, and lifecycle concepts.
* **Likely Questions**: High-probability questions for the target job title.
* **Project-Related Questions**: Probing questions on candidate's actual projects.
* **Resume-Based Questions**: Questions on listed work history, ownership, and metrics.
* **Missing-Skill Questions**: Adaptability questions on ramping up on unlisted technologies.
* **Behavioral Questions**: Scenarios evaluated using the **STAR** method (Situation, Task, Action, Result).
* Each question includes: *Why the interviewer asks this*, *Recommended Answer Strategy*, and *Structured Answer Outline*.

### 5. ✍️ Fact-Preserving Resume Studio
Empowers job seekers to optimize their resumes without inventing falsehoods:
* **Bullet Point Improver**: Audits bullets using the **Action + Tech + Task + Result** framework.
* **Rule-Based Grammar**: Real-time spellchecking, passive voice conversion, and weak starter replacements.
* **AI Writing Signal Detector**: Audits robotic cliches and buzzword density with honest probabilistic disclosures.
* **Strict Fact-Preserving Humanizer**: 5 natural tone modes (`Simple`, `Professional`, `Natural`, `Concise`, `Impact-Focused`). The `containsInventedNumbers()` mathematical guardrail **automatically blocks rewrites that invent metrics, percentages, dollar values, companies, or dates**.
* **Live Re-analysis & Delta Matrix**: Side-by-side Before/After comparison matrix showing exact score and skill improvements.

### 6. 💼 Local Applications Pipeline & Version Management
* **Kanban-Style Job Tracker**: Manage applications across `Saved` $\to$ `Applied` $\to$ `Screening` $\to$ `Online Assessment` $\to$ `Interview` $\to$ `Offer` / `Rejected`.
* **Tailored Resume Versions**: Save, clone, and switch between role-specific variants (e.g. *Full Stack*, *Backend Core*, *Fintech Engineer*).

---

## 🧭 Dashboard: "Where am I in my job search?"

The redesigned dashboard provides an immediate, 7-indicator status board:
1. **Active Resume**: Loaded file, character count, and instant text viewer.
2. **Target Role**: Target role title and company name.
3. **Alignment Status**: Real-time match score and verdict badge.
4. **Top Skill Gap**: Highest-priority missing technology with roadmap link.
5. **Resume Health**: Quality score out of 100 based on grammar and structure.
6. **Interview Readiness**: Status of generated questions and practice topics.
7. **Next Best Action**: Guided recommendation button directing the user to the highest-leverage next step.

---

## 🎬 3–5 Minute Hackathon Demo Script

```
[0:00 - 0:45] THE HOOK & ELEVATOR PITCH
"Judges, every developer has applied to 50 jobs with their resume and heard nothing back. 
Why? Because candidates don't know how their skills align with the JD, and commercial tools 
either steal your data or invent fake metrics that get you caught in background checks. 
Meet HireLens: the 100% client-side, explainable career alignment platform."

[0:45 - 1:30] INSTANT ALIGNMENT & EXPLAINABILITY
1. Open HireLens on http://localhost:4173/.
2. Click "Load Sample Resume" (Step 1) -> 3-year full stack developer profile loads instantly.
3. Click "Next: Target Job" (Step 2) -> Click "Load Sample JD" (Senior Full Stack Developer at TechCorp).
4. Click "Next: Run Analysis" (Step 3).
5. Highlight the 10-Point Career Alignment Report: 72% fit. Click "Why this score?" to show the transparent breakdown across Skills, Experience, and ATS.

[1:30 - 2:30] SKILL GAP ROADMAP & FACT-PRESERVING STUDIO
1. Show the "Skill Gap Roadmap" tab: TypeScript is missing. Show the practical 5-day step-by-step learning plan with exercises.
2. Jump to "Resume Studio" -> select a bullet point.
3. Demonstrate the Fact Preservation rule: The engine strengthens action verbs and clarity, but NEVER hallucinates fake revenue or statistics.

[2:30 - 3:15] INTERVIEW READY & PIPELINE
1. Click "Interview Ready" tab: Point out the 6 tailored categories.
2. Show the "Missing Skill" question: 'How would you ramp up on TypeScript in 30 days?' with strategic answer outlines.
3. Click "Save to Applications" -> Show the local Kanban pipeline in IndexedDB.

[3:15 - 3:30] CONCLUSION & PRIVACY CLOSE
"Zero servers, zero API costs, zero data leaks, and 52 passing automated tests. 
HireLens: Align your skills. Match your career."
```

---

## 🧪 Automated Testing & Verification

All 20 test suites execute natively in Node.js via `npm test`:

```bash
$ npm test

========================================
TEST RESULTS SUMMARY
========================================
Total:  52
Passed: 52
Failed: 0
🎉 ALL TESTS PASSED!
```

### Test Suite Coverage:
* **Suite 1**: Skill Extraction & Canonicalization (700+ skills)
* **Suite 2**: Alias Matching Layer (`JS` $\to$ `JavaScript`, `Postgres` $\to$ `PostgreSQL`)
* **Suite 3**: Critical False-Positive Guardrails (`C` vs `C++`/`C#`, `Java` vs `JS`, `Go` vs `Google`, `AWS` vs `Azure`, `React` vs `React Native`)
* **Suite 4**: Scoring Engine & Proximity Matches
* **Suite 5**: ATS Analyzer & Length Auditing
* **Suite 6**: Career Risk Signals Engine
* **Suite 7**: LocalDB Backup Schema & Sanitization
* **Suite 8**: Transparent 5-Dimension Score Explainability
* **Suite 9**: 4-Tier JD Classification
* **Suite 10**: Grammar & Weak Bullet Starter Replacer
* **Suite 11**: AI Writing Signals Engine
* **Suite 12**: Humanizer & Strict Fact Preservation (`containsInventedNumbers()`)
* **Suite 13**: Section Detection & Action+Tech+Task+Result Auditing
* **Suite 14**: Storage V2 Schema, Versions & Applications
* **Suite 15**: Quality Comparison Matrix & Metric Deltas
* **Suite 16**: Product Information Architecture & Bilingual i18n
* **Suite 17**: Career Alignment Engine & 10-Point Synthesis
* **Suite 18**: Skill Gap $\longrightarrow$ Action Plan 5-Day Roadmaps
* **Suite 19**: Interview Ready Tailored Question Generator
* **Suite 20**: Explainable Matching "Why this score?" Breakdown

---

## 🛠️ Technology Stack & Architecture

* **Core**: Semantic HTML5, Vanilla ES6 JavaScript (zero heavy framework overhead).
* **Styling**: Vanilla CSS3 Custom Properties (Dark Charcoal & Crisp Light modes, full responsive grid, mobile bottom navigation bar).
* **In-Browser PDF Parsing**: PDF.js (Mozilla).
* **Local Persistence**: IndexedDB v2 & LocalStorage with JSON backup schema.
* **Internationalization**: Dual-language engine (`i18n.js`) with English and natural Hindi.
* **Testing Runner**: Node.js assert test framework.
* **Mobile Ready**: Capacitor configuration included for iOS/Android native compilation.

---

## 📄 License
MIT License. Built for job seekers, career switchers, and engineers everywhere.
