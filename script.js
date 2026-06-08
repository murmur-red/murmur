/* murmur.red — script.js */

const WORKER_URL   = 'https://murmur-qbr.murmur-red1.workers.dev';
const ARTICLES_URL = 'https://raw.githubusercontent.com/murmur-red/murmur/main/articles.json';

// ── Scramble utility ────────────────────────────────────
function scramble(el, final, ms) {
  const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789·!';
  const n = final.length;
  const t0 = performance.now();
  const run = now => {
    const p = Math.min((now - t0) / ms, 1);
    const done = Math.floor(p * n);
    el.textContent = final.split('').map((c,i) => {
      if (c === ' ' || c === '.') return c;
      return i < done ? c : pool[Math.floor(Math.random() * pool.length)];
    }).join('');
    if (p < 1) requestAnimationFrame(run);
    else el.textContent = final;
  };
  requestAnimationFrame(run);
}

// ── Loader ──────────────────────────────────────────────
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  const bar    = document.getElementById('lBar');
  const pct    = document.getElementById('lPct');
  const logo   = document.getElementById('lLogo');

  logo.textContent = '';
  scramble(logo, 'MURMUR.RED', 1500);

  let p = 0;
  const tick = setInterval(() => {
    p += Math.random() * 20 + 8;
    if (p > 100) p = 100;
    bar.style.width = p + '%';
    pct.textContent = Math.round(p) + '%';
    if (p >= 100) {
      clearInterval(tick);
      setTimeout(() => {
        loader.style.transition = 'background .07s';
        loader.style.background = '#ff2056';
        setTimeout(() => {
          loader.style.background = '';
          loader.classList.add('out');
          setTimeout(() => {
            loader.style.display = 'none';
            initTW();
            initReveal();
            initStacks();
            loadArticles();
            loadAccountsQBR();
          }, 400);
        }, 90);
      }, 440);
    }
  }, 60);
});

// ── Cursor ──────────────────────────────────────────────
const cd = document.getElementById('cd');
const cr = document.getElementById('cr');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove', e => {
  mx=e.clientX; my=e.clientY;
  cd.style.left=mx+'px'; cd.style.top=my+'px';
});
(function loop(){
  rx+=(mx-rx)*.12; ry+=(my-ry)*.12;
  cr.style.left=rx+'px'; cr.style.top=ry+'px';
  requestAnimationFrame(loop);
})();
document.querySelectorAll('a,button,input,[onclick]').forEach(el=>{
  el.addEventListener('mouseenter',()=>document.body.classList.add('hov'));
  el.addEventListener('mouseleave',()=>document.body.classList.remove('hov'));
});

// ── Particles ───────────────────────────────────────────
const cv = document.getElementById('bgc');
const cx = cv.getContext('2d');
let W,H,pts=[];
function rsz(){W=cv.width=window.innerWidth;H=cv.height=window.innerHeight}
rsz();
window.addEventListener('resize',()=>{rsz();build();},{passive:true});
class P{
  reset(){this.x=Math.random()*W;this.y=Math.random()*H;this.vx=(Math.random()-.5)*.22;this.vy=(Math.random()-.5)*.22;this.r=Math.random()*.9+.2;this.a=Math.random()*.28+.04;const r=Math.random();this.c=r<.1?'#ff2056':r<.22?'#38bdf8':'#ffffff'}
  step(){this.x+=this.vx;this.y+=this.vy;if(this.x<0||this.x>W||this.y<0||this.y>H)this.reset()}
  draw(){cx.beginPath();cx.arc(this.x,this.y,this.r,0,Math.PI*2);cx.fillStyle=this.c+Math.floor(this.a*255).toString(16).padStart(2,'0');cx.fill()}
}
function build(){pts=Array.from({length:Math.min(Math.floor(W*H/22000),80)},()=>{const p=new P;p.reset();return p})}
build();
(function render(){cx.clearRect(0,0,W,H);pts.forEach(p=>{p.step();p.draw()});requestAnimationFrame(render)})();

// ── Nav ─────────────────────────────────────────────────
const nav=document.getElementById('nav');
window.addEventListener('scroll',()=>nav.classList.toggle('on',window.scrollY>50),{passive:true});
function toggleNav(){document.getElementById('mnav').classList.toggle('on');document.getElementById('mov').classList.toggle('on')}
function closeNav(){document.getElementById('mnav').classList.remove('on');document.getElementById('mov').classList.remove('on')}

// ── Typewriter ──────────────────────────────────────────
function triggerUnicorn(){
  const u=document.getElementById('unicorn');
  const tw=document.getElementById('tw');
  const rect=tw.getBoundingClientRect();
  u.style.top=(rect.top+rect.height/2-37)+'px';
  u.style.left='-120px';
  u.classList.remove('run');
  void u.offsetWidth;
  u.classList.add('run');
  u.addEventListener('animationend',()=>u.classList.remove('run'),{once:true});
}

function initTW(){
  const phrases=['AI Customer Lifecycle Expert','Growth & Operations Expert','Head of Customer Success','Co-Founder @ YGames','SaaS Churn Slayer','Unicorn'];
  const el=document.getElementById('tw');
  let pi=0,ci=0,del=false,w=0;
  (function tick(){
    if(w-->0){setTimeout(tick,80);return}
    const p=phrases[pi];
    if(!del){
      el.textContent=p.slice(0,++ci);
      if(ci===p.length){del=true;w=22;if(p==='Unicorn')triggerUnicorn()}
    }
    else{el.textContent=p.slice(0,--ci);if(ci===0){del=false;pi=(pi+1)%phrases.length;w=4}}
    setTimeout(tick,del?40:78);
  })();
}

// ── Scroll reveal ────────────────────────────────────────
function initReveal(){
  const ob=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('vis');ob.unobserve(e.target)}})},{threshold:.14});
  document.querySelectorAll('.rev').forEach(el=>ob.observe(el));
}


