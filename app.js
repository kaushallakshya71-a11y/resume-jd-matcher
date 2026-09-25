// ============================================================
// app.js — Main Application Controller & Router v4.0.0
// ResumeMatch AI — Redesigned Information Architecture & Navigation
// Complete 8-section product suite with 100% client-side execution.
// ============================================================

(function () {
    // ---- Global State ----
    const state = {
        resumeText: '',
        jdText: '',
        result: null,
        currentView: 'dashboard',
        wizardStep: 1,
        onboardingStep: 1,
        selectedGoal: 'analyze'
    };

    window.AppState = state;

    // ---- DOM Ready Entry Point ----
    document.addEventListener('DOMContentLoaded', async () => {
        // 1. Initialize Auth
        if (window.Auth) {
            try { await Auth.init(); } catch (e) { console.warn('Auth init:', e); }
        }

        // 2. Initialize Database (IndexedDB)
        if (window.LocalDB) {
            try { await LocalDB.init(); } catch (e) { console.warn('LocalDB init:', e); }
        }

        // 3. Initialize Preferences (Theme, Language)
        initTheme();
        if (window.I18N) I18N.applyTranslations();

        // 4. Setup Navigation & Shell
        initNavigation();
        initMobileDrawer();

        // 5. Bind Core Feature Events
        bindCoreEvents();
        initWizardEvents();
        initStudio();
        initTracker();
        initCareerRisk();
        initResultsTabs();
        initSettings();
        initAuthForms();

        // 6. Update Auth UI & Route Protection
        updateAuthUI();
        const isAuth = window.Auth && Auth.isAuthenticated();
        if (!isAuth) {
            navigateTo('login');
        } else {
            restoreActiveResume();
            checkFirstTimeOnboarding();
            updateDashboard();
            navigateTo('dashboard');
        }

        // 7. Video & Feedback Sub-modules
        if (window.VideoResume) VideoResume.init();
        if (window.Feedback) Feedback.init();
    });

    // =========================================================
    // 1. NAVIGATION CONTROLLER & ROUTING
    // =========================================================
    function initNavigation() {
        // Desktop sidebar nav buttons
        document.querySelectorAll('.app-sidebar .nav-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.nav;
                if (view) navigateTo(view);
            });
        });

        // Mobile bottom nav buttons
        document.querySelectorAll('.mobile-bottom-nav .mb-nav-item').forEach(btn => {
            if (btn.id === 'btn-mobile-more') return;
            btn.addEventListener('click', () => {
                const view = btn.dataset.nav;
                if (view) navigateTo(view);
            });
        });

        // Populate drawer navigation list
        const drawerList = document.getElementById('drawer-nav-list');
        if (drawerList) {
            const navItems = [
                { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
                { id: 'analyze', icon: '📄', label: 'Analyze Resume' },
                { id: 'job-match', icon: '🎯', label: 'Job Match' },
                { id: 'studio', icon: '✨', label: 'Resume Studio' },
                { id: 'career-insights', icon: '📊', label: 'Career Insights' },
                { id: 'applications', icon: '💼', label: 'Applications' },
                { id: 'versions', icon: '📚', label: 'Resume Versions' },
                { id: 'account', icon: '👤', label: 'Account & Profile' },
                { id: 'settings', icon: '⚙', label: 'Settings' },
                { id: 'help', icon: '❓', label: 'Help & Guide' },
            ];

            drawerList.innerHTML = navItems.map(item => `
                <li>
                    <button type="button" class="nav-item" data-drawer-nav="${item.id}" onclick="navigateTo('${item.id}'); closeMobileDrawer();">
                        <span class="nav-icon">${item.icon}</span>
                        <span class="nav-label">${item.label}</span>
                    </button>
                </li>
            `).join('') + `
                <li style="margin-top:10px; border-top:1px solid rgba(217,119,6,0.15); padding-top:6px;">
                    <button type="button" class="nav-item" onclick="closeMobileDrawer(); handleLogoutClick();">
                        <span class="nav-icon">🚪</span>
                        <span class="nav-label">Log Out</span>
                    </button>
                </li>
            `;
        }
    }

    window.navigateTo = function (viewId, params = {}) {
        const viewMapping = {
            'dashboard': 'view-dashboard',
            'analyze': 'view-analyze',
            'matcher': 'view-analyze', // legacy alias
            'job-match': 'view-job-match',
            'studio': 'view-studio',
            'quality': 'view-studio', // legacy alias
            'career-insights': 'view-career-insights',
            'risk': 'view-career-insights', // legacy alias
            'applications': 'view-applications',
            'tracker': 'view-applications', // legacy alias
            'versions': 'view-versions',
            'settings': 'view-settings',
            'help': 'view-help',
            'account': 'view-account',
            'login': 'view-login',
            'signup': 'view-signup',
            'forgot-password': 'view-forgot-password'
        };

        let normalizedView = viewId === 'matcher' ? 'analyze'
            : viewId === 'quality' ? 'studio'
            : viewId === 'risk' ? 'career-insights'
            : viewId === 'tracker' ? 'applications'
            : viewId;

        // Route Protection Guard
        const PROTECTED_VIEWS = ['dashboard', 'analyze', 'job-match', 'studio', 'career-insights', 'applications', 'versions', 'settings', 'account'];
        const isAuth = window.Auth && Auth.isAuthenticated();

        if (!isAuth && PROTECTED_VIEWS.includes(normalizedView)) {
            state.redirectAfterLogin = normalizedView;
            normalizedView = 'login';
        } else if (isAuth && (normalizedView === 'login' || normalizedView === 'signup' || normalizedView === 'forgot-password')) {
            normalizedView = 'dashboard';
        }

        state.currentView = normalizedView;

        // Adapt layout for standalone auth screens vs full app shell
        const isAuthScreen = ['login', 'signup', 'forgot-password'].includes(normalizedView);
        document.body.classList.toggle('auth-active-mode', isAuthScreen);

        // Hide all views
        document.querySelectorAll('.page-view').forEach(v => v.classList.add('hidden'));

        // Show target view
        const finalPanelId = viewMapping[normalizedView] || 'view-login';
        const targetEl = document.getElementById(finalPanelId);
        if (targetEl) {
            targetEl.classList.remove('hidden');
        }

        // Update Desktop Sidebar active states
        document.querySelectorAll('.app-sidebar .nav-item').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.nav === normalizedView);
        });

        // Update Mobile Bottom Nav active states
        document.querySelectorAll('.mobile-bottom-nav .mb-nav-item').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.nav === normalizedView);
        });

        // Update Mobile Top Bar title
        const titleEl = document.getElementById('mobile-view-title');
        if (titleEl && window.I18N) {
            const titleKeys = {
                'dashboard': 'navDashboard',
                'analyze': 'navAnalyze',
                'job-match': 'navJobMatch',
                'studio': 'navStudio',
                'career-insights': 'navInsights',
                'applications': 'navApplications',
                'versions': 'navVersions',
                'settings': 'navSettings',
                'help': 'navHelp',
                'account': 'navAccount',
                'login': 'navLogin',
                'signup': 'navSignup',
                'forgot-password': 'authForgotPassword'
            };
            titleEl.textContent = I18N.t(titleKeys[normalizedView] || 'navDashboard');
        }

        // View-specific initialization triggers
        if (normalizedView === 'dashboard') {
            updateDashboard();
        } else if (normalizedView === 'applications') {
            loadJobApplications();
        } else if (normalizedView === 'versions') {
            loadResumeVersions();
        } else if (normalizedView === 'job-match') {
            refreshJobMatchResumeOptions();
        } else if (normalizedView === 'account') {
            updateAuthUI();
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Legacy switchTool adapter for backward compatibility
    window.switchTool = function (tool) {
        navigateTo(tool);
    };

    // Mobile Drawer Controls
    function initMobileDrawer() {
        const menuBtn = document.getElementById('btn-mobile-menu');
        if (menuBtn) menuBtn.addEventListener('click', openMobileDrawer);
    }

    window.openMobileDrawer = function () {
        document.getElementById('mobile-drawer')?.classList.add('open');
        document.getElementById('mobile-drawer-overlay')?.classList.add('open');
    };

    window.closeMobileDrawer = function () {
        document.getElementById('mobile-drawer')?.classList.remove('open');
        document.getElementById('mobile-drawer-overlay')?.classList.remove('open');
    };

    // =========================================================
    // 2. ACTIVE RESUME STATE & DASHBOARD CONTROLLER
    // =========================================================
    function syncActiveResumeText(text, source = '') {
        state.resumeText = text || '';

        // Synchronize inputs across views
        if (source !== 'analyze') {
            const el = document.getElementById('resume-input');
            if (el && el.value !== state.resumeText) {
                el.value = state.resumeText;
                UI.updateCharCount('resume-input', 'resume-char-count');
            }
        }
        if (source !== 'studio') {
            const el = document.getElementById('studio-resume-input');
            if (el && el.value !== state.resumeText) {
                el.value = state.resumeText;
                UI.updateCharCount('studio-resume-input', 'studio-resume-char-count');
            }
        }

        // Cache in localStorage scoped to active user
        const activeUid = (window.Auth && Auth.getCurrentUser()) ? Auth.getCurrentUser().userId : 'guest';
        localStorage.setItem(`rmActiveResume_${activeUid}`, state.resumeText);
        localStorage.setItem('rmActiveResume', state.resumeText);

        // Update UI representations
        updateDashboard();
    }

    function restoreActiveResume() {
        const activeUid = (window.Auth && Auth.getCurrentUser()) ? Auth.getCurrentUser().userId : 'guest';
        const cached = localStorage.getItem(`rmActiveResume_${activeUid}`) || localStorage.getItem('rmActiveResume');
        if (cached && cached.trim().length > 0) {
            syncActiveResumeText(cached, 'restore');
        } else {
            // Pre-load default sample resume text
            syncActiveResumeText(SAMPLE_RESUME, 'sample');
        }
    }

    function updateDashboard() {
        const text = state.resumeText.trim();
        const hasResume = text.length >= 20;

        // Status Card
        const statusBadge = document.getElementById('dash-status-badge');
        const statusText = document.getElementById('dash-status-text');
        const statusSub = document.getElementById('dash-status-sub');
        const lastAnalyzedEl = document.getElementById('dash-last-analyzed');
        const skillsCountEl = document.getElementById('dash-skills-count');
        const issuesCountEl = document.getElementById('dash-issues-count');

        if (statusBadge && statusText) {
            if (hasResume) {
                statusBadge.className = 'status-indicator-badge loaded';
                statusText.textContent = I18N.t('dashStatusUploaded');
                if (statusSub) statusSub.textContent = `${text.length} characters loaded in browser storage`;
            } else {
                statusBadge.className = 'status-indicator-badge';
                statusText.textContent = I18N.t('dashStatusEmpty');
                if (statusSub) statusSub.textContent = 'Upload a resume to begin';
            }
        }

        // Current Resume Card
        const resumeLengthEl = document.getElementById('dash-resume-length');
        if (resumeLengthEl) {
            resumeLengthEl.textContent = hasResume ? `${text.length} characters loaded` : '0 characters';
        }

        // Sidebar Widget
        const srwDot = document.getElementById('srw-dot');
        const srwName = document.getElementById('srw-name');
        const srwMeta = document.getElementById('srw-meta');

        if (srwDot) srwDot.className = hasResume ? 'srw-dot active' : 'srw-dot';
        if (srwName) srwName.textContent = hasResume ? 'Active Resume' : I18N.t('noActiveResume');
        if (srwMeta) srwMeta.textContent = hasResume ? `${text.length} characters` : '0 characters';

        // Compute detected skills count if analyzer available
        let detectedSkills = [];
        if (hasResume && window.ResumeAnalyzer) {
            try {
                detectedSkills = ResumeAnalyzer.extractSkillsFromText(text);
            } catch (e) { }
        }
        if (skillsCountEl) skillsCountEl.textContent = detectedSkills.length;

        // Compute grammar issues count if grammar module available
        let grammarIssues = 0;
        if (hasResume && window.ResumeGrammar) {
            try {
                const gRes = ResumeGrammar.analyzeGrammar(text);
                grammarIssues = (gRes.issues || []).length;
            } catch (e) { }
        }
        if (issuesCountEl) issuesCountEl.textContent = grammarIssues;

        // Score summary tiles
        const qScore = state.result?.breakdown?.qualityScore || (hasResume ? 78 : 0);
        const mScore = state.result?.score || (hasResume ? 72 : 0);
        const missingCount = state.result?.missingSkills?.length ?? (hasResume ? 5 : 0);

        const qualityEl = document.getElementById('dash-score-quality');
        const matchEl = document.getElementById('dash-score-match');
        const missingEl = document.getElementById('dash-score-missing');
        const issuesEl = document.getElementById('dash-score-issues');

        if (qualityEl) qualityEl.textContent = `${qScore}/100`;
        if (matchEl) matchEl.textContent = `${mScore}%`;
        if (missingEl) missingEl.textContent = missingCount;
        if (issuesEl) issuesEl.textContent = grammarIssues;

        document.getElementById('dash-bar-quality')?.style.setProperty('width', `${qScore}%`);
        document.getElementById('dash-bar-match')?.style.setProperty('width', `${mScore}%`);

        // Update 7-Indicator "Where am I in my job search?" Board
        const targetRole = state.result?.targetRole || (hasResume ? 'Senior Full Stack Developer' : 'None Selected');
        const roleEl = document.getElementById('dash-status-role-val');
        const fitEl = document.getElementById('dash-status-fit-val');
        const topGapEl = document.getElementById('dash-status-topgap-val');
        const healthEl = document.getElementById('dash-status-health-val');
        const interviewEl = document.getElementById('dash-status-interview-val');

        if (roleEl) roleEl.textContent = targetRole;
        if (fitEl) {
            fitEl.textContent = hasResume ? `${mScore}% ${state.result?.verdict || 'Strong Match'}` : 'Not Analyzed';
            fitEl.className = mScore >= 70 ? 'jssb-col-val text-green' : (mScore >= 50 ? 'jssb-col-val text-yellow' : 'jssb-col-val text-red');
        }
        if (topGapEl) {
            const topMissing = state.result?.missingSkills?.[0] || (hasResume ? 'TypeScript' : 'None');
            topGapEl.textContent = hasResume ? `${topMissing} (Priority)` : 'None Detected';
        }
        if (healthEl) healthEl.textContent = `${qScore} / 100`;
        if (interviewEl) interviewEl.textContent = hasResume ? 'Curated Questions Ready' : 'Pending Analysis';

        // Smart Next Step Recommendation
        updateSmartNextAction({
            hasResume,
            grammarIssues,
            missingCount,
            matchScore: mScore,
            result: state.result
        });
    }

    // Global Explainability Modal Controls
    window.showExplainabilityModal = function () {
        const modal = document.getElementById('explainability-modal');
        if (modal) {
            modal.classList.remove('hidden');
            if (state.careerAlignmentReport && state.careerAlignmentReport.explainability) {
                UI.renderExplainability(state.careerAlignmentReport.explainability);
            } else if (state.result && window.CareerAlignment) {
                const effectiveJd = state.jdText.length >= 20 ? state.jdText : SAMPLE_JD;
                const exp = CareerAlignment.generateExplainableBreakdown(state.result, state.resumeText, effectiveJd);
                UI.renderExplainability(exp);
            }
        }
    };

    window.closeExplainabilityModal = function () {
        document.getElementById('explainability-modal')?.classList.add('hidden');
    };

    function updateSmartNextAction({ hasResume, grammarIssues, missingCount, matchScore, result }) {
        const titleEl = document.getElementById('dash-next-step-title');
        const descEl = document.getElementById('dash-next-step-desc');
        const btnTextEl = document.getElementById('dash-next-btn-text');

        if (!titleEl || !descEl || !btnTextEl) return;

        if (!hasResume) {
            titleEl.textContent = 'Upload your resume to begin your personalized optimization';
            descEl.textContent = 'Drop a PDF or plain text resume to get your instant estimated score, detected skills, and ATS alignment.';
            btnTextEl.textContent = 'Upload Resume';
            window.activeNextAction = () => navigateTo('analyze');
        } else if (grammarIssues > 4) {
            titleEl.textContent = `Your resume has ${grammarIssues} writing & clarity suggestions detected`;
            descEl.textContent = 'Review passive voice, spelling corrections, and weak bullet point starters in Resume Studio.';
            btnTextEl.textContent = 'Review in Studio';
            window.activeNextAction = () => {
                navigateTo('studio');
                document.getElementById('studio-btn-grammar')?.click();
            };
        } else if (missingCount > 3) {
            titleEl.textContent = `Your resume is missing ${missingCount} core skills required by the target job`;
            descEl.textContent = 'Review missing technologies and add your relevant coursework, projects, or experience.';
            btnTextEl.textContent = 'View Missing Skills';
            window.activeNextAction = () => {
                navigateTo('analyze');
                goToWizardStep(3);
                switchResultsTab('rtab-skills');
            };
        } else if (matchScore < 65) {
            titleEl.textContent = 'Your estimated job match score is moderate — tailor your bullet points';
            descEl.textContent = 'Aligning your project highlights with the job description keywords can significantly improve compatibility.';
            btnTextEl.textContent = 'Match With Target Job';
            window.activeNextAction = () => navigateTo('job-match');
        } else {
            titleEl.textContent = 'Your resume is strongly aligned! Prepare for technical & situational interviews';
            descEl.textContent = 'Review personalized interview preparation questions predicted from your resume and target JD.';
            btnTextEl.textContent = 'View Interview Questions';
            window.activeNextAction = () => {
                navigateTo('analyze');
                goToWizardStep(3);
                switchResultsTab('rtab-roadmap');
            };
        }
    }

    window.executeSmartNextAction = function () {
        if (typeof window.activeNextAction === 'function') {
            window.activeNextAction();
        } else {
            navigateTo('analyze');
        }
    };

    // =========================================================
    // 3. CORE EVENTS & EVENT LISTENERS
    // =========================================================
    function bindCoreEvents() {
        // Resume Textarea Inputs
        const resumeTA = document.getElementById('resume-input');
        if (resumeTA) {
            resumeTA.addEventListener('input', () => {
                syncActiveResumeText(resumeTA.value, 'analyze');
                updateInputStatus('resume-status', resumeTA.value);
            });
        }

        const studioTA = document.getElementById('studio-resume-input');
        if (studioTA) {
            studioTA.addEventListener('input', () => {
                syncActiveResumeText(studioTA.value, 'studio');
            });
        }

        const jdTA = document.getElementById('jd-input');
        if (jdTA) {
            jdTA.addEventListener('input', () => {
                state.jdText = jdTA.value;
                UI.updateCharCount('jd-input', 'jd-char-count');
                updateInputStatus('jd-status', jdTA.value);
            });
        }

        // Action Buttons
        document.getElementById('analyze-btn')?.addEventListener('click', runAnalysis);
        document.getElementById('clear-btn')?.addEventListener('click', clearAll);
        document.getElementById('load-sample-btn')?.addEventListener('click', loadSampleData);
        document.getElementById('download-btn')?.addEventListener('click', () => {
            if (state.result) DownloadReport.generate(state.result);
            else showToast('Please run analysis first!', 'error');
        });

        // File uploads & Drag and drop
        document.getElementById('resume-file')?.addEventListener('change', e =>
            handleFileUpload(e, 'resume-input', 'resume-char-count', 'resume-status')
        );
        document.getElementById('jd-file')?.addEventListener('change', e =>
            handleFileUpload(e, 'jd-input', 'jd-char-count', 'jd-status')
        );

        setupDragDrop('resume-drop', 'resume-input', 'resume-char-count', 'resume-status');
        setupDragDrop('jd-drop', 'jd-input', 'jd-char-count', 'jd-status');

        // Fine-tune customize toggle
        const toggle = document.getElementById('customize-toggle');
        const panel = document.getElementById('customize-panel');
        if (toggle && panel) {
            toggle.addEventListener('click', () => {
                const isOpen = panel.classList.toggle('open');
                const chevron = toggle.querySelector('.chevron-toggle');
                if (chevron) chevron.classList.toggle('open', isOpen);
            });
        }
    }

    // =========================================================
    // 4. 3-STEP WIZARD CONTROLLER
    // =========================================================
    function initWizardEvents() {
        window.goToWizardStep = function (step) {
            state.wizardStep = step;

            // Update Stepper Buttons
            [1, 2, 3].forEach(s => {
                const btn = document.getElementById(`wiz-step-${s}-btn`);
                const panel = document.getElementById(`wiz-panel-${s}`);
                if (btn) btn.classList.toggle('active', s === step);
                if (panel) panel.classList.toggle('hidden', s !== step);
            });

            window.scrollTo({ top: 120, behavior: 'smooth' });
        };

        window.proceedFromStep1 = function () {
            const text = (document.getElementById('resume-input')?.value || state.resumeText || '').trim();
            if (text.length < 20) {
                showToast('Please upload or paste at least 20 characters of resume text to proceed.', 'warn');
                document.getElementById('resume-input')?.focus();
                return;
            }
            goToWizardStep(2);
        };

        window.proceedFromStep2 = function () {
            goToWizardStep(3);
            runAnalysis();
        };

        window.skipJdAndAnalyze = function () {
            // Clear or set placeholder JD for standalone resume analysis
            document.getElementById('jd-input').value = '';
            state.jdText = '';
            goToWizardStep(3);
            runAnalysis();
        };
    }

    // =========================================================
    // 5. RESULTS DASHBOARD CONTROLLER & TABS
    // =========================================================
    function initResultsTabs() {
        document.querySelectorAll('.results-tabs-nav .rtab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.rtab;
                if (target) switchResultsTab(target);
            });
        });
    }

    window.switchResultsTab = function (rtabId) {
        document.querySelectorAll('.results-tabs-nav .rtab-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.rtab === rtabId);
        });
        document.querySelectorAll('.rtab-panel').forEach(p => {
            p.classList.toggle('hidden', p.id !== rtabId);
            p.classList.toggle('active', p.id === rtabId);
        });
    };

    function runAnalysis() {
        state.resumeText = (document.getElementById('resume-input')?.value || state.resumeText || '').trim();
        state.jdText = (document.getElementById('jd-input')?.value || state.jdText || '').trim();

        if (state.resumeText.length < 30) {
            showToast('Please enter your resume text (at least 30 characters).', 'warn');
            goToWizardStep(1);
            return;
        }

        // If no JD, use standard software engineering baseline
        const effectiveJd = state.jdText.length >= 20 ? state.jdText : SAMPLE_JD;

        UI.showLoading();

        setTimeout(() => {
            try {
                const options = getCustomizeOptions();
                state.result = ResumeAnalyzer.analyzeMatch(state.resumeText, effectiveJd, options);
                window.lastMatchResult = state.result;

                // Render in UI
                UI.renderResults(state.result);
                renderTldr(state.result);

                // Render Career Alignment 10-Point Report, Skill Action Plan & Interview Ready
                if (window.CareerAlignment) {
                    state.careerAlignmentReport = CareerAlignment.generateCareerAlignmentReport(state.resumeText, effectiveJd, state.result);
                    UI.renderCareerAlignmentReport(state.careerAlignmentReport);
                    UI.renderSkillActionPlan(state.careerAlignmentReport.actionPlan);
                    UI.renderInterviewReady(state.careerAlignmentReport.interviewReady);
                    UI.renderExplainability(state.careerAlignmentReport.explainability);
                }

                // Reveal Results Section
                document.getElementById('results-section')?.classList.remove('hidden');

                // Switch to Overview tab by default
                switchResultsTab('rtab-overview');

                // Update Dashboard stats
                updateDashboard();

                showToast('Resume analysis complete! 🎉', 'success');

                // Auto-save to LocalDB (IndexedDB)
                const db = window.LocalDB || window.FirebaseDB;
                if (db) db.saveMatchAnalysis(state.result, state.resumeText, state.jdText);

            } catch (err) {
                console.error('Analysis error:', err);
                showToast('An error occurred during analysis. Please try again.', 'error');
            } finally {
                UI.hideLoading();
            }
        }, 800);
    }

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
              <div class="tldr-score-desc">Estimated Compatibility</div>
              <div class="tldr-verdict-badge" style="background:${scoreColor}22;color:${scoreColor};border:1px solid ${scoreColor}44">
                ${verdictIcon} ${verdict}
              </div>
            </div>
            <div>
              <div class="tldr-section-title">✅ Top Strengths</div>
              <ul class="tldr-list">
                ${strengths.slice(0, 3).map(s => `<li data-icon="✓">${s}</li>`).join('') || '<li data-icon="✓">Solid professional foundation detected</li>'}
              </ul>
            </div>
            <div>
              <div class="tldr-section-title">🔥 Missing Key Skills</div>
              <ul class="tldr-list">
                ${missing.slice(0, 3).map(s => `<li data-icon="+">${ResumeAnalyzer.titleCase(s)}</li>`).join('') || '<li data-icon="✓">Strong overall keyword coverage</li>'}
              </ul>
            </div>
          </div>
        `;
    }

    function clearAll() {
        document.getElementById('resume-input').value = '';
        document.getElementById('jd-input').value = '';
        document.getElementById('resume-char-count').textContent = '0 characters';
        document.getElementById('jd-char-count').textContent = '0 characters';
        state.resumeText = '';
        state.jdText = '';
        state.result = null;
        syncActiveResumeText('', 'clear');
        document.getElementById('results-section')?.classList.add('hidden');
        showToast('Inputs cleared! Ready for new resume.', 'info');
        goToWizardStep(1);
    }

    // =========================================================
    // 6. DEDICATED JOB MATCH PAGE
    // =========================================================
    function refreshJobMatchResumeOptions() {
        const select = document.getElementById('jm-resume-select');
        if (!select) return;

        select.innerHTML = `<option value="active">Active Resume (${state.resumeText.length} chars)</option>`;

        if (window.ResumeVersions) {
            ResumeVersions.getAllVersions().then(versions => {
                versions.forEach(v => {
                    const opt = document.createElement('option');
                    opt.value = v.id;
                    opt.textContent = `${v.name} (${(v.resumeText || '').length} chars)`;
                    select.appendChild(opt);
                });
            }).catch(e => console.warn(e));
        }
    }

    window.handleJobMatchResumeSelect = async function (val) {
        if (val === 'active') return;
        if (window.ResumeVersions) {
            try {
                const v = await ResumeVersions.getVersionById(val);
                if (v && v.resumeText) {
                    showToast(`Selected "${v.name}" for job matching.`, 'info');
                }
            } catch (e) { }
        }
    };

    window.runJobMatchFromDedicatedPage = async function () {
        const jdText = document.getElementById('jm-jd-input')?.value.trim();
        if (!jdText || jdText.length < 30) {
            showToast('Please paste a job description (at least 30 characters).', 'warn');
            document.getElementById('jm-jd-input')?.focus();
            return;
        }

        let resumeTextToUse = state.resumeText;
        let resumeTitle = 'Active Resume';

        const selectVal = document.getElementById('jm-resume-select')?.value;
        if (selectVal && selectVal !== 'active' && window.ResumeVersions) {
            try {
                const v = await ResumeVersions.getVersionById(selectVal);
                if (v && v.resumeText) {
                    resumeTextToUse = v.resumeText;
                    resumeTitle = v.name;
                }
            } catch (e) { }
        }

        if (!resumeTextToUse || resumeTextToUse.length < 30) {
            showToast('No resume content found! Please upload a resume first.', 'warn');
            navigateTo('analyze');
            return;
        }

        try {
            const res = ResumeAnalyzer.analyzeMatch(resumeTextToUse, jdText);
            window.lastMatchResult = res;
            UI.renderJobMatchResults(res, resumeTitle);
            showToast('Job match calculated! 🎯', 'success');
        } catch (e) {
            console.error('Job match error:', e);
            showToast('Failed to analyze match.', 'error');
        }
    };

    window.loadSampleJdIntoJobMatch = function () {
        const el = document.getElementById('jm-jd-input');
        if (el) {
            el.value = SAMPLE_JD;
            showToast('Sample job description loaded!', 'info');
        }
    };

    // =========================================================
    // 7. RESUME QUALITY STUDIO CONTROLLER
    // =========================================================
    let currentStudioMode = 'professional';

    function initStudio() {
        // Sub-tabs navigation
        document.querySelectorAll('.studio-subtabs-nav .sstab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.studio-subtabs-nav .sstab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const action = btn.dataset.action;
                if (action === 'improve') runStudioImprover();
                else if (action === 'grammar') runStudioGrammar();
                else if (action === 'ai') runStudioAISignals();
                else if (action === 'humanize') runStudioHumanize();
                else if (action === 'compare') {
                    const comp = document.getElementById('studio-comparison-container');
                    if (comp) comp.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Humanize tone pills
        const modeButtons = document.querySelectorAll('#humanize-mode-pills .mode-pill');
        modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                modeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentStudioMode = btn.dataset.mode || 'professional';
            });
        });

        // Action buttons
        document.getElementById('studio-btn-grammar')?.addEventListener('click', runStudioGrammar);
        document.getElementById('studio-btn-ai')?.addEventListener('click', runStudioAISignals);
        document.getElementById('studio-btn-humanize')?.addEventListener('click', runStudioHumanize);
        document.getElementById('studio-btn-improve')?.addEventListener('click', runStudioImprover);
        document.getElementById('studio-btn-reanalyze')?.addEventListener('click', runStudioReanalyze);
        document.getElementById('studio-btn-clear')?.addEventListener('click', clearStudio);
    }

    function getStudioText() {
        const text = (document.getElementById('studio-resume-input')?.value || state.resumeText || '').trim();
        if (text.length < 20) {
            showToast('Please enter at least 20 characters in the resume text box.', 'warn');
            return null;
        }
        return text;
    }

    function setStudioStatus(status) {
        const el = document.getElementById('studio-output-status');
        if (el) el.textContent = status;
    }

    function runStudioGrammar() {
        const text = getStudioText();
        if (!text) return;

        setStudioStatus('Checking Grammar...');
        const grammarResult = ResumeGrammar.analyzeGrammar(text);
        const container = document.getElementById('studio-output-content');
        if (!container) return;

        setStudioStatus(`${grammarResult.score}/100 Grammar Health`);

        const issues = grammarResult.issues || [];
        if (issues.length === 0) {
            container.innerHTML = `
                <div class="sentence-diff-card">
                    <div class="diff-header">
                        <span class="diff-rule-tag" style="background:rgba(52,211,153,0.2);color:#34d399">✅ Excellent Grammar</span>
                    </div>
                    <p style="font-size:13px;color:var(--text-secondary);margin:4px 0">No obvious spelling errors, weak action verbs, or passive voice patterns detected!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div style="margin-bottom:8px;font-size:12px;color:var(--text-muted)">
                Found <strong>${issues.length}</strong> suggestion${issues.length > 1 ? 's' : ''} (Spelling: ${grammarResult.spellingCount}, Weak Bullet Starters: ${grammarResult.weakVerbCount}, Passive Voice: ${grammarResult.passiveCount})
            </div>
            ${issues.map((iss, idx) => `
                <div class="sentence-diff-card" id="grammar-card-${idx}">
                    <div class="diff-header">
                        <span class="diff-rule-tag">${iss.type}</span>
                        <span style="color:var(--text-muted)">Line ${iss.line || 1}</span>
                    </div>
                    <div class="diff-original">"${iss.original}"</div>
                    <div class="diff-suggested">💡 Suggestion: ${iss.suggestion}</div>
                    ${iss.replacement ? `
                        <div class="diff-actions">
                            <button type="button" class="btn-diff-action btn-accept" onclick="applyStudioReplacement('${encodeURIComponent(iss.original)}', '${encodeURIComponent(iss.replacement)}', 'grammar-card-${idx}')">✓ Apply Fix</button>
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        `;
    }

    function runStudioAISignals() {
        const text = getStudioText();
        if (!text) return;

        setStudioStatus('Analyzing AI Signals...');
        const res = AISignals.analyzeAISignals(text);
        const container = document.getElementById('studio-output-content');
        if (!container) return;

        setStudioStatus(`${res.probability}% Probability`);

        container.innerHTML = `
            <div class="sentence-diff-card">
                <div class="diff-header">
                    <span class="diff-rule-tag" style="background:rgba(245,158,11,0.2);color:#fbbf24">🤖 ${res.riskLevel}</span>
                    <span style="font-weight:700;font-family:var(--font-mono)">${res.probability}% AI Writing Signal</span>
                </div>
                <div style="font-size:13px;color:var(--text-secondary);line-height:1.6;margin-top:6px">
                    <p><strong>Breakdown of Heuristics:</strong></p>
                    <ul style="margin:4px 0 10px 18px">
                        <li>Generic Corporate Clichés: <strong>${res.metrics.genericCliches}</strong></li>
                        <li>Buzzword Density: <strong>${res.metrics.buzzwordDensity}%</strong></li>
                        <li>Sentence Length Uniformity: <strong>${res.metrics.sentenceUniformity}%</strong></li>
                        <li>Personal Specificity Index: <strong>${res.metrics.personalSpecificity}%</strong></li>
                    </ul>
                </div>
                ${res.foundCliches.length > 0 ? `
                    <div style="margin-top:6px">
                        <strong style="font-size:11px;text-transform:uppercase;color:var(--text-muted)">Clichés Detected:</strong>
                        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px">
                            ${res.foundCliches.map(c => `<span class="skill-pill pill-yellow">${c}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
                <div class="honest-disclaimer-card" style="margin-top:10px">
                    <span class="disclaimer-icon">ℹ️</span>
                    <div class="disclaimer-body">
                        <strong>Probabilistic Detection Notice:</strong>
                        <p>${res.disclaimer}</p>
                    </div>
                </div>
            </div>
        `;
    }

    function runStudioHumanize() {
        const text = getStudioText();
        if (!text) return;

        const preserveFacts = document.getElementById('chk-preserve-facts')?.checked ?? true;
        setStudioStatus(`Humanizing (${currentStudioMode})...`);

        const res = ResumeHumanizer.humanizeText(text, currentStudioMode, { preserveFacts });
        const container = document.getElementById('studio-output-content');
        if (!container) return;

        setStudioStatus(`${res.changesCount} Modified Sentences`);

        if (res.changesCount === 0) {
            container.innerHTML = `
                <div class="sentence-diff-card">
                    <div class="diff-header">
                        <span class="diff-rule-tag" style="background:rgba(52,211,153,0.2);color:#34d399">✨ Naturally Phrased</span>
                    </div>
                    <p style="font-size:13px;color:var(--text-secondary)">No overly artificial phrasing detected for the <strong>${currentStudioMode}</strong> mode. Facts &amp; metrics are strictly preserved.</p>
                </div>
            `;
            return;
        }

        window.studioSentenceChanges = res.sentences.filter(s => s.changed);

        container.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:12px;color:var(--text-muted)">
                <span><strong>${res.changesCount}</strong> suggestions available:</span>
                <button type="button" class="btn-diff-action btn-accept" onclick="acceptAllHumanizedSuggestions()">✓ Accept All</button>
            </div>
            ${window.studioSentenceChanges.map((item, idx) => `
                <div class="sentence-diff-card" id="diff-card-${idx}">
                    <div class="diff-header">
                        <span class="diff-rule-tag">${item.rule || currentStudioMode}</span>
                    </div>
                    <div class="diff-original">${item.original}</div>
                    <div class="diff-suggested" id="diff-sug-${idx}">${item.suggested}</div>
                    <div class="diff-actions">
                        <button type="button" class="btn-diff-action btn-accept" onclick="acceptHumanizedSentence(${idx})">✓ Accept</button>
                        <button type="button" class="btn-diff-action btn-reject" onclick="rejectHumanizedSentence(${idx})">✗ Dismiss</button>
                        <button type="button" class="btn-diff-action btn-edit-toggle" onclick="toggleEditSentence(${idx})">✎ Edit</button>
                    </div>
                    <div class="diff-edit-wrap hidden" id="diff-edit-wrap-${idx}">
                        <input type="text" class="diff-edit-input" id="diff-edit-input-${idx}" value="${item.suggested.replace(/"/g, '&quot;')}" />
                        <button type="button" class="btn-diff-action btn-accept" onclick="applyCustomEditedSentence(${idx})">Apply Custom</button>
                    </div>
                </div>
            `).join('')}
        `;
    }

    function runStudioImprover() {
        const text = getStudioText();
        if (!text) return;

        setStudioStatus('Reviewing Sections & Bullets...');
        const res = ResumeImprover.evaluateResumeQuality(text);
        const container = document.getElementById('studio-output-content');
        if (!container) return;

        setStudioStatus(`${res.qualityScore}/100 Quality Score`);

        container.innerHTML = `
            <div class="sentence-diff-card">
                <div class="diff-header">
                    <span class="diff-rule-tag" style="background:rgba(52,211,153,0.2);color:#34d399">📋 Sections Overview</span>
                    <span style="font-weight:800;font-family:var(--font-mono)">${res.qualityScore}/100</span>
                </div>
                <div style="font-size:12px;color:var(--text-secondary);margin:8px 0">
                    <div><strong>Detected Sections:</strong> ${res.sectionsDetected.map(s => `<span class="skill-pill pill-green">${s}</span>`).join(' ') || 'None explicitly marked'}</div>
                    ${res.missingSections.length > 0 ? `
                        <div style="margin-top:6px"><strong>Missing Recommended Sections:</strong> ${res.missingSections.map(s => `<span class="skill-pill pill-yellow">${s}</span>`).join(' ')}</div>
                    ` : ''}
                </div>
                <div style="margin-top:10px">
                    <strong style="font-size:12px">Bullet Point Quality Framework:</strong>
                    <p style="font-size:12px;color:var(--text-muted);margin:4px 0">Evaluated on: Action Verb + Technology + Task + Quantified Result</p>
                    <div style="font-size:12px;color:var(--text-secondary)">Strong Bullets: <strong>${res.bulletReview.strongBullets}</strong> / Total Analyzed: <strong>${res.bulletReview.totalBullets}</strong></div>
                </div>
                ${res.recommendations.length > 0 ? `
                    <div style="margin-top:10px">
                        <strong style="font-size:12px">Key Recommendations:</strong>
                        <ul style="margin:4px 0 0 18px;font-size:12px;color:var(--text-secondary)">
                            ${res.recommendations.map(r => `<li>${r}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
    }

    function runStudioReanalyze() {
        const improvedText = document.getElementById('studio-resume-input')?.value.trim();
        if (!improvedText) {
            showToast('Studio text is empty. Enter resume text to re-analyze.', 'warn');
            return;
        }

        const prevResult = state.result;
        syncActiveResumeText(improvedText, 'studio');

        // Navigate to analyze results and re-run
        navigateTo('analyze');
        goToWizardStep(3);
        runAnalysis();

        // Calculate comparison matrix if previous result exists
        if (prevResult && window.ResumeQuality) {
            setTimeout(() => {
                const newResult = state.result;
                if (newResult) {
                    const comparison = ResumeQuality.computeComparisonMatrix(prevResult, newResult);
                    renderStudioComparisonMatrix(comparison);
                }
            }, 1200);
        }
    }

    function renderStudioComparisonMatrix(comp) {
        const container = document.getElementById('studio-comparison-container');
        if (!container || !comp) return;

        container.innerHTML = `
            <div class="breakdown-header">
                <span class="breakdown-badge">📊 Before vs After</span>
                <h4 class="breakdown-title">Resume Optimization Impact</h4>
                <p class="breakdown-subtitle">${comp.summaryMessage}</p>
            </div>
            <table class="comparison-matrix-table">
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Before</th>
                        <th>After</th>
                        <th>Delta</th>
                    </tr>
                </thead>
                <tbody>
                    ${comp.metrics.map(m => `
                        <tr>
                            <td><strong>${m.label}</strong></td>
                            <td>${m.before}</td>
                            <td>${m.after}</td>
                            <td class="matrix-delta ${m.delta > 0 ? 'positive' : m.delta < 0 ? 'negative' : 'neutral'}">
                                ${m.delta > 0 ? '+' : ''}${m.delta}${m.unit || ''}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        container.classList.remove('hidden');
    }

    function clearStudio() {
        const ta = document.getElementById('studio-resume-input');
        if (ta) ta.value = '';
        UI.updateCharCount('studio-resume-input', 'studio-resume-char-count');
        const out = document.getElementById('studio-output-content');
        if (out) {
            out.innerHTML = `
                <div class="studio-empty-prompt">
                    <div class="sep-icon">✨</div>
                    <p>Choose an action below to check grammar, view AI writing signals, or humanize bullet points sentence-by-sentence.</p>
                </div>
            `;
        }
        setStudioStatus('Ready');
        document.getElementById('studio-comparison-container')?.classList.add('hidden');
        showToast('Studio output cleared!', 'info');
    }

    window.applyStudioReplacement = function (origEnc, repEnc, cardId) {
        const orig = decodeURIComponent(origEnc);
        const rep = decodeURIComponent(repEnc);
        const ta = document.getElementById('studio-resume-input');
        if (ta && ta.value.includes(orig)) {
            ta.value = ta.value.replace(orig, rep);
            UI.updateCharCount('studio-resume-input', 'studio-resume-char-count');
            syncActiveResumeText(ta.value, 'studio');
            const card = document.getElementById(cardId);
            if (card) {
                card.querySelector('.diff-actions').innerHTML = `<span class="diff-status-badge diff-status-accepted">✓ Applied</span>`;
            }
            showToast('Replacement applied! ✅', 'success');
        } else {
            showToast('Original sentence could not be located in textarea.', 'warn');
        }
    };

    window.acceptHumanizedSentence = function (idx) {
        const item = window.studioSentenceChanges?.[idx];
        if (!item) return;
        const ta = document.getElementById('studio-resume-input');
        if (ta && ta.value.includes(item.original)) {
            ta.value = ta.value.replace(item.original, item.suggested);
            UI.updateCharCount('studio-resume-input', 'studio-resume-char-count');
            syncActiveResumeText(ta.value, 'studio');
            const card = document.getElementById(`diff-card-${idx}`);
            if (card) {
                card.querySelector('.diff-actions').innerHTML = `<span class="diff-status-badge diff-status-accepted">✓ Applied</span>`;
                card.querySelector('.diff-edit-wrap')?.classList.add('hidden');
            }
            showToast('Suggestion applied! ✅', 'success');
        }
    };

    window.rejectHumanizedSentence = function (idx) {
        const card = document.getElementById(`diff-card-${idx}`);
        if (card) {
            card.querySelector('.diff-actions').innerHTML = `<span class="diff-status-badge diff-status-rejected">✗ Dismissed</span>`;
            card.querySelector('.diff-edit-wrap')?.classList.add('hidden');
        }
    };

    window.toggleEditSentence = function (idx) {
        const wrap = document.getElementById(`diff-edit-wrap-${idx}`);
        if (wrap) wrap.classList.toggle('hidden');
    };

    window.applyCustomEditedSentence = function (idx) {
        const item = window.studioSentenceChanges?.[idx];
        if (!item) return;
        const customVal = document.getElementById(`diff-edit-input-${idx}`)?.value.trim();
        if (!customVal) return;

        const ta = document.getElementById('studio-resume-input');
        if (ta && ta.value.includes(item.original)) {
            ta.value = ta.value.replace(item.original, customVal);
            UI.updateCharCount('studio-resume-input', 'studio-resume-char-count');
            syncActiveResumeText(ta.value, 'studio');
            const card = document.getElementById(`diff-card-${idx}`);
            if (card) {
                document.getElementById(`diff-sug-${idx}`).textContent = customVal;
                card.querySelector('.diff-actions').innerHTML = `<span class="diff-status-badge diff-status-accepted">✓ Applied Custom</span>`;
                card.querySelector('.diff-edit-wrap')?.classList.add('hidden');
            }
            showToast('Custom change applied! ✅', 'success');
        }
    };

    window.acceptAllHumanizedSuggestions = function () {
        if (!window.studioSentenceChanges || window.studioSentenceChanges.length === 0) return;
        const ta = document.getElementById('studio-resume-input');
        if (!ta) return;

        let updated = ta.value;
        let appliedCount = 0;
        window.studioSentenceChanges.forEach((item, idx) => {
            if (updated.includes(item.original)) {
                updated = updated.replace(item.original, item.suggested);
                appliedCount++;
                const card = document.getElementById(`diff-card-${idx}`);
                if (card) {
                    card.querySelector('.diff-actions').innerHTML = `<span class="diff-status-badge diff-status-accepted">✓ Applied</span>`;
                }
            }
        });

        ta.value = updated;
        UI.updateCharCount('studio-resume-input', 'studio-resume-char-count');
        syncActiveResumeText(ta.value, 'studio');
        showToast(`Applied ${appliedCount} humanized suggestions! 🎉`, 'success');
    };

    window.openActiveResumeInStudio = function () {
        const text = state.resumeText || document.getElementById('resume-input')?.value || '';
        if (!text.trim()) {
            showToast('Please enter or upload a resume first!', 'warn');
            return;
        }
        syncActiveResumeText(text, 'goto');
        navigateTo('studio');
        showToast('Resume loaded into Studio! Choose an action to begin.', 'info');
    };

    // =========================================================
    // 8. ONBOARDING WIZARD CONTROLLER
    // =========================================================
    function checkFirstTimeOnboarding() {
        const seen = localStorage.getItem('rmOnboardingSeen');
        if (!seen) {
            setTimeout(openOnboardingModal, 600);
        }
    }

    window.openOnboardingModal = function () {
        state.onboardingStep = 1;
        updateOnboardingUI();
        document.getElementById('onboarding-modal')?.classList.remove('hidden');
    };

    window.closeOnboardingModal = function () {
        document.getElementById('onboarding-modal')?.classList.add('hidden');
        localStorage.setItem('rmOnboardingSeen', 'true');
    };

    function updateOnboardingUI() {
        [1, 2, 3, 4].forEach(s => {
            const dot = document.getElementById(`ob-dot-${s}`);
            const panel = document.getElementById(`ob-step-${s}`);
            if (dot) dot.classList.toggle('active', s === state.onboardingStep);
            if (panel) panel.classList.toggle('hidden', s !== state.onboardingStep);
        });

        const backBtn = document.getElementById('ob-btn-back');
        const nextBtn = document.getElementById('ob-btn-next');

        if (backBtn) backBtn.style.display = state.onboardingStep > 1 ? 'inline-block' : 'none';
        if (nextBtn) {
            nextBtn.textContent = state.onboardingStep === 4 ? I18N.t('obBtnStart') : I18N.t('obBtnNext');
        }
    }

    window.selectOnboardingGoal = function (goal, el) {
        state.selectedGoal = goal;
        document.querySelectorAll('.ob-goal-card').forEach(c => c.classList.remove('selected'));
        if (el) el.classList.add('selected');
    };

    window.nextOnboardingStep = function () {
        if (state.onboardingStep === 2) {
            const inputVal = document.getElementById('ob-resume-input')?.value.trim();
            if (inputVal && inputVal.length > 20) {
                syncActiveResumeText(inputVal, 'onboarding');
            }
        } else if (state.onboardingStep === 3) {
            const jdVal = document.getElementById('ob-jd-input')?.value.trim();
            if (jdVal) {
                state.jdText = jdVal;
                document.getElementById('jd-input').value = jdVal;
            }
        } else if (state.onboardingStep === 4) {
            closeOnboardingModal();
            if (state.selectedGoal === 'studio') {
                navigateTo('studio');
            } else if (state.selectedGoal === 'match') {
                navigateTo('job-match');
            } else {
                navigateTo('analyze');
                goToWizardStep(3);
                runAnalysis();
            }
            return;
        }

        state.onboardingStep++;
        updateOnboardingUI();
    };

    window.prevOnboardingStep = function () {
        if (state.onboardingStep > 1) {
            state.onboardingStep--;
            updateOnboardingUI();
        }
    };

    window.handleOnboardingFileUpload = function (e) {
        const file = e.target.files[0];
        if (!file) return;
        if (file.name.endsWith('.txt') || file.type === 'text/plain') {
            const r = new FileReader();
            r.onload = ev => {
                document.getElementById('ob-resume-input').value = ev.target.result;
                syncActiveResumeText(ev.target.result, 'onboarding');
                showToast('Resume loaded into onboarding!', 'success');
            };
            r.readAsText(file);
        } else if (file.name.endsWith('.pdf')) {
            extractPdfText(file, 'resume', text => {
                document.getElementById('ob-resume-input').value = text;
                syncActiveResumeText(text, 'onboarding');
                showToast('PDF loaded into onboarding!', 'success');
            });
        }
    };

    // =========================================================
    // 9. JOB APPLICATION TRACKER & VERSIONS
    // =========================================================
    let currentJobFilter = 'all';

    function initTracker() {
        const filterChips = document.querySelectorAll('#job-status-filters .filter-chip');
        filterChips.forEach(chip => {
            chip.addEventListener('click', () => {
                filterChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                currentJobFilter = chip.dataset.filter || 'all';
                loadJobApplications(currentJobFilter);
            });
        });

        document.getElementById('btn-show-add-job')?.addEventListener('click', () => openJobModal());
        document.getElementById('btn-save-current-version')?.addEventListener('click', saveCurrentAsVersion);
    }

    async function loadJobApplications(filter = 'all') {
        const container = document.getElementById('job-applications-list');
        if (!container) return;

        let apps = [];
        try {
            if (window.JobTracker) {
                apps = await JobTracker.getAllApplications();
            }
        } catch (e) {
            console.error('Error loading job applications:', e);
        }

        if (filter !== 'all') {
            apps = apps.filter(a => (a.status || '').toLowerCase() === filter.toLowerCase());
        }

        if (apps.length === 0) {
            UI.renderEmptyState(
                'job-applications-list',
                I18N.t('emptyAppsTitle'),
                I18N.t('emptyAppsDesc'),
                I18N.t('btnAddApp'),
                'openJobModal()'
            );
            return;
        }

        const statusClass = {
            'Saved': 'status-saved',
            'Applied': 'status-applied',
            'Online Assessment': 'status-oa',
            'Interview': 'status-interview',
            'Selected': 'status-selected',
            'Rejected': 'status-rejected'
        };

        container.innerHTML = apps.map(app => `
            <div class="job-app-card" id="job-card-${app.id}">
                <div class="job-card-top">
                    <div>
                        <div class="job-card-company">${escapeHtml(app.company)}</div>
                        <div class="job-card-role">${escapeHtml(app.role)}</div>
                    </div>
                    <span class="job-status-badge ${statusClass[app.status] || 'status-saved'}">${escapeHtml(app.status)}</span>
                </div>
                <div class="job-card-details">
                    <span>📅 Applied: ${escapeHtml(app.appliedDate || app.dateApplied || 'N/A')}</span>
                    ${app.matchScore ? `<span>🎯 Match: ${app.matchScore}%</span>` : ''}
                </div>
                ${app.notes ? `<div class="job-card-notes">${escapeHtml(app.notes)}</div>` : ''}
                <div class="job-card-actions">
                    <button type="button" class="btn-job-action" onclick="openJobModal('${app.id}')">✎ Edit</button>
                    <button type="button" class="btn-job-action btn-job-delete" onclick="deleteJobApp('${app.id}')">🗑 Delete</button>
                </div>
            </div>
        `).join('');
    }

    window.openJobModal = async function (id = null) {
        const modal = document.getElementById('job-modal');
        if (!modal) return;

        const editIdInput = document.getElementById('job-edit-id');
        const companyInput = document.getElementById('job-input-company');
        const roleInput = document.getElementById('job-input-role');
        const statusSelect = document.getElementById('job-input-status');
        const notesInput = document.getElementById('job-input-notes');
        const scoreInput = document.getElementById('job-input-score');
        const titleEl = document.getElementById('job-modal-title');

        if (id) {
            titleEl.textContent = 'Edit Job Application';
            editIdInput.value = id;
            try {
                const app = await JobTracker.getApplicationById(id);
                if (app) {
                    companyInput.value = app.company || '';
                    roleInput.value = app.role || '';
                    statusSelect.value = app.status || 'Saved';
                    notesInput.value = app.notes || '';
                    if (scoreInput) scoreInput.value = app.matchScore || '';
                }
            } catch (e) { }
        } else {
            titleEl.textContent = 'Add Job Application';
            editIdInput.value = '';
            companyInput.value = '';
            roleInput.value = '';
            statusSelect.value = 'Saved';
            notesInput.value = '';
            if (scoreInput) scoreInput.value = state.result?.score || '';
        }

        modal.classList.remove('hidden');
    };

    window.closeJobModal = function () {
        document.getElementById('job-modal')?.classList.add('hidden');
    };

    window.saveJobApplication = async function (e) {
        if (e && e.preventDefault) e.preventDefault();

        const id = document.getElementById('job-edit-id')?.value;
        const company = document.getElementById('job-input-company')?.value.trim();
        const role = document.getElementById('job-input-role')?.value.trim();
        const status = document.getElementById('job-input-status')?.value;
        const notes = document.getElementById('job-input-notes')?.value.trim();
        const matchScore = parseInt(document.getElementById('job-input-score')?.value) || 0;
        const appliedDate = document.getElementById('job-input-applied-date')?.value || new Date().toISOString().split('T')[0];
        const interviewDate = document.getElementById('job-input-interview-date')?.value || '';

        if (!company || !role) {
            showToast('Please enter both company name and role.', 'warn');
            return;
        }

        const data = {
            company,
            role,
            status,
            notes,
            matchScore,
            appliedDate,
            interviewDate
        };

        try {
            if (id) {
                await JobTracker.updateApplication(id, data);
                showToast('Application updated! ✅', 'success');
            } else {
                await JobTracker.addApplication(data);
                showToast('Application added! 🎉', 'success');
            }
            closeJobModal();
            loadJobApplications(currentJobFilter);
        } catch (err) {
            console.error('Error saving application:', err);
            showToast('Failed to save application.', 'error');
        }
    };

    window.deleteJobApp = async function (id) {
        if (!confirm('Are you sure you want to delete this job application?')) return;
        try {
            await JobTracker.deleteApplication(id);
            showToast('Application deleted.', 'info');
            loadJobApplications(currentJobFilter);
        } catch (err) {
            console.error(err);
        }
    };

    async function loadResumeVersions() {
        const container = document.getElementById('resume-versions-list');
        if (!container) return;

        let versions = [];
        try {
            if (window.ResumeVersions) {
                versions = await ResumeVersions.getAllVersions();
            }
        } catch (e) {
            console.error('Error loading versions:', e);
        }

        if (versions.length === 0) {
            UI.renderEmptyState(
                'resume-versions-list',
                I18N.t('emptyVersionsTitle'),
                I18N.t('emptyVersionsDesc'),
                I18N.t('btnSaveNewVersion'),
                'saveCurrentAsVersion()'
            );
            return;
        }

        container.innerHTML = versions.map(v => {
            const preview = escapeHtml((v.content || v.resumeText || '').slice(0, 140).replace(/\n/g, ' ')) + '...';
            return `
                <div class="version-card" id="version-card-${v.id}">
                    <div class="version-name">📄 ${escapeHtml(v.name)}</div>
                    <div class="version-meta">Saved: ${new Date(v.createdAt).toLocaleDateString()} · ${(v.content || v.resumeText || '').length} characters</div>
                    <div class="version-preview">${preview}</div>
                    <div class="version-actions">
                        <button type="button" class="btn-job-action" onclick="loadVersionToTarget('${v.id}', 'matcher')">Load to Matcher</button>
                        <button type="button" class="btn-job-action" onclick="loadVersionToTarget('${v.id}', 'studio')">Load to Studio</button>
                        <button type="button" class="btn-job-action btn-job-delete" onclick="deleteVersionRecord('${v.id}')">🗑 Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    window.saveCurrentAsVersion = async function () {
        const textToSave = state.resumeText || document.getElementById('resume-input')?.value.trim();
        if (!textToSave) {
            showToast('No resume text found to save! Enter or upload a resume first.', 'warn');
            return;
        }

        const versionName = prompt('Enter a name for this resume version:', `Tailored Resume — ${new Date().toLocaleDateString()}`);
        if (!versionName || !versionName.trim()) return;

        try {
            await ResumeVersions.createVersion(versionName.trim(), textToSave, 'General');
            showToast('Version saved to browser storage! 💾', 'success');
            loadResumeVersions();
        } catch (e) {
            console.error(e);
            showToast('Failed to save version.', 'error');
        }
    };

    window.loadVersionToTarget = async function (id, target) {
        try {
            const v = await ResumeVersions.getVersionById(id);
            const content = v.content || v.resumeText;
            if (!v || !content) return;

            syncActiveResumeText(content, target);

            if (target === 'studio') {
                navigateTo('studio');
                showToast(`Loaded "${v.name}" into Studio!`, 'success');
            } else {
                navigateTo('analyze');
                showToast(`Loaded "${v.name}" into Matcher!`, 'success');
            }
        } catch (e) {
            console.error(e);
        }
    };

    window.deleteVersionRecord = async function (id) {
        if (!confirm('Are you sure you want to delete this resume version?')) return;
        try {
            await ResumeVersions.deleteVersion(id);
            showToast('Version deleted.', 'info');
            loadResumeVersions();
        } catch (e) {
            console.error(e);
        }
    };

    // =========================================================
    // 10. CAREER INSIGHTS CONTROLLER
    // =========================================================
    function initCareerRisk() {
        document.getElementById('analyze-risk-btn')?.addEventListener('click', runCareerRiskAnalysis);
        document.getElementById('risk-clear-btn')?.addEventListener('click', clearCareerRisk);
    }

    function clearCareerRisk() {
        ['cri-role', 'cri-years', 'cri-goal', 'cri-skills'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        const result = document.getElementById('career-risk-result');
        if (result) { result.innerHTML = ''; result.classList.add('hidden'); }
    }

    function runCareerRiskAnalysis() {
        const role = document.getElementById('cri-role')?.value.trim() || '';
        const years = document.getElementById('cri-years')?.value || 0;
        const expLevel = document.getElementById('cri-exp-level')?.value || 'mid';
        const industry = document.getElementById('cri-industry')?.value || 'tech';
        const skills = document.getElementById('cri-skills')?.value.trim() || '';
        const learning = document.getElementById('cri-learning')?.value || '';
        const goal = document.getElementById('cri-goal')?.value.trim() || '';

        if (!role) {
            showToast('Please enter your current role to analyze career signals.', 'warn');
            document.getElementById('cri-role')?.focus();
            return;
        }
        if (!skills) {
            showToast('Please enter at least a few skills for accurate analysis.', 'warn');
            document.getElementById('cri-skills')?.focus();
            return;
        }

        const analyzeBtn = document.getElementById('analyze-risk-btn');
        if (analyzeBtn) {
            analyzeBtn.disabled = true;
            analyzeBtn.innerHTML = `<span class="spinner"></span> Analyzing...`;
        }

        setTimeout(() => {
            try {
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

                const db = window.LocalDB || window.FirebaseDB;
                if (db) db.saveRiskAnalysis(result, { currentRole: role, yearsOfExperience: parseFloat(years) || 0 });

            } catch (e) {
                console.error('Career risk error:', e);
                showToast('Failed to evaluate career signals.', 'error');
            } finally {
                if (analyzeBtn) {
                    analyzeBtn.disabled = false;
                    analyzeBtn.innerHTML = `<span>⚠️</span> Analyze Career Signals`;
                }
            }
        }, 800);
    }

    function renderCareerRiskResult(r) {
        const container = document.getElementById('career-risk-result');
        if (!container || !r) return;

        const scoreColor = r.overallScore <= 35 ? '#10b981' : r.overallScore <= 65 ? '#f59e0b' : '#ef4444';
        const categoryColor = r.riskCategory === 'Safe Zone' ? '#10b981' : r.riskCategory === 'Warning Zone' ? '#f59e0b' : '#ef4444';
        const categoryIcon = r.riskCategory === 'Safe Zone' ? '✅' : r.riskCategory === 'Warning Zone' ? '⚠️' : '🚨';
        const m = r.modules;

        container.innerHTML = `
            <div class="risk-disclaimer" role="note" style="margin-bottom:20px;">
                ℹ️ <strong>Career Risk Signals:</strong> This analysis is informational and based on the data you entered. It is <strong>not</strong> a guaranteed prediction of future career outcomes.
            </div>

            <div class="risk-score-banner" style="border-left:4px solid ${scoreColor};margin-bottom:20px;">
                <div class="risk-score-main">
                    <div class="risk-score-num" style="color:${scoreColor}">${r.overallScore}%</div>
                    <div>
                        <div class="risk-score-label">Career Risk Signal Score</div>
                        <div class="risk-category-badge" style="background:${categoryColor}22;color:${categoryColor};border:1px solid ${categoryColor}44">
                            ${categoryIcon} ${r.riskCategory}
                        </div>
                    </div>
                </div>
                <div class="risk-confidence-box">
                    <span class="risk-conf-label">Confidence</span>
                    <span class="risk-conf-val" style="color:${scoreColor}">${r.confidence}</span>
                </div>
            </div>

            <div class="risk-modules-row">
                <div class="risk-module-card">
                    <div class="rm-icon">🧠</div>
                    <div class="rm-title">Learning Adaptability</div>
                    <div class="rm-score" style="color:${m.learningAdaptability.score >= 60 ? '#10b981' : '#f59e0b'}">${m.learningAdaptability.score}/100</div>
                    <div class="rm-detail">${m.learningAdaptability.reasons[0] || 'Good continuous learning pace'}</div>
                </div>
                <div class="risk-module-card">
                    <div class="rm-icon">📈</div>
                    <div class="rm-title">Consistency Stability</div>
                    <div class="rm-score" style="color:${m.consistencyStability.level === 'High' ? '#10b981' : '#f59e0b'}">${m.consistencyStability.level}</div>
                    <div class="rm-detail">${m.consistencyStability.analysis}</div>
                </div>
                <div class="risk-module-card">
                    <div class="rm-icon">⚗️</div>
                    <div class="rm-title">Skill Relevance Index</div>
                    <div class="rm-score" style="color:${m.skillDecay.relevanceRatio >= 50 ? '#10b981' : '#f59e0b'}">${m.skillDecay.relevanceRatio}% Relevant</div>
                    <div class="rm-detail">${m.skillDecay.verdict}</div>
                </div>
                <div class="risk-module-card">
                    <div class="rm-icon">🤖</div>
                    <div class="rm-title">Automation Risk</div>
                    <div class="rm-score" style="color:${r.automationRisk < 40 ? '#10b981' : '#f59e0b'}">${r.automationRisk}%</div>
                    <div class="rm-detail">${m.marketMismatch.sustainability}</div>
                </div>
            </div>

            <div class="risk-section-card" style="margin-top:20px;">
                <h4 class="risk-section-title">🗺 6–12 Month Growth & Recovery Roadmap</h4>
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
        `;

        container.classList.remove('hidden');
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // =========================================================
    // 11. SETTINGS & DATA PORTABILITY CONTROLLER
    // =========================================================
    function initSettings() {
        // Active theme buttons
        const currentTheme = localStorage.getItem('theme') || 'dark';
        applyTheme(currentTheme, false);
    }

    window.applyTheme = function (mode, notify = true) {
        if (mode === 'light') {
            document.documentElement.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
            document.getElementById('theme-toggle-btn').textContent = '☀️';
        } else {
            document.documentElement.classList.remove('light-mode');
            localStorage.setItem('theme', 'dark');
            document.getElementById('theme-toggle-btn').textContent = '🌙';
        }
        if (notify) showToast(`${mode === 'light' ? 'Light' : 'Dark'} mode activated!`, 'success');
    };

    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        const systemLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
        const initial = savedTheme || (systemLight ? 'light' : 'dark');
        applyTheme(initial, false);

        document.getElementById('theme-toggle-btn')?.addEventListener('click', () => {
            const isLight = document.documentElement.classList.contains('light-mode');
            applyTheme(isLight ? 'dark' : 'light');
        });

        document.getElementById('lang-toggle-btn')?.addEventListener('click', () => {
            if (window.I18N) I18N.toggleLang();
        });
    }

    window.exportDataBackup = async function () {
        if (!window.LocalDB) {
            showToast('Local database not ready.', 'error');
            return;
        }
        try {
            const data = await LocalDB.exportAllData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ResumeMatch_Backup_${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast('Backup exported successfully! 💾', 'success');
        } catch (e) {
            console.error('Export error:', e);
            showToast('Failed to export backup.', 'error');
        }
    };

    window.importDataBackup = function (event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async ev => {
            try {
                const json = JSON.parse(ev.target.result);
                if (window.LocalDB) {
                    await LocalDB.importData(json);
                    showToast('Backup restored successfully! 🎉', 'success');
                    updateDashboard();
                    loadJobApplications();
                    loadResumeVersions();
                }
            } catch (err) {
                console.error('Import error:', err);
                showToast('Invalid backup file. Could not restore.', 'error');
            }
        };
        reader.readAsText(file);
    };

    window.confirmClearAllData = async function () {
        if (!confirm('Are you sure you want to permanently delete all local resumes, versions, and applications from this browser? This cannot be undone.')) {
            return;
        }

        try {
            if (window.LocalDB) await LocalDB.clearAll();
            localStorage.removeItem('rmActiveResume');
            syncActiveResumeText('', 'clear');
            showToast('All local browser data has been wiped.', 'info');
            updateDashboard();
            loadJobApplications();
            loadResumeVersions();
        } catch (e) {
            console.error('Clear error:', e);
            showToast('Failed to wipe data.', 'error');
        }
    };

    // =========================================================
    // 12. FILE UPLOAD & PDF EXTRACTION
    // =========================================================
    window.activePdfExtractions = window.activePdfExtractions || {};

    window.cancelPdfExtraction = function (type) {
        if (window.activePdfExtractions && window.activePdfExtractions[type]) {
            window.activePdfExtractions[type].cancelled = true;
        }
        document.getElementById(`${type}-upload-progress`)?.classList.add('hidden');
        const inputEl = document.getElementById(`${type}-file`);
        if (inputEl) inputEl.value = '';
        showToast('PDF processing cancelled.', 'info');
    };

    function handleFileUpload(event, textareaId, countId, statusId) {
        const file = event.target.files[0];
        if (!file) return;
        const ta = document.getElementById(textareaId);
        const type = textareaId === 'resume-input' ? 'resume' : 'jd';

        if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
            const reader = new FileReader();
            reader.onload = e => {
                ta.value = e.target.result;
                if (type === 'resume') syncActiveResumeText(e.target.result, 'upload');
                else state.jdText = e.target.result;
                UI.updateCharCount(textareaId, countId);
                updateInputStatus(statusId, ta.value);
                showToast('File loaded! ✅', 'success');
            };
            reader.readAsText(file);
        } else if (file.name.endsWith('.pdf')) {
            extractPdfText(file, type, text => {
                ta.value = text;
                if (type === 'resume') syncActiveResumeText(text, 'upload');
                else state.jdText = text;
                UI.updateCharCount(textareaId, countId);
                updateInputStatus(statusId, ta.value);
                showToast('PDF text extracted! ✅', 'success');
            });
        } else {
            showToast('Please upload a .txt or .pdf file.', 'error');
        }
    }

    function extractPdfText(file, type, callback) {
        const MAX_PDF_MB = 10;
        if (file.size > MAX_PDF_MB * 1024 * 1024) {
            showToast(`PDF is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max allowed: ${MAX_PDF_MB} MB.`, 'error');
            return;
        }

        const progressBox = document.getElementById(`${type}-upload-progress`);
        const progressFill = document.getElementById(`${type}-progress-fill`);
        const progressText = document.getElementById(`${type}-progress-text`);

        if (progressBox) progressBox.classList.remove('hidden');
        if (progressFill) progressFill.style.width = '15%';
        if (progressText) progressText.textContent = I18N.t('progReading');

        window.activePdfExtractions[type] = { cancelled: false };

        const reader = new FileReader();
        reader.onload = async e => {
            try {
                const pdfjsLib = window['pdfjs-dist/build/pdf'];
                if (!pdfjsLib) {
                    if (progressBox) progressBox.classList.add('hidden');
                    showToast('PDF parsing library could not be loaded. Please paste text directly.', 'error');
                    return;
                }
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

                let pdf;
                try {
                    pdf = await pdfjsLib.getDocument(new Uint8Array(e.target.result)).promise;
                } catch (pdfErr) {
                    if (progressBox) progressBox.classList.add('hidden');
                    showToast('Could not read this PDF. It may be password-protected or corrupted.', 'error');
                    return;
                }

                if (progressFill) progressFill.style.width = '45%';
                if (progressText) progressText.textContent = I18N.t('progSections');

                const MAX_PAGES = 30;
                const pageCount = Math.min(pdf.numPages, MAX_PAGES);
                let fullText = '';

                for (let i = 1; i <= pageCount; i++) {
                    if (window.activePdfExtractions?.[type]?.cancelled) {
                        if (progressBox) progressBox.classList.add('hidden');
                        return;
                    }
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    const pageStr = content.items.map(item => item.str).join(' ');
                    fullText += pageStr + '\n\n';

                    const pct = Math.round(45 + (i / pageCount) * 50);
                    if (progressFill) progressFill.style.width = `${pct}%`;
                    if (progressText) progressText.textContent = `${I18N.t('progSkills')} (${i}/${pageCount})`;
                }

                if (progressBox) progressBox.classList.add('hidden');
                if (typeof callback === 'function') callback(fullText.trim());

            } catch (err) {
                console.error('PDF error:', err);
                if (progressBox) progressBox.classList.add('hidden');
                showToast('Failed to extract text from PDF.', 'error');
            }
        };
        reader.readAsArrayBuffer(file);
    }

    function setupDragDrop(zoneId, textareaId, countId, statusId) {
        const zone = document.getElementById(zoneId);
        if (!zone) return;
        ['dragenter', 'dragover'].forEach(ev => {
            zone.addEventListener(ev, e => { e.preventDefault(); zone.classList.add('dragover'); });
        });
        ['dragleave', 'drop'].forEach(ev => {
            zone.addEventListener(ev, e => { e.preventDefault(); zone.classList.remove('dragover'); });
        });
        zone.addEventListener('drop', e => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const fakeEvent = { target: { files } };
                handleFileUpload(fakeEvent, textareaId, countId, statusId);
            }
        });
    }

    function updateInputStatus(statusId, text) {
        const el = document.getElementById(statusId);
        if (!el) return;
        if (text.length > 300) {
            el.textContent = '✓ Good length';
            el.className = 'input-status ok';
        } else if (text.length > 50) {
            el.textContent = '⚠️ Short text';
            el.className = 'input-status warn';
        } else {
            el.textContent = '';
            el.className = 'input-status';
        }
    }

    function getCustomizeOptions() {
        const roleLevelEl = document.querySelector('input[name="role-level"]:checked');
        const roleLevel = roleLevelEl ? roleLevelEl.value : 'mid';
        const industry = document.getElementById('industry-select')?.value || 'tech';
        const priorityRaw = document.getElementById('priority-skills-input')?.value || '';
        const prioritySkills = priorityRaw.split(',').map(s => s.trim()).filter(Boolean);
        const targetRole = document.getElementById('target-role-input')?.value.trim() || '';
        const targetCompany = document.getElementById('target-company-input')?.value.trim() || '';
        return { roleLevel, industry, prioritySkills, targetRole, targetCompany };
    }

    function loadSampleData() {
        document.getElementById('resume-input').value = SAMPLE_RESUME;
        document.getElementById('jd-input').value = SAMPLE_JD;
        state.jdText = SAMPLE_JD;
        syncActiveResumeText(SAMPLE_RESUME, 'sample');
        UI.updateCharCount('resume-input', 'resume-char-count');
        UI.updateCharCount('jd-input', 'jd-char-count');
        showToast('Sample data loaded! Click Next or Run Analysis to proceed.', 'success');
    }

    // Modal helpers for Active Resume text
    window.showActiveResumeModal = function () {
        const modal = document.getElementById('resume-viewer-modal');
        const ta = document.getElementById('rv-modal-text');
        if (modal && ta) {
            ta.value = state.resumeText || 'No resume text loaded.';
            modal.classList.remove('hidden');
        }
    };

    window.copyActiveResumeText = function () {
        const ta = document.getElementById('rv-modal-text');
        if (ta) {
            navigator.clipboard.writeText(ta.value);
            showToast('Copied to clipboard! 📋', 'success');
        }
    };

    window.exportActiveResumeText = function () {
        if (!state.resumeText) {
            showToast('No resume loaded to export!', 'warn');
            return;
        }
        const blob = new Blob([state.resumeText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `My_Resume_${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Resume exported as text! 📄', 'success');
    };

    // Toast Notifications
    window.showToast = function (message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => toast.classList.add('visible'), 20);
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    };

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // Sample Data Constants
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

    // =========================================================
    // 12. AUTHENTICATION & ACCOUNT CONTROLLER
    // =========================================================

    function showAuthAlert(elId, msg, type = 'error') {
        const el = document.getElementById(elId);
        if (!el) return;
        el.textContent = msg;
        el.className = `auth-alert ${type}`;
        el.classList.remove('hidden');
    }

    window.switchLoginMode = function (mode) {
        const emailGroup = document.getElementById('login-email-group');
        const phoneGroup = document.getElementById('login-phone-group');
        const tabEmail   = document.getElementById('login-tab-email');
        const tabMobile  = document.getElementById('login-tab-mobile');
        const alertEl    = document.getElementById('login-alert');
        if (alertEl) alertEl.classList.add('hidden');

        if (mode === 'email') {
            emailGroup?.classList.remove('hidden');
            phoneGroup?.classList.add('hidden');
            tabEmail?.classList.add('active');
            tabMobile?.classList.remove('active');
            tabEmail?.setAttribute('aria-selected', 'true');
            tabMobile?.setAttribute('aria-selected', 'false');
            document.getElementById('login-email-input')?.focus();
        } else {
            emailGroup?.classList.add('hidden');
            phoneGroup?.classList.remove('hidden');
            tabEmail?.classList.remove('active');
            tabMobile?.classList.add('active');
            tabEmail?.setAttribute('aria-selected', 'false');
            tabMobile?.setAttribute('aria-selected', 'true');
            document.getElementById('login-phone-input')?.focus();
        }
    };

    window.togglePasswordVisibility = function (inputId, btn) {
        const input = document.getElementById(inputId);
        if (!input) return;
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        if (btn) {
            btn.textContent = isPassword ? '🙈' : '👁️';
            btn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
        }
    };

    window.openOAuthSetupModal = function () {
        document.getElementById('oauth-setup-modal')?.classList.remove('hidden');
    };

    window.closeOAuthSetupModal = function () {
        document.getElementById('oauth-setup-modal')?.classList.add('hidden');
    };

    function updatePasswordStrengthUI(password) {
        if (!window.Auth) return;
        const res = Auth.validatePassword(password);
        const fill = document.getElementById('strength-bar-fill');
        const badge = document.getElementById('strength-badge');
        const scoreLabel = document.getElementById('strength-score-label');

        if (fill && badge) {
            fill.className = 'strength-bar-fill ' + res.strength.toLowerCase();
            badge.textContent = res.strength;
            if (scoreLabel) scoreLabel.textContent = `${res.score}/5`;
        }

        const rules = [
            { id: 'rule-length', met: res.criteria.length },
            { id: 'rule-upper', met: res.criteria.uppercase },
            { id: 'rule-lower', met: res.criteria.lowercase },
            { id: 'rule-number', met: res.criteria.number },
            { id: 'rule-special', met: res.criteria.special }
        ];

        rules.forEach(r => {
            const el = document.getElementById(r.id);
            if (el) el.classList.toggle('met', r.met);
        });
    }

    function initAuthForms() {
        // --- 1. Login Form ---
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const alertEl = document.getElementById('login-alert');
                const spinner = document.getElementById('login-spinner');
                const submitBtn = document.getElementById('login-submit-btn');
                if (alertEl) { alertEl.classList.add('hidden'); alertEl.textContent = ''; }

                const isEmailMode = !document.getElementById('login-email-group').classList.contains('hidden');
                const credential = isEmailMode
                    ? document.getElementById('login-email-input').value.trim()
                    : document.getElementById('login-phone-input').value.trim();
                const password = document.getElementById('login-password-input').value;

                if (!credential) {
                    showAuthAlert('login-alert', isEmailMode ? 'Please enter your Gmail address.' : 'Please enter your mobile number.', 'error');
                    return;
                }
                if (!password) {
                    showAuthAlert('login-alert', 'Please enter your password.', 'error');
                    return;
                }

                try {
                    if (spinner) spinner.classList.remove('hidden');
                    if (submitBtn) submitBtn.disabled = true;

                    const res = await Auth.login({ credential, password });
                    if (res.success) {
                        updateAuthUI();
                        if (window.LocalDB) {
                            LocalDB.setCurrentUserId(res.user.userId);
                            await LocalDB.loadHistory();
                        }
                        restoreActiveResume();
                        updateDashboard();
                        const target = state.redirectAfterLogin || 'dashboard';
                        state.redirectAfterLogin = null;
                        navigateTo(target);
                        if (window.showToast) showToast(`Welcome back, ${res.user.fullName}! 👋`, 'success');
                    }
                } catch (err) {
                    showAuthAlert('login-alert', err.message || 'Unable to complete authentication. Please try again.', 'error');
                } finally {
                    if (spinner) spinner.classList.add('hidden');
                    if (submitBtn) submitBtn.disabled = false;
                }
            });
        }

        // --- 2. Sign Up Form ---
        const signupForm = document.getElementById('signup-form');
        const passInput = document.getElementById('signup-password-input');
        const emailInput = document.getElementById('signup-email-input');
        const phoneInput = document.getElementById('signup-phone-input');
        const confirmInput = document.getElementById('signup-confirm-input');

        if (passInput) {
            passInput.addEventListener('input', (e) => {
                updatePasswordStrengthUI(e.target.value);
            });
        }

        if (emailInput) {
            emailInput.addEventListener('input', (e) => {
                const val = e.target.value.trim();
                const feedback = document.getElementById('signup-email-feedback');
                if (!feedback) return;
                if (!val) {
                    feedback.textContent = '';
                    feedback.className = 'field-feedback';
                    return;
                }
                const res = Auth.validateGmail(val);
                if (res.valid) {
                    feedback.textContent = '✓ Valid Gmail address';
                    feedback.className = 'field-feedback success';
                } else {
                    feedback.textContent = res.message;
                    feedback.className = 'field-feedback error';
                }
            });
        }

        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                const val = e.target.value.trim();
                const feedback = document.getElementById('signup-phone-feedback');
                if (!feedback) return;
                if (!val) {
                    feedback.textContent = '';
                    feedback.className = 'field-feedback';
                    return;
                }
                const res = Auth.validateIndianPhone(val);
                if (res.valid) {
                    feedback.textContent = `✓ Valid Indian mobile (${res.canonical})`;
                    feedback.className = 'field-feedback success';
                } else {
                    feedback.textContent = res.message;
                    feedback.className = 'field-feedback error';
                }
            });
        }

        if (confirmInput) {
            confirmInput.addEventListener('input', (e) => {
                const val = e.target.value;
                const orig = passInput ? passInput.value : '';
                const feedback = document.getElementById('signup-confirm-feedback');
                if (!feedback) return;
                if (!val) {
                    feedback.textContent = '';
                    feedback.className = 'field-feedback';
                    return;
                }
                const match = Auth.checkPasswordMatch(orig, val);
                if (match.match) {
                    feedback.textContent = '✓ Passwords match';
                    feedback.className = 'field-feedback success';
                } else {
                    feedback.textContent = match.message;
                    feedback.className = 'field-feedback error';
                }
            });
        }

        if (signupForm) {
            signupForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const alertEl = document.getElementById('signup-alert');
                const spinner = document.getElementById('signup-spinner');
                const submitBtn = document.getElementById('signup-submit-btn');
                if (alertEl) { alertEl.classList.add('hidden'); alertEl.textContent = ''; }

                const fullName = document.getElementById('signup-name-input').value.trim();
                const email = document.getElementById('signup-email-input').value.trim();
                const phone = document.getElementById('signup-phone-input').value.trim();
                const password = document.getElementById('signup-password-input').value;
                const confirmPassword = document.getElementById('signup-confirm-input').value;
                const terms = document.getElementById('signup-terms').checked;

                if (!terms) {
                    showAuthAlert('signup-alert', 'Please accept the Terms of Service to continue.', 'error');
                    return;
                }

                try {
                    if (spinner) spinner.classList.remove('hidden');
                    if (submitBtn) submitBtn.disabled = true;

                    const res = await Auth.signUp({ fullName, email, phone, password, confirmPassword });
                    if (res.success) {
                        updateAuthUI();
                        if (window.LocalDB) {
                            LocalDB.setCurrentUserId(res.user.userId);
                            await LocalDB.loadHistory();
                        }
                        restoreActiveResume();
                        updateDashboard();
                        navigateTo('dashboard');
                        if (window.showToast) showToast(`Account created! Welcome, ${res.user.fullName}! 🎉`, 'success');
                    }
                } catch (err) {
                    showAuthAlert('signup-alert', err.message || 'Unable to complete registration. Please try again.', 'error');
                } finally {
                    if (spinner) spinner.classList.add('hidden');
                    if (submitBtn) submitBtn.disabled = false;
                }
            });
        }

        // --- 3. Forgot Password Form ---
        const forgotForm = document.getElementById('forgot-password-form');
        if (forgotForm) {
            forgotForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const alertEl = document.getElementById('forgot-alert');
                const email = document.getElementById('forgot-email-input').value.trim();
                const resetSection = document.getElementById('forgot-reset-section');
                const isVerifying = resetSection.classList.contains('hidden');

                if (isVerifying) {
                    try {
                        await Auth.requestPasswordReset(email);
                        resetSection.classList.remove('hidden');
                        showAuthAlert('forgot-alert', 'Account identified. Please verify your mobile number and set a new password.', 'success');
                        const btn = document.getElementById('forgot-submit-btn');
                        if (btn) btn.querySelector('.btn-text').textContent = 'Save New Password';
                    } catch (err) {
                        showAuthAlert('forgot-alert', err.message, 'error');
                    }
                } else {
                    const phone = document.getElementById('forgot-phone-verify').value.trim();
                    const newPass = document.getElementById('forgot-new-pass').value;
                    const passCheck = Auth.validatePassword(newPass);
                    if (!passCheck.valid) {
                        showAuthAlert('forgot-alert', passCheck.message, 'error');
                        return;
                    }
                    try {
                        const user = await Auth.findUserByEmail(email);
                        if (!user) throw new Error('Account not found.');
                        const phoneCheck = Auth.validateIndianPhone(phone);
                        if (!phoneCheck.valid || user.phone.replace(/\s+/g, '') !== phoneCheck.canonical.replace(/\s+/g, '')) {
                            throw new Error('Mobile number does not match registered account.');
                        }
                        const { hashHex, saltHex } = await Auth.hashPassword(newPass);
                        user.passwordHash = hashHex;
                        user.passwordSalt = saltHex;
                        user.updatedAt = Date.now();
                        if (window.LocalDB) {
                            await LocalDB.saveUser(user);
                        }
                        showAuthAlert('forgot-alert', 'Password reset successfully! Redirecting to sign in...', 'success');
                        setTimeout(() => {
                            navigateTo('login');
                        }, 1200);
                    } catch (err) {
                        showAuthAlert('forgot-alert', err.message, 'error');
                    }
                }
            });
        }

        // --- 4. Profile Edit Form ---
        const profileForm = document.getElementById('profile-edit-form');
        if (profileForm) {
            profileForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = document.getElementById('profile-name-input').value.trim();
                const phone = document.getElementById('profile-phone-input').value.trim();
                try {
                    await Auth.updateProfile({ fullName: name, phone });
                    updateAuthUI();
                    showAuthAlert('profile-alert', 'Profile updated successfully! ✅', 'success');
                    if (window.showToast) showToast('Profile updated!', 'success');
                } catch (err) {
                    showAuthAlert('profile-alert', err.message, 'error');
                }
            });
        }

        // --- 5. Change Password Form ---
        const changePassForm = document.getElementById('change-password-form');
        if (changePassForm) {
            changePassForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const current = document.getElementById('cp-current-input').value;
                const newPass = document.getElementById('cp-new-input').value;
                const confirm = document.getElementById('cp-confirm-input').value;
                try {
                    await Auth.changePassword({ currentPassword: current, newPassword: newPass, confirmPassword: confirm });
                    showAuthAlert('password-change-alert', 'Password updated successfully! 🔒', 'success');
                    if (window.showToast) showToast('Password changed successfully!', 'success');
                    changePassForm.reset();
                } catch (err) {
                    showAuthAlert('password-change-alert', err.message, 'error');
                }
            });
        }
    }

    window.updateAuthUI = function () {
        if (!window.Auth) return;
        const user = Auth.getCurrentUser();
        const sidebarWidget = document.getElementById('sidebar-user-widget');

        if (user) {
            const initial = (user.fullName || 'U').charAt(0).toUpperCase();
            if (sidebarWidget) sidebarWidget.style.display = 'flex';

            const suwAvatar = document.getElementById('suw-avatar');
            if (suwAvatar) suwAvatar.textContent = initial;

            const suwName = document.getElementById('suw-name');
            if (suwName) suwName.textContent = user.fullName;

            const suwEmail = document.getElementById('suw-email');
            if (suwEmail) suwEmail.textContent = user.email;

            const mobileAvatar = document.getElementById('mobile-user-avatar');
            if (mobileAvatar) mobileAvatar.textContent = initial;

            // Account view fields
            const accAvatar = document.getElementById('account-avatar-large');
            if (accAvatar) accAvatar.textContent = initial;

            const accName = document.getElementById('account-user-name');
            if (accName) accName.textContent = user.fullName;

            const accBadgeEmail = document.getElementById('account-badge-email');
            if (accBadgeEmail) accBadgeEmail.textContent = `✉️ ${user.email}`;

            const accBadgePhone = document.getElementById('account-badge-phone');
            if (accBadgePhone) accBadgePhone.textContent = `📱 ${user.phone}`;

            const profNameInput = document.getElementById('profile-name-input');
            if (profNameInput) profNameInput.value = user.fullName;

            const profEmailInput = document.getElementById('profile-email-readonly');
            if (profEmailInput) profEmailInput.value = user.email;

            const profPhoneInput = document.getElementById('profile-phone-input');
            if (profPhoneInput) profPhoneInput.value = user.phone;
        } else {
            if (sidebarWidget) sidebarWidget.style.display = 'none';
        }
    };

    window.handleLogoutClick = async function () {
        if (!confirm('Are you sure you want to log out? Your saved career history remains secure on this device.')) {
            return;
        }
        if (window.Auth) {
            await Auth.logout();
        }
        // Securely wipe active workspace memory state
        state.resumeText = '';
        state.jdText = '';
        state.result = null;

        const resumeInput = document.getElementById('resume-input');
        if (resumeInput) resumeInput.value = '';
        const studioInput = document.getElementById('studio-resume-input');
        if (studioInput) studioInput.value = '';
        const jdInput = document.getElementById('jd-input');
        if (jdInput) jdInput.value = '';

        updateAuthUI();
        updateDashboard();
        navigateTo('login');
        if (window.showToast) showToast('Logged out securely. 🔒', 'info');
    };

})();

