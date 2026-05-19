/* ═══════════════════════════════════════════
   MURMUR.RED — script.js
   ═══════════════════════════════════════════ */

// ─── LOADER ───────────────────────────────
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    const bar    = document.getElementById('loaderBar');
    const status = document.getElementById('loaderStatus');
    const msgs   = ['INITIALIZING...', 'LOADING ASSETS...', 'CALIBRATING UI...', 'READY.'];
    let p = 0, i = 0;

    const tick = setInterval(() => {
        p += Math.random() * 18 + 8;
        if (p > 100) p = 100;
        bar.style.width = p + '%';
        status.textContent = msgs[Math.min(Math.floor(p / 30), msgs.length - 1)];
        if (p >= 100) {
            clearInterval(tick);
            setTimeout(() => {
                loader.classList.add('hidden');
                initScrollReveal();
                initSkillBars();
            }, 400);
        }
    }, 80);
});

// ─── CUSTOM CURSOR ────────────────────────
const dot  = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left  = mx + 'px';
    dot.style.top   = my + 'px';
});

function animRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
}
animRing();

// ─── PARTICLE CANVAS ──────────────────────
const canvas = document.getElementById('bgCanvas');
const ctx    = canvas.getContext('2d');
let W, H, particles = [];

function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', () => { resize(); buildParticles(); });

class Particle {
    constructor() { this.reset(); }
    reset() {
        this.x  = Math.random() * W;
        this.y  = Math.random() * H;
        this.vx = (Math.random() - .5) * .4;
        this.vy = (Math.random() - .5) * .4;
        this.r  = Math.random() * 1.5 + .5;
        this.a  = Math.random() * .5 + .1;
        this.c  = Math.random() < .15 ? '#ff0044' : Math.random() < .4 ? '#00f5ff' : '#ffffff';
    }
    update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.c + Math.floor(this.a * 255).toString(16).padStart(2,'0');
        ctx.fill();
    }
}

function buildParticles() {
    const count = Math.min(Math.floor(W * H / 15000), 120);
    particles = Array.from({length: count}, () => new Particle());
}
buildParticles();

