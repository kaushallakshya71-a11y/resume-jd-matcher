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
        if (result.exactMatches || result.aliasMatches) {
            const matchedContainer = document.getElementById('strong-skills-list');
            if (matchedContainer) {
                const exactHtml = (result.exactMatches || []).map(s =>
                    `<span class="skill-pill pill-green" title="Direct match in resume">✓ ${UI.titleCase(s)} <span class="layer-tag">Exact</span></span>`
                ).join('');
                const aliasHtml = (result.aliasMatches || []).map(a =>
                    `<span class="skill-pill pill-green pill-alias" title="Matched via alias: ${a.canonical}">✓ ${UI.titleCase(a.skill)} <span class="layer-tag">Alias → ${UI.titleCase(a.canonical)}</span></span>`
                ).join('');
                const combined = exactHtml + aliasHtml;
                matchedContainer.innerHTML = combined || '<span class="no-skills">None detected</span>';
            }
        } else {
            UI.renderPills('strong-skills-list', result.strongMatches, 'pill-green');
        }

        if (result.relatedMatches && result.relatedMatches.length > 0) {
            const partialContainer = document.getElementById('partial-skills-list');
            if (partialContainer) {
                partialContainer.innerHTML = result.relatedMatches.map(r =>
                    `<span class="skill-pill pill-yellow" title="Related to: ${r.matchedVia}">◐ ${UI.titleCase(r.skill)} <span class="layer-tag">Related: ${UI.titleCase(r.matchedVia)}</span></span>`
                ).join('');
            }
        } else {
            UI.renderPills('partial-skills-list', result.partialMatches, 'pill-yellow');
        }

        if (result.missingDetails && result.missingDetails.length > 0) {
            const missingContainer = document.getElementById('missing-skills-list');
            if (missingContainer) {
                missingContainer.innerHTML = result.missingDetails.map(m =>
                    `<span class="skill-pill pill-red ${m.critical ? 'pill-critical' : ''}" title="${m.critical ? 'High Priority Must-Have' : 'Missing Skill'}">✗ ${UI.titleCase(m.skill)} ${m.critical ? '<span class="layer-tag layer-critical">Must Have</span>' : ''}</span>`
                ).join('');
            }
        } else {
            UI.renderPills('missing-skills-list', result.missingSkills, 'pill-red');
        }

        UI.renderPills('extra-skills-list', result.extraSkills, 'pill-blue');

        document.getElementById('strong-count').textContent = result.strongMatches.length;
        document.getElementById('partial-count').textContent = result.partialMatches.length;
        document.getElementById('missing-count').textContent = result.missingSkills.length;
    },

    // ---- Transparent Breakdown Table ----
    renderBreakdownTable(breakdown, result) {
        const container = document.getElementById('transparent-breakdown-container');
        if (!container || !breakdown) return;

        const rows = [
            { key: 'skills', label: 'Skills Alignment', points: breakdown.skills?.points ?? 0, max: breakdown.skills?.max ?? 40, desc: 'Exact matches, aliases & related tech' },
            { key: 'experience', label: 'Experience Level', points: breakdown.experience?.points ?? 0, max: breakdown.experience?.max ?? 20, desc: 'Years of industry tenure vs required' },
            { key: 'domain', label: 'Domain & Industry Fit', points: breakdown.domain?.points ?? 0, max: breakdown.domain?.max ?? 15, desc: 'Field-specific terminology & context' },
            { key: 'softSkills', label: 'Soft Skills & Leadership', points: breakdown.softSkills?.points ?? 0, max: breakdown.softSkills?.max ?? 15, desc: 'Teamwork, communication & problem solving' },
            { key: 'ats', label: 'ATS Formatting & Keywords', points: breakdown.ats?.points ?? 0, max: breakdown.ats?.max ?? 10, desc: 'Keyword distribution & structure' },
        ];

        const totalPts = breakdown.total?.points ?? Math.min(100, rows.reduce((s, r) => s + r.points, 0));

        container.innerHTML = `
            <div class="breakdown-header">
                <div class="breakdown-title-row">
                    <span class="breakdown-badge">🔍 Transparent Scoring</span>
                    <h4 class="breakdown-title">Estimated Compatibility Breakdown</h4>
                </div>
                <p class="breakdown-subtitle">Here is exactly how your overall score is composed across 5 distinct dimensions.</p>
            </div>

            <div class="breakdown-table-wrapper">
                <table class="breakdown-table">
                    <thead>
                        <tr>
                            <th>Dimension</th>
                            <th>Description</th>
                            <th>Points Earned</th>
                            <th>Max</th>
                            <th>Bar</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows.map(r => {
                            const pct = Math.round((r.points / r.max) * 100);
                            const barColor = pct >= 75 ? 'var(--green)' : pct >= 50 ? 'var(--yellow)' : 'var(--red)';
                            return `
                                <tr>
                                    <td><strong>${r.label}</strong></td>
                                    <td class="breakdown-desc-cell">${r.desc}</td>
                                    <td><span class="pts-badge">${r.points}</span></td>
                                    <td class="dim-max">/${r.max}</td>
                                    <td class="breakdown-bar-cell">
                                        <div class="mini-bar-track">
                                            <div class="mini-bar-fill" style="width:${pct}%;background:${barColor}"></div>
                                        </div>
                                        <span class="mini-bar-pct">${pct}%</span>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                    <tfoot>
                        <tr class="breakdown-total-row">
                            <td colspan="2"><strong>Total Compatibility</strong></td>
                            <td><strong class="total-pts-badge">${totalPts}</strong></td>
                            <td><strong>/100</strong></td>
                            <td><span class="total-status-pill">${UI.getScoreLabel(totalPts)}</span></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <div class="honest-disclaimer-card">
                <span class="disclaimer-icon">ℹ️</span>
                <div class="disclaimer-body">
                    <strong>Honest Assessment Disclaimer:</strong>
                    <p>${result?.disclaimer || "This score estimates how closely your resume aligns with the job description. It is not a hiring probability or guarantee of selection."}</p>
                </div>
            </div>
        `;
    },

    // ---- JD Requirements Classification ----
    renderJDRequirements(jdRequirements) {
        const container = document.getElementById('jd-requirements-container');
        if (!container) return;
        if (!jdRequirements) {
            container.innerHTML = `<p class="dim">No job description requirement tiers detected.</p>`;
            return;
        }

        const { mustHave = [], preferred = [], qualifications = [], responsibilities = [], skillsByTier } = jdRequirements;

        const renderListOrEmpty = (items, emptyMsg, pillClass = '') => {
            if (!items || items.length === 0) return `<p class="tier-empty-note">${emptyMsg}</p>`;
            if (pillClass) {
                return `<div class="tier-pills-wrap">${items.map(s => `<span class="skill-pill ${pillClass}">${UI.titleCase(s)}</span>`).join('')}</div>`;
            }
            return `<ul class="tier-list">${items.map(it => `<li>${it}</li>`).join('')}</ul>`;
        };

        container.innerHTML = `
            <div class="jd-tiers-grid">
                <div class="jd-tier-box tier-must-have">
                    <div class="jd-tier-header">
                        <span class="tier-icon">🔴</span>
                        <div>
                            <h4>Must-Have Requirements</h4>
                            <span class="tier-subtitle">Essential qualifications explicitly identified</span>
                        </div>
                    </div>
                    <div class="jd-tier-content">
                        ${renderListOrEmpty(mustHave, "No explicit must-have phrases detected. Core JD skills will be weighted evenly.")}
                        ${skillsByTier?.mustHave?.length ? `
                            <div class="tier-skills-subgroup">
                                <strong>Core Skills Extracted:</strong>
                                ${renderListOrEmpty(skillsByTier.mustHave.slice(0, 10), "", "pill-red")}
                            </div>
                        ` : ''}
                    </div>
                </div>

                <div class="jd-tier-box tier-preferred">
                    <div class="jd-tier-header">
                        <span class="tier-icon">🟡</span>
                        <div>
                            <h4>Preferred / Nice-to-Have</h4>
                            <span class="tier-subtitle">Bonus strengths that make candidates stand out</span>
                        </div>
                    </div>
                    <div class="jd-tier-content">
                        ${renderListOrEmpty(preferred, "No secondary bonus criteria specified.")}
                        ${skillsByTier?.preferred?.length ? `
                            <div class="tier-skills-subgroup">
                                <strong>Bonus Skills Extracted:</strong>
                                ${renderListOrEmpty(skillsByTier.preferred.slice(0, 10), "", "pill-yellow")}
                            </div>
                        ` : ''}
                    </div>
                </div>

                <div class="jd-tier-box tier-qualifications">
                    <div class="jd-tier-header">
                        <span class="tier-icon">🎓</span>
                        <div>
                            <h4>Qualifications & Degrees</h4>
                            <span class="tier-subtitle">Education, certifications and years of experience</span>
                        </div>
                    </div>
                    <div class="jd-tier-content">
                        ${renderListOrEmpty(qualifications, "No specific degree or certification restrictions detected.")}
                    </div>
                </div>

                <div class="jd-tier-box tier-responsibilities">
                    <div class="jd-tier-header">
                        <span class="tier-icon">💼</span>
                        <div>
                            <h4>Key Responsibilities</h4>
                            <span class="tier-subtitle">Day-to-day work and project ownership expected</span>
                        </div>
                    </div>
                    <div class="jd-tier-content">
                        ${renderListOrEmpty(responsibilities, "No structured responsibility bullet points extracted.")}
                    </div>
                </div>
            </div>
        `;
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
                <div class="ats-pass-pct" style="color:${passColor}">${passProbability}% Estimated ATS Compatibility</div>
                <p class="ats-pass-desc">Based on keyword and formatting alignment between your resume and the job description.</p>
                <p class="ats-disclaimer">⚠️ ATS systems vary widely between companies and software platforms. This is an estimate — not a guarantee of passing any specific ATS.</p>
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
        UI.renderJDRequirements(result.jdRequirements);
        UI.renderBreakdownTable(result.breakdown, result);
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

    // ---- Dedicated Job Match Results ----
    renderJobMatchResults(result, resumeTitle = 'Selected Resume') {
        const container = document.getElementById('jm-results-container');
        if (!container || !result) return;

        const score = result.score || 0;
        const color = score >= 75 ? 'var(--green)' : score >= 50 ? 'var(--yellow)' : 'var(--red)';
        const strongMatches = result.strongMatches || [];
        const partialMatches = result.partialMatches || [];
        const missingSkills = result.missingSkills || [];

        container.innerHTML = `
            <div class="result-card" style="margin-top: 10px;">
                <div class="card-header">
                    <div class="card-icon purple-bg">🎯</div>
                    <div>
                        <h3>Job Match Analysis — ${resumeTitle}</h3>
                        <p>Estimated compatibility score based on resume and job description requirements.</p>
                    </div>
                </div>

                <div class="score-display" style="margin-bottom: 24px;">
                    <div class="score-ring-wrap">
                        <svg width="140" height="140" viewBox="0 0 140 140">
                            <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="12" />
                            <circle cx="70" cy="70" r="54" fill="none" stroke="${color}" stroke-width="12" stroke-linecap="round"
                                style="stroke-dasharray: 339.29; stroke-dashoffset: ${339.29 - (339.29 * score / 100)};" />
                        </svg>
                        <div class="score-text-overlay">
                            <span class="score-number">${score}%</span>
                            <span style="color:${color}">${UI.getScoreLabel(score)}</span>
                        </div>
                    </div>
                    <div class="score-bars">
                        <div class="score-bar-row">
                            <div class="bar-meta"><span>Hard Skills Match</span><span class="bar-num">${result.skillScore || 0}%</span></div>
                            <div class="bar-track"><div class="bar-fill" style="width:${result.skillScore || 0}%;background:var(--green)"></div></div>
                        </div>
                        <div class="score-bar-row">
                            <div class="bar-meta"><span>Experience Alignment</span><span class="bar-num">${result.expScore || 0}%</span></div>
                            <div class="bar-track"><div class="bar-fill" style="width:${result.expScore || 0}%;background:var(--purple)"></div></div>
                        </div>
                        <div class="score-bar-row">
                            <div class="bar-meta"><span>ATS Keyword Fit</span><span class="bar-num">${result.keywordScore || 0}%</span></div>
                            <div class="bar-track"><div class="bar-fill" style="width:${result.keywordScore || 0}%;background:var(--cyan-light)"></div></div>
                        </div>
                    </div>
                </div>

                <!-- Skill Matching Transparency Breakdown -->
                <div style="margin-top: 16px;">
                    <h4 style="font-size:14px;font-weight:700;margin-bottom:12px">🧬 Skill Breakdown & Match Reasons</h4>
                    <div style="display:flex;flex-direction:column;gap:12px;">
                        <div>
                            <strong style="font-size:12.5px;color:var(--green-light)">✓ Strong / Exact Matches (${strongMatches.length}):</strong>
                            <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;">
                                ${strongMatches.map(s => `<span class="skill-pill pill-green">✓ ${s}</span>`).join('') || '<span style="color:var(--text-muted);font-size:12px">None detected</span>'}
                            </div>
                        </div>

                        ${partialMatches.length > 0 ? `
                        <div>
                            <strong style="font-size:12.5px;color:var(--yellow-light)">~ Similar / Related Technology (${partialMatches.length}):</strong>
                            <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;">
                                ${partialMatches.map(s => `<span class="skill-pill pill-yellow">~ ${s}</span>`).join('')}
                            </div>
                        </div>` : ''}

                        <div>
                            <strong style="font-size:12.5px;color:var(--red-light)">✗ Missing Important Skills (${missingSkills.length}):</strong>
                            <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;">
                                ${missingSkills.map(s => `<span class="skill-pill pill-red">✗ ${s}</span>`).join('') || '<span style="color:var(--text-muted);font-size:12px">None! Full skill coverage.</span>'}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Action to Studio -->
                <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border); display: flex; gap: 12px; flex-wrap: wrap;">
                    <button type="button" class="btn-primary" onclick="openActiveResumeInStudio()">✨ Improve Resume in Studio</button>
                    <button type="button" class="btn-secondary" onclick="DownloadReport.generate(window.lastMatchResult || result)">📥 Download Report</button>
                </div>
            </div>
        `;
        container.classList.remove('hidden');
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    // ---- Empty State Helper ----
    renderEmptyState(containerId, title, desc, btnText = '', btnAction = '') {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = `
            <div class="empty-state-card" style="text-align:center;padding:48px 24px;color:var(--text-muted);">
                <div style="font-size:42px;margin-bottom:12px;">📁</div>
                <h3 style="font-size:16px;font-weight:700;color:var(--text-primary);margin-bottom:6px;">${title}</h3>
                <p style="font-size:13px;max-width:420px;margin:0 auto 16px;">${desc}</p>
                ${btnText ? `<button type="button" class="btn-primary" onclick="${btnAction}">${btnText}</button>` : ''}
            </div>
        `;
    },

    // ---- Career Alignment Engine 10-Point Report ----
    renderCareerAlignmentReport(report) {
        const container = document.getElementById('career-alignment-report-container');
        if (!container || !report) return;

        const { overallAlignment, skillsFound, skillsMissing, partialMatches, experienceAlignment, atsRisks, improvementOpportunities, priorityGaps } = report;

        container.innerHTML = `
            <div class="alignment-report-card">
                <!-- 1. Overall Alignment Header -->
                <div class="alignment-header-banner ${overallAlignment.classType}">
                    <div class="alignment-score-badge">
                        <span class="as-score">${overallAlignment.score}%</span>
                        <span class="as-label">Fit Score</span>
                    </div>
                    <div class="alignment-header-text">
                        <div class="as-verdict-tag">${overallAlignment.verdict}</div>
                        <h3 class="as-title">Career Fit &amp; Readiness Assessment</h3>
                        <p class="as-summary">${overallAlignment.summary}</p>
                    </div>
                    <div class="alignment-header-actions">
                        <button type="button" class="btn-secondary btn-sm" onclick="showExplainabilityModal()">💡 Why this score?</button>
                        <button type="button" class="btn-primary btn-sm" onclick="navigateTo('studio')">✨ Optimize in Studio</button>
                    </div>
                </div>

                <!-- 10-Point Dimension Grid -->
                <div class="alignment-grid">
                    <!-- 2 & 3 & 4. Required & Preferred Skills -->
                    <div class="alignment-card">
                        <div class="ac-header">
                            <span class="ac-icon">✅</span>
                            <h4>Skills Alignment</h4>
                            <span class="ac-count">${skillsFound.totalFound} found / ${skillsMissing.totalMissing} missing</span>
                        </div>
                        <div class="ac-body">
                            <div class="skill-group">
                                <span class="sg-title text-green">✓ Required Skills Found (${skillsFound.mustHave.length})</span>
                                <div class="sg-pills">
                                    ${skillsFound.mustHave.map(s => `<span class="skill-pill pill-green">✓ ${s}</span>`).join('') || '<span class="text-muted">None detected</span>'}
                                </div>
                            </div>
                            ${skillsFound.preferred.length > 0 ? `
                            <div class="skill-group" style="margin-top:10px;">
                                <span class="sg-title text-cyan">⭐ Preferred Skills Found (${skillsFound.preferred.length})</span>
                                <div class="sg-pills">
                                    ${skillsFound.preferred.map(s => `<span class="skill-pill pill-cyan">★ ${s}</span>`).join('')}
                                </div>
                            </div>` : ''}
                            ${partialMatches.length > 0 ? `
                            <div class="skill-group" style="margin-top:10px;">
                                <span class="sg-title text-yellow">~ Related Stack Match (${partialMatches.length})</span>
                                <div class="sg-pills">
                                    ${partialMatches.map(s => `<span class="skill-pill pill-yellow">~ ${s}</span>`).join('')}
                                </div>
                            </div>` : ''}
                            <div class="skill-group" style="margin-top:10px;">
                                <span class="sg-title text-red">✗ Missing Required Skills (${skillsMissing.mustHave.length})</span>
                                <div class="sg-pills">
                                    ${skillsMissing.mustHave.map(s => `<span class="skill-pill pill-red">✗ ${s}</span>`).join('') || '<span class="text-muted">None! Full required coverage</span>'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 5. Experience Alignment & 6. ATS Risks -->
                    <div class="alignment-card">
                        <div class="ac-header">
                            <span class="ac-icon">📊</span>
                            <h4>Experience &amp; ATS Reliability</h4>
                            <span class="ac-badge ${experienceAlignment.status === 'Qualified Match' ? 'badge-green' : 'badge-yellow'}">${experienceAlignment.status}</span>
                        </div>
                        <div class="ac-body">
                            <div class="stat-bullet">
                                <strong>Role Scope:</strong> ${experienceAlignment.roleLevel} ${experienceAlignment.targetRole}
                                <p class="text-muted" style="margin-top:2px;font-size:12px">${experienceAlignment.notes}</p>
                            </div>
                            <div class="stat-bullet" style="margin-top:12px;">
                                <strong>ATS Formatting Risks:</strong>
                                ${atsRisks.length === 0 ? '<p class="text-green" style="font-size:12px;margin:2px 0 0">✓ Zero formatting risks detected. High machine readability.</p>' : `
                                    <ul style="margin:4px 0 0 16px;padding:0;font-size:12px;color:var(--yellow-light)">
                                        ${atsRisks.map(r => `<li>${r}</li>`).join('')}
                                    </ul>
                                `}
                            </div>
                        </div>
                    </div>

                    <!-- 7. Improvement Opportunities -->
                    <div class="alignment-card">
                        <div class="ac-header">
                            <span class="ac-icon">✍️</span>
                            <h4>Resume Optimization Opportunities</h4>
                            <span class="ac-count">${improvementOpportunities.length} opportunities</span>
                        </div>
                        <div class="ac-body">
                            <div class="opps-list">
                                ${improvementOpportunities.map(opp => `
                                    <div class="opp-item">
                                        <span class="opp-badge">${opp.area}</span>
                                        <p class="opp-text">${opp.recommendation}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <!-- 8. Priority Skill Gaps -->
                    <div class="alignment-card">
                        <div class="ac-header">
                            <span class="ac-icon">🎯</span>
                            <h4>Priority Skill Gaps</h4>
                            <span class="ac-count">${priorityGaps.length} critical gaps</span>
                        </div>
                        <div class="ac-body">
                            ${priorityGaps.length === 0 ? '<p class="text-green" style="font-size:12.5px;">✓ No major skill gaps detected for this position!</p>' : `
                                <div class="priority-gap-list">
                                    ${priorityGaps.map(g => `
                                        <div class="priority-gap-row">
                                            <div class="pgr-left">
                                                <span class="pgr-skill">${g.skill}</span>
                                                <span class="pgr-priority priority-${g.priority.toLowerCase()}">${g.priority} Priority</span>
                                            </div>
                                            <p class="pgr-reason">${g.reason}</p>
                                        </div>
                                    `).join('')}
                                </div>
                            `}
                        </div>
                    </div>
                </div>

                <!-- Navigation CTAs to Action Plan & Interview Ready -->
                <div class="alignment-footer-bar">
                    <button type="button" class="btn-primary" onclick="switchResultsTab('rtab-action-plan')">📅 View Day-by-Day Learning Roadmap</button>
                    <button type="button" class="btn-secondary" onclick="switchResultsTab('rtab-interview-ready')">🎤 Explore Interview Ready Questions</button>
                </div>
            </div>
        `;
    },

    // ---- Day-by-Day Skill Action Plan ----
    renderSkillActionPlan(actionPlans) {
        const container = document.getElementById('action-plan-container');
        if (!container) return;

        if (!actionPlans || actionPlans.length === 0) {
            container.innerHTML = `
                <div class="empty-state-card" style="text-align:center;padding:36px;">
                    <div style="font-size:36px;margin-bottom:8px">🎉</div>
                    <h4>No Skill Gaps Detected</h4>
                    <p style="font-size:13px;color:var(--text-muted)">Your resume demonstrates coverage for all primary required skills in this job description.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="action-plan-wrapper">
                <div class="action-plan-intro">
                    <h3>📅 Personalized Skill Gap Roadmaps</h3>
                    <p>Realistic, practical 5-day action plans to bridge missing technologies before your interview. Follow one topic per day with hands-on exercises.</p>
                </div>
                <div class="skill-roadmaps-list">
                    ${actionPlans.map(plan => `
                        <div class="roadmap-accordion-card">
                            <div class="rac-header">
                                <div class="rac-title-group">
                                    <span class="rac-badge priority-${plan.priority.toLowerCase()}">${plan.priority} Priority</span>
                                    <h4>${plan.skill}</h4>
                                    <span class="rac-hours">⏱️ ${plan.estimatedHours || '10 hours'}</span>
                                </div>
                                <p class="rac-reason">${plan.reason}</p>
                            </div>
                            <div class="rac-timeline">
                                ${plan.days.map(d => `
                                    <div class="rac-day-card">
                                        <div class="rdc-day-tag">${d.day}</div>
                                        <div class="rdc-content">
                                            <div class="rdc-topic">${d.topic}</div>
                                            <div class="rdc-details">${d.details}</div>
                                            <div class="rdc-exercise"><strong>💡 Practical Exercise:</strong> ${d.exercise}</div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="rac-footer">
                                <span><strong>Recommended Resource:</strong> ${plan.resource}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    // ---- Interview Ready (Tailored Questions) ----
    renderInterviewReady(interviewReady) {
        const container = document.getElementById('interview-ready-container');
        if (!container || !interviewReady) return;

        const { technicalTopics, likelyQuestions, projectQuestions, resumeQuestions, missingSkillQuestions, behavioralQuestions, totalQuestions } = interviewReady;

        container.innerHTML = `
            <div class="interview-ready-wrapper">
                <div class="interview-ready-header">
                    <div>
                        <h3>🎤 Interview Ready Preparation</h3>
                        <p>Questions tailored directly to your resume, detected skill gaps, and the target role requirements.</p>
                    </div>
                    <span class="ir-badge-total">${totalQuestions} Curated Questions</span>
                </div>

                <!-- Technical Focus Areas -->
                <div class="ir-section">
                    <h4 class="ir-sec-title">🛠️ Core Technical Topics to Revise</h4>
                    <div class="ir-topics-grid">
                        ${technicalTopics.map(t => `
                            <div class="ir-topic-card">
                                <h5>${t.topic}</h5>
                                <ul>${t.focusAreas.map(f => `<li>${f}</li>`).join('')}</ul>
                                <span class="ir-importance">${t.importance}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Questions by Category -->
                <div class="ir-section">
                    <h4 class="ir-sec-title">❓ Likely Interview Questions &amp; How to Answer</h4>
                    <div class="ir-questions-list">
                        ${[...likelyQuestions, ...projectQuestions, ...resumeQuestions, ...missingSkillQuestions, ...behavioralQuestions].map((q, idx) => `
                            <div class="ir-q-card">
                                <div class="ir-q-header">
                                    <span class="ir-cat-tag">${q.category}</span>
                                    <span class="ir-q-num">Q${idx + 1}</span>
                                </div>
                                <div class="ir-question">${q.question}</div>
                                <div class="ir-why-box">
                                    <strong>Why the interviewer asks this:</strong> ${q.whyAsked}
                                </div>
                                <div class="ir-strategy-box">
                                    <strong>Recommended Answer Strategy:</strong> ${q.answerStrategy}
                                </div>
                                <div class="ir-outline-box">
                                    <strong>Outline:</strong> ${q.outline}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    // ---- Explainability "Why this score?" ----
    renderExplainability(explainability) {
        const container = document.getElementById('explainability-container');
        if (!container || !explainability) return;

        const { categories, compositeScore, verdict, verdictDisclaimer } = explainability;

        container.innerHTML = `
            <div class="explainability-sheet">
                <div class="exp-sheet-header">
                    <div class="exp-score-callout">
                        <span class="esc-score">${compositeScore}%</span>
                        <div>
                            <h4>${verdict}</h4>
                            <p>${verdictDisclaimer}</p>
                        </div>
                    </div>
                </div>
                <div class="exp-categories-list">
                    ${categories.map(cat => `
                        <div class="exp-category-card">
                            <div class="ecc-header">
                                <div class="ecc-title-group">
                                    <h5>${cat.name}</h5>
                                    <span class="ecc-status status-${cat.statusClass}">${cat.status}</span>
                                </div>
                                <span class="ecc-pts">${cat.points} / ${cat.maxPoints} pts</span>
                            </div>
                            <p class="ecc-explanation">${cat.explanation}</p>
                            <div class="ecc-items-grid">
                                ${cat.matched.length > 0 ? `
                                <div class="ecc-col col-matched">
                                    <h6>✓ Matched</h6>
                                    <ul>${cat.matched.map(m => `<li><strong>${m.item}:</strong> ${m.reason}</li>`).join('')}</ul>
                                </div>` : ''}
                                ${cat.partiallyMatched.length > 0 ? `
                                <div class="ecc-col col-partial">
                                    <h6>~ Partially Matched</h6>
                                    <ul>${cat.partiallyMatched.map(m => `<li><strong>${m.item}:</strong> ${m.reason}</li>`).join('')}</ul>
                                </div>` : ''}
                                ${cat.missing.length > 0 ? `
                                <div class="ecc-col col-missing">
                                    <h6>✗ Missing Gap</h6>
                                    <ul>${cat.missing.map(m => `<li><strong>${m.item}:</strong> ${m.reason}</li>`).join('')}</ul>
                                </div>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
};

if (typeof window !== 'undefined') {
    window.UI = UI;
}
if (typeof module !== 'undefined') {
    module.exports = UI;
}