// ── QBR ──────────────────────────────────────────────────
let _accounts = [];
let _qbrMarkdown = '';

async function loadAccountsQBR() {
  const sel = document.getElementById('qacc');
  const st  = document.getElementById('qsrc-status');
  if (!sel) return;
  try {
    if (st) st.textContent = 'Loading…';
    const res = await fetch(WORKER_URL);
    if (!res.ok) throw new Error();
    _accounts = await res.json();
    sel.innerHTML = '<option value="">— select account or fill manually —</option>' +
      _accounts.map((a, i) =>
        `<option value="${i}">${a.account_name} · ${a.industry} · $${Number(a.arr||0).toLocaleString()} · Health ${a.health_score}</option>`
      ).join('');
    if (st) { st.textContent = `${_accounts.length} accounts loaded`; setTimeout(() => { st.textContent = ''; }, 3000); }
  } catch {
    if (st) st.textContent = 'Could not load accounts';
  }
}

async function syncAccounts() { await loadAccountsQBR(); }

function selectAccount(idx) {
  if (idx === '') return;
  const a = _accounts[parseInt(idx)];
  if (!a) return;
  document.getElementById('qa').value         = a.account_name   || '';
  document.getElementById('qindustry').value  = a.industry       || '';
  document.getElementById('qr').value         = a.arr            || '';
  document.getElementById('qh').value         = a.health_score   || '';
  document.getElementById('qrenew').value     = a.renewal_date   || '';
  document.getElementById('qcsm').value       = a.csm            || '';
  document.getElementById('qseats_lic').value = a.seats_licensed || '';
  document.getElementById('qseats_act').value = a.seats_active   || '';
  document.getElementById('qnps').value       = a.nps            || '';
  document.getElementById('qtickets').value   = a.open_tickets   || '';
  document.getElementById('qc').value         = a.key_challenge  || '';
  document.getElementById('qnotes').value     = a.notes          || '';
}

function toggleTranscript() {
  const body = document.getElementById('qtrans-body');
  const icon = document.querySelector('.qtrans-icon');
  const open = body.style.display === 'block';
  body.style.display = open ? 'none' : 'block';
  if (icon) icon.textContent = open ? '+' : '−';
}

let _qbrResearch = null;
let _qbrAccountName = '';

async function runQBR() {
  const btn     = document.getElementById('qbtn');
  const st      = document.getElementById('qst');
  const outWrap = document.getElementById('qout-wrap');
  const out     = document.getElementById('qout');
  const tabBar  = document.getElementById('qtabs');

  if (WORKER_URL.includes('YOUR_SUBDOMAIN')) {
    outWrap.style.display = 'block';
    out.innerHTML = '<div class="qloading" style="color:var(--red)">Worker not deployed yet.</div>';
    return;
  }

  const accountName = document.getElementById('qa').value.trim() || 'Demo Company';
  _qbrAccountName = accountName;
  _qbrResearch = null;

  btn.disabled = true;
  btn.innerHTML = '<span class="scur"></span> Researching…';
  st.textContent = '';
  outWrap.style.display = 'block';
  tabBar.innerHTML = '';
  const oldBtn = document.getElementById('qreport-btn');
  if (oldBtn) oldBtn.remove();
  out.innerHTML = `<div class="qloading">Researching ${accountName}<span class="scur"></span></div>`;
  _qbrMarkdown = '';

  // Step 1: research
  try {
    const rRes = await fetch(WORKER_URL + '/research', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company: accountName })
    });
    if (rRes.ok) _qbrResearch = await rRes.json();
  } catch {}

  // Step 2: generate QBR
  btn.innerHTML = '<span class="scur"></span> Generating…';
  out.innerHTML = '<div class="qloading">Generating QBR<span class="scur"></span></div>';

  try {
    const res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        account_name:   accountName,
        industry:       document.getElementById('qindustry').value.trim()   || 'SaaS',
        arr:            document.getElementById('qr').value                 || 120000,
        health_score:   document.getElementById('qh').value                 || 72,
        renewal_date:   document.getElementById('qrenew').value             || '',
        csm:            document.getElementById('qcsm').value.trim()        || 'CSM',
        seats_licensed: document.getElementById('qseats_lic').value         || 100,
        seats_active:   document.getElementById('qseats_act').value         || 70,
        nps:            document.getElementById('qnps').value               || 45,
        open_tickets:   document.getElementById('qtickets').value           || 3,
        challenge:      document.getElementById('qc').value.trim()          || 'Improving product adoption',
        notes:          document.getElementById('qnotes').value.trim()      || '',
        transcript:     document.getElementById('qtranscript').value.trim() || '',
        research:       _qbrResearch,
      })
    });
    if (!res.ok) throw new Error(`${res.status}`);
    const reader = res.body.getReader(), dec = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      for (const line of dec.decode(value, { stream: true }).split('\n')) {
        if (!line.startsWith('data: ')) continue;
        const pl = line.slice(6).trim(); if (pl === '[DONE]') break;
        try { const j = JSON.parse(pl); const d = j?.delta?.text ?? ''; if (d) _qbrMarkdown += d; } catch {}
      }
    }
    renderQBRTabs(_qbrMarkdown);
    st.textContent = '✓ Done';
    const actions = document.querySelector('.qactions');
    if (actions && !document.getElementById('qreport-btn')) {
      const reportBtn = document.createElement('button');
      reportBtn.id = 'qreport-btn';
      reportBtn.className = 'qact-btn';
      reportBtn.style.cssText = 'background:var(--red);border-color:var(--red);color:#fff;font-weight:600;';
      reportBtn.textContent = 'View Report →';
      reportBtn.onclick = openQBRReport;
      actions.prepend(reportBtn);
    }
  } catch (err) {
    out.innerHTML = `<div class="qloading" style="color:var(--red)">Error: ${err.message}</div>`;
    st.textContent = 'Failed';
  }
  btn.disabled = false;
  btn.innerHTML = '<svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1 5.5h9M5.5 1l4.5 4.5L5.5 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg> Generate QBR';
}