function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const d  = Math.sqrt(dx*dx + dy*dy);
            if (d < 100) {
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(255,255,255,${(1 - d/100) * 0.04})`;
                ctx.lineWidth = .5;
                ctx.stroke();
            }
        }
    }
}

function renderCanvas() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    connectParticles();
    requestAnimationFrame(renderCanvas);
}
renderCanvas();

// ─── NAVBAR SCROLL ────────────────────────
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
});

// ─── MOBILE NAV ───────────────────────────
function toggleMenu() {
    const links = document.getElementById('navLinks');
    const ham   = document.getElementById('hamburger');
    links.classList.toggle('open');
    ham.classList.toggle('open');
}
function closeMenu() {
    document.getElementById('navLinks').classList.remove('open');
    document.getElementById('hamburger').classList.remove('open');
}

// ─── SCROLL REVEAL ────────────────────────
function initScrollReveal() {
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                const items = e.target.querySelectorAll('.reveal-item');
                items.forEach((item, i) => {
                    setTimeout(() => item.classList.add('visible'), i * 80);
                });
                obs.unobserve(e.target);
            }
        });
    }, { threshold: .12 });
    document.querySelectorAll('.reveal-section').forEach(el => obs.observe(el));
}

// ─── SKILL BARS ───────────────────────────
function initSkillBars() {
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.querySelectorAll('.sk-fill').forEach(bar => {
                    bar.style.width = bar.dataset.w + '%';
                });
                obs.unobserve(e.target);
            }
        });
    }, { threshold: .3 });
    document.querySelectorAll('.s-about').forEach(el => obs.observe(el));
}

// ─── TABS ─────────────────────────────────
function switchTab(id, btn) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('panel-' + id).classList.add('active');
    btn.classList.add('active');
}

// ─── COMPANY TYPE TOGGLE ──────────────────
let companyType = 'zzp';
function setCompanyType(type) {
    companyType = type;
    document.getElementById('btnZZP').classList.toggle('active', type === 'zzp');
    document.getElementById('btnBV').classList.toggle('active', type === 'bv');
    calcRevenue();
}

// ─── NL REVENUE CALCULATOR ────────────────
function fmt(n) { return '€' + Math.round(n).toLocaleString('nl-NL'); }
function fmtPct(n) { return Math.round(n) + '%'; }

function calcNLTax_ZZP(grossProfit) {
    const zza = 3750;
    const afterZZA = Math.max(0, grossProfit - zza);
    const mkb  = afterZZA * 0.1331;
    const taxable = afterZZA - mkb;

    // Box 1 brackets 2024
    let tax = 0;
    if (taxable <= 75518) {
        tax = taxable * 0.3697;
    } else {
        tax = 75518 * 0.3697 + (taxable - 75518) * 0.4950;
    }

    // Heffingskorting (simplified)
    let hk = 0;
    if (taxable <= 24813) hk = 3070;
    else if (taxable <= 73031) hk = Math.max(0, 3070 - (taxable - 24813) * 0.06095);

    // ZVW
    const zvw = Math.min(afterZZA * 0.0565, 3700);

    return {
        tax: Math.max(0, tax - hk),
        zvw,
        mkb,
        taxable,
        afterZZA,
        total: Math.max(0, tax - hk) + zvw
    };
}

function calcNLTax_BV(grossSalary) {
    // DGA salary: straightforward income tax on salary, VpB on company profit
    let tax = 0;
    if (grossSalary <= 75518) tax = grossSalary * 0.3697;
    else tax = 75518 * 0.3697 + (grossSalary - 75518) * 0.4950;

    let hk = 0;
    if (grossSalary <= 24813) hk = 3070;
    else if (grossSalary <= 73031) hk = Math.max(0, 3070 - (grossSalary - 24813) * 0.06095);

    const zvw = Math.min(grossSalary * 0.0565, 3700);
    const netto = grossSalary - Math.max(0, tax - hk) - zvw;
    return { tax: Math.max(0, tax - hk), zvw, netto, total: Math.max(0, tax - hk) + zvw };
}

function findGross(targetNetAnnual, mode) {
    let lo = targetNetAnnual, hi = targetNetAnnual * 4;
    for (let i = 0; i < 80; i++) {
        const mid  = (lo + hi) / 2;
        const info = mode === 'zzp' ? calcNLTax_ZZP(mid) : calcNLTax_BV(mid);
        const net  = mid - info.total;
        if (Math.abs(net - targetNetAnnual) < 1) return { gross: mid, info };
        if (net < targetNetAnnual) lo = mid; else hi = mid;
    }
    const info = mode === 'zzp' ? calcNLTax_ZZP((lo+hi)/2) : calcNLTax_BV((lo+hi)/2);
    return { gross: (lo+hi)/2, info };
}

function calcRevenue() {
    const netMo    = +document.getElementById('slNet').value;
    const expMo    = +document.getElementById('slExp').value;
    const hours    = +document.getElementById('slHours').value;

    document.getElementById('netVal').textContent   = fmt(netMo);
    document.getElementById('expVal').textContent   = fmt(expMo);
    document.getElementById('hoursVal').textContent = hours + 'h';

    const netAnnual = netMo * 12;
    const expAnnual = expMo * 12;

    const { gross, info } = findGross(netAnnual, companyType);
    const revenueAnnual = gross + expAnnual;
    const revenueMo = revenueAnnual / 12;
    const taxMo = info.total / 12;
    const eff = (info.total / gross) * 100;
    const hr = revenueMo / hours;
    const dr = hr * 8;

    document.getElementById('resRevenue').textContent = fmt(revenueMo);
    document.getElementById('resAnnual').textContent  = fmt(revenueAnnual) + ' / year';
    document.getElementById('resTax').textContent     = fmt(taxMo);
    document.getElementById('resTaxRate').textContent = fmtPct(eff);
    document.getElementById('resDay').textContent     = fmt(dr);
    document.getElementById('resHour').textContent    = fmt(hr);

    // Breakdown
    document.getElementById('bdGross').textContent   = fmt(gross);
    if (companyType === 'zzp') {
        document.getElementById('bdMKB').textContent = '−' + fmt(info.mkb);
        document.getElementById('bdTaxable').textContent = fmt(info.taxable);
    } else {
        document.getElementById('bdMKB').textContent = 'N/A (BV)';
        document.getElementById('bdTaxable').textContent = fmt(gross);
    }
    document.getElementById('bdIncomeTax').textContent = '−' + fmt(info.tax);
    document.getElementById('bdZVW').textContent      = '−' + fmt(info.zvw);
    document.getElementById('bdNet').textContent      = fmt(netAnnual);
}
calcRevenue();

// ─── P&L PLANNER ──────────────────────────
const industryProfiles = {
    saas:        { label:'SaaS / Software',   cogs:.18, sm:.32, rd:.22, ga:.10, badge:'badge-saas' },
    gaming:      { label:'Gaming / Mobile',   cogs:.25, sm:.28, rd:.20, ga:.08, badge:'badge-gaming' },
    ecom:        { label:'E-commerce / D2C',  cogs:.45, sm:.25, rd:.05, ga:.08, badge:'badge-ecom' },
    agency:      { label:'Agency / Services', cogs:.35, sm:.18, rd:.05, ga:.12, badge:'badge-agency' },
    marketplace: { label:'Marketplace',       cogs:.22, sm:.30, rd:.18, ga:.10, badge:'badge-marketplace' },
    fintech:     { label:'FinTech',           cogs:.20, sm:.28, rd:.25, ga:.12, badge:'badge-fintech' },
};

function f(n) { return n < 0 ? '(€' + Math.abs(Math.round(n)).toLocaleString('nl-NL') + ')' : '€' + Math.round(n).toLocaleString('nl-NL'); }
function cls(n) { return n >= 0 ? 'green' : 'red'; }

function generatePL() {
    const name    = document.getElementById('plName').value.trim() || 'Your Startup';
    const ind     = document.getElementById('plIndustry').value;
    const rev     = parseFloat(document.getElementById('plRevenue').value) || 0;
    const team    = parseInt(document.getElementById('plTeam').value)       || 0;
    const salary  = parseFloat(document.getElementById('plSalary').value)   || 0;
    const fixed   = parseFloat(document.getElementById('plFixed').value)    || 0;
    const prof    = industryProfiles[ind];

    const cogs   = rev * prof.cogs;
    const gp     = rev - cogs;
    const gpMarg = rev ? (gp/rev*100) : 0;

    const salTotal = team * salary;
    const sm       = rev * prof.sm;
    const rd       = rev * prof.rd;
    const ga       = rev * prof.ga + fixed;
    const opex     = salTotal + sm + rd + ga;

    const ebitda   = gp - opex;
    const ebitdaMarg = rev ? (ebitda/rev*100) : 0;
    const burn     = Math.max(0, -ebitda);
    const runway   = burn > 0 ? '?' : '∞';

    const out = document.getElementById('plOutput');
    out.innerHTML = `
        <div class="pl-result-header">
            <div>
                <div class="pl-co-name">${name}</div>
                <div class="pl-co-meta">Monthly P&L · ${new Date().toLocaleDateString('en-GB',{month:'long',year:'numeric'})}</div>
            </div>
            <span class="pl-industry-badge ${prof.badge}">${prof.label}</span>
        </div>

        <div class="pl-section">
            <div class="pl-section-title">Revenue</div>
            <div class="pl-row"><span>Monthly Revenue</span><span class="pl-amt green">${f(rev)}</span></div>
        </div>

        <div class="pl-section">
            <div class="pl-section-title">Cost of Revenue (COGS · ${Math.round(prof.cogs*100)}%)</div>
            <div class="pl-row"><span>Direct Costs / COGS</span><span class="pl-amt red">${f(-cogs)}</span></div>
            <div class="pl-row total"><span>Gross Profit (${Math.round(gpMarg)}% margin)</span><span class="pl-amt ${cls(gp)}">${f(gp)}</span></div>
        </div>

        <div class="pl-section">
            <div class="pl-section-title">Operating Expenses</div>
            <div class="pl-row"><span>Personnel (${team} × ${f(salary)})</span><span class="pl-amt red">${f(-salTotal)}</span></div>
            <div class="pl-row"><span>Sales &amp; Marketing (${Math.round(prof.sm*100)}%)</span><span class="pl-amt red">${f(-sm)}</span></div>
            <div class="pl-row"><span>R&amp;D / Product (${Math.round(prof.rd*100)}%)</span><span class="pl-amt red">${f(-rd)}</span></div>
            <div class="pl-row"><span>G&amp;A + Fixed Costs</span><span class="pl-amt red">${f(-ga)}</span></div>
            <div class="pl-row total"><span>Total OpEx</span><span class="pl-amt red">${f(-opex)}</span></div>
        </div>

        <div class="pl-section">
            <div class="pl-row total" style="font-size:17px">
                <span>EBITDA (${Math.round(ebitdaMarg)}% margin)</span>
                <span class="pl-amt ${cls(ebitda)}">${f(ebitda)}</span>
            </div>
        </div>

        <div class="kpi-row">
            <div class="kpi-box">
                <div class="kpi-box-l">Gross Margin</div>
                <div class="kpi-box-v ${gpMarg>=40?'green':gpMarg>=20?'yellow':'red'}">${Math.round(gpMarg)}%</div>
            </div>
            <div class="kpi-box">
                <div class="kpi-box-l">Monthly Burn</div>
                <div class="kpi-box-v ${burn===0?'green':'red'}">${burn===0?'€0':f(-burn)}</div>
            </div>
            <div class="kpi-box">
                <div class="kpi-box-l">EBITDA Margin</div>
                <div class="kpi-box-v ${ebitdaMarg>=15?'green':ebitdaMarg>=0?'yellow':'red'}">${Math.round(ebitdaMarg)}%</div>
            </div>
            <div class="kpi-box">
                <div class="kpi-box-l">Break-Even Rev.</div>
                <div class="kpi-box-v cyan">${rev>0?Math.round(opex/(1-prof.cogs)).toLocaleString('nl-NL'):'N/A'}</div>
            </div>
            <div class="kpi-box">
                <div class="kpi-box-l">Revenue / Head</div>
                <div class="kpi-box-v">${team>0?f(rev/team):'N/A'}</div>
            </div>
            <div class="kpi-box">
                <div class="kpi-box-l">OpEx Ratio</div>
                <div class="kpi-box-v ${rev>0&&(opex/rev)<.7?'green':'red'}">${rev>0?Math.round(opex/rev*100)+'%':'N/A'}</div>
            </div>
        </div>

        <button class="copy-btn" onclick="copyPL(this, '${name}', ${rev}, ${gp}, ${ebitda})">
            📋 Copy Summary
        </button>
    `;
}

function copyPL(btn, name, rev, gp, ebitda) {
    const txt = `P&L SUMMARY — ${name}\nRevenue: €${Math.round(rev).toLocaleString()}\nGross Profit: €${Math.round(gp).toLocaleString()}\nEBITDA: €${Math.round(ebitda).toLocaleString()}\nGenerated by murmur.red`;
    navigator.clipboard.writeText(txt).then(() => {
        btn.textContent = '✓ Copied!';
        setTimeout(() => btn.textContent = '📋 Copy Summary', 2000);
    });
}

// ─── SWIM COACH AI ────────────────────────
let swimLevel   = 'water-fear';
let sessionType = 'pool';

function selectLevel(el) {
    document.querySelectorAll('.level-card').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    swimLevel = el.dataset.level;
}
function setSession(type) {
    sessionType = type;
    document.getElementById('btnPool').classList.toggle('active', type === 'pool');
    document.getElementById('btnDry').classList.toggle('active',  type === 'dry');
}

const swimData = {
    'water-fear': {
        label: 'Water Fear',
        pool: {
            phases: [
                { name: 'Warm-Up', time: '0–10 min', exercises: [
                    'Stand in shallow end, both hands on wall — feel the temperature, breathe slowly',
                    'Gently splash water on arms and face — no rush, no pressure',
                    'Walk in water: feel the resistance and buoyancy',
                    'Blow bubbles with mouth at water surface — 10 reps'
                ]},
                { name: 'Breath Control & Face Immersion', time: '10–25 min', exercises: [
                    'Deep inhale, exhale through mouth at water surface — 10 reps',
                    'Lower chin into water, then back up — gradually lower each time',
                    'Face fully in water for 2 seconds while holding wall — 5 reps',
                    'Blow bubbles face-down while holding wall — build to 5 seconds'
                ]},
                { name: 'Floating Introduction', time: '25–40 min', exercises: [
                    'Back float with instructor support — focus on ears in water',
                    'Starfish float on back with instructor hands under lower back',
                    'Front float with face down, instructor holds (2–3 seconds)',
                    'Exhale, float, feel buoyancy — repeat with longer hold times'
                ]},
                { name: 'Cool-Down', time: '40–50 min', exercises: [
                    'Walk slowly in water, breathe deeply',
                    'Celebrate achievements — every small step counts',
                    'Debrief: what felt safe, what needs more work'
                ]}
            ]
        },
        dry: {
            phases: [
                { name: 'Breathing & Relaxation', time: '0–15 min', exercises: [
                    'Box breathing: inhale 4 counts, hold 4, exhale 4, hold 4 — 5 rounds',
                    'Diaphragmatic breathing lying on mat — hand on belly',
                    'Visualization: imagine yourself floating calmly, feeling safe',
                    'Progressive muscle relaxation: tense and release each muscle group'
                ]},
                { name: 'Body Awareness & Confidence', time: '15–35 min', exercises: [
                    'Balance board standing — builds proprioception and confidence',
                    'Arm stroke mechanics lying on mat (freestyle arm circles)',
                    'Leg kick practice on mat — flutter kick rhythm',
                    'Plank hold (20 sec) — builds core stability for floating'
                ]},
                { name: 'Mental Training', time: '35–45 min', exercises: [
                    'Watch short swimming video, identify the body position',
                    'Breathing simulation: face in towel, exhale practice',
                    'Set one achievable goal for next pool session'
                ]}
            ]
        },
        feedback: (name, dur) =>
`SESSION FEEDBACK — Water Fear
Date: ${new Date().toLocaleDateString('en-GB')}
Swimmer: ${name || '[Name]'} · Duration: ${dur} min

✅ ACHIEVEMENTS THIS SESSION:
· [Describe 1–2 specific things they did well]

💪 SHOWED COURAGE WITH:
· [Note any moment they pushed past fear]

🎯 NEXT SESSION FOCUS:
· [Single skill to build on]

💬 COACH NOTES:
· Fear level (1–10): [  ]
· Water confidence change: [Better / Same / Needs support]
· Recommended next step: [  ]

📝 REMINDER: Progress with water fear is non-linear.
   Celebrate every win, no matter how small.`
    },

    'beginner': {
        label: 'Beginner',
        pool: {
            phases: [
                { name: 'Warm-Up', time: '0–10 min', exercises: [
                    'Easy breaststroke or flutter kick with board — 2×25m',
                    'Arm circles in water — front and back',
                    'Face immersion practice: 5× hold for 5 seconds',
                    'Push & glide from wall — feel streamline position'
                ]},
                { name: 'Technique Drills', time: '10–30 min', exercises: [
                    'Freestyle arms only with kickboard between legs — 4×25m',
                    'Kick drills: flutter kick with board, focus on ankle flexibility — 4×25m',
                    'Breathing drill: side breathing every 3 strokes — 4×25m',
                    'Full freestyle with focus on ONE thing: high elbow catch'
                ]},
                { name: 'Main Set', time: '30–45 min', exercises: [
                    '4×50m freestyle with 30s rest — focus on breathing rhythm',
                    '2×25m backstroke — feel the different body position',
                    '100m easy any stroke — focus on relaxation'
                ]},
                { name: 'Cool-Down', time: '45–55 min', exercises: [
                    '100m easy backstroke — unwind',
                    'Static stretches on pool edge: shoulder, hip flexor',
                    'Float on back 30 seconds — quiet awareness'
                ]}
            ]
        },
        dry: {
            phases: [
                { name: 'Warm-Up', time: '0–10 min', exercises: [
                    'Jump rope 3 min (or high knees in place)',
                    'Shoulder rolls, arm circles, hip circles',
                    'Cat-cow stretch — mobilizes spine for streamline'
                ]},
                { name: 'Technique on Dry Land', time: '10–30 min', exercises: [
                    'Freestyle arm stroke on swim bench or lying prone — 3×30 reps',
                    'Breaststroke arm pull pattern standing — 3×20 reps',
                    'Flutter kick lying prone on bench — 3×30 sec',
                    'Breathing practice: turn head side to side, exhale in "down" position'
                ]},
                { name: 'Strength & Mobility', time: '30–50 min', exercises: [
                    'Lat pulldown or resistance band pulldown — 3×12 (builds catch)',
                    'Glute bridges — 3×15 (builds kick power)',
                    'Dead bug exercise — 3×10 (core stability)',
                    'Ankle circles and calf raises — ankle flexibility for kick'
                ]},
                { name: 'Cool-Down', time: '50–60 min', exercises: [
                    'Chest and shoulder stretch — doorway stretch 30s each',
                    'Hip flexor stretch — 30s each side',
                    'Breathing: 5 slow deep breaths, count exhale to 6'
                ]}
            ]
        },
        feedback: (name, dur) =>
`SESSION FEEDBACK — Beginner
Date: ${new Date().toLocaleDateString('en-GB')}
Swimmer: ${name || '[Name]'} · Duration: ${dur} min

✅ TECHNIQUE WINS:
· Breathing: [Consistent / Needs work / Improved]
· Body position: [Flat / Hips sinking / Good]
· Arm stroke: [Clean catch / Crossing midline / Elbow drop]

📍 KEY CORRECTION THIS SESSION:
· [One specific technical correction given]

🎯 DRILL FOR NEXT SESSION:
· [Name the drill + what it fixes]

📊 SETS COMPLETED:
· Distance: [  ]m
· Main set: [  ]×[  ]m @ [  ]s rest

💬 OVERALL ASSESSMENT:
· Consistency: [1–5]
· Effort level: [1–5]
· Ready to progress: [Yes / 2–3 more sessions]`
    },

    'intermediate': {
        label: 'Intermediate',
        pool: {
            phases: [
                { name: 'Warm-Up', time: '0–10 min', exercises: [
                    '200m easy freestyle — focus on long, smooth stroke',
                    '100m kick only, no board',
                    '100m pull buoy — arms only, feel the catch',
                    '4×25m build speed (easy → moderate → fast → easy)'
                ]},
                { name: 'Drill Set', time: '10–25 min', exercises: [
                    'Fingertip drag drill — 4×25m (high elbow recovery)',
                    'Catch-up drill — 4×25m (timing and balance)',
                    'Underwater dolphin kicks off every wall — 6 kicks minimum',
                    'Side kick drill — 4×25m (body rotation mechanics)'
                ]},
                { name: 'Main Set (Threshold)', time: '25–50 min', exercises: [
                    '6×100m at threshold pace (85% effort) — 20s rest',
                    '4×50m negative split (second 25 faster than first)',
                    '2×200m steady aerobic — focus on maintaining stroke count'
                ]},
                { name: 'Cool-Down', time: '50–60 min', exercises: [
                    '200m easy backstroke — flush lactic acid',
                    '4×25m easy breaststroke',
                    'Stretch in water: calf, shoulder, chest'
                ]}
            ]
        },
        dry: {
            phases: [
                { name: 'Activation', time: '0–10 min', exercises: [
                    '5 min light cardio (row, bike, or jog)',
                    'Band pull-aparts — 2×15 (shoulder health)',
                    'Thoracic rotation stretch — 10 reps each side'
                ]},
                { name: 'Strength', time: '10–35 min', exercises: [
                    'Lat pulldown — 4×10 (heavy, simulate catch)',
                    'Single-arm cable row — 3×12 each side',
                    'Romanian deadlift — 3×10 (posterior chain for kick)',
                    'Copenhagen plank — 3×20s each side (hip stability)'
                ]},
                { name: 'Power & Speed', time: '35–50 min', exercises: [
                    'Med ball slam — 3×8 (explosive power)',
                    'Resistance band sprint drill — 3×10s',
                    'Box jumps — 3×6 (fast-twitch for start/turn)',
                    'Core: cable woodchops 3×10 each side'
                ]},
                { name: 'Mobility', time: '50–60 min', exercises: [
                    'Overhead squat with PVC — 2×10 (full body mobility)',
                    'Hip 90/90 stretch — 60s each side',
                    'Neck and shoulder release — 30s each direction'
                ]}
            ]
        },
        feedback: (name, dur) =>
`SESSION FEEDBACK — Intermediate
Date: ${new Date().toLocaleDateString('en-GB')}
Swimmer: ${name || '[Name]'} · Duration: ${dur} min

📊 PERFORMANCE DATA:
· Main set avg pace: [  ]/100m
· Best 100m split: [  ]
· Stroke count / 25m: [  ]
· Turns rating (1–5): [  ]

✅ TECHNICAL HIGHLIGHTS:
· [What they did well technically]

⚠️ AREAS TO ADDRESS:
· [1–2 specific technical issues]

🎯 FOCUS FOR NEXT SESSION:
· [Specific element + drill to use]

💡 COACH INSIGHT:
· [Observation about stroke pattern or mental approach]

📈 PROGRESSION NOTE:
· [Comparison to last session — improving in what area?]`
    },

    'advanced': {
        label: 'Advanced',
        pool: {
            phases: [
                { name: 'Warm-Up', time: '0–15 min', exercises: [
                    '400m easy (100 free / 100 back / 100 breast / 100 free)',
                    '4×50m drill set (choice of drill targeting weakness)',
                    '6×25m build to race pace — 10s rest',
                    'Activation: 4 dive starts or turn practice'
                ]},
                { name: 'Main Set (VO₂ Max / Race Pace)', time: '15–45 min', exercises: [
                    '10×100m at race pace + 3s — 30s rest (aerobic base)',
                    '6×50m at race pace — 45s rest (speed endurance)',
                    '4×25m max sprint — full recovery',
                    'OR: 2×400m race simulation (even-split discipline)'
                ]},
                { name: 'Specificity Drills', time: '45–55 min', exercises: [
                    'Underwater dolphins: 4×15m max depth and speed',
                    'Race-pace breakout drill — 6 reps',
                    'Touch turn practice (breaststroke) or flip turn optimization'
                ]},
                { name: 'Cool-Down', time: '55–65 min', exercises: [
                    '400m easy mixed strokes',
                    'Stretch in pool: lat, hip flexor, ankle',
                    'Review pace data — discuss splits'
                ]}
            ]
        },
        dry: {
            phases: [
                { name: 'CNS Activation', time: '0–10 min', exercises: [
                    'Jump rope complex: 2 min normal, 30s double-unders',
                    'Band activation: clam shells, side walks, pull-aparts',
                    'Dynamic mobility: leg swings, thoracic rotation, hip circles'
                ]},
                { name: 'Olympic Lifting / Power', time: '10–30 min', exercises: [
                    'Hang clean or power clean — 4×4 (explosive hip extension)',
                    'Jump squats — 4×5 (fast-twitch activation)',
                    'Banded sprint starts — 6×5m (reaction + power)',
                    'Med ball chest pass — 3×6 (upper body power for pull)'
                ]},
                { name: 'Strength', time: '30–50 min', exercises: [
                    'Weighted pull-ups — 4×6 (lat strength for catch)',
                    'Barbell RDL — 4×8 (posterior chain power)',
                    'Single-leg box step-up — 3×8 each (balance + leg drive)',
                    'Pallof press — 3×10 each side (anti-rotation core)'
                ]},
                { name: 'Recovery', time: '50–60 min', exercises: [
                    'Foam roll: thoracic spine, lats, glutes — 60s each',
                    'Contrast therapy recommendation: 10 min cold (if available)',
                    'HRV / readiness check for next session planning'
                ]}
            ]
        },
        feedback: (name, dur) =>
`SESSION FEEDBACK — Advanced
Date: ${new Date().toLocaleDateString('en-GB')}
Swimmer: ${name || '[Name]'} · Duration: ${dur} min

📊 PERFORMANCE METRICS:
· Main set: [  ]×[  ]m @ avg [  ]/100m
· Race pace 100m: [  ] (target: [  ])
· Stroke count: [  ] | Stroke rate: [  ] spm
· Turn time (wall to 5m): [  ]s

🔬 TECHNICAL ANALYSIS:
· Catch: [  ] | Pull: [  ] | Rotation: [  ] | Kick: [  ]

📈 VS. LAST SESSION:
· Improved: [  ]
· Regressed: [  ]
· Consistent: [  ]

🎯 PERFORMANCE PRIORITY (next 2 weeks):
· [Specific race element or time target]

💡 MENTAL / RACE STRATEGY NOTE:
· [Pacing discipline / turn aggression / breathing pattern]`
    }
};

function generateSwim() {
    const name = document.getElementById('swimName').value.trim();
    const dur  = document.getElementById('swimDuration').value;
    const data = swimData[swimLevel];
    const plan = data[sessionType];
    const out  = document.getElementById('swimOutput');

    const phases = plan.phases.map(ph => `
        <div class="swim-phase">
            <div class="swim-phase-title">${ph.name}</div>
            <div class="swim-phase-time">⏱ ${ph.time}</div>
            ${ph.exercises.map(ex => `<div class="swim-ex">${ex}</div>`).join('')}
        </div>
    `).join('');

    out.innerHTML = `
        <div class="swim-plan">
            <div class="swim-plan-header">
                <div>
                    <div class="swim-plan-title">
                        ${data.label} · ${sessionType === 'pool' ? '🏊 Pool' : '💪 Dry Training'}
                        ${name ? ' · ' + name : ''}
                    </div>
                    <div class="swim-plan-meta">${dur} min session · ${new Date().toLocaleDateString('en-GB')}</div>
                </div>
            </div>
            ${phases}
            <button class="copy-btn" onclick="copySwim(this)">📋 Copy Training Plan</button>
        </div>
    `;
}

function copySwim(btn) {
    const text = document.getElementById('swimOutput').innerText;
    navigator.clipboard.writeText(text).then(() => {
        btn.textContent = '✓ Copied!';
        setTimeout(() => btn.textContent = '📋 Copy Training Plan + Feedback', 2000);
    });
}

// Game opens in new tab via HTML anchor tag
