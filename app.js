// ============================================================
// app.js — Main Entry Point v3 (all 9 modules integrated)
// ============================================================

(function () {
    let state = { resumeText: '', jdText: '', result: null };

    document.addEventListener('DOMContentLoaded', () => {
        initThemeToggle();
        I18N.applyTranslations();
        bindEvents();
        initSampleData();
        initNavScroll();
        initTabs();
        VideoResume.init();
        Feedback.init();
        initCustomizePanel();
        initLangToggle();
        initCareerRisk();
    });

    // ---- Bind Events ----
    function bindEvents() {
        document.getElementById('analyze-btn').addEventListener('click', runAnalysis);
        document.getElementById('clear-btn').addEventListener('click', clearAll);
        document.getElementById('load-sample-btn').addEventListener('click', loadSampleData);
        document.getElementById('download-btn')?.addEventListener('click', () => {
            if (state.result) DownloadReport.generate(state.result);
            else showToast('Please run analysis first!', 'error');
        });

        const resumeTA = document.getElementById('resume-input');
        resumeTA.addEventListener('input', () => {
            state.resumeText = resumeTA.value;
            UI.updateCharCount('resume-input', 'resume-char-count');
            updateInputStatus('resume-status', resumeTA.value);
        });

        const jdTA = document.getElementById('jd-input');
        jdTA.addEventListener('input', () => {
            state.jdText = jdTA.value;
            UI.updateCharCount('jd-input', 'jd-char-count');
            updateInputStatus('jd-status', jdTA.value);
        });

        document.getElementById('resume-file').addEventListener('change', e => handleFileUpload(e, 'resume-input', 'resume-char-count', 'resume-status'));
        document.getElementById('jd-file').addEventListener('change', e => handleFileUpload(e, 'jd-input', 'jd-char-count', 'jd-status'));

        setupDragDrop('resume-drop', 'resume-input', 'resume-char-count', 'resume-status');
        setupDragDrop('jd-drop', 'jd-input', 'jd-char-count', 'jd-status');
    }

    // ---- AI Customization Panel ----
    function initCustomizePanel() {
        const toggle = document.getElementById('customize-toggle');
        const panel = document.getElementById('customize-panel');
        const chevron = toggle ? toggle.querySelector('.chevron-toggle') : null;
        if (toggle && panel) {
            toggle.addEventListener('click', () => {
                const isOpen = panel.classList.toggle('open');
                if (chevron) chevron.classList.toggle('open', isOpen);
            });
        }
    }

    function getCustomizeOptions() {
        // Role level from radio buttons
        const roleLevelEl = document.querySelector('input[name="role-level"]:checked');
        const roleLevel = roleLevelEl ? roleLevelEl.value : 'mid';

        const industry = document.getElementById('industry-select')?.value || 'tech';
        const priorityRaw = document.getElementById('priority-skills-input')?.value || '';
        const prioritySkills = priorityRaw.split(',').map(s => s.trim()).filter(Boolean);
        const targetRole = document.getElementById('target-role-input')?.value.trim() || '';
        const targetCompany = document.getElementById('target-company-input')?.value.trim() || '';

        return { roleLevel, industry, prioritySkills, targetRole, targetCompany };
    }

    // ---- Theme Toggle (Light/Dark Mode) ----
    function initThemeToggle() {
        const btn = document.getElementById('theme-toggle-btn');
        if (!btn) return;
        
        // Check local storage or system preference
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        const currentTheme = savedTheme || (systemPrefersLight ? 'light' : 'dark');

        if (currentTheme === 'light') {
            document.documentElement.classList.add('light-mode');
            btn.textContent = '☀️';
        } else {
            document.documentElement.classList.remove('light-mode');
            btn.textContent = '🌙';
        }

        btn.addEventListener('click', () => {
            const isLight = document.documentElement.classList.toggle('light-mode');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            btn.textContent = isLight ? '☀️' : '🌙';
            showToast(`${isLight ? 'Light' : 'Dark'} mode activated!`, 'success');
        });
    }

    // ---- Language Toggle ----
    function initLangToggle() {
        const btn = document.getElementById('lang-toggle-btn');
        if (btn) btn.addEventListener('click', () => { I18N.toggleLang(); });
    }

    // ---- Core Analysis ----
    function runAnalysis() {
        state.resumeText = document.getElementById('resume-input').value.trim();
        state.jdText = document.getElementById('jd-input').value.trim();

        if (state.resumeText.length < 50) {
            showToast('Please enter your resume text (at least 50 characters).');
            document.getElementById('resume-input').focus();
            return;
        }
        if (state.jdText.length < 30) {
            showToast('Please enter the job description.');
            document.getElementById('jd-input').focus();
            return;
        }

        UI.showLoading();
        setTimeout(() => {
            try {
                const options = getCustomizeOptions();
                state.result = ResumeAnalyzer.analyzeMatch(state.resumeText, state.jdText, options);
                UI.renderResults(state.result);
                renderTldr(state.result);
                Feedback.reset();
                showToast('Analysis complete! 🎉', 'success');
            } catch (err) {
                console.error('Analysis error:', err);
                showToast('An error occurred. Please try again.', 'error');
            } finally {
                UI.hideLoading();
            }
        }, 900);
    }

    // ---- Clear ----
    function clearAll() {
        document.getElementById('resume-input').value = '';
        document.getElementById('jd-input').value = '';
        document.getElementById('resume-char-count').textContent = '0 characters';
        document.getElementById('jd-char-count').textContent = '0 characters';
        state = { resumeText: '', jdText: '', result: null };
        document.getElementById('results-section').classList.add('hidden');
        document.querySelectorAll('.input-status').forEach(s => { s.textContent = ''; s.className = 'input-status'; });
        showToast('Cleared! Ready for new input.', 'success');
    }

    // ---- File Upload ----
    function handleFileUpload(event, textareaId, countId, statusId) {
        const file = event.target.files[0];
        if (!file) return;
        const ta = document.getElementById(textareaId);
        if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
            const reader = new FileReader();
            reader.onload = e => {
                ta.value = e.target.result;
                UI.updateCharCount(textareaId, countId);
                updateInputStatus(statusId, ta.value);
                showToast('File loaded! ✅', 'success');
            };
            reader.readAsText(file);
        } else if (file.name.endsWith('.pdf')) {
            extractPdfText(file, text => {
                ta.value = text;
                UI.updateCharCount(textareaId, countId);
                updateInputStatus(statusId, ta.value);
                showToast('PDF extracted! ✅', 'success');
            });
        } else {
            showToast('Please upload a .txt or .pdf file.', 'error');
        }
    }

    function extractPdfText(file, callback) {
        const reader = new FileReader();
        reader.onload = async e => {
            try {
                const pdfjsLib = window['pdfjs-dist/build/pdf'];
                if (!pdfjsLib) { showToast('PDF.js not loaded. Paste text directly.', 'error'); return; }
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                const pdf = await pdfjsLib.getDocument(new Uint8Array(e.target.result)).promise;
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    fullText += content.items.map(item => item.str).join(' ') + '\n';
                }
                callback(fullText);
            } catch { showToast('Could not parse PDF. Paste text directly.', 'error'); }
        };
        reader.readAsArrayBuffer(file);
    }

    // ---- Drag & Drop ----
    function setupDragDrop(dropZoneId, textareaId, countId, statusId) {
        const zone = document.getElementById(dropZoneId);
        if (!zone) return;
        zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
        zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
        zone.addEventListener('drop', e => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file) handleFileUpload({ target: { files: [file] } }, textareaId, countId, statusId);
        });
    }

    // ---- Status Labels ----
    function updateInputStatus(statusId, text) {
        const el = document.getElementById(statusId);
        if (!el) return;
        if (text.length === 0) { el.textContent = ''; el.className = 'input-status'; return; }
        if (text.length < 100) { el.textContent = '⚠️ Too short'; el.className = 'input-status warn'; }
        else { el.textContent = '✅ Ready'; el.className = 'input-status ok'; }
    }

    // ---- Toast ----
    function showToast(message, type = 'info') {
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 3000);
    }

    // ---- Nav Scroll ----
    function initNavScroll() {
        const sections = [
            'match-score', 'skills', 'strengths-section', 'skills-gap-section',
            'verdict', 'resume-tips', 'company-opt-section', 'career-roadmap',
            'ats-analysis', 'interview-section', 'video-resume', 'feedback-section'
        ];
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => { if (entry.isIntersecting) UI.setActiveNav(entry.target.id); });
        }, { rootMargin: '-35% 0px -35% 0px' });
        sections.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
    }

    // ---- Tabs ----
    function initTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.tab;
                const group = btn.closest('.tabs-container');
                group.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                group.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(target)?.classList.add('active');
            });
        });
    }

    // ---- Sample Data ----
    const SAMPLE_RESUME = `John Doe — Software Developer | 3 Years of Experience

SUMMARY
Passionate full-stack developer with 3 years of experience building web applications using React, Python, and SQL. Agile teams, strong communication, problem-solving, clean code.

SKILLS
Languages: JavaScript, Python, SQL, HTML5, CSS3
Frameworks: React, Express, Flask
Tools: Git, GitHub, VS Code, Postman, Jira
Databases: MySQL, PostgreSQL, MongoDB
Other: REST APIs, Agile, Scrum, Unit Testing (Jest), Linux

EXPERIENCE
Frontend Developer — TechStart Inc. | 2022 – Present
- Built React web apps serving 10,000+ daily users
- Reduced page load time by 40% via code splitting
- Integrated REST APIs, managed state with Redux

Junior Developer — FreelanceHub | 2021 – 2022
- Built 15+ client websites with HTML, CSS, JavaScript
- Flask backend + PostgreSQL for e-commerce platform

EDUCATION: B.Tech Computer Science — 2021

PROJECTS: E-Commerce (React+Flask+PostgreSQL), Task Manager (Node.js+MongoDB+JWT)`;

    const SAMPLE_JD = `Senior Full Stack Developer — TechCorp
5+ years experience required.

REQUIREMENTS:
- React, TypeScript, Next.js
- Node.js, Express, GraphQL
- AWS (S3, EC2, Lambda)
- Docker, Kubernetes
- PostgreSQL, Redis
- GitHub Actions, CI/CD
- Team leadership and mentoring
- Strong communication skills`;

    function initSampleData() { }

    function loadSampleData() {
        document.getElementById('resume-input').value = SAMPLE_RESUME;
        document.getElementById('jd-input').value = SAMPLE_JD;
        state.resumeText = SAMPLE_RESUME;
        state.jdText = SAMPLE_JD;
        UI.updateCharCount('resume-input', 'resume-char-count');
        UI.updateCharCount('jd-input', 'jd-char-count');
        updateInputStatus('resume-status', SAMPLE_RESUME);
        updateInputStatus('jd-status', SAMPLE_JD);
        showToast('Sample data loaded! Click "Analyze Match" to see results.', 'success');
    }

    window.AppState = state;
    window.showToast = showToast;

    // ---- TL;DR Quick Summary Renderer ----
    function renderTldr(result) {
        const container = document.getElementById('tldr-container');
        if (!container || !result) return;

        const score = result.score || 0;
        const scoreColor = score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
        const verdict = result.verdict || (score >= 70 ? 'Strong Match' : score >= 50 ? 'Good Potential' : 'Needs Work');
        const verdictIcon = score >= 70 ? '✅' : score >= 50 ? '⚠️' : '❌';

        const strengths = (result.strengthsWeaknesses?.strengths || []).map(s => s.label);
        const missing = result.missingSkills || [];

        container.innerHTML = `
          <div class="tldr-grid">
            <div class="tldr-score-circle">
              <div class="tldr-score-num" style="color:${scoreColor}">${score}%</div>
              <div class="tldr-score-desc">Match Score</div>
              <div class="tldr-verdict-badge" style="background:${scoreColor}22;color:${scoreColor};border:1px solid ${scoreColor}44">
                ${verdictIcon} ${verdict}
              </div>
            </div>
            <div>
              <div class="tldr-section-title">✅ Your Strengths</div>
              <ul class="tldr-list">
                ${strengths.slice(0, 3).map(s => `<li data-icon="✓">${s}</li>`).join('') || '<li data-icon="✓">Good resume foundation detected</li>'}
              </ul>
            </div>
            <div>
              <div class="tldr-section-title">🔥 Key Gaps to Fix</div>
              <ul class="tldr-list">
                ${missing.slice(0, 3).map(s => `<li data-icon="+">${ResumeAnalyzer.titleCase(s)}</li>`).join('') || '<li data-icon="+">Check the Skills Gap section below</li>'}
              </ul>
            </div>
          </div>
        `;
    }

    // ---- Tool Tab Switcher ----
    window.switchTool = function (tool) {
        const matcherPanel = document.getElementById('matcher-tool-panel');
        const riskPanel = document.getElementById('risk-tool-panel');
        const matcherBtn = document.getElementById('tab-btn-matcher');
        const riskBtn = document.getElementById('tab-btn-risk');
        const stickyBar = document.getElementById('sticky-analyze-bar');

        if (tool === 'matcher') {
            matcherPanel?.classList.remove('hidden');
            riskPanel?.classList.add('hidden');
            matcherBtn?.classList.add('active');
            riskBtn?.classList.remove('active');
            stickyBar?.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            matcherPanel?.classList.add('hidden');
            riskPanel?.classList.remove('hidden');
            riskBtn?.classList.add('active');
            matcherBtn?.classList.remove('active');
            stickyBar?.classList.add('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // ---- Career Risk Intelligence ----
    function initCareerRisk() {
        const analyzeBtn = document.getElementById('analyze-risk-btn');
        const clearBtn = document.getElementById('risk-clear-btn');
        if (analyzeBtn) analyzeBtn.addEventListener('click', runCareerRiskAnalysis);
        if (clearBtn) clearBtn.addEventListener('click', clearCareerRisk);
    }

    function clearCareerRisk() {
        ['cri-role', 'cri-years', 'cri-goal', 'cri-skills'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        ['cri-exp-level', 'cri-learning', 'cri-industry'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.selectedIndex = el.id === 'cri-exp-level' ? 1 : 0;
        });
        const result = document.getElementById('career-risk-result');
        if (result) { result.innerHTML = ''; result.classList.add('hidden'); }
    }

    function runCareerRiskAnalysis() {
        const role = (document.getElementById('cri-role') || {}).value || '';
        const years = (document.getElementById('cri-years') || {}).value || 0;
        const expLevel = (document.getElementById('cri-exp-level') || {}).value || 'mid';
        const industry = (document.getElementById('cri-industry') || {}).value || 'tech';
        const skills = (document.getElementById('cri-skills') || {}).value || '';
        const learning = (document.getElementById('cri-learning') || {}).value || '';
        const goal = (document.getElementById('cri-goal') || {}).value || '';

        if (!role.trim()) {
            showToast('Please enter your current role to analyze risk.', 'warn');
            return;
        }
        if (!skills.trim()) {
            showToast('Please enter at least a few skills for accurate analysis.', 'warn');
            return;
        }

        const analyzeBtn = document.getElementById('analyze-risk-btn');
        const formCard = document.querySelector('.career-risk-form-card');
        if (analyzeBtn) { 
            analyzeBtn.disabled = true; 
            analyzeBtn.innerHTML = `<span class="spinner"></span> Analyzing...`; 
        }
        if (formCard) formCard.classList.add('active-scanning');

        setTimeout(() => {
            const result = CareerRisk.analyze({
                currentRole: role,
                yearsOfExperience: parseFloat(years) || 0,
                experienceLevel: expLevel,
                industry,
                skills,
                learningActivity: learning,
                careerGoal: goal
            });
            renderCareerRiskResult(result);
            if (analyzeBtn) { 
                analyzeBtn.disabled = false; 
                analyzeBtn.innerHTML = `<span>⚠️</span> Analyze Career Risk`; 
            }
            if (formCard) formCard.classList.remove('active-scanning');
        }, 900);
    }

    function renderCareerRiskResult(r) {
        const container = document.getElementById('career-risk-result');
        if (!container) return;

        const categoryColor = r.riskCategory === 'Safe Zone' ? '#10b981'
            : r.riskCategory === 'Warning Zone' ? '#f59e0b' : '#ef4444';
        const categoryIcon = r.riskCategory === 'Safe Zone' ? '✅' : r.riskCategory === 'Warning Zone' ? '⚠️' : '🚨';
        const scoreColor = r.overallScore <= 35 ? '#10b981' : r.overallScore <= 65 ? '#f59e0b' : '#ef4444';
        const confColor = r.confidence === 'High' ? '#10b981' : r.confidence === 'Medium' ? '#f59e0b' : '#94a3b8';
        const automColor = r.automationRisk < 30 ? '#10b981' : r.automationRisk < 60 ? '#f59e0b' : '#ef4444';
        const salaryIcon = r.salaryGrowth === 'High' ? '📈' : r.salaryGrowth === 'Moderate' ? '📊' : '📉';

        const m = r.modules;

        container.innerHTML = `
        <!-- BANNER -->
        <div class="risk-score-banner" style="border-left:4px solid ${scoreColor}">
          <div class="risk-score-main">
            <div class="risk-score-num" style="color:${scoreColor}">${r.overallScore}%</div>
            <div>
              <div class="risk-score-label">Overall Career Risk Score</div>
              <div class="risk-category-badge" style="background:${categoryColor}22;color:${categoryColor};border:1px solid ${categoryColor}44">${categoryIcon} ${r.riskCategory}</div>
            </div>
          </div>
          <div class="risk-confidence-box">
            <span class="risk-conf-label">Prediction Confidence</span>
            <span class="risk-conf-val" style="color:${confColor}">${r.confidence}</span>
          </div>
        </div>

        <!-- 5 MODULE CARDS -->
        <div class="risk-modules-row">
          <div class="risk-module-card">
            <div class="rm-icon">🧠</div>
            <div class="rm-title">Learning Adaptability</div>
            <div class="rm-score" style="color:${m.learningAdaptability.score >= 60 ? '#10b981' : m.learningAdaptability.score >= 40 ? '#f59e0b' : '#ef4444'}">${m.learningAdaptability.score}/100</div>
            <div class="rm-detail">${m.learningAdaptability.reasons[0] || ''}</div>
          </div>
          <div class="risk-module-card">
            <div class="rm-icon">📈</div>
            <div class="rm-title">Consistency Stability</div>
            <div class="rm-score" style="color:${m.consistencyStability.level === 'High' ? '#10b981' : m.consistencyStability.level === 'Medium' ? '#f59e0b' : '#ef4444'}">${m.consistencyStability.level}</div>
            <div class="rm-detail">${m.consistencyStability.analysis}</div>
          </div>
          <div class="risk-module-card">
            <div class="rm-icon">⚗️</div>
            <div class="rm-title">Skill Relevance Index</div>
            <div class="rm-score" style="color:${m.skillDecay.relevanceRatio >= 50 ? '#10b981' : m.skillDecay.relevanceRatio >= 25 ? '#f59e0b' : '#ef4444'}">${m.skillDecay.relevanceRatio}% Relevant</div>
            <div class="rm-detail">${m.skillDecay.verdict}</div>
          </div>
          <div class="risk-module-card">
            <div class="rm-icon">🤖</div>
            <div class="rm-title">Automation Risk</div>
            <div class="rm-score" style="color:${automColor}">${r.automationRisk}%</div>
            <div class="rm-detail">${m.marketMismatch.sustainability}</div>
          </div>
          <div class="risk-module-card">
            <div class="rm-icon">🎯</div>
            <div class="rm-title">Direction Clarity</div>
            <div class="rm-score" style="color:${m.directionClarity.clarity === 'Clear' ? '#10b981' : m.directionClarity.clarity === 'Partially Aligned' ? '#f59e0b' : '#ef4444'}">${m.directionClarity.clarity}</div>
            <div class="rm-detail">${m.directionClarity.assessment}</div>
          </div>
        </div>

        <!-- TOP 3 RISK FACTORS -->
        <div class="risk-section-card">
          <h4 class="risk-section-title">🔥 Top Risk Factors</h4>
          ${r.topRiskFactors.length === 0
                ? '<p class="risk-positive">✅ No major risk factors detected. You are on a great track!</p>'
                : r.topRiskFactors.map((f, i) => `<div class="risk-factor-item"><span class="risk-factor-num">${i + 1}</span><div><strong>${f.label}</strong><p>${f.detail}</p></div></div>`).join('')
            }
        </div>

        <!-- 2-YEAR PROJECTION + SALARY -->
        <div class="risk-two-col">
          <div class="risk-section-card">
            <h4 class="risk-section-title">🔭 2-Year Career Projection</h4>
            <p class="risk-text">${r.projection}</p>
          </div>
          <div class="risk-section-card">
            <h4 class="risk-section-title">💰 Salary Growth Outlook</h4>
            <div class="risk-salary-badge">
              <span class="salary-icon">${salaryIcon}</span>
              <div>
                <div class="salary-level">${r.salaryGrowth} Growth Potential</div>
                <div class="salary-detail">Based on your role, skills, and market demand alignment.</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ALT CAREER PATHS -->
        ${r.altPaths && r.altPaths.length > 0 ? `
        <div class="risk-section-card">
          <h4 class="risk-section-title">🛤 Alternative Career Paths</h4>
          <div class="alt-paths-grid">
            ${r.altPaths.map(p => `<div class="alt-path-pill">🔀 ${p}</div>`).join('')}
          </div>
        </div>` : ''}

        <!-- 6–12 MONTH ROADMAP -->
        <div class="risk-section-card">
          <h4 class="risk-section-title">🗺 6–12 Month Recovery Roadmap</h4>
          <div class="recovery-phases">
            <div class="recovery-phase">
              <div class="phase-label phase-1">⚡ Months 1–3</div>
              <ul class="phase-list">${r.roadmap.months1to3.map(s => `<li>${s}</li>`).join('')}</ul>
            </div>
            <div class="recovery-phase">
              <div class="phase-label phase-2">🌱 Months 3–6</div>
              <ul class="phase-list">${r.roadmap.months3to6.map(s => `<li>${s}</li>`).join('')}</ul>
            </div>
            <div class="recovery-phase">
              <div class="phase-label phase-3">🌟 Months 6–12</div>
              <ul class="phase-list">${r.roadmap.months6to12.map(s => `<li>${s}</li>`).join('')}</ul>
            </div>
          </div>
        </div>

        <!-- IMMEDIATE ACTIONS -->
        <div class="risk-section-card risk-actions-card">
          <h4 class="risk-section-title">⚡ Immediate Action Steps</h4>
          <div class="immediate-actions-list">
            ${r.immediateActions.map((a, i) => `<div class="immediate-action"><span class="action-num">${i + 1}</span><span>${a}</span></div>`).join('')}
          </div>
        </div>
        `;

        container.classList.remove('hidden');
        setTimeout(() => container.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }

})();
