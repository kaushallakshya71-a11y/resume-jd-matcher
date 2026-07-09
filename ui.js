// ============================================================
// ui.js — Dynamic UI Rendering & Animations v3
// All 9 modules rendered here
// ============================================================

const UI = {

    // ---- Score Ring Animation ----
    animateScoreRing(score) {
        const ring = document.getElementById('score-ring-circle');
        const scoreText = document.getElementById('score-number');
        const scoreLabel = document.getElementById('score-label');
        const circumference = 2 * Math.PI * 54;

        ring.style.strokeDasharray = circumference;
        ring.style.strokeDashoffset = circumference;

        let color;
        if (score >= 75) color = '#34d399';
        else if (score >= 50) color = '#fbbf24';
        else color = '#f87171';
        ring.style.stroke = color;

        const duration = 1800;
        const start = performance.now();
        function animate(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(eased * score);
            const offset = circumference - (circumference * current / 100);
            ring.style.strokeDashoffset = offset;
            scoreText.textContent = current + '%';
            if (progress < 1) requestAnimationFrame(animate);
            else {
                scoreText.textContent = score + '%';
                scoreLabel.textContent = UI.getScoreLabel(score);
                scoreLabel.style.color = color;
            }
        }
        requestAnimationFrame(animate);
    },

    getScoreLabel(score) {
        if (score >= 85) return 'Excellent Match!';
        if (score >= 70) return 'Strong Match';
        if (score >= 55) return 'Good Match';
        if (score >= 40) return 'Moderate Match';
        return 'Low Match';
    },

    // ---- Sub Score Bars ----
    renderSubScores(result) {
        const bars = [
            { id: 'bar-skills', score: result.skillScore, label: 'Skills Match' },
            { id: 'bar-exp', score: result.expScore, label: 'Experience' },
            { id: 'bar-edu', score: result.educationScore, label: 'Education Fit' },
            { id: 'bar-project', score: result.projectScore, label: 'Project Relevance' },
            { id: 'bar-domain', score: result.domainScore, label: 'Domain Alignment' },
            { id: 'bar-ats', score: result.keywordScore, label: 'ATS Keywords' },
        ];
        bars.forEach(({ id, score }) => {
            const bar = document.getElementById(id);
            if (!bar) return;
            const fill = bar.querySelector('.bar-fill');
            const num = bar.querySelector('.bar-num');
            setTimeout(() => {
                fill.style.width = score + '%';
                fill.style.background = score >= 70 ? 'var(--green)' : score >= 45 ? 'var(--yellow)' : 'var(--red)';
                num.textContent = score + '%';
            }, 400);
        });
    },

    // ---- Strengths & Weaknesses ----
    renderStrengthsWeaknesses(sw) {
        const container = document.getElementById('strengths-weaknesses');
        if (!container || !sw) return;
        container.innerHTML = `
            <div class="sw-section">
                <h4 class="sw-title sw-green">🏆 Top 3 Strengths</h4>
                ${sw.strengths.map(s => `
                    <div class="sw-item sw-strength">
                        <div class="sw-label">${s.label}</div>
                        <div class="sw-bar-track"><div class="sw-bar-fill" style="width:${s.score}%;background:var(--green)"></div></div>
                        <div class="sw-detail">${s.detail}</div>
                    </div>
                `).join('')}
            </div>
            <div class="sw-section">
                <h4 class="sw-title sw-red">⚠️ Top 3 Areas to Improve</h4>
                ${sw.weaknesses.map(w => `
                    <div class="sw-item sw-weakness">
                        <div class="sw-label">${w.label}</div>
                        <div class="sw-bar-track"><div class="sw-bar-fill" style="width:${w.score}%;background:${w.score >= 45 ? 'var(--yellow)' : 'var(--red)'}"></div></div>
                        <div class="sw-detail">${w.detail}</div>
                    </div>
                `).join('')}
            </div>`;
    },

    // ---- Skill Pills ----
    renderSkills(result) {
        UI.renderPills('strong-skills-list', result.strongMatches, 'pill-green');
        UI.renderPills('partial-skills-list', result.partialMatches, 'pill-yellow');
        UI.renderPills('missing-skills-list', result.missingSkills, 'pill-red');
        UI.renderPills('extra-skills-list', result.extraSkills, 'pill-blue');

        document.getElementById('strong-count').textContent = result.strongMatches.length;
        document.getElementById('partial-count').textContent = result.partialMatches.length;
        document.getElementById('missing-count').textContent = result.missingSkills.length;
    },

    renderPills(containerId, skills, cls) {
        const container = document.getElementById(containerId);
        if (!container) return;
        if (skills.length === 0) {
            container.innerHTML = '<span class="no-skills">None detected</span>';
            return;
        }
        container.innerHTML = skills.map(skill =>
            `<span class="skill-pill ${cls}">${UI.titleCase(skill)}</span>`
        ).join('');
    },

    titleCase(str) {
        return str.replace(/\b\w/g, l => l.toUpperCase());
    },

    // ---- Skills Gap & Priority Analysis ----
    renderSkillsGap(gap) {
        const container = document.getElementById('skills-gap-container');
        if (!container || !gap) return;

        const renderTier = (title, icon, cls, items, showImprovement) => {
            if (!items || items.length === 0) return `<div class="gap-empty">None in this category — great job! ✅</div>`;
            return `
                <div class="gap-tier ${cls}">
                    <div class="gap-tier-header">${icon} ${title} <span class="gap-count">${items.length}</span></div>
                    <div class="gap-items">
                        ${items.map(item => `
                            <div class="gap-item">
                                <div class="gap-skill-name">${item.skill}</div>
                                ${showImprovement ? `<div class="gap-improvement">💡 ${item.improvement}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>`;
        };

        container.innerHTML = `
            <div class="gap-section">
                <h4 class="gap-section-title">Missing Skills by Priority</h4>
                ${renderTier('High Priority — Must Have', '🔴', 'tier-high', gap.highPriority, true)}
                ${renderTier('Medium Priority — Good to Have', '🟡', 'tier-medium', gap.mediumPriority, true)}
                ${renderTier('Optional — Nice to Have', '🔵', 'tier-optional', gap.optional, false)}
            </div>
            ${gap.partialEntries && gap.partialEntries.length > 0 ? `
            <div class="gap-section" style="margin-top:20px">
                <h4 class="gap-section-title">⚠️ Partially Matched — Needs Strengthening</h4>
                <div class="gap-tier tier-partial">
                    <div class="gap-items">
                        ${gap.partialEntries.map(item => `
                            <div class="gap-item">
                                <div class="gap-skill-name">${item.skill}</div>
                                <div class="gap-improvement">💡 ${item.improvement}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>` : ''}`;
    },

    // ---- Resume Tips ----
    renderTips(tips) {
        const container = document.getElementById('tips-container');
        if (!container || !tips.length) return;
        container.innerHTML = tips.map((tip, i) => `
            <div class="tip-card" style="animation-delay: ${i * 0.08}s">
                <div class="tip-icon">${tip.icon}</div>
                <div class="tip-content">
                    <h4>${tip.title}</h4>
                    <p>${tip.body}</p>
                </div>
            </div>
        `).join('');
    },

    // ---- Career Roadmap (3 Phases) ----
    renderRoadmap(roadmap) {
        const p1 = document.getElementById('phase1-list');
        const p2 = document.getElementById('phase2-list');
        const p3 = document.getElementById('phase3-list');

        const renderPhaseItems = (items) => items.map((item, i) => `
            <div class="roadmap-item" style="animation-delay: ${i * 0.1}s">
                <div class="roadmap-dot"></div>
                <div>
                    <strong>${item.skill}</strong>
                    <p>${item.resource}</p>
                    ${item.action ? `<span class="roadmap-action">🎯 ${item.action}</span>` : ''}
                </div>
            </div>
        `).join('');

        if (p1) p1.innerHTML = renderPhaseItems(roadmap.phase1 || []);
        if (p2) p2.innerHTML = renderPhaseItems(roadmap.phase2 || []);
        if (p3) p3.innerHTML = renderPhaseItems(roadmap.phase3 || []);

        // Next roles
        const nextRolesEl = document.getElementById('next-roles-list');
        if (nextRolesEl && roadmap.nextRoles && roadmap.nextRoles.length > 0) {
            nextRolesEl.innerHTML = roadmap.nextRoles.map(r =>
                `<span class="next-role-pill">${r}</span>`
            ).join('');
        }
    },

    // ---- ATS Analysis ----
    renderATSKeywords(keywords) {
        const container = document.getElementById('ats-keywords');
        if (!container) return;
        container.innerHTML = keywords.map(kw => `
            <span class="ats-pill ${kw.inResume ? 'ats-found' : 'ats-missing'}"
                  title="${kw.inResume ? '✅ Found in resume' : '❌ Not in resume — Add this!'}">
                ${kw.word} ${kw.inResume ? '✓' : '✗'}
            </span>
        `).join('');
    },

    renderATSAnalysis(atsAnalysis) {
        const container = document.getElementById('ats-analysis-container');
        if (!container || !atsAnalysis) return;

        const { passProbability, passLabel, passClass, formatRisks, missingKeywords, overusedWords, atsTips } = atsAnalysis;

        const passColors = { pass: 'var(--green)', maybe: 'var(--yellow)', fail: 'var(--red)' };
        const passColor = passColors[passClass] || 'var(--yellow)';

        container.innerHTML = `
            <div class="ats-pass-box" style="border-color:${passColor}">
                <div class="ats-pass-label" style="color:${passColor}">${passLabel}</div>
                <div class="ats-pass-bar">
                    <div class="ats-pass-fill" style="width:${passProbability}%;background:${passColor}"></div>
                </div>
                <div class="ats-pass-pct" style="color:${passColor}">${passProbability}% Pass Probability</div>
                <p class="ats-pass-desc">Based on keyword match between your resume and the job description.</p>
            </div>

            ${formatRisks.length > 0 ? `
            <div class="ats-risks">
                <h4>⚠️ Formatting Risks Detected</h4>
                <ul>${formatRisks.map(r => `<li>${r}</li>`).join('')}</ul>
            </div>` : `<div class="ats-risks ats-risks-ok">✅ No major formatting issues detected!</div>`}

            ${missingKeywords.length > 0 ? `
            <div class="ats-missing-kw">
                <h4>❌ Missing Keywords to Add</h4>
                <div class="ats-kw-pills">${missingKeywords.map(w => `<span class="ats-pill ats-missing">${w}</span>`).join('')}</div>
            </div>` : ''}

            ${overusedWords.length > 0 ? `
            <div class="ats-overused">
                <h4>🚫 Overused / Generic Words</h4>
                <div class="ats-kw-pills">${overusedWords.map(w => `<span class="ats-pill ats-overused-pill">${w}</span>`).join('')}</div>
                <p style="font-size:12px;color:var(--text-muted);margin-top:8px">Remove vague buzzwords — replace with specific action verbs and quantified results.</p>
            </div>` : ''}

            <div class="ats-tips-list">
                <h4>💡 ATS Improvement Tips</h4>
                <ul>${atsTips.map(t => `<li>${t}</li>`).join('')}</ul>
            </div>`;
    },

    // ---- Company Optimization ----
    renderCompanyOptimization(opt) {
        const container = document.getElementById('company-opt-container');
        if (!container || !opt) return;
        const { companyType, profile, nextRoles, targetRole, targetCompany, structureSuggestions } = opt;

        const typeColors = { startup: '#f59e0b', mnc: '#3b82f6', product: '#8b5cf6' };
        const color = typeColors[companyType] || '#8b5cf6';

        container.innerHTML = `
            <div class="company-badge" style="border-color:${color};color:${color}">
                🏢 Optimized for: <strong>${profile.label}</strong>
                ${targetCompany ? `· Target: <strong>${targetCompany}</strong>` : ''}
                ${targetRole ? `· Role: <strong>${targetRole}</strong>` : ''}
            </div>

            <div class="company-grid">
                <div class="company-section">
                    <h4>📋 Structure Suggestions</h4>
                    <ul>${structureSuggestions.map(s => `<li>${s}</li>`).join('')}</ul>
                </div>
                <div class="company-section">
                    <h4>🎯 Focus Areas</h4>
                    <ul>${profile.focusAreas.map(f => `<li>${f}</li>`).join('')}</ul>
                </div>
                <div class="company-section">
                    <h4>✅ Tone Keywords to Use</h4>
                    <div class="tone-pills">${profile.toneKeywords.map(k => `<span class="tone-pill">"${k}"</span>`).join('')}</div>
                </div>
                <div class="company-section">
                    <h4>❌ Things to Avoid</h4>
                    <ul>${profile.avoid.map(a => `<li>${a}</li>`).join('')}</ul>
                </div>
            </div>

            <div class="company-tips">
                <h4>💡 Optimization Tips for ${profile.label}</h4>
                ${profile.tips.map((t, i) => `
                    <div class="company-tip">
                        <span class="tip-num">${i + 1}</span> ${t}
                    </div>`).join('')}
            </div>

            ${nextRoles && nextRoles.length > 0 ? `
            <div class="next-roles">
                <h4>🚀 Possible Next Roles for You</h4>
                <div class="next-role-pills">${nextRoles.map(r => `<span class="next-role-pill">${r}</span>`).join('')}</div>
            </div>` : ''}`;
    },

    // ---- Interview Prep ----
    renderInterviewPrep(interviewPrep) {
        const container = document.getElementById('interview-container');
        if (!container || !interviewPrep) return;
        const { questions, quickTips } = interviewPrep;

        const diffColors = { Easy: 'var(--green)', Medium: 'var(--yellow)', Hard: 'var(--red)' };
        const catIcons = { Technical: '💻', Behavioral: '🧠', 'Gap Question': '❓', 'System Design': '🏗️', 'Culture Fit': '🤝' };

        container.innerHTML = `
            <div class="interview-tips-box">
                <h4>⚡ Quick Interview Tips</h4>
                <ul>${quickTips.map(t => `<li>${t}</li>`).join('')}</ul>
            </div>
            <h4 style="margin:20px 0 12px;font-size:15px">🎯 Predicted Interview Questions</h4>
            <div class="interview-questions">
                ${questions.map((q, i) => `
                    <div class="interview-q-card">
                        <div class="interview-q-header">
                            <span class="interview-cat">${catIcons[q.category] || '❓'} ${q.category}</span>
                            <span class="interview-diff" style="color:${diffColors[q.difficulty] || 'var(--yellow)'}">${q.difficulty}</span>
                        </div>
                        <div class="interview-question">Q${i + 1}. ${q.question}</div>
                        <div class="interview-tip">💡 <strong>How to answer:</strong> ${q.tip}</div>
                    </div>
                `).join('')}
            </div>`;
    },

    // ---- Soft Skills & Video Resume ----
    renderSoftSkillsTips(softSkillsTips) {
        const container = document.getElementById('soft-skills-container');
        if (!container || !softSkillsTips) return;
        const { videoTips, softSkillAdvice, commonMistakes, hasSoftSkills } = softSkillsTips;

        container.innerHTML = `
            ${!hasSoftSkills ? `<div class="soft-alert">⚠️ No soft skills detected in your resume. Consider adding a line about communication, leadership, or teamwork.</div>` : ''}
            <div class="soft-grid">
                <div class="soft-section">
                    <h4>🎭 Soft Skills to Demonstrate</h4>
                    ${softSkillAdvice.map(s => `
                        <div class="soft-skill-item">
                            <div class="soft-skill-icon">${s.icon}</div>
                            <div>
                                <strong>${s.skill}</strong>
                                <p>${s.tip}</p>
                            </div>
                        </div>`).join('')}
                </div>
                <div class="soft-section">
                    <h4>🎬 Video Resume Tips</h4>
                    <ul class="video-tips-list">
                        ${videoTips.map(t => `<li>${t}</li>`).join('')}
                    </ul>
                    <h4 style="margin-top:16px">🚫 Common Mistakes to Avoid</h4>
                    <ul class="video-mistakes-list">
                        ${commonMistakes.map(m => `<li>${m}</li>`).join('')}
                    </ul>
                </div>
            </div>`;
    },

    // ---- Verdict Banner ----
    renderVerdict(result) {
        const el = document.getElementById('verdict-badge');
        if (!el) return;

        const readyColors = { Yes: 'var(--green)', Almost: 'var(--yellow)', 'Not Yet': 'var(--red)' };
        const readyColor = readyColors[result.jobReady] || 'var(--yellow)';

        el.className = `verdict-badge verdict-${result.verdictClass}`;
        el.innerHTML = `
            <span class="verdict-icon">${result.verdictIcon}</span>
            <div>
                <div class="verdict-title">${result.verdict}</div>
                <div class="verdict-sub">${UI.getVerdictMessage(result.verdictClass, result.score)}</div>
                <div class="verdict-ready" style="color:${readyColor}">
                    Job Ready: <strong>${result.jobReady}</strong>
                </div>
            </div>`;
    },

    getVerdictMessage(cls, score) {
        switch (cls) {
            case 'ready': return `You're a great match! Tailor your cover letter and apply with confidence. Top ${100 - score}% applicants won't have your background.`;
            case 'improve': return `You're on the right track! A few skill additions & resume tweaks will make you a much stronger candidate. Keep going! 💪`;
            case 'learning': return `Every expert was once a beginner! Follow the roadmap below, build projects, and reapply in 2–3 months. You've got this! 🌱`;
        }
    },

    // ---- Immediate Next Actions ----
    renderNextActions(result) {
        const container = document.getElementById('next-actions-container');
        if (!container) return;

        const actions = [];
        if (result.score < 75) {
            const top3Missing = result.skillsGap?.highPriority?.slice(0, 3).map(s => s.skill) || result.missingSkills.slice(0, 3).map(s => UI.titleCase(s));
            if (top3Missing.length > 0) actions.push(`🎯 Learn: ${top3Missing.join(', ')} (High Priority)`);
        }
        if (!result.atsAnalysis || result.atsAnalysis.passProbability < 70) {
            actions.push('🤖 Add missing ATS keywords from the "ATS Analysis" section above');
        }
        actions.push('📝 Rewrite 3 bullet points using the STAR method with metrics');
        actions.push('🔗 Update LinkedIn with new skills and set "Open to Work"');
        actions.push('📂 Build/update 1 portfolio project matching this job stack');
        actions.push('🎤 Practice your 2-minute intro pitch 10 times before the interview');

        container.innerHTML = actions.map((a, i) => `
            <div class="action-item" style="animation-delay:${i * 0.06}s">
                <span class="action-num">${i + 1}</span>
                <span>${a}</span>
            </div>`).join('');
    },

    // ---- Experience Info ----
    renderExperienceInfo(result) {
        const el = document.getElementById('exp-info');
        if (!el) return;
        if (result.resumeYears > 0 || result.jdYears > 0) {
            el.innerHTML = `
                <div class="exp-row">
                    <span>📋 Job Requires:</span><strong>${result.jdYears > 0 ? result.jdYears + '+ years' : 'Not specified'}</strong>
                </div>
                <div class="exp-row">
                    <span>👤 Your Experience:</span><strong>${result.resumeYears > 0 ? result.resumeYears + ' years (detected)' : 'Not detected'}</strong>
                </div>`;
        } else {
            el.innerHTML = `<p class="dim">Experience years not explicitly detected. Add "X years of experience" to your resume for better ATS matching.</p>`;
        }
    },

    // ==============================
    //  MAIN RENDER FUNCTION
    // ==============================
    renderResults(result) {
        const section = document.getElementById('results-section');
        section.classList.remove('hidden');
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });

        setTimeout(() => UI.animateScoreRing(result.score), 200);
        setTimeout(() => UI.renderSubScores(result), 300);

        UI.renderStrengthsWeaknesses(result.strengthsWeaknesses);
        UI.renderSkills(result);
        UI.renderSkillsGap(result.skillsGap);
        UI.renderVerdict(result);
        UI.renderNextActions(result);
        UI.renderExperienceInfo(result);
        UI.renderTips(result.tips);
        UI.renderRoadmap(result.roadmap);
        UI.renderATSKeywords(result.atsKeywords);
        UI.renderATSAnalysis(result.atsAnalysis);
        UI.renderCompanyOptimization(result.companyOptimization);
        UI.renderInterviewPrep(result.interviewPrep);
        UI.renderSoftSkillsTips(result.softSkillsTips);

        UI.setActiveNav('match-score');

        document.querySelectorAll('.result-card').forEach((card, i) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(24px)';
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 100 + i * 80);
        });
    },

    // ---- Nav ----
    setActiveNav(id) {
        document.querySelectorAll('.side-nav a').forEach(a => a.classList.remove('active'));
        const target = document.querySelector(`.side-nav a[href="#${id}"]`);
        if (target) target.classList.add('active');
    },

    // ---- Loading State ----
    showLoading() {
        const btn = document.getElementById('analyze-btn');
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner"></span> Analyzing...`;
        document.getElementById('resume-drop')?.classList.add('active-scanning');
        document.getElementById('jd-drop')?.classList.add('active-scanning');
    },

    hideLoading() {
        const btn = document.getElementById('analyze-btn');
        btn.disabled = false;
        btn.innerHTML = `<span>🔍</span> Analyze Match`;
        document.getElementById('resume-drop')?.classList.remove('active-scanning');
        document.getElementById('jd-drop')?.classList.remove('active-scanning');
    },

    // ---- Char counts ----
    updateCharCount(id, countId) {
        const el = document.getElementById(id);
        const counter = document.getElementById(countId);
        if (el && counter) counter.textContent = el.value.length + ' characters';
    },
};

window.UI = UI;
