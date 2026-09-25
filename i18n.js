// ============================================================
// i18n.js — Internationalization (English + Hindi)
// ResumeMatch AI — Comprehensive Localization System v4
// Natural, friendly, non-technical phrasing in both languages.
// ============================================================

const TRANSLATIONS = {
    en: {
        // App Identity
        appName: "HireLens",
        appTagline: "Align your skills. Match your career.",
        appPositioning: "AI-powered career alignment and job-readiness platform",
        aiBadge: "🎯 Career Alignment Engine",
        langToggle: "हिंदी",
        themeToggle: "Theme",
        privacyGuarantee: "Your resume stays on your device.",
        privacyNotice: "100% in-browser processing. Zero external AI APIs. No cloud telemetry.",
        dashStatusAnswer: "Where am I in my job search?",
        cardTargetRole: "Target Role",
        cardAlignmentStatus: "Alignment Status",
        cardTopSkillGap: "Top Skill Gap",
        cardResumeHealth: "Resume Health",
        cardInterviewReady: "Interview Readiness",
        cardNextBestAction: "Next Best Action",
        tabCareerAlignment: "🎯 Career Alignment Report",
        tabActionPlan: "📅 Skill Gap Roadmap",
        tabInterviewReady: "🎤 Interview Ready",
        tabExplainScore: "💡 Why this score?",

        // Global Navigation
        navMain: "MAIN",
        navSystem: "SYSTEM",
        navDashboard: "Dashboard",
        navAnalyze: "Analyze Resume",
        navJobMatch: "Job Match",
        navStudio: "Resume Studio",
        navInsights: "Career Insights",
        navApplications: "Applications",
        navVersions: "Resume Versions",
        navSettings: "Settings",
        navHelp: "Help & Guide",
        navAccount: "Account & Profile",
        navLogin: "Sign In",
        navSignup: "Create Account",
        navLogout: "Log Out",
        authSignInTitle: "Sign in to HireLens",
        authSignInSub: "Access your private, in-browser career workspace",
        authSignUpTitle: "Create your HireLens Account",
        authSignUpSub: "100% private, client-side encrypted career intelligence",
        authForgotPassword: "Forgot Password?",
        authRememberMe: "Keep me signed in on this device",
        authDontHaveAccount: "Don't have an account?",
        authAlreadyHaveAccount: "Already have an account?",
        authFullNameLabel: "Full Name",
        authEmailLabel: "Gmail Address",
        authPhoneLabel: "Mobile Number (+91)",
        authPasswordLabel: "Password",
        authConfirmPasswordLabel: "Confirm Password",
        authTermsLabel: "I accept the Privacy Policy & Terms of Service",
        authBtnSignIn: "Sign In",
        authBtnSignUp: "Create Free Account",
        authBtnReset: "Send Reset Instructions",
        authProfileTitle: "Account & Profile",
        authProfileSub: "Manage your personal profile and local cryptographic credentials",
        authEditProfileBtn: "Update Profile",
        authChangePassBtn: "Change Password",
        authSecurityBadge: "Client-Side Cryptographic Security Active",

        // Mobile Bottom Nav
        mNavHome: "Home",
        mNavResume: "Resume",
        mNavMatch: "Match",
        mNavStudio: "Studio",
        mNavMore: "More",

        // Active Resume Sidebar Widget
        activeResumeLabel: "Active Resume",
        noActiveResume: "No resume loaded",
        btnSwitchResume: "Switch",

        // Dashboard
        dashWelcomeTitle: "Welcome to HireLens 👋",
        dashWelcomeSub: "Align your skills, bridge critical gaps, and get ready for your next career move.",
        dashPrimaryCTA: "Run Career Alignment Analysis",
        dashSecImprove: "✨ Optimize in Studio",
        dashSecMatch: "🎯 Match With Target Job",
        dashSecVersions: "📚 View My Resumes",

        dashStatusTitle: "Resume Status",
        dashStatusUploaded: "Resume Loaded",
        dashStatusEmpty: "No Resume Yet",
        dashLastAnalyzed: "Last Analyzed",
        dashNever: "Never",
        dashSkillsFound: "Skills Detected",
        dashIssuesFound: "Issues Found",

        dashCurrentTitle: "Current Active Resume",
        dashCurrentDesc: "The resume currently loaded across all analysis and studio tools.",
        dashBtnView: "View Text",
        dashBtnAnalyze: "Analyze",
        dashBtnImprove: "Improve",
        dashBtnExport: "Export",
        dashBtnReplace: "Replace",

        dashScoresTitle: "Recent Analysis Summary",
        dashCardQuality: "Resume Quality",
        dashCardMatch: "Job Match",
        dashCardMissing: "Missing Skills",
        dashCardIssues: "Writing Issues",

        dashNextTitle: "Recommended Next Step",
        dashNextHelp: "Our guided engine recommends this single action based on your latest analysis.",
        dashNextEmpty: "Upload your resume to receive your personalized next step.",
        dashNextActionBtn: "Take Action",

        // Onboarding
        onboardingTitle: "Welcome to ResumeMatch AI",
        onboardingSub: "Your private, browser-based resume optimization guide. Let's get you set up in seconds!",
        obStep1Title: "What would you like to do first?",
        obCard1Title: "Analyze My Resume",
        obCard1Desc: "Check structure, detected skills, formatting, and overall quality.",
        obCard2Title: "Match With a Job",
        obCard2Desc: "Compare your resume against a specific job description to find missing skills.",
        obCard3Title: "Improve My Resume",
        obCard3Desc: "Fix grammar, polish bullet points, and humanize phrasing.",
        obStep2Title: "Upload or Paste Your Resume",
        obStep2Desc: "All processing happens securely inside your browser. No files leave your device.",
        obStep3Title: "Add Target Job (Optional)",
        obStep3Desc: "Paste a job description now, or skip this step to focus only on your resume.",
        obStep3Skip: "Skip this step for now →",
        obStep4Title: "Your Resume Is Ready!",
        obStep4Sub: "Click below to run your instant rule-based analysis.",
        obBtnBack: "Back",
        obBtnNext: "Continue",
        obBtnStart: "Analyze Resume Now 🚀",
        obBtnDismiss: "Close Tour",

        // Analyze Resume Wizard
        wizTitle: "Analyze Your Resume",
        wizSubtitle: "A 3-step guided check to uncover your resume's strengths, structure, and job readiness.",
        wizStep1: "1. Resume",
        wizStep2: "2. Job Description",
        wizStep3: "3. Analysis",

        wizUploadHeader: "Step 1: Upload or Paste Your Resume",
        wizUploadSub: "Drop a PDF or plain text resume below, or paste your text directly.",
        uploadDropText: "Drag & drop your resume PDF or TXT here, or click to browse",
        uploadFileBtn: "Browse File",
        uploadMaxNotice: "Supports .pdf and .txt files up to 10 MB. 100% processed in your browser.",
        resumePlaceholder: "Paste your resume text here (Skills, Experience, Education, Projects)...",
        charCountLabel: "characters",
        btnNextStep2: "Next: Choose Job Description →",

        wizJDHeader: "Step 2: Add Job Description (Optional)",
        wizJDSub: "Compare against a target role, or skip to analyze your resume's standalone quality.",
        jdPlaceholder: "Paste job description from LinkedIn, Indeed, or company careers page...",
        btnSkipJD: "Skip & Analyze Resume Only",
        btnNextStep3: "Next: Run Full Match Analysis →",

        wizStep3Header: "Step 3: Ready to Analyze",
        wizStep3Sub: "Our deterministic engine will scan your resume for skills, formatting, and clarity.",
        btnRunAnalysis: "🔍 Run Resume Analysis",
        btnTrySample: "🧪 Try Sample Data",
        btnClearAll: "🗑 Clear All",

        // Progressive Upload States
        progReading: "Reading resume file...",
        progSections: "Finding resume sections...",
        progSkills: "Analyzing detected skills...",
        progReady: "Resume parsed successfully!",

        // Results Dashboard
        resultsHeaderTitle: "Resume Analysis Results",
        resultsHeaderSub: "Transparent, rule-based compatibility evaluation for your resume.",
        scoreDisclaimer: "This score is an estimated resume compatibility and quality indicator based on keyword, skill, and structure rules. It does not represent hiring probability or guarantee an employer's decision.",
        btnDownloadReport: "📥 Download Report",
        btnReanalyze: "🔄 Re-Analyze Resume",
        btnOpenStudio: "✨ Improve in Studio →",

        // Results Tabs
        tabOverview: "⚡ Overview",
        tabSkills: "🧬 Skills Found",
        tabATS: "🤖 ATS Compatibility",
        tabStructure: "📋 Resume Structure",
        tabRoadmap: "🚀 Growth & Interview",

        // Skills Tab
        skillsMatchedTitle: "Matched Skills",
        skillsMissingTitle: "Missing Skills",
        skillsRelatedTitle: "Related / Ecosystem Skills",
        badgeExactMatch: "Exact Match",
        badgeAliasMatch: "Similar Name",
        badgeRelatedMatch: "Related Technology",

        // ATS Compatibility
        atsTitle: "Estimated ATS Compatibility",
        atsExplain: "This is an estimate based on resume structure, formatting, keywords, and detected sections. It does not guarantee that any particular ATS or employer will accept the resume.",
        atsFormatRisks: "Formatting & Layout Signals",
        atsKeywordsTitle: "Key Job Keywords",

        // Resume Structure
        structTitle: "Section Checklist",
        structContact: "Contact Details",
        structSummary: "Professional Summary",
        structSkills: "Skills Section",
        structExp: "Work Experience",
        structProjects: "Projects & Highlights",
        structEdu: "Education & Degrees",
        statusFound: "Found",
        statusNeedsWork: "Needs Work",
        statusMissing: "Missing",

        // Resume Studio
        studioTitle: "Resume Quality Studio",
        studioSubtitle: "Refine bullet points, check grammar, review AI writing signals, and humanize phrasing with strict fact preservation.",
        subtabImprove: "✨ Improve Resume",
        subtabGrammar: "📝 Grammar Check",
        subtabAISignals: "🤖 AI Writing Signals",
        subtabHumanize: "👤 Humanize Resume",
        subtabQuality: "🔍 Quality & Bullets",
        subtabCompare: "↔ Before & After",

        // Humanizer
        humanizeModeLabel: "Humanize Tone:",
        modeSimple: "Simple",
        modeProfessional: "Professional",
        modeNatural: "Natural",
        modeConcise: "Concise",
        modeImpact: "Impact-Focused",
        preserveFactsNotice: "🔒 Strict Fact Lock Active: Numbers, metrics, companies, dates, and technologies will NEVER be fabricated or changed.",
        btnAcceptSuggestion: "✓ Accept",
        btnRejectSuggestion: "✗ Dismiss",
        btnEditSuggestion: "✎ Edit",
        btnAcceptAll: "✓ Accept All Suggestions",
        btnReanalyzeAfterEdit: "🔄 Re-analyze Resume with Changes",

        // AI Writing Signals
        aiSignalsTitle: "AI Writing Signals",
        aiSignalsExplain: "This feature identifies writing patterns that may appear generic or AI-like (such as corporate clichés, buzzwords, and uniform sentence lengths). It cannot reliably determine who or what created the text.",
        aiLowSignal: "Low AI Signals",
        aiModSignal: "Moderate AI Signals",
        aiHighSignal: "Elevated AI Signals",

        // Job Match Page
        jmTitle: "Match Resume With a Job",
        jmSubtitle: "See exactly how well your resume matches any specific job posting with transparent match reasons.",
        jmSelectResume: "Select Resume:",
        jmPasteJD: "Paste Job Description:",
        jmBtnAnalyze: "🎯 Analyze Job Match",
        jmTierMustHave: "Must-Have Requirements",
        jmTierPreferred: "Preferred / Nice-to-Have",
        jmTierQualifications: "Qualifications & Degrees",
        jmTierResponsibilities: "Key Responsibilities",
        jmTierTools: "Tools & Technologies",
        jmTierSoftSkills: "Soft Skills & Team Fit",

        // Career Insights
        ciTitle: "Career Insights & Growth Signals",
        ciSubtitle: "Constructive signals to understand skill freshness, learning consistency, and career trajectory. These are informative indicators, not predictions of future outcomes.",
        ciDisclaimer: "These are signals based on the information available in your resume. They are not predictions of your future career outcome.",
        ciSignalFreshness: "Skill Freshness",
        ciSignalLearning: "Learning Consistency",
        ciSignalRelevance: "Technology Relevance",
        ciSignalExperience: "Experience Consistency",
        ciRoadmapTitle: "6–12 Month Growth & Recovery Roadmap",

        // Application Tracker
        appTrackerTitle: "Job Application Tracker",
        appTrackerSubtitle: "Track applications across each pipeline stage from saved to offer, stored privately in your browser.",
        btnAddApplication: "+ Add Job Application",
        filterAll: "All",
        filterSaved: "Saved",
        filterApplied: "Applied",
        filterOA: "Online Assessment",
        filterInterview: "Interview",
        filterSelected: "Selected / Offer",
        filterRejected: "Rejected",

        // Resume Versions
        versionsTitle: "Resume Versions",
        versionsSubtitle: "Create and manage tailored resume variations for different roles (e.g., Frontend, Full Stack, Data).",
        btnSaveNewVersion: "+ Save Current Resume as New Version",
        btnLoadToMatcher: "Load into Matcher",
        btnLoadToStudio: "Load into Studio",
        btnDuplicateVersion: "Duplicate",
        btnRenameVersion: "Rename",
        btnDeleteVersion: "Delete",

        // Settings Page
        settingsTitle: "Settings & Privacy",
        settingsSubtitle: "Customize your visual appearance, language, local data backup, and privacy preferences.",
        secAppearance: "Appearance",
        themeModeDark: "Dark Charcoal",
        themeModeLight: "Crisp Light",
        themeModeSystem: "System Default",
        secLanguage: "Language / भाषा",
        secDataManagement: "Data Management (IndexedDB)",
        dataDesc: "All your resumes, job descriptions, analysis history, and tracked applications are stored locally in your browser's IndexedDB.",
        btnExportBackup: "📥 Export Complete Data Backup (JSON)",
        btnImportBackup: "📤 Import Data Backup",
        btnClearData: "🗑 Clear All Local Data",
        clearDataWarning: "Warning: This permanently deletes all saved resumes, applications, and analyses from this browser.",
        secPrivacy: "Privacy & Architecture Transparency",
        privacyDetails: "ResumeMatch AI operates 100% in your browser. No resume text, job posting, or personal notes are uploaded to any server. PDF parsing, grammar analysis, keyword matching, and calculations run strictly client-side.",
        secAbout: "About ResumeMatch AI",
        aboutVersion: "Version 4.0.0 · Production Career Engine",

        // Help Center
        helpTitle: "Help Center & User Guide",
        helpSubtitle: "Clear, beginner-friendly explanations of every feature, score, and recommendation in ResumeMatch AI.",
        btnRestartTour: "▶ Restart First-Time Tour",
        helpTopic1: "Getting Started with Resume Analysis",
        helpTopic1Body: "Start by uploading your resume in PDF or plain text format on the Analyze Resume page. Our system extracts your skills, work history, and formatting structure client-side, showing your strengths and areas to polish.",
        helpTopic2: "How the Match Score Works",
        helpTopic2Body: "The match score evaluates hard skills (40%), experience level (20%), domain relevance (15%), soft skills (15%), and ATS keywords (10%). It is an estimated compatibility indicator, not a hiring prediction.",
        helpTopic3: "Understanding ATS Compatibility",
        helpTopic3Body: "Applicant Tracking Systems (ATS) scan for plain text, clear section headers, standard dates, and relevant keywords. We simulate these checks and flag formatting risks like missing headers or short descriptions.",
        helpTopic4: "Understanding AI Writing Signals",
        helpTopic4Body: "We identify corporate clichés, buzzwords, and robotic sentence patterns. We do not claim 100% AI detection; instead, we point out generic phrasing that recruiters might find unconvincing.",
        helpTopic5: "How Humanize Works & Strict Fact Lock",
        helpTopic5Body: "Our Humanizer transforms overly formal or passive sentences into natural, conversational, or impact-driven English. Crucially, it NEVER invents numbers, percentages, companies, or accomplishments.",
        helpTopic6: "Privacy & Security Guarantee",
        helpTopic6Body: "Your data stays on your device. We do not store your resumes in the cloud. You can export a full JSON backup of your data anytime from the Settings page.",

        // Common Actions & Empty States
        emptyResumeTitle: "You haven't added a resume yet",
        emptyResumeDesc: "Upload your resume in PDF or text to start analyzing and improving it.",
        emptyJDTitle: "No job description provided",
        emptyJDDesc: "Add a job description to see how closely your resume aligns with the role.",
        emptyAppsTitle: "No applications tracked yet",
        emptyAppsDesc: "Start organizing your job search pipeline from initial application to offer.",
        emptyVersionsTitle: "No resume versions saved",
        emptyVersionsDesc: "Save different versions of your resume tailored for specific job domains.",
        btnUploadResume: "Upload Resume",
        btnAddJD: "Add Job Description",
        btnAddApp: "Add First Application",

        // Error Feedback
        errReadFailedTitle: "We couldn't read this file",
        errReadFailedReasons: "Possible reasons:\n• The file may be corrupted or password-protected\n• Scanned PDF images without selectable text\n• File size exceeds 10 MB",
        btnTryAnotherFile: "Try Another File",
        errShortResume: "Please enter at least 50 characters of resume text to analyze.",
        errShortJD: "Please enter at least 30 characters of job description text.",

        // Footer
        footerText: "Crafted for job seekers worldwide · 100% Client-Side Processing · Local Browser Storage · Privacy-Guaranteed Architecture",
        footerDisclaimer: "ResumeMatch AI is a rule-based career guidance platform. Compatibility scores and suggestions are estimates designed to help improve your application materials."
    },

    hi: {
        // App Identity
        appName: "HireLens",
        appTagline: "Align your skills. Match your career.",
        appPositioning: "AI-संचालित करियर अलाइनमेंट और जॉब-रेडीनेस प्लेटफॉर्म",
        aiBadge: "🎯 करियर अलाइनमेंट इंजन",
        langToggle: "English",
        themeToggle: "थीम",
        privacyGuarantee: "आपका रिज्यूमे आपके डिवाइस पर ही रहता है।",
        privacyNotice: "100% ब्राउज़र में प्रोसेसिंग। कोई थर्ड-पार्टी AI APIs नहीं। जीरो क्लाउड ट्रैकिंग।",
        dashStatusAnswer: "मैं अपनी जॉब खोज में कहाँ हूँ?",
        cardTargetRole: "टारगेट रोल",
        cardAlignmentStatus: "अलाइनमेंट स्थिति",
        cardTopSkillGap: "मुख्य स्किल गैप",
        cardResumeHealth: "रिज्यूमे स्कोर",
        cardInterviewReady: "इंटरव्यू तैयारी",
        cardNextBestAction: "अगला सर्वोत्तम कदम",
        tabCareerAlignment: "🎯 करियर अलाइनमेंट रिपोर्ट",
        tabActionPlan: "📅 स्किल गैप रोडमैप",
        tabInterviewReady: "🎤 इंटरव्यू तैयारी",
        tabExplainScore: "💡 यह स्कोर क्यों?",

        // Global Navigation
        navMain: "मुख्य",
        navSystem: "सिस्टम",
        navDashboard: "डैशबोर्ड",
        navAnalyze: "रिज्यूमे एनालिसिस",
        navJobMatch: "जॉब मैच",
        navStudio: "रिज्यूमे स्टूडियो",
        navInsights: "करियर इनसाइट्स",
        navApplications: "एप्लीकेशन्स",
        navVersions: "रिज्यूमे वर्शन्स",
        navSettings: "सेटिंग्स",
        navHelp: "मदद और गाइड",
        navAccount: "खाता और प्रोफ़ाइल",
        navLogin: "साइन इन करें",
        navSignup: "खाता बनाएं",
        navLogout: "लॉग आउट",
        authSignInTitle: "HireLens में साइन इन करें",
        authSignInSub: "अपने व्यक्तिगत और सुरक्षित करियर कार्यक्षेत्र तक पहुँचें",
        authSignUpTitle: "HireLens खाता बनाएं",
        authSignUpSub: "100% निजी, ब्राउज़र-स्तरीय एन्क्रिप्टेड करियर टूल",
        authForgotPassword: "पासवर्ड भूल गए?",
        authRememberMe: "इस डिवाइस पर मुझे साइन इन रखें",
        authDontHaveAccount: "खाता नहीं है?",
        authAlreadyHaveAccount: "क्या आपके पास पहले से खाता है?",
        authFullNameLabel: "पूरा नाम",
        authEmailLabel: "जीमेल पता",
        authPhoneLabel: "मोबाइल नंबर (+91)",
        authPasswordLabel: "पासवर्ड",
        authConfirmPasswordLabel: "पासवर्ड की पुष्टि करें",
        authTermsLabel: "मैं गोपनीयता नीति और सेवा की शर्तें स्वीकार करता हूँ",
        authBtnSignIn: "साइन इन करें",
        authBtnSignUp: "निःशुल्क खाता बनाएं",
        authBtnReset: "रीसेट निर्देश भेजें",
        authProfileTitle: "खाता और प्रोफ़ाइल",
        authProfileSub: "अपनी व्यक्तिगत प्रोफ़ाइल और क्रेडेंशियल प्रबंधित करें",
        authEditProfileBtn: "प्रोफ़ाइल अपडेट करें",
        authChangePassBtn: "पासवर्ड बदलें",
        authSecurityBadge: "क्लाइंट-साइड क्रिप्टोग्राफिक सुरक्षा सक्रिय",

        // Mobile Bottom Nav
        mNavHome: "होम",
        mNavResume: "रिज्यूमे",
        mNavMatch: "मैच",
        mNavStudio: "स्टूडियो",
        mNavMore: "अधिक",

        // Active Resume Sidebar Widget
        activeResumeLabel: "सक्रिय रिज्यूमे",
        noActiveResume: "कोई रिज्यूमे लोड नहीं है",
        btnSwitchResume: "बदलें",

        // Dashboard
        dashWelcomeTitle: "HireLens में आपका स्वागत है 👋",
        dashWelcomeSub: "अपने कौशल का सही मिलान करें, कमियों को दूर करें और आत्मविश्वास से इंटरव्यू के लिए तैयार हों।",
        dashPrimaryCTA: "करियर अलाइनमेंट एनालिसिस शुरू करें",
        dashSecImprove: "✨ स्टूडियो में सुधारें",
        dashSecMatch: "🎯 जॉब से मैच करें",
        dashSecVersions: "📚 मेरे रिज्यूमे देखें",

        dashStatusTitle: "रिज्यूमे स्थिति",
        dashStatusUploaded: "रिज्यूमे लोड हो चुका है",
        dashStatusEmpty: "अभी कोई रिज्यूमे नहीं है",
        dashLastAnalyzed: "अंतिम एनालिसिस",
        dashNever: "कभी नहीं",
        dashSkillsFound: "पहचाने गए स्किल्स",
        dashIssuesFound: "सुधार योग्य बिंदु",

        dashCurrentTitle: "सक्रिय रिज्यूमे",
        dashCurrentDesc: "यह रिज्यूमे वर्तमान में सभी एनालिसिस और स्टूडियो टूल्स में लोड है।",
        dashBtnView: "टेक्स्ट देखें",
        dashBtnAnalyze: "एनालिसिस",
        dashBtnImprove: "सुधारें",
        dashBtnExport: "एक्सपोर्ट",
        dashBtnReplace: "बदलें",

        dashScoresTitle: "हालिया एनालिसिस का सारांश",
        dashCardQuality: "रिज्यूमे क्वालिटी",
        dashCardMatch: "जॉब मैच",
        dashCardMissing: "छूटे हुए स्किल्स",
        dashCardIssues: "लिखावट की कमियां",

        dashNextTitle: "अनुशंसित अगला कदम",
        dashNextHelp: "हमारा सिस्टम आपके हालिया एनालिसिस के आधार पर यह कदम उठाने की सलाह देता है।",
        dashNextEmpty: "व्यक्तिगत सुझाव पाने के लिए पहले अपना रिज्यूमे अपलोड करें।",
        dashNextActionBtn: "कदम उठाएं",

        // Onboarding
        onboardingTitle: "ResumeMatch AI में आपका स्वागत है",
        onboardingSub: "आपका व्यक्तिगत, ब्राउज़र-आधारित रिज्यूमे गाइड। आइए कुछ ही सेकंड में शुरुआत करें!",
        obStep1Title: "आप पहले क्या करना चाहते हैं?",
        obCard1Title: "रिज्यूमे का एनालिसिस करें",
        obCard1Desc: "स्ट्रक्चर, मिले हुए स्किल्स, फॉर्मेटिंग और समग्र गुणवत्ता की जांच करें।",
        obCard2Title: "जॉब डिस्क्रिप्शन से मैच करें",
        obCard2Desc: "किसी जॉब से तुलना करके छूटे हुए आवश्यक स्किल्स का पता लगाएं।",
        obCard3Title: "रिज्यूमे बेहतर बनाएं",
        obCard3Desc: "व्याकरण ठीक करें, बुलेट पॉइंट्स सुधारें और भाषा को स्वाभाविक बनाएं।",
        obStep2Title: "अपना रिज्यूमे अपलोड या पेस्ट करें",
        obStep2Desc: "सारा काम आपके अपने ब्राउज़र में सुरक्षित रूप से होता है। कोई डेटा बाहर नहीं जाता।",
        obStep3Title: "टारगेट जॉब जोड़ें (वैकल्पिक)",
        obStep3Desc: "जॉब डिस्क्रिप्शन अभी पेस्ट करें, या केवल रिज्यूमे देखने के लिए इसे छोड़ दें।",
        obStep3Skip: "इस कदम को अभी छोड़ें →",
        obStep4Title: "आपका रिज्यूमे तैयार है!",
        obStep4Sub: "तत्काल नियम-आधारित एनालिसिस देखने के लिए नीचे क्लिक करें।",
        obBtnBack: "पीछे",
        obBtnNext: "आगे बढ़ें",
        obBtnStart: "रिज्यूमे एनालिसिस शुरू करें 🚀",
        obBtnDismiss: "टूर बंद करें",

        // Analyze Resume Wizard
        wizTitle: "अपने रिज्यूमे का एनालिसिस करें",
        wizSubtitle: "3 चरणों में अपने रिज्यूमे की मजबूती, बनावट और तैयारी की जांच करें।",
        wizStep1: "1. रिज्यूमे",
        wizStep2: "2. जॉब डिस्क्रिप्शन",
        wizStep3: "3. एनालिसिस",

        wizUploadHeader: "चरण 1: अपना रिज्यूमे अपलोड या पेस्ट करें",
        wizUploadSub: "नीचे PDF या टेक्स्ट फाइल ड्रॉप करें, या सीधे टेक्स्ट पेस्ट करें।",
        uploadDropText: "PDF या TXT फाइल यहां खींचकर लाएं, या चुनने के लिए क्लिक करें",
        uploadFileBtn: "फाइल चुनें",
        uploadMaxNotice: "10 MB तक की .pdf और .txt फाइलों का समर्थन। 100% आपके ब्राउज़र में प्रोसेस।",
        resumePlaceholder: "अपना रिज्यूमे टेक्स्ट यहां पेस्ट करें (स्किल्स, अनुभव, शिक्षा, प्रोजेक्ट्स)...",
        charCountLabel: "अक्षर",
        btnNextStep2: "अगला: जॉब डिस्क्रिप्शन चुनें →",

        wizJDHeader: "चरण 2: जॉब डिस्क्रिप्शन जोड़ें (वैकल्पिक)",
        wizJDSub: "टारगेट रोल से तुलना करें, या केवल रिज्यूमे क्वालिटी देखने के लिए छोड़ दें।",
        jdPlaceholder: "LinkedIn, Indeed या कंपनी पेज से जॉब डिस्क्रिप्शन यहां पेस्ट करें...",
        btnSkipJD: "छोड़ें और केवल रिज्यूमे का एनालिसिस करें",
        btnNextStep3: "अगला: पूरा मैच एनालिसिस चलाएं →",

        wizStep3Header: "चरण 3: एनालिसिस के लिए तैयार",
        wizStep3Sub: "हमारा इंजन स्किल्स, फॉर्मेटिंग और स्पष्टता के लिए आपके रिज्यूमे को स्कैन करेगा।",
        btnRunAnalysis: "🔍 रिज्यूमे एनालिसिस चलाएं",
        btnTrySample: "🧪 सैंपल डेटा आज़माएं",
        btnClearAll: "🗑 सब साफ़ करें",

        // Progressive Upload States
        progReading: "रिज्यूमे फाइल पढ़ी जा रही है...",
        progSections: "सेक्शन ढूंढे जा रहे हैं...",
        progSkills: "स्किल्स का विश्लेषण हो रहा है...",
        progReady: "रिज्यूमे सफलतापूर्वक तैयार हो गया!",

        // Results Dashboard
        resultsHeaderTitle: "रिज्यूमे एनालिसिस परिणाम",
        resultsHeaderSub: "आपके रिज्यूमे का पारदर्शी और नियम-आधारित मूल्यांकन।",
        scoreDisclaimer: "यह स्कोर कीवर्ड्स, स्किल्स और बनावट के नियमों पर आधारित एक अनुमानित सूचक है। यह किसी कंपनी द्वारा चयन की गारंटी नहीं देता है।",
        btnDownloadReport: "📥 रिपोर्ट डाउनलोड करें",
        btnReanalyze: "🔄 दोबारा एनालिसिस करें",
        btnOpenStudio: "✨ स्टूडियो में सुधारें →",

        // Results Tabs
        tabOverview: "⚡ अवलोकन",
        tabSkills: "🧬 मिले हुए स्किल्स",
        tabATS: "🤖 ATS अनुकूलता",
        tabStructure: "📋 रिज्यूमे स्ट्रक्चर",
        tabRoadmap: "🚀 विकास और इंटरव्यू",

        // Skills Tab
        skillsMatchedTitle: "मैच हुए स्किल्स",
        skillsMissingTitle: "छूटे हुए स्किल्स",
        skillsRelatedTitle: "सम्बंधित / इकोसिस्टम स्किल्स",
        badgeExactMatch: "हूबहू मैच",
        badgeAliasMatch: "समान नाम",
        badgeRelatedMatch: "सम्बंधित टेक्नोलॉजी",

        // ATS Compatibility
        atsTitle: "अनुमानित ATS अनुकूलता",
        atsExplain: "यह अनुमान रिज्यूमे की बनावट, हेडिंग्स और कीवर्ड्स पर आधारित है। यह किसी विशिष्ट ATS या कंपनी द्वारा स्वीकार किए जाने की गारंटी नहीं देता।",
        atsFormatRisks: "फॉर्मेटिंग व लेआउट संकेत",
        atsKeywordsTitle: "मुख्य जॉब कीवर्ड्स",

        // Resume Structure
        structTitle: "सेक्शन चेकलिस्ट",
        structContact: "संपर्क जानकारी",
        structSummary: "प्रोफेशनल सारांश",
        structSkills: "स्किल्स सेक्शन",
        structExp: "कार्य अनुभव",
        structProjects: "प्रोजेक्ट्स व उपलब्धियां",
        structEdu: "शिक्षा व डिग्रियां",
        statusFound: "उपलब्ध",
        statusNeedsWork: "सुधार की जरूरत",
        statusMissing: "अनुपलब्ध",

        // Resume Studio
        studioTitle: "रिज्यूमे क्वालिटी स्टूडियो",
        studioSubtitle: "बुलेट पॉइंट्स निखारें, व्याकरण जांचें, AI लिखावट के संकेत देखें और तथ्यों को सुरक्षित रखते हुए भाषा को स्वाभाविक बनाएं।",
        subtabImprove: "✨ रिज्यूमे सुधारें",
        subtabGrammar: "📝 व्याकरण जांचें",
        subtabAISignals: "🤖 AI लिखावट के संकेत",
        subtabHumanize: "👤 स्वाभाविक भाषा (Humanize)",
        subtabQuality: "🔍 क्वालिटी व बुलेट्स",
        subtabCompare: "↔ पहले और बाद की तुलना",

        // Humanizer
        humanizeModeLabel: "लिखावट का अंदाज़:",
        modeSimple: "सरल",
        modeProfessional: "व्यावसायिक",
        modeNatural: "स्वाभाविक",
        modeConcise: "संक्षिप्त",
        modeImpact: "प्रभावशाली",
        preserveFactsNotice: "🔒 तथ्य सुरक्षा सक्रिय: संख्याएं, आंकड़े, कंपनियां, तारीखें और टेक्नोलॉजीज कभी नहीं बदली जाएंगी।",
        btnAcceptSuggestion: "✓ स्वीकार करें",
        btnRejectSuggestion: "✗ हटाएं",
        btnEditSuggestion: "✎ एडिट करें",
        btnAcceptAll: "✓ सभी सुझाव स्वीकार करें",
        btnReanalyzeAfterEdit: "🔄 बदलावों के साथ दोबारा एनालिसिस करें",

        // AI Writing Signals
        aiSignalsTitle: "AI लिखावट के संकेत",
        aiSignalsExplain: "यह फीचर उन लिखावट पैटर्नों को पहचानता है जो घिसे-पिटे या AI जैसे लग सकते हैं। यह निश्चित तौर पर यह नहीं बता सकता कि टेक्स्ट किसने लिखा है।",
        aiLowSignal: "कम AI संकेत",
        aiModSignal: "मध्यम AI संकेत",
        aiHighSignal: "अधिक AI संकेत",

        // Job Match Page
        jmTitle: "रिज्यूमे को जॉब से मैच करें",
        jmSubtitle: "पारदर्शी कारणों के साथ देखें कि आपका रिज्यूमे किसी जॉब के साथ कितना मेल खाता है।",
        jmSelectResume: "रिज्यूमे चुनें:",
        jmPasteJD: "जॉब डिस्क्रिप्शन पेस्ट करें:",
        jmBtnAnalyze: "🎯 जॉब मैच का एनालिसिस करें",
        jmTierMustHave: "अति आवश्यक योग्यताएं (Must-Have)",
        jmTierPreferred: "प्राथमिकता / अतिरिक्त योग्यताएं",
        jmTierQualifications: "डिग्रियां व योग्यता",
        jmTierResponsibilities: "मुख्य जिम्मेदारियां",
        jmTierTools: "टूल्स व टेक्नोलॉजीज",
        jmTierSoftSkills: "सॉफ्ट स्किल्स व टीमवर्क",

        // Career Insights
        ciTitle: "करियर इनसाइट्स व विकास संकेत",
        ciSubtitle: "स्किल्स की ताज़गी, सीखने की निरंतरता और करियर की दिशा समझने के लिए सकारात्मक संकेत। ये भविष्य के पक्के परिणाम नहीं हैं।",
        ciDisclaimer: "ये संकेत आपके रिज्यूमे की जानकारी पर आधारित हैं। ये आपके भविष्य की गारंटीकृत भविष्यवाणी नहीं हैं।",
        ciSignalFreshness: "स्किल्स की ताज़गी",
        ciSignalLearning: "सीखने की निरंतरता",
        ciSignalRelevance: "टेक्नोलॉजी की प्रासंगिकता",
        ciSignalExperience: "अनुभव की निरंतरता",
        ciRoadmapTitle: "6–12 महीने का विकास और सुधार रोडमैप",

        // Application Tracker
        appTrackerTitle: "जॉब एप्लीकेशन ट्रैकर",
        appTrackerSubtitle: "आवेदन से लेकर ऑफर तक अपनी हर जॉब एप्लीकेशन को अपने ब्राउज़र में सुरक्षित ट्रैक करें।",
        btnAddApplication: "+ नई एप्लीकेशन जोड़ें",
        filterAll: "सभी",
        filterSaved: "सेव की गई",
        filterApplied: "आवेदन किया",
        filterOA: "ऑनलाइन असेसमेंट",
        filterInterview: "इंटरव्यू",
        filterSelected: "चयन / ऑफर",
        filterRejected: "अस्वीकृत",

        // Resume Versions
        versionsTitle: "रिज्यूमे वर्शन्स",
        versionsSubtitle: "अलग-अलग भूमिकाओं (जैसे फ्रंटएंड, फुल स्टैक, डेटा) के लिए अनुकूलित रिज्यूमे वर्शन्स बनाएं।",
        btnSaveNewVersion: "+ वर्तमान रिज्यूमे को नए वर्शन में सेव करें",
        btnLoadToMatcher: "मैचर में लोड करें",
        btnLoadToStudio: "स्टूडियो में लोड करें",
        btnDuplicateVersion: "कॉपी बनाएं",
        btnRenameVersion: "नाम बदलें",
        btnDeleteVersion: "डिलीट करें",

        // Settings Page
        settingsTitle: "सेटिंग्स और प्राइवेसी",
        settingsSubtitle: "थीम, भाषा, डेटा बैकअप और प्राइवेसी विकल्पों को अपनी पसंद के अनुसार सेट करें।",
        secAppearance: "दिखावट (Appearance)",
        themeModeDark: "डार्क चारकोल",
        themeModeLight: "लाइट मोड",
        themeModeSystem: "सिस्टम डिफॉल्ट",
        secLanguage: "भाषा / Language",
        secDataManagement: "डेटा प्रबंधन (IndexedDB)",
        dataDesc: "आपके सभी रिज्यूमे, जॉब डिस्क्रिप्शन, एनालिसिस हिस्ट्री और एप्लीकेशन्स आपके ब्राउज़र के IndexedDB में सुरक्षित रहते हैं।",
        btnExportBackup: "📥 पूरा डेटा बैकअप डाउनलोड करें (JSON)",
        btnImportBackup: "📤 डेटा बैकअप रिस्टोर करें",
        btnClearData: "🗑 सारा लोकल डेटा मिटाएं",
        clearDataWarning: "चेतावनी: इससे इस ब्राउज़र में सेव किए गए सभी रिज्यूमे और एप्लीकेशन्स हमेशा के लिए मिट जाएंगे।",
        secPrivacy: "प्राइवेसी और आर्किटेक्चर पारदर्शिता",
        privacyDetails: "ResumeMatch AI 100% आपके ब्राउज़र में काम करता है। आपका कोई भी डेटा किसी सर्वर पर नहीं भेजा जाता। PDF पढ़ना, व्याकरण जांचना और स्कोरिंग पूरी तरह आपके डिवाइस पर होती है।",
        secAbout: "ResumeMatch AI के बारे में",
        aboutVersion: "वर्शन 4.0.0 · प्रोडक्शन करियर इंजन",

        // Help Center
        helpTitle: "मदद केंद्र और गाइड",
        helpSubtitle: "ResumeMatch AI के हर फीचर, स्कोर और सुझाव का सरल और स्पष्ट विवरण।",
        btnRestartTour: "▶ शुरुआती टूर दोबारा देखें",
        helpTopic1: "रिज्यूमे एनालिसिस से शुरुआत कैसे करें",
        helpTopic1Body: "Analyze Resume पेज पर जाकर PDF या टेक्स्ट फॉर्मेट में अपना रिज्यूमे अपलोड करें। हमारा सिस्टम बिना किसी सर्वर के आपके ब्राउज़र में ही स्किल्स और बनावट का विश्लेषण करता है।",
        helpTopic2: "मैच स्कोर कैसे काम करता है",
        helpTopic2Body: "स्कोर स्किल्स (40%), अनुभव (20%), कार्यक्षेत्र (15%), सॉफ्ट स्किल्स (15%) और ATS कीवर्ड्स (10%) पर आधारित होता है। यह एक उपयोगी तुलनात्मक सूचक है, नौकरी मिलने की गारंटी नहीं।",
        helpTopic3: "ATS अनुकूलता का क्या अर्थ है",
        helpTopic3Body: "कंपनियों के ATS सिस्टम साफ टेक्स्ट, स्पष्ट हेडिंग्स और सही कीवर्ड्स को प्राथमिकता देते हैं। हम इसी के आधार पर सुझाव देते हैं।",
        helpTopic4: "AI लिखावट के संकेत क्या हैं",
        helpTopic4Body: "हम उन वाक्यों को इंगित करते हैं जो अत्यधिक औपचारिक या रोबोटिक लगते हैं, ताकि आप अपनी बात को अधिक स्वाभाविक रूप से कह सकें।",
        helpTopic5: "Humanize और तथ्य सुरक्षा नियम",
        helpTopic5Body: "हमारा Humanizer आपकी भाषा को अधिक स्वाभाविक बनाता है। सबसे महत्वपूर्ण बात यह है कि यह कभी भी झूठे आंकड़े, अनुभव या तारीखें नहीं जोड़ता।",
        helpTopic6: "प्राइवेसी और डेटा सुरक्षा",
        helpTopic6Body: "आपका डेटा पूरी तरह आपके पास रहता है। आप सेटिंग्स पेज से कभी भी अपना बैकअप डाउनलोड कर सकते हैं।",

        // Common Actions & Empty States
        emptyResumeTitle: "अभी तक कोई रिज्यूमे नहीं जोड़ा गया है",
        emptyResumeDesc: "एनालिसिस और सुधार शुरू करने के लिए अपना रिज्यूमे PDF या टेक्स्ट में अपलोड करें।",
        emptyJDTitle: "कोई जॉब डिस्क्रिप्शन नहीं दी गई है",
        emptyJDDesc: "जॉब से तुलना देखने के लिए जॉब डिस्क्रिप्शन पेस्ट करें।",
        emptyAppsTitle: "अभी कोई एप्लीकेशन नहीं है",
        emptyAppsDesc: "अपनी जॉब खोज को व्यवस्थित करने के लिए पहली एप्लीकेशन जोड़ें।",
        emptyVersionsTitle: "कोई रिज्यूमे वर्शन सेव नहीं है",
        emptyVersionsDesc: "विशिष्ट नौकरियों के लिए अपने रिज्यूमे के अलग-अलग वर्शन सेव करें।",
        btnUploadResume: "रिज्यूमे अपलोड करें",
        btnAddJD: "जॉब डिस्क्रिप्शन जोड़ें",
        btnAddApp: "पहली एप्लीकेशन जोड़ें",

        // Error Feedback
        errReadFailedTitle: "हम इस फाइल को पढ़ नहीं पाए",
        errReadFailedReasons: "संभावित कारण:\n• फाइल पासवर्ड प्रोटेक्टेड या करप्ट हो सकती है\n• स्कैन की गई PDF जिसमें टेक्स्ट चुनने योग्य न हो\n• फाइल का साइज 10 MB से अधिक हो",
        btnTryAnotherFile: "दूसरी फाइल आज़माएं",
        errShortResume: "कृपया एनालिसिस के लिए कम से कम 50 अक्षरों का रिज्यूमे दर्ज करें।",
        errShortJD: "कृपया कम से कम 30 अक्षरों का जॉब डिस्क्रिप्शन दर्ज करें।",

        // Footer
        footerText: "विश्वभर के नौकरी चाहने वालों के लिए समर्पित · 100% क्लाइंट-साइड एनालिसिस · लोकल स्टोरेज · संपूर्ण प्राइवेसी",
        footerDisclaimer: "ResumeMatch AI नियम-आधारित करियर प्लेटफॉर्म है। सभी स्कोर और सुझाव आपके रिज्यूमे को बेहतर बनाने के लिए अनुमानित दिशानिर्देश हैं।"
    }
};

