// ============================================================
// i18n.js — Internationalization (English + Hindi)
// ============================================================

const TRANSLATIONS = {
    en: {
        // Header
        appName: "ResumeMatch AI",
        appTagline: "Smart Career Compatibility Analyzer",
        aiBadge: "⚡ Smart Analysis",
        langToggle: "हिंदी",

        // Hero
        eyebrow: "🔍 Resume Intelligence Engine",
        heroTitle1: "Know Your",
        heroGrad: "Compatibility Score",
        heroTitle2: "Before You Apply",
        heroSubtitle: "Paste your resume and any job description to get an estimated compatibility score, skill gap analysis, ATS keyword insights, and a personalized career roadmap.",

        stat1Label: "Skills Tracked",
        stat2Label: "ATS Match Score",
        stat3Label: "Private & Offline",
        stat4Label: "No Sign-up Needed",

        // Customization
        customizeTitle: "🎛 Customize Analysis",
        customizeSubtitle: "Tune the analyzer to match your situation",
        roleLevelLabel: "Your Target Role Level",
        roleEntry: "Entry Level",
        roleMid: "Mid Level",
        roleSenior: "Senior",
        roleLead: "Lead / Manager",
        roleExec: "C-Suite / Director",
        industryLabel: "Industry Focus",
        industryTech: "Technology",
        industryFinance: "Finance",
        industryHealth: "Healthcare",
        industryMarketing: "Marketing",
        industryEducation: "Education",
        industryDesign: "Design / Creative",
        industryData: "Data Science / AI",
        industryOther: "Other",
        prioritySkillsLabel: "Priority Skills (comma separated)",
        prioritySkillsPlaceholder: "e.g. React, Docker, Python",

        // Inputs
        resumeLabel: "Your Resume",
        jdLabel: "Job Description",
        uploadBtn: "⬆ Upload File",
        resumePlaceholder: "Paste your full resume text here...\n\nInclude: Skills, Experience, Projects, Education\n\n(Or drag & drop a .txt or .pdf file)",
        jdPlaceholder: "Paste the full job description here...\n\nInclude: Requirements, Responsibilities, Skills\n\n(Or drag & drop a .txt or .pdf file)",

        // Buttons
        analyzeBtn: "🔍 Analyze Match",
        sampleBtn: "🧪 Try Sample Data",
        clearBtn: "🗑 Clear All",
        downloadBtn: "📥 Download Report",

        // Video Resume
        videoTitle: "📹 Video Resume",
        videoSubtitle: "Add a 30-second video pitch to stand out",
        videoUploadBtn: "📂 Upload Video",
        videoRecordBtn: "🔴 Record Now",
        videoStopBtn: "⏹ Stop Recording",
        videoTip: "Tip: Introduce yourself, mention your top 3 skills, and why you're excited about this role!",

        // Nav
        navScore: "📊 Match Score",
        navSkills: "🧬 Skills Analysis",
        navVerdict: "🏆 Final Verdict",
        navTips: "🛠 Resume Tips",
        navRoadmap: "🚀 Career Roadmap",
        navATS: "🤖 ATS Keywords",
        navVideo: "📹 Video Resume",
        navFeedback: "⭐ Feedback",

        // Results
        scoreTitle: "Estimated Compatibility Score",
        scoreSubtitle: "Overall alignment with the job description based on keywords and skills",

        skillsTitle: "Skill Breakdown",
        skillsSubtitle: "How your skills compare with the job requirements",
        verdictTitle: "Final Verdict",
        verdictSubtitle: "Your overall readiness for this role",
        tipsTitle: "Resume Improvement Tips",
        tipsSubtitle: "Personalized suggestions to increase your match score",
        roadmapTitle: "Career Growth Roadmap",
        roadmapSubtitle: "Your short-term actions and long-term goals",
        atsTitle: "ATS Keyword Analysis",
        atsSubtitle: "Important JD keywords — green means found, red means missing",
        shortTermLabel: "⚡ Short-Term (Next 4–8 Weeks)",
        longTermLabel: "🌟 Long-Term (Next 3–6 Months)",
        tabMatched: "✅ Matched",
        tabPartial: "⚠️ Partial",
        tabMissing: "❌ Missing",
        tabBonus: "⭐ Bonus",
        strongCount: "Matched",
        partialCount: "Partial",
        missingCount: "Missing",
        atsLegendFound: "Found in your resume",
        atsLegendMissing: "Missing — add these!",
        atsTip: "ATS Tip: Copy-paste the exact red keywords from the job description into your resume (in context). Most ATS systems do exact keyword matching, so phrasing matters!",

        // Sub-scores
        barSkills: "Skills Match",
        barExp: "Experience Fit",
        barDomain: "Domain Alignment",
        barATS: "ATS Keywords",

        // Feedback
        feedbackTitle: "⭐ Rate This Analysis",
        feedbackSubtitle: "Help us improve! How accurate was this analysis?",
        feedbackPlaceholder: "Any comments or suggestions? (optional)",
        feedbackSubmit: "Submit Feedback",
        feedbackThanks: "Thanks for your feedback! 🙏",
        feedbackRatings: "ratings so far",

        // Footer
        footerText: "Made with ♥ for job seekers everywhere · ResumeMatch AI · All analysis is 100% local — your data never leaves your browser",
    },

    hi: {
        appName: "ResumeMatch AI",
        appTagline: "स्मार्ट करियर कम्पैटिबिलिटी एनालाइज़र",
        aiBadge: "⚡ स्मार्ट एनालिसिस",
        langToggle: "English",

        eyebrow: "🔍 रिज्यूमे इंटेलिजेंस इंजन",
        heroTitle1: "जानो अपना",
        heroGrad: "कम्पैटिबिलिटी स्कोर",
        heroTitle2: "Apply करने से पहले",
        heroSubtitle: "अपना रिज्यूमे और जॉब डिस्क्रिप्शन paste करो — अनुमानित compatibility score, skill gap, और career roadmap पाओ।",

        stat1Label: "Skills Track होते हैं",
        stat2Label: "ATS मैच स्कोर",
        stat3Label: "प्राइवेट & ऑफलाइन",
        stat4Label: "कोई Sign-up नहीं",

        customizeTitle: "🎛 एनालिसिस कस्टमाइज़ करो",
        customizeSubtitle: "अपनी situation के हिसाब से analyzer को tune करो",
        roleLevelLabel: "आपका टारगेट रोल लेवल",
        roleEntry: "Entry Level",
        roleMid: "Mid Level",
        roleSenior: "Senior",
        roleLead: "Lead / Manager",
        roleExec: "C-Suite / Director",
        industryLabel: "इंडस्ट्री फोकस",
        industryTech: "Technology",
        industryFinance: "Finance",
        industryHealth: "Healthcare",
        industryMarketing: "Marketing",
        industryEducation: "Education",
        industryDesign: "Design / Creative",
        industryData: "Data Science / AI",
        industryOther: "अन्य",
        prioritySkillsLabel: "Priority Skills (comma से अलग करो)",
        prioritySkillsPlaceholder: "जैसे: React, Docker, Python",

        resumeLabel: "आपका रिज्यूमे",
        jdLabel: "जॉब डिस्क्रिप्शन",
        uploadBtn: "⬆ File Upload करो",
        resumePlaceholder: "यहाँ अपना पूरा रिज्यूमे text paste करो...\n\nशामिल करो: Skills, Experience, Projects, Education\n\n(या .txt या .pdf file drag & drop करो)",
        jdPlaceholder: "यहाँ पूरी job description paste करो...\n\nशामिल करो: Requirements, Responsibilities, Skills\n\n(या .txt या .pdf file drag & drop करो)",

        analyzeBtn: "🔍 मैच एनालाइज़ करो",
        sampleBtn: "🧪 Sample Data आज़माओ",
        clearBtn: "🗑 सब Clear करो",
        downloadBtn: "📥 Report Download करो",

        videoTitle: "📹 Video रिज्यूमे",
        videoSubtitle: "30 सेकंड का video pitch जोड़ो — अलग दिखो!",
        videoUploadBtn: "📂 Video Upload करो",
        videoRecordBtn: "🔴 अभी Record करो",
        videoStopBtn: "⏹ Recording बंद करो",
        videoTip: "टिप: खुद को introduce करो, अपनी top 3 skills बताओ, और बताओ कि इस role के लिए क्यों excited हो!",

        navScore: "📊 मैच स्कोर",
        navSkills: "🧬 Skills एनालिसिस",
        navVerdict: "🏆 Final Verdict",
        navTips: "🛠 रिज्यूमे Tips",
        navRoadmap: "🚀 Career Roadmap",
        navATS: "🤖 ATS Keywords",
        navVideo: "📹 Video रिज्यूमे",
        navFeedback: "⭐ Feedback",

        scoreTitle: "अनुमानित कम्पैटिबिलिटी स्कोर",
        scoreSubtitle: "जॉब डिस्क्रिप्शन के साथ अनुमानित alignment",

        skillsTitle: "Skills का विवरण",
        skillsSubtitle: "आपकी skills vs job requirements",
        verdictTitle: "Final Verdict",
        verdictSubtitle: "इस role के लिए आपकी overall readiness",
        tipsTitle: "रिज्यूमे Improvement Tips",
        tipsSubtitle: "मैच स्कोर बढ़ाने के लिए personalized सुझाव",
        roadmapTitle: "Career Growth Roadmap",
        roadmapSubtitle: "Short-term actions और long-term goals",
        atsTitle: "ATS Keyword एनालिसिस",
        atsSubtitle: "JD के important keywords — हरा = मिला, लाल = गायब",
        shortTermLabel: "⚡ Short-Term (अगले 4–8 हफ्ते)",
        longTermLabel: "🌟 Long-Term (अगले 3–6 महीने)",
        tabMatched: "✅ मिले",
        tabPartial: "⚠️ आंशिक",
        tabMissing: "❌ गायब",
        tabBonus: "⭐ Bonus",
        strongCount: "मिले",
        partialCount: "आंशिक",
        missingCount: "गायब",
        atsLegendFound: "रिज्यूमे में मिला",
        atsLegendMissing: "गायब है — इन्हें जोड़ो!",
        atsTip: "ATS टिप: Job description के exact लाल keywords अपने resume में (context के साथ) copy करो। ज़्यादातर ATS systems exact keyword matching करते हैं!",

        barSkills: "Skills मैच",
        barExp: "Experience Fit",
        barDomain: "Domain Alignment",
        barATS: "ATS Keywords",

        feedbackTitle: "⭐ इस एनालिसिस को Rate करो",
        feedbackSubtitle: "हमें improve करने में help करो! यह एनालिसिस कितनी accurate थी?",
        feedbackPlaceholder: "कोई सुझाव या टिप्पणी? (optional)",
        feedbackSubmit: "Feedback Submit करो",
        feedbackThanks: "आपके feedback के लिए धन्यवाद! 🙏",
        feedbackRatings: "ratings अब तक",

        footerText: "job seekers के लिए ❤️ से बनाया · ResumeMatch AI · क्लाइंट-साइड एनालिसिस · लोकल स्टोरेज · प्राइवेसी-फोकस्ड आर्किटेक्चर",

    }
};

let currentLang = localStorage.getItem('rmLang') || 'en';

const I18N = {
    t(key) {
        return TRANSLATIONS[currentLang][key] || TRANSLATIONS['en'][key] || key;
    },

    setLang(lang) {
        currentLang = lang;
        localStorage.setItem('rmLang', lang);
        I18N.applyTranslations();
    },

    toggleLang() {
        I18N.setLang(currentLang === 'en' ? 'hi' : 'en');
    },

    getCurrentLang() {
        return currentLang;
    },

    applyTranslations() {
        // Apply translation to all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = I18N.t(key);
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                el.placeholder = translation;
            } else {
                el.innerHTML = translation;
            }
        });

        // Update lang toggle button text
        const langBtn = document.getElementById('lang-toggle-btn');
        if (langBtn) langBtn.textContent = I18N.t('langToggle');

        // Update document language attribute
        document.documentElement.lang = currentLang === 'hi' ? 'hi' : 'en';
    }
};

window.I18N = I18N;