function openQBRReport() {
  const html = buildReportHTML(_qbrMarkdown, _qbrAccountName, _qbrResearch, {
    arr:          document.getElementById('qr').value          || '',
    health_score: document.getElementById('qh').value          || '',
    renewal_date: document.getElementById('qrenew').value      || '',
    nps:          document.getElementById('qnps').value        || '',
    csm:          document.getElementById('qcsm').value.trim() || '',
    industry:     document.getElementById('qindustry').value.trim() || '',
  });
  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  window.open(url, '_blank');
}

function buildReportHTML(markdown, company, research, meta) {
  const md = typeof marked.parse === 'function' ? marked.parse : marked;
  const date = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  const p = research?.perplexity || {};
  const g = research?.grok || {};

  const sentimentColor = g.sentiment
    ? (g.sentiment.toLowerCase().includes('positive') ? '#34d399'
      : g.sentiment.toLowerCase().includes('negative') ? '#ff2056' : '#fb923c')
    : '#fb923c';

  const intelCards = [
    p.funding       && { label: 'Funding', icon: '💰', value: p.funding },
    p.acquisitions  && { label: 'M&A', icon: '🤝', value: p.acquisitions },
    p.new_hires     && { label: 'Leadership', icon: '👤', value: p.new_hires },
    p.headcount     && { label: 'Team Size', icon: '📊', value: p.headcount },
    p.strategy      && { label: 'Strategy', icon: '🎯', value: p.strategy },
    g.trending_topics && { label: 'X Signals', icon: '𝕏', value: g.trending_topics },
    g.complaints    && { label: 'Concerns', icon: '⚠️', value: g.complaints },
    g.praise        && { label: 'Praise', icon: '⭐', value: g.praise },
  ].filter(Boolean);

  const sections = markdown.split(/\n(?=## )/).map(p => {
    const m = p.match(/^## (.+)\n([\s\S]*)/);
    return m ? { title: m[1].trim(), content: m[2].trim() } : null;
  }).filter(Boolean);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${company} — QBR · murmur.red</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600&family=Bebas+Neue&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#050509;--text:#f0f0ff;--dim:rgba(200,200,240,.5);--line:rgba(255,255,255,.08);--red:#ff2056;--pad:clamp(24px,5vw,64px);--max:860px}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:'Space Grotesk',sans-serif;font-size:15px;line-height:1.7;min-width:320px}

/* Print */
@media print{
  body{background:#fff;color:#111}
  .no-print{display:none!important}
  .page-break{page-break-before:always}
  .section{border:1px solid #ddd;background:#fff}
  .section h2{color:#c0001a}
  table th{background:#f5f5f5}
  .intel-card{border:1px solid #ddd;background:#fafafa}
  .intel-val{color:#444}
  .meta-val{color:#111}
  footer{display:none}
}

/* Toolbar */
.toolbar{
  position:fixed;top:0;left:0;right:0;z-index:100;
  background:rgba(5,5,9,.95);backdrop-filter:blur(20px);
  border-bottom:1px solid var(--line);
  padding:.7rem var(--pad);
  display:flex;align-items:center;justify-content:space-between;gap:1rem;flex-wrap:wrap;
}
.tb-brand{font-family:'Bebas Neue',sans-serif;font-size:1.1rem;letter-spacing:.14em;color:var(--red);text-decoration:none}
.tb-title{font-size:.72rem;letter-spacing:.08em;color:var(--dim)}
.tb-actions{display:flex;gap:.5rem}
.btn{padding:.38rem 1rem;font-family:'Space Grotesk',sans-serif;font-size:.65rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;border-radius:2px;cursor:pointer;border:none;transition:all .18s}
.btn-ghost{background:rgba(255,255,255,.04);border:1px solid var(--line);color:var(--dim)}
.btn-ghost:hover{border-color:rgba(255,255,255,.2);color:var(--text)}
.btn-red{background:var(--red);color:#fff}
.btn-red:hover{background:#d91545;box-shadow:0 0 16px rgba(255,32,86,.3)}

/* Layout */
.wrap{max-width:var(--max);margin:0 auto;padding:5.5rem var(--pad) 4rem}

/* Cover */
.cover{padding:3rem 0 2.5rem;border-bottom:1px solid var(--line);margin-bottom:2.5rem}
.cover-label{font-size:.58rem;letter-spacing:.28em;text-transform:uppercase;color:var(--red);display:flex;align-items:center;gap:.5rem;margin-bottom:1rem}
.cover-label::before{content:'';display:block;width:1.5rem;height:1px;background:var(--red)}
.cover-company{font-family:'Bebas Neue',sans-serif;font-size:clamp(3rem,8vw,5.5rem);line-height:.9;letter-spacing:.02em;margin-bottom:.6rem}
.cover-sub{font-size:.82rem;color:var(--dim);margin-bottom:2rem}
.cover-meta{display:flex;flex-wrap:wrap;gap:.5rem}
.meta-chip{padding:.3rem .85rem;border:1px solid var(--line);border-radius:20px;font-size:.62rem;letter-spacing:.08em;display:flex;gap:.4rem;align-items:center}
.meta-label{color:var(--dim)}
.meta-val{color:var(--text);font-weight:500}

/* Sentiment badge */
.sentiment-badge{padding:.28rem .9rem;border-radius:20px;font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;font-weight:600;border:1px solid}

/* Intel grid */
.intel-section{margin-bottom:2.5rem}
.intel-label{font-size:.58rem;letter-spacing:.26em;text-transform:uppercase;color:var(--dim);margin-bottom:.9rem;display:flex;align-items:center;gap:.5rem}
.intel-label::after{content:'';flex:1;height:1px;background:var(--line)}
.intel-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:.6rem}
.intel-card{background:rgba(255,255,255,.02);border:1px solid var(--line);border-radius:4px;padding:.85rem 1rem}
.intel-card-top{display:flex;align-items:center;gap:.4rem;margin-bottom:.35rem}
.intel-icon{font-size:.85rem}
.intel-cat{font-size:.56rem;letter-spacing:.14em;text-transform:uppercase;color:var(--dim)}
.intel-val{font-size:.78rem;color:rgba(200,200,240,.7);line-height:1.55}

/* Sections */
.section{background:rgba(255,255,255,.018);border:1px solid var(--line);border-radius:4px;padding:1.6rem 1.8rem;margin-bottom:1rem;page-break-inside:avoid}
.section h2{font-family:'Bebas Neue',sans-serif;font-size:1.15rem;letter-spacing:.06em;color:var(--red);margin-bottom:1rem;padding-bottom:.5rem;border-bottom:1px solid var(--line)}
.section p{color:var(--dim);margin-bottom:.65rem;font-size:.85rem}
.section ul,.section ol{padding-left:1.3rem;margin-bottom:.65rem}
.section li{color:var(--dim);font-size:.85rem;margin-bottom:.25rem}
.section strong{color:var(--text);font-weight:600}
.section table{width:100%;border-collapse:collapse;font-size:.82rem;margin-bottom:.65rem}
.section th{text-align:left;padding:.4rem .65rem;border-bottom:1px solid var(--line);font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);font-weight:400}
.section td{padding:.38rem .65rem;border-bottom:1px solid rgba(255,255,255,.03);color:var(--dim)}

/* This Week highlight */
.this-week{background:rgba(255,32,86,.06);border:1px solid rgba(255,32,86,.2);border-left:3px solid var(--red);border-radius:4px;padding:1.2rem 1.5rem;margin-bottom:1rem}
.this-week-label{font-size:.56rem;letter-spacing:.22em;text-transform:uppercase;color:var(--red);margin-bottom:.4rem}
.this-week p{color:var(--text)!important;font-size:.9rem!important;font-weight:500}

/* Footer */
footer{margin-top:3rem;padding:1.2rem 0;border-top:1px solid var(--line);display:flex;justify-content:space-between;flex-wrap:wrap;gap:.5rem;font-size:.6rem;letter-spacing:.06em;color:rgba(180,180,220,.2)}

/* No-intel notice */
.no-intel{font-size:.75rem;color:rgba(200,200,240,.25);font-style:italic;padding:.6rem 0}
</style>
</head>
<body>

<div class="toolbar no-print">
  <div>
    <a href="https://murmur.red" class="tb-brand">murmur.red</a>
    <div class="tb-title">${company} · Quarterly Business Review · ${date}</div>
  </div>
  <div class="tb-actions">
    <button class="btn btn-ghost" onclick="window.close()">← Back</button>
    <button class="btn btn-red" onclick="window.print()">Download PDF</button>
  </div>
</div>

<div class="wrap">

  <!-- Cover -->
  <div class="cover">
    <div class="cover-label">Quarterly Business Review</div>
    <div class="cover-company">${company}</div>
    <div class="cover-sub">Prepared by murmur.red · ${date}</div>
    <div class="cover-meta">
      ${meta.industry    ? `<div class="meta-chip"><span class="meta-label">Industry</span><span class="meta-val">${meta.industry}</span></div>` : ''}
      ${meta.arr         ? `<div class="meta-chip"><span class="meta-label">ARR</span><span class="meta-val">$${Number(meta.arr).toLocaleString()}</span></div>` : ''}
      ${meta.health_score ? `<div class="meta-chip"><span class="meta-label">Health</span><span class="meta-val">${meta.health_score}/100</span></div>` : ''}
      ${meta.nps         ? `<div class="meta-chip"><span class="meta-label">NPS</span><span class="meta-val">${meta.nps}</span></div>` : ''}
      ${meta.renewal_date ? `<div class="meta-chip"><span class="meta-label">Renewal</span><span class="meta-val">${meta.renewal_date}</span></div>` : ''}
      ${meta.csm         ? `<div class="meta-chip"><span class="meta-label">CSM</span><span class="meta-val">${meta.csm}</span></div>` : ''}
      ${g.sentiment      ? `<div class="sentiment-badge" style="color:${sentimentColor};border-color:${sentimentColor}22;background:${sentimentColor}11">𝕏 ${g.sentiment.split(' ')[0]}</div>` : ''}
    </div>
  </div>

  <!-- Market Intelligence -->
  ${intelCards.length ? `
  <div class="intel-section">
    <div class="intel-label">Live Market Intelligence</div>
    <div class="intel-grid">
      ${intelCards.map(c => `
      <div class="intel-card">
        <div class="intel-card-top"><span class="intel-icon">${c.icon}</span><span class="intel-cat">${c.label}</span></div>
        <div class="intel-val">${c.value}</div>
      </div>`).join('')}
    </div>
  </div>` : `<div class="no-intel">No live market intelligence — company name not found or APIs unavailable.</div>`}

  <!-- QBR Sections -->
  ${sections.map((s, i) => {
    const isThisWeek = s.title.toLowerCase().includes('this week');
    if (isThisWeek) {
      return `<div class="this-week">
        <div class="this-week-label">This Week</div>
        ${md(s.content)}
      </div>`;
    }
    return `<div class="section${i > 0 ? ' page-break' : ''}">
      <h2>${s.title}</h2>
      ${md(s.content)}
    </div>`;
  }).join('')}

  <footer>
    <span>© 2026 murmur.red · Lena Ry · Amsterdam</span>
    <span>Generated ${date} · Confidential</span>
  </footer>

</div>

</body>
</html>`;
}

function renderQBRTabs(markdown) {
  const md    = typeof marked.parse === 'function' ? marked.parse : marked;
  const parts = markdown.split(/\n(?=## )/);
  const sections = parts.map(p => {
    const m = p.match(/^## (.+)\n([\s\S]*)/);
    return m ? { title: m[1].trim(), content: m[2].trim() } : null;
  }).filter(Boolean);

  const tabBar = document.getElementById('qtabs');
  const out    = document.getElementById('qout');

  if (!sections.length) { out.innerHTML = `<div class="qtab-panel on">${md(markdown)}</div>`; return; }

  tabBar.innerHTML = sections.map((s, i) =>
    `<button class="qtab${i === 0 ? ' on' : ''}" onclick="showQBRTab(${i})">${s.title}</button>`
  ).join('');
  out.innerHTML = sections.map((s, i) =>
    `<div class="qtab-panel${i === 0 ? ' on' : ''}" data-tab="${i}">${md(s.content)}</div>`
  ).join('');
}

function showQBRTab(idx) {
  document.querySelectorAll('.qtab').forEach((t, i)       => t.classList.toggle('on', i === idx));
  document.querySelectorAll('.qtab-panel').forEach((p, i) => p.classList.toggle('on', i === idx));
}

function copyQBR() {
  navigator.clipboard.writeText(_qbrMarkdown).then(() => {
    const btn = event.target;
    const orig = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = orig; }, 1800);
  });
}

function downloadQBR() {
  const name = document.getElementById('qa').value.trim() || 'QBR';
  const blob = new Blob([_qbrMarkdown], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${name.replace(/\s+/g, '-')}-QBR.txt`;
  a.click();
}

// ── AI Stacks ────────────────────────────────────────────
const CATC={
  'Anthropic':'#d97706','OpenAI':'#10b981','Google':'#4285f4','xAI':'#8b5cf6',
  'CS Platform':'#38bdf8','CRM':'#0ea5e9','Revenue Intel':'#f59e0b','Messaging':'#34d399',
  'Analytics':'#a78bfa','Knowledge':'#fb923c','Automation':'#ff2056','Enrichment':'#a78bfa',
  'Prospecting':'#38bdf8','AI Research':'#34d399','Outreach':'#fb923c',
  'Image AI':'#f59e0b','Video AI':'#f43f5e','OpenAI Video':'#f43f5e','Audio AI':'#a78bfa',
  'Avatar AI':'#38bdf8','Music AI':'#34d399',
  'AI Builder':'#34d399','AI IDE':'#38bdf8','Vercel UI Gen':'#a78bfa',
  'No-Code':'#fb923c','Hosting':'#0ea5e9','Database':'#34d399','Infrastructure':'#f59e0b',
  'Design':'#a78bfa','Version Control':'#64748b'
};
const STACKS={
  cs:{label:'CS Teams',color:'#38bdf8',
    recipe:{name:'Auto-QBR Workflow',steps:[
      {tool:'Gong',action:'call transcribed + risks flagged'},
      {tool:'Claude',action:'QBR draft generated'},
      {tool:'Gainsight',action:'health score updated'},
      {tool:'Salesforce',action:'activities logged'},
      {tool:'Slack',action:'CSM briefed'}
    ]},
    tools:[
      {name:'Claude',cat:'Anthropic',desc:'Best for long-form CS work: QBRs, EBR decks, risk emails, success plans. Projects feature keeps full account context across every session — it remembers your clients.',connects:['Zapier','Make','Notion','Gmail'],use:'Paste a Gong call transcript and say: "Extract top 3 risks, next steps, and draft a follow-up email." Done in 30 seconds.'},
      {name:'ChatGPT',cat:'OpenAI',desc:'GPT-4o for quick CS tasks: summarize Gong calls, draft follow-ups, analyze NPS verbatims. o1 model is strong for complex renewal strategy and pricing scenarios.',connects:['Zapier','Make','Salesforce','Notion'],use:'Upload your NPS survey export and ask GPT-4o to cluster verbatims by theme and flag which accounts are at renewal risk.'},
      {name:'Gemini',cat:'Google',desc:'Deeply wired into Google Workspace. Summarizes Docs, drafts slides, pulls Sheets data mid-meeting. If your CS team runs on Google, this is the AI layer to activate first.',connects:['Google Docs','Google Sheets','Gmail','Google Meet'],use:'Type "@doc" in Google Docs mid-QBR prep and ask Gemini to pull last quarter\'s notes into a 3-bullet exec briefing.'},
      {name:'Gainsight',cat:'CS Platform',desc:'Enterprise standard for health scoring, lifecycle automation, and renewal management. Overkill below 50 enterprise accounts — above that, nothing comes close.',connects:['Salesforce','Slack','Mixpanel','Zendesk'],use:'Build a playbook that auto-assigns a CSM task the moment health drops below 65 — no manual triage, no missed signals.'},
      {name:'Vitally',cat:'CS Platform',desc:'The modern alternative to Gainsight. Better UX, faster implementation, built for B2B SaaS teams who want automation without a six-month onboarding project.',connects:['HubSpot','Intercom','Segment','Slack'],use:'Set up a Conversation template that fires a check-in email when core feature adoption stalls for 14 consecutive days.'},
      {name:'Gong',cat:'Revenue Intel',desc:'Records every customer call. AI surfaces churn signals, competitor mentions, and expansion opportunities before your CSM even writes up their notes.',connects:['Salesforce','HubSpot','Slack','Zoom'],use:'Enable Trackers to flag every competitor mention — get a Slack alert within minutes of any call ending, not hours later.'},
      {name:'Intercom',cat:'Messaging',desc:'In-app chat, onboarding flows, and Fin AI for automated tier-1 support. Best for PLG companies where users self-serve before they ever talk to a human.',connects:['Salesforce','Mixpanel','Stripe','Zapier'],use:'Configure Fin AI to resolve tier-1 renewal FAQs autonomously, escalating to a human only when sentiment score turns negative.'},
      {name:'Mixpanel',cat:'Analytics',desc:'The leading-indicator layer. See who is disengaging in the product before they say anything. Feeds health scores directly into Gainsight and Vitally.',connects:['Segment','Salesforce','Gainsight','Vitally'],use:'Create a "silent churn" cohort — users who haven\'t triggered a core event in 21 days — and pipe it to Gainsight as a health signal.'},
      {name:'Notion AI',cat:'Knowledge',desc:'CS playbooks, runbooks, and EBR templates that write themselves. AI fills in account context, generates meeting summaries, and translates docs for global teams.',connects:['Slack','Zapier','Google Drive','Linear'],use:'Build a QBR template with AI blocks that auto-fill account name, ARR, and health score from page properties on load.'},
      {name:'Salesforce',cat:'CRM',desc:'System of record. Einstein AI surfaces renewal risk, next best actions, and forecast accuracy. Every CS tool integrates here — it is the backbone, not optional.',connects:['Gainsight','Gong','Intercom','Mixpanel'],use:'Surface Einstein\'s Renewal Likelihood score in your CSM dashboard so reps spend their day on the bottom 20%, not the safe ones.'},
    ]
  },
  ops:{label:'Ops & Growth',color:'#a78bfa',
    recipe:{name:'AI Outbound Pipeline',steps:[
      {tool:'Apollo',action:'ICP list built'},
      {tool:'Clay',action:'enriched + AI researched'},
      {tool:'ChatGPT',action:'emails personalized'},
      {tool:'Instantly',action:'sequence launched'},
      {tool:'HubSpot',action:'pipeline tracked'}
    ]},
    tools:[
      {name:'Clay',cat:'Enrichment',desc:'The most powerful GTM tool of the last three years. Pulls from 75+ data sources, runs AI research on every row, and writes personalized outreach at scale. Nothing else does what Clay does.',connects:['Apollo','HubSpot','Salesforce','Instantly'],use:'Add a Claude column that writes a one-sentence personalized opener per lead using their LinkedIn activity and recent company news.'},
      {name:'Perplexity',cat:'AI Research',desc:'AI-powered search that cites real sources. Use it for competitive intel, ICP research, and market sizing — faster and more accurate than a Google deep-dive.',connects:['Notion','Slack','Clay','Chrome'],use:'Ask it to research a target account\'s latest funding round, strategic priorities, and likely pain points — all cited, in 30 seconds.'},
      {name:'Grok',cat:'xAI',desc:'Built on real-time X/Twitter data. Best for tracking competitor moves, industry conversations, and cultural signals as they happen. No other AI has this speed of market intel.',connects:['X/Twitter','Notion','Slack','Clay'],use:'Search your top competitor\'s name — Grok shows exactly what the market is saying about them right now, with real-time sentiment.'},
      {name:'ChatGPT',cat:'OpenAI',desc:'GPT-4o for ops tasks at scale: analyze cohorts, write GTM copy, build frameworks. Operator mode can browse web apps and take actions — powerful for workflow automation.',connects:['Zapier','Make','HubSpot','Notion'],use:'Paste your product changelog and ask GPT-4o to write five email subject lines for each ICP persona — test them in Instantly.'},
      {name:'Apollo',cat:'Prospecting',desc:'275M+ contacts. Build ICP-filtered lists, verify emails in real time, and launch sequences — all without leaving the platform. The entry point for most outbound motions.',connects:['Clay','HubSpot','Salesforce','LinkedIn'],use:'Filter for job change alerts — people who just moved into a new CS or ops role are your warmest outbound targets.'},
      {name:'Make',cat:'Automation',desc:'Visual automation builder that handles complexity Zapier cannot. Multi-branch logic, error handling, AI modules, and HTTP requests. The ops Swiss army knife.',connects:['Clay','HubSpot','Slack','Airtable'],use:'Connect Clay to Instantly: when a new enriched lead appears, automatically add them to the right sequence based on their persona tag.'},
      {name:'n8n',cat:'Automation',desc:'Self-hosted Make alternative with no per-task pricing. Native AI agent nodes, full control over data, and the ability to run LLM workflows without SaaS cost blowing up.',connects:['Webhooks','Postgres','Claude API','Slack'],use:'Build a weekly workflow that scrapes competitor G2 reviews and sends a Slack digest summarizing new complaints and themes.'},
      {name:'Amplitude',cat:'Analytics',desc:'Behavioral cohort analysis that tells you what actually drives 12-month retention. The best tool for finding activation milestones that correlate with renewals.',connects:['Segment','Braze','Salesforce','Slack'],use:'Define your "aha moment" event and track the % of new users who reach it within 7 days — this one number predicts 6-month retention.'},
      {name:'Instantly',cat:'Outreach',desc:'Cold email at scale with inbox rotation, AI personalization per-lead, and deliverability tooling. The default for outbound-heavy growth teams running Clay-sourced lists.',connects:['Clay','Apollo','HubSpot','Slack'],use:'Rotate across 5 warmed domains, keep daily send under 50 per inbox — this is the deliverability playbook for 500+ emails per day.'},
      {name:'HubSpot',cat:'CRM',desc:'Best all-in-one for scaling teams. Breeze AI writes emails, scores leads, and summarizes pipeline. Marketing, sales, and ops in one platform — and it actually talks to Clay.',connects:['Clay','Apollo','Segment','Intercom'],use:'Set a sequence trigger when a lead opens your email 3+ times — Breeze writes the follow-up automatically using their company context.'},
    ]
  },
  creative:{label:'Creative',color:'#ff2056',
    recipe:{name:'Ad Creative Pipeline',steps:[
      {tool:'ChatGPT',action:'brief + concepts written'},
      {tool:'Midjourney',action:'visuals generated'},
      {tool:'Kling',action:'video animated'},
      {tool:'ElevenLabs',action:'voiceover added'},
      {tool:'HeyGen',action:'avatar ad rendered'}
    ]},
    tools:[
      {name:'Midjourney',cat:'Image AI',desc:'Still the best for aesthetic quality and brand consistency. V7 has dramatically better prompt following. The default for game art, ad creatives, and concept work.',connects:['Runway','Figma','Canva','Adobe Firefly'],use:'Use --style raw with a detailed character brief. Add --cref to reference your existing character sheet for consistency across sessions.'},
      {name:'ChatGPT',cat:'OpenAI',desc:'DALL-E 3 for image generation inside the chat, plus GPT-4o for writing briefs, ad copy, and scripts. The creative generalist — ideation through copy in one tool.',connects:['DALL-E 3','Canva','Make','Zapier'],use:'Write your brief in plain English, ask GPT-4o to expand it into a full shot list, then generate reference images with DALL-E 3.'},
      {name:'Sora',cat:'OpenAI Video',desc:'OpenAI text-to-video generating up to 20-second cinematic clips. Available in ChatGPT Pro. Changing what is possible for indie studios with no video budget.',connects:['ChatGPT','ElevenLabs','CapCut','Adobe Premiere'],use:'Describe a 10-second gameplay cinematic — Sora generates the footage in minutes. Use as a stakeholder placeholder while your team builds the real assets.'},
      {name:'Kling',cat:'Video AI',desc:'Kuaishou video model with top-tier motion quality, longer clips, and excellent character animation. Now the go-to for mobile game trailers and high-motion ad creatives.',connects:['Midjourney','ElevenLabs','CapCut','Runway'],use:'Generate a 5-second looping animation from a single Midjourney image. Best motion quality for mobile ad creatives right now.'},
      {name:'Runway',cat:'Video AI',desc:'Gen-3 Alpha with the most complete ecosystem: inpainting, motion brush, camera controls, and Act-One for character animation. Preferred by professional studios.',connects:['Midjourney','ElevenLabs','CapCut','Adobe Premiere'],use:'Use Motion Brush to animate only the background while the product stays still — cinematic result with no editing skills required.'},
      {name:'ElevenLabs',cat:'Audio AI',desc:'Hyper-realistic AI voices in 32 languages with instant voice cloning, sound effects, and music generation. The audio layer every creative pipeline needs.',connects:['Runway','Kling','Sora','CapCut'],use:'Clone your voice in 3 minutes, then generate all narration for a game trailer in 5 languages without re-recording a single word.'},
      {name:'HeyGen',cat:'Avatar AI',desc:'Generate talking-head video ads with AI avatars or your own cloned likeness. Used by ad teams to localize video content into 40+ languages without reshooting.',connects:['ElevenLabs','CapCut','Canva','Meta Ads'],use:'Upload a script and a photo — HeyGen renders a localized talking-head ad in any language. Five market variants in one afternoon.'},
      {name:'Ideogram',cat:'Image AI',desc:'The only AI that reliably renders text inside images. Essential for ad overlays, game UI mockups, and logo concepts — the one thing Midjourney still cannot do.',connects:['Figma','Canva','Midjourney','Adobe'],use:'Put your exact ad headline inside quotation marks in the prompt — Ideogram renders it as part of the image, correctly spelled every time.'},
      {name:'Suno',cat:'Music AI',desc:'Generate complete, royalty-free music tracks from a text prompt in seconds. Vocal tracks, genre control, stem exports. The fastest way to soundtrack a mobile game or ad.',connects:['CapCut','Runway','ElevenLabs','Adobe Premiere'],use:'"Upbeat mobile game loop, 8-bit meets electronic, 30 seconds, loops seamlessly" — production-ready track in under 2 minutes.'},
      {name:'Adobe Firefly',cat:'Image AI',desc:'Commercially indemnified AI generation inside Photoshop, Illustrator, and Premiere. The safe choice for agency work where IP liability matters.',connects:['Adobe Premiere','Figma','Frame.io','Midjourney'],use:'Use Generative Fill in Photoshop to extend a background or swap a product color variant — no licensing risk, IP-indemnified by Adobe.'},
    ]
  },
  web:{label:'Build a Website',color:'#34d399',
    recipe:{name:'Ship a Landing Page',steps:[
      {tool:'Claude',action:'architecture + code planned'},
      {tool:'Bolt',action:'full app scaffolded'},
      {tool:'Cursor',action:'refined in AI IDE'},
      {tool:'Supabase',action:'database + auth wired'},
      {tool:'Vercel',action:'deployed in 30 seconds'}
    ]},
    tools:[
      {name:'Claude',cat:'Anthropic',desc:'Best for production-quality code. 200K context window handles entire codebases. Projects remembers your stack, conventions, and constraints — the senior dev that never forgets.',connects:['GitHub','Cursor','Vercel','Supabase'],use:'Share your whole project with Claude Projects, describe the feature — it writes code that fits your actual architecture, not a generic example.'},
      {name:'Bolt',cat:'AI Builder',desc:'StackBlitz full-stack AI builder. Describe your app → running Next.js + React project in 60 seconds, complete with routing, components, and API calls.',connects:['Vercel','Supabase','GitHub','Stripe'],use:'Type "Build a SaaS landing page with pricing and waitlist form" — get a fully running app in 90 seconds, edit from there.'},
      {name:'Lovable',cat:'AI Builder',desc:'AI-native web builder outputting clean React code you own. No vendor lock-in. Excellent for landing pages, SaaS MVPs, and internal tools without a developer.',connects:['Supabase','GitHub','Vercel','Stripe'],use:'Connect your Supabase project and say "add user auth with email magic links" — full auth flow written for you, zero code.'},
      {name:'ChatGPT',cat:'OpenAI',desc:'o1 and o3 models for complex architectural decisions, debugging hard problems, and code review. GPT-4o for fast iteration. The rubber duck that actually codes.',connects:['GitHub','Cursor','Vercel','Supabase'],use:'Paste the bug into o1. It reasons through the problem step-by-step and finds root causes senior devs miss on first pass.'},
      {name:'Cursor',cat:'AI IDE',desc:'The AI code editor engineers actually choose. Cmd+K edits inline, Composer rewrites files, indexes your whole codebase — not just the open file.',connects:['GitHub','Vercel','Supabase','Cloudflare'],use:'Select any component, press Cmd+K, type "make this mobile responsive" — Cursor rewrites just that section with full codebase context.'},
      {name:'v0',cat:'Vercel UI Gen',desc:'Describe any UI → get production React + Tailwind code. Best for building design systems, complex components, and dashboards fast.',connects:['Cursor','GitHub','Vercel','Figma'],use:'Describe a complex dashboard component → paste the Tailwind/React output directly into Cursor and wire up your real data.'},
      {name:'Framer',cat:'No-Code',desc:'Highest-quality no-code tool for marketing sites. Real physics-based animations, CMS, and AI layout generation. If a site feels too good to be no-code — it is Framer.',connects:['Figma','HubSpot','Calendly','Lottie'],use:'Use the CMS for blog posts, connect Framer\'s SEO settings, and submit the auto-generated sitemap to Google Search Console.'},
      {name:'Vercel',cat:'Hosting',desc:'Git push → live URL in 30 seconds. Gold standard for frontend deployment. Edge functions, analytics, and AI SDK built in. Free tier handles most early-stage projects.',connects:['GitHub','Supabase','Cloudflare','Next.js'],use:'Add one environment variable to enable Vercel Speed Insights — real user performance data, no tracking code, no setup.'},
      {name:'Supabase',cat:'Database',desc:'Postgres + auth + storage + realtime in one dashboard. Open source, no vendor lock-in, pgvector for AI search. The fastest way to add a real backend.',connects:['Vercel','Cloudflare','Next.js','Cursor'],use:'Enable Row Level Security with one SQL policy — each user sees only their own data, replacing 50 lines of backend authorization code.'},
      {name:'Cloudflare',cat:'Infrastructure',desc:'Workers for serverless edge functions, Pages for hosting, R2 for object storage. Global by default, remarkable free tier.',connects:['GitHub','Supabase','Stripe','Resend'],use:'Deploy a Worker as your API proxy — keys stay server-side, the frontend calls a simple endpoint you fully control.'},
    ]
  }
};

const CATC_ALPHA='18';
let activeStack='cs';
function initStacks(){switchStack('cs',document.querySelector('.stab'))}
function switchStack(key,btn){
  activeStack=key;
  document.querySelectorAll('.stcard').forEach(c=>c.classList.remove('active','dimmed','highlight'));
  document.querySelectorAll('.stab').forEach(t=>t.classList.remove('on'));
  if(btn)btn.classList.add('on');
  const s=STACKS[key];
  document.getElementById('stacks').style.setProperty('--scolor',s.color);
  document.getElementById('srlabel').textContent=s.recipe.name;
  const rc=document.getElementById('srecipe');
  rc.innerHTML=s.recipe.steps.map((step,i)=>`
    <div class="srstep" style="animation-delay:${i*70}ms">
      <div class="srnum">0${i+1}</div>
      <div class="srtool">${step.tool}</div>
      <div class="sraction">${step.action}</div>
    </div>
    ${i<s.recipe.steps.length-1?'<span class="srarrow">→</span>':''}
  `).join('');
  const g=document.getElementById('sgrid');
  g.innerHTML=s.tools.map((t,i)=>{
    const cc=CATC[t.cat]||s.color;
    return`<div class="stcard" data-name="${t.name}" style="--cc:${cc};animation-delay:${i*25}ms" onclick="toggleCard(this)">
      <div class="stcard-top">
        <div class="stcard-name">${t.name}</div>
        <div class="stcard-cat">${t.cat}</div>
      </div>
      <div class="stcard-desc">${t.desc}</div>
      <div class="stcard-conn">${t.connects.map(c=>`<span class="stconn" onmouseenter="hlConn('${c}')" onmouseleave="unhlConn()">${c}</span>`).join('')}</div>
      <div class="stcard-detail">
        <div class="stcard-uselabel">Try this</div>
        <div class="stcard-use">${t.use}</div>
      </div>
    </div>`;
  }).join('');
}
function toggleCard(el){
  const was=el.classList.contains('active');
  document.querySelectorAll('.stcard').forEach(c=>c.classList.remove('active','dimmed'));
  if(!was){el.classList.add('active');document.querySelectorAll('.stcard').forEach(c=>{if(c!==el)c.classList.add('dimmed')})}
}
function hlConn(name){
  document.querySelectorAll('.stcard').forEach(c=>c.classList.toggle('highlight',c.dataset.name===name));
}
function unhlConn(){document.querySelectorAll('.stcard').forEach(c=>c.classList.remove('highlight'))}

// ── Articles ─────────────────────────────────────────────
let arts=[];
async function loadArticles(){
  const g=document.getElementById('agrid');
  try{
    const d=(await(await fetch(ARTICLES_URL+'?t='+Date.now())).json());
    arts=d.articles||[];
    const types=['All',...new Set(arts.map(a=>a.type).filter(Boolean))];
    document.getElementById('ftabs').innerHTML=types.map((t,i)=>`<button class="ftab${i===0?' on':''}" onclick="filterA('${t==='All'?'all':t}',this)">${t}</button>`).join('');
    renderA(arts);
  }catch{g.innerHTML='<div class="aempty">Could not load articles.</div>'}
}
function filterA(type,btn){
  document.querySelectorAll('.ftab').forEach(t=>t.classList.remove('on'));btn.classList.add('on');
  renderA(type==='all'?arts:arts.filter(a=>a.type===type));
}
function renderA(list){
  const g=document.getElementById('agrid');
  if(!list.length){g.innerHTML='<div class="aempty">No articles found.</div>';return}
  g.innerHTML=list.map((a,i)=>{
    const d=a.date?new Date(a.date).toLocaleDateString('en-GB',{year:'numeric',month:'short',day:'numeric'}):'';
    const h=(a.url&&a.url!=='#')?a.url:'#';
    return`<a class="acard" href="${h}"${h!=='#'?' target="_blank" rel="noopener"':''} style="animation-delay:${i*30}ms"><div class="atype">${a.type||'Article'}</div><div class="atitle">${a.title}</div><div class="ameta">${d}${a.topic?' · '+a.topic:''}</div></a>`;
  }).join('');
}