let currentLang = (typeof localStorage !== 'undefined') ? (localStorage.getItem('rmLang') || 'en') : 'en';

const I18N = {
    t(key, fallback = null) {
        if (!key) return '';
        const dict = TRANSLATIONS[currentLang] || TRANSLATIONS['en'];
        if (dict && dict[key] !== undefined) return dict[key];
        const enDict = TRANSLATIONS['en'];
        if (enDict && enDict[key] !== undefined) return enDict[key];
        return fallback !== null ? fallback : key;
    },

    setLang(lang) {
        currentLang = (lang === 'hi') ? 'hi' : 'en';
        if (typeof localStorage !== 'undefined') {
            try { localStorage.setItem('rmLang', currentLang); } catch (e) { }
        }
        I18N.applyTranslations();
        if (typeof window !== 'undefined') {
            try {
                window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: currentLang } }));
            } catch (e) { }
        }
    },

    setLanguage(lang) {
        this.setLang(lang);
    },

    toggleLang() {
        I18N.setLang(currentLang === 'en' ? 'hi' : 'en');
    },

    getCurrentLang() {
        return currentLang;
    },

    getLanguage() {
        return currentLang;
    },

    applyTranslations() {
        if (typeof document === 'undefined') return;

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = I18N.t(key);
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translation;
            } else {
                el.textContent = translation;
            }
        });

        // Also update elements with data-i18n-html if HTML allowed
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.getAttribute('data-i18n-html');
            el.innerHTML = I18N.t(key);
        });

        // Language toggle button text
        const langBtns = document.querySelectorAll('.lang-toggle-btn, #lang-toggle-btn');
        langBtns.forEach(btn => {
            btn.textContent = I18N.t('langToggle');
        });

        document.documentElement.lang = currentLang === 'hi' ? 'hi' : 'en';
    }
};

if (typeof window !== 'undefined') {
    window.I18N = I18N;
    window.TRANSLATIONS = TRANSLATIONS;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TRANSLATIONS, I18N };
}
