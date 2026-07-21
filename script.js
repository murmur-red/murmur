/* murmur.red · script.js */

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
  const phrases=['Head of AI Operations','AI Customer Lifecycle Expert','Growth & Operations Expert','Head of Customer Success','Co-Founder @ YGames','SaaS Churn Slayer','Unicorn'];
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
    sel.innerHTML = '<option value="">Select account or fill manually</option>' +
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
  const name = a.account_name || '';
  document.getElementById('qa').value = name;
  autoResearch(name);
}


let _qbrResearch    = null;
let _qbrAccountName = '';
let _qbrFakeData    = null;
let _preResearch    = null;
let _preResearchCompany = '';
let _researchDebounce   = null;

// ── Fake data (deterministic per company name) ───────────
function fakePipelineData(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (Math.imul(h, 31) + name.charCodeAt(i)) | 0;
  const r = n => { h = (Math.imul(h, 1664525) + 1013904223) | 0; return Math.abs(h) % n; };

  const arrOptions   = [480000,720000,1100000,1800000,2400000,3600000,4800000,6200000];
  const arr          = arrOptions[r(arrOptions.length)];
  const health       = 61 + r(23);
  const seatsLic     = [50,75,100,150,200,300,400][r(7)];
  const seatsAct     = Math.round(seatsLic * (0.68 + r(22) / 100));
  const nps          = 28 + r(36);
  const tickets      = 1 + r(7);

  const d = new Date(); d.setMonth(d.getMonth() + 2 + r(8));
  const renewal      = d.toISOString().split('T')[0];
  const renewalShort = d.toLocaleDateString('en-GB', {month:'short', year:'numeric'});

  const csm = ['Sarah Chen','Marcus Webb','Anna Kowalski','James Osei','Priya Sharma','Tom Lindqvist','Elena Vasquez'][r(7)];
  const ind = ['B2B SaaS','HR Tech','FinTech','Revenue Operations','Marketing Technology','DevOps / Platform','Customer Intelligence'][r(7)];
  const challenge = [
    'Low adoption in core reporting module',
    'Champion contact has recently changed roles',
    'Evaluating competitor at renewal',
    'Budget consolidation heading into Q3',
    'Slow rollout across regional offices',
    'Onboarding new team after acquisition',
  ][r(6)];

  const arrFmt = arr >= 1e6 ? '$'+(arr/1e6).toFixed(1)+'M' : '$'+(arr/1e3).toFixed(0)+'k';
  return { arr, arrFmt, health, seatsLic, seatsAct, nps, tickets, renewal, renewalShort, csm, ind, challenge };
}

// ── Pipeline animation ───────────────────────────────────
const PIPE_STEPS = [
  { tool:'Salesforce', label:'Pulling account & contract data', result: d => `${d.arrFmt} ARR`,                  delay:500 },
  { tool:'Mixpanel',   label:'Fetching product usage metrics',  result: d => `${d.seatsAct}/${d.seatsLic} seats active`, delay:560 },
  { tool:'Intercom',   label:'Scanning support queue',          result: d => `${d.tickets} open · NPS ${d.nps}`, delay:440 },
  { tool:'HubSpot',    label:'Reading contact & activity log',  result: d => `CSM: ${d.csm}`,                    delay:380 },
  { tool:'Stripe',     label:'Checking billing & renewal',      result: d => `Renewal ${d.renewalShort}`,         delay:420 },
  { tool:'Perplexity', label:'Researching company news',        result: () => 'Intelligence ready',              real:true  },
  { tool:'Grok',       label:'Reading X / market signals',      result: () => 'Signals captured',                real:true  },
];

async function runPipelineAnimation(data, researchPromise) {
  const container = document.getElementById('qpipe-steps');
  container.innerHTML = '';
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const els = PIPE_STEPS.map((s, i) => {
    const el = document.createElement('div');
    el.className = 'qpipe-step';
    el.innerHTML = `<div class="qpipe-dot"></div>
      <span class="qpipe-tool">${s.tool}</span>
      <span class="qpipe-label">${s.label}</span>
      <span class="qpipe-result" id="qpr-${i}"></span>`;
    container.appendChild(el);
    return el;
  });

  // Fake steps 0-4
  for (let i = 0; i < 5; i++) {
    await sleep(100); els[i].classList.add('show');
    await sleep(60);  els[i].classList.add('active');
    await sleep(PIPE_STEPS[i].delay);
    els[i].classList.remove('active'); els[i].classList.add('done');
    document.getElementById(`qpr-${i}`).textContent = PIPE_STEPS[i].result(data);
  }

  // Real steps 5-6: show active while research runs
  await sleep(100);
  els[5].classList.add('show','active');
  await sleep(120);
  els[6].classList.add('show','active');

  await researchPromise;

  els[5].classList.remove('active'); els[5].classList.add('done');
  document.getElementById('qpr-5').textContent = PIPE_STEPS[5].result();
  await sleep(80);
  els[6].classList.remove('active'); els[6].classList.add('done');
  document.getElementById('qpr-6').textContent = PIPE_STEPS[6].result();
  await sleep(200);
}

async function autoResearch(value) {
  const panel   = document.getElementById('qintel');
  const content = document.getElementById('qintel-content');
  if (_researchDebounce) clearTimeout(_researchDebounce);
  if (value.trim().length < 3) { panel.style.display = 'none'; _preResearch = null; _preResearchCompany = ''; return; }
  _researchDebounce = setTimeout(async () => {
    panel.style.display = 'block';
    content.innerHTML = '<span class="qintel-loading">Researching ' + value.trim() + '…</span>';
    try {
      const res = await fetch(WORKER_URL + '/research', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({company:value.trim()}) });
      if (!res.ok) throw new Error();
      _preResearch = await res.json();
      _preResearchCompany = value.trim();
      const p = _preResearch?.perplexity || {};
      const g = _preResearch?.grok || {};
      if (p.industry && !document.getElementById('qindustry').value) document.getElementById('qindustry').value = p.industry;
      const items = [
        p.funding        && {lbl:'Funding',    val:p.funding},
        p.headcount      && {lbl:'Team Size',  val:p.headcount},
        p.new_hires      && {lbl:'Leadership', val:p.new_hires},
        g.sentiment      && {lbl:'𝕏 Sentiment',val:g.sentiment},
        p.strategy       && {lbl:'Strategy',   val:p.strategy},
        g.trending_topics && {lbl:'𝕏 Signals', val:g.trending_topics},
      ].filter(Boolean).slice(0, 4);
      if (items.length) {
        content.innerHTML = items.map(i => `<div class="qintel-item"><span class="qintel-lbl">${i.lbl}</span><span class="qintel-val">${i.val}</span></div>`).join('');
      } else {
        content.innerHTML = '<span class="qintel-loading">No public intel found, internal data will drive the QBR</span>';
      }
    } catch { panel.style.display = 'none'; _preResearch = null; _preResearchCompany = ''; }
  }, 650);
}

async function runQBR() {
  const btn      = document.getElementById('qbtn');
  const outWrap  = document.getElementById('qout-wrap');
  const out      = document.getElementById('qout');
  const tabBar   = document.getElementById('qtabs');
  const pipeline = document.getElementById('qpipeline');

  const accountName = (document.getElementById('qa').value || '').trim() || 'Demo Company';
  _qbrAccountName = accountName;
  _qbrMarkdown    = '';
  _qbrResearch    = null;

  btn.disabled = true;
  btn.textContent = 'Running…';
  outWrap.style.display = 'none';
  document.getElementById('qgen-cta').classList.remove('show');
  document.getElementById('qintel').style.display = 'none';
  const oldBtn = document.getElementById('qreport-btn');
  if (oldBtn) oldBtn.remove();

  const fd = fakePipelineData(accountName);
  _qbrFakeData = fd;

  const researchP = (_preResearch && _preResearchCompany.toLowerCase() === accountName.toLowerCase())
    ? Promise.resolve(_preResearch)
    : fetch(WORKER_URL + '/research', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({company: accountName})
      }).then(r => r.ok ? r.json() : null).catch(() => null);

  pipeline.classList.add('show');
  await runPipelineAnimation(fd, researchP);
  _qbrResearch = await researchP;

  tabBar.innerHTML = '';
  outWrap.style.display = 'block';
  out.innerHTML = '<div class="qloading">Building your QBR<span class="scur"></span></div>';

  try {
    const res = await fetch(WORKER_URL, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        account_name:   accountName,  industry:       fd.ind,
        arr:            fd.arr,       health_score:   fd.health,
        renewal_date:   fd.renewal,   csm:            fd.csm,
        seats_licensed: fd.seatsLic,  seats_active:   fd.seatsAct,
        nps:            fd.nps,       open_tickets:   fd.tickets,
        challenge:      fd.challenge, notes:          '',
        transcript:     '',           research:       _qbrResearch,
      })
    });
    if (!res.ok) throw new Error(`${res.status}`);

    const reader = res.body.getReader(), dec = new TextDecoder();
    while (true) {
      const {done, value} = await reader.read(); if (done) break;
      for (const line of dec.decode(value,{stream:true}).split('\n')) {
        if (!line.startsWith('data: ')) continue;
        const pl = line.slice(6).trim(); if (pl==='[DONE]') break;
        try { const j=JSON.parse(pl); const d=j?.delta?.text??''; if(d) _qbrMarkdown+=d; } catch {}
      }
    }

    renderQBRTabs(_qbrMarkdown);

    const actions = document.querySelector('.qactions');
    if (actions && !document.getElementById('qreport-btn')) {
      const rb = document.createElement('button');
      rb.id = 'qreport-btn'; rb.className = 'qact-btn';
      rb.style.cssText = 'background:var(--red);border-color:var(--red);color:#fff;font-weight:600;letter-spacing:.1em;';
      rb.textContent = 'Open Full Report →';
      rb.onclick = openQBRReport;
      actions.prepend(rb);
    }
    document.getElementById('qgen-cta').classList.add('show');

  } catch(err) {
    out.innerHTML = `<div class="qloading" style="color:var(--red)">Error: ${err.message}</div>`;
  }

  btn.disabled = false;
  btn.textContent = 'Generate QBR →';
}

function openQBRReport() {
  const fd = _qbrFakeData || {};
  const html = buildReportHTML(_qbrMarkdown, _qbrAccountName, _qbrResearch, {
    arr: fd.arr, health_score: fd.health, renewal_date: fd.renewal,
    nps: fd.nps, csm: fd.csm,            industry:     fd.ind,
  });
  window.open(URL.createObjectURL(new Blob([html],{type:'text/html'})), '_blank');
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
<title>${company} · QBR · murmur.red</title>
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

/* Report CTA */
.report-cta{margin-top:2.5rem;padding:2.5rem var(--pad);background:rgba(255,32,86,.04);border:1px solid rgba(255,32,86,.12);border-radius:4px;text-align:center}
.rcta-eyebrow{font-size:.56rem;letter-spacing:.26em;text-transform:uppercase;color:var(--red);margin-bottom:.8rem}
.rcta-headline{font-family:'Bebas Neue',sans-serif;font-size:clamp(1.6rem,3vw,2.4rem);letter-spacing:.03em;color:var(--text);margin-bottom:.9rem;line-height:1.05}
.rcta-body{font-size:.82rem;color:var(--dim);line-height:1.7;max-width:480px;margin:0 auto 1.6rem}
.rcta-btn{display:inline-block;padding:.6rem 2rem;background:var(--red);color:#fff;text-decoration:none;font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;border-radius:2px}
.rcta-note{font-size:.6rem;color:rgba(180,180,220,.25);margin-top:.9rem}
@media print{.report-cta{display:none}}
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
    <button class="btn btn-ghost" onclick="window.opener&&window.opener.downloadPPTX?window.opener.downloadPPTX():alert('Return to murmur.red to download slides')">↓ Download Slides</button>
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
  </div>` : `<div class="no-intel">No live market intelligence, company name not found or APIs unavailable.</div>`}

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

  <!-- CTA -->
  <div class="report-cta no-print">
    <div class="rcta-eyebrow">murmur.red</div>
    <div class="rcta-headline">Want this for every account, automatically?</div>
    <p class="rcta-body">This QBR was generated in under 60 seconds. In production, your CS team receives one for every account, data pulled automatically from Salesforce, Mixpanel, and Stripe. No manual entry. No assembly time.</p>
    <a href="https://calendly.com/murmur-red1/30min" target="_blank" class="rcta-btn">Book a 30-minute call →</a>
    <div class="rcta-note">CS Automation Sprint · 6 weeks · €12,000 flat fee</div>
  </div>

  <footer>
    <span>© 2026 murmur.red · Lena Ry · Amsterdam</span>
    <span>Generated ${date} · Confidential</span>
  </footer>

</div>

</body>
</html>`;
}

// ── Slide content extractor ──────────────────────────────
function extractSlideContent(markdown) {
  const sections = markdown.split(/\n(?=## )/).map(s => {
    const m = s.match(/^## (.+)\n([\s\S]*)/);
    return m ? { title: m[1].trim().toLowerCase(), raw: m[2].trim() } : null;
  }).filter(Boolean);

  const bullets = (raw, max = 4) =>
    raw.split('\n')
       .map(l => l.replace(/^[-*•]\s*/, '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/^#{1,4}\s+/, '').trim())
       .filter(l => l.length > 20 && l.length < 200 && !l.startsWith('|') && !l.startsWith('#') && !l.startsWith('-'))
       .slice(0, max);

  const riskKeys  = ['risk','concern','challenge','issue','churn','alert','health','watch'];
  const nextKeys  = ['next','action','recommend','goal','plan','step','objective'];
  let well = [], risk = [], next = [];

  sections.forEach(s => {
    const b = bullets(s.raw);
    if (nextKeys.some(k => s.title.includes(k)))      next.push(...b);
    else if (riskKeys.some(k => s.title.includes(k))) risk.push(...b);
    else                                               well.push(...b);
  });

  // Fallback: distribute evenly if parser found nothing
  if (!well.length && !risk.length && !next.length && sections.length) {
    sections.forEach((s, i) => {
      const b = bullets(s.raw);
      if (i === 0) well.push(...b);
      else if (i % 2 === 0) next.push(...b);
      else risk.push(...b);
    });
  }

  return { well: well.slice(0,4), risk: risk.slice(0,4), next: next.slice(0,4) };
}

// ── PPTX generator ───────────────────────────────────────
function downloadPPTX() {
  if (!_qbrMarkdown) return;

  const btn = document.getElementById('pptx-btn');
  if (btn) { btn.textContent = 'Building…'; btn.disabled = true; }

  try {
    const pres  = new PptxGenJS();
    pres.layout = 'LAYOUT_WIDE'; // 13.33" × 7.5"

    const BG    = '07070F';
    const RED   = 'FF2056';
    const WHITE = 'F0F0FF';
    const DIM   = '55556A';
    const DIM2  = '333348';
    const GREEN = '34D399';
    const AMBER = 'FB923C';
    const BLUE  = '38BDF8';
    const CARD  = '0F0F1E';

    const fd      = _qbrFakeData || {};
    const company = _qbrAccountName || 'Company';
    const date    = new Date().toLocaleDateString('en-GB', {year:'numeric', month:'long', day:'numeric'});
    const content = extractSlideContent(_qbrMarkdown);

    const addFooter = (slide) =>
      slide.addText(`${company} · QBR · ${date}`, {
        x:0.4, y:7.1, w:12.5, h:0.3, fontSize:8, color:DIM2, fontFace:'Arial'
      });

    const accentBar = (slide, color) =>
      slide.addShape('rect', {x:0, y:0, w:0.06, h:7.5, fill:{color}, line:{color}});

    const rule = (slide) =>
      slide.addShape('rect', {x:0.4, y:1.28, w:12.5, h:0.02, fill:{color:DIM2}, line:{color:DIM2}});

    const brand = (slide) =>
      slide.addText('murmur.red', {x:0.4, y:0.28, w:4, h:0.3, fontSize:9, color:RED, fontFace:'Arial', bold:true, charSpacing:3});

    // ── Slide 1: Cover ────────────────────────────────────
    const s1 = pres.addSlide();
    s1.background = {color: BG};
    accentBar(s1, RED);
    s1.addText('murmur.red', {x:0.4, y:0.42, w:4, h:0.35, fontSize:11, color:RED, fontFace:'Arial', bold:true, charSpacing:3});
    s1.addText(company, {x:0.4, y:1.35, w:12.5, h:2.4, fontSize:Math.max(28, Math.min(64, Math.floor(540/company.length))), color:WHITE, fontFace:'Arial', bold:true, wrap:true});
    s1.addText('QUARTERLY BUSINESS REVIEW', {x:0.4, y:3.85, w:12, h:0.5, fontSize:13, color:RED, fontFace:'Arial', bold:true, charSpacing:4});
    s1.addText(`Prepared by murmur.red · ${date}`, {x:0.4, y:4.45, w:9, h:0.4, fontSize:12, color:DIM, fontFace:'Arial'});

    if (fd.arr) {
      s1.addShape('rect', {x:0.4, y:5.7, w:12.5, h:0.02, fill:{color:DIM2}, line:{color:DIM2}});
      [{l:'ARR', v: fd.arrFmt||'N/A'}, {l:'HEALTH', v: (fd.health||'N/A')+'/100'}, {l:'RENEWAL', v: fd.renewalShort||'N/A'}, {l:'NPS', v: String(fd.nps||'N/A')}]
        .forEach((m, i) => {
          const x = 0.4 + i * 3.2;
          s1.addText(m.l, {x, y:5.88, w:3, h:0.28, fontSize:8, color:DIM, fontFace:'Arial', charSpacing:2});
          s1.addText(m.v, {x, y:6.2,  w:3, h:0.55, fontSize:20, color:WHITE, fontFace:'Arial', bold:true});
        });
    }

    // ── Slide 2: Key Metrics ──────────────────────────────
    const s2 = pres.addSlide();
    s2.background = {color: BG};
    accentBar(s2, RED); brand(s2);
    s2.addText('KEY METRICS', {x:0.4, y:0.62, w:12, h:0.58, fontSize:30, color:WHITE, fontFace:'Arial', bold:true});
    rule(s2);

    const hScore = Number(fd.health)||0;
    const cards  = [
      {l:'Annual Recurring Revenue', v: fd.arrFmt||'N/A',                         c: GREEN},
      {l:'Health Score',             v: hScore ? `${hScore} / 100` : 'N/A',        c: hScore>74?GREEN:hScore>54?AMBER:RED},
      {l:'Active Seats',             v: fd.seatsAct&&fd.seatsLic ? `${fd.seatsAct} / ${fd.seatsLic}` : 'N/A', c: WHITE},
      {l:'NPS Score',                v: String(fd.nps||'N/A'),                     c: (fd.nps||0)>50?GREEN:(fd.nps||0)>30?AMBER:RED},
      {l:'Open Support Tickets',     v: String(fd.tickets||'N/A'),                 c: (fd.tickets||0)>5?AMBER:WHITE},
      {l:'Renewal Date',             v: fd.renewalShort||'N/A',                   c: BLUE},
    ];
    cards.forEach((c, i) => {
      const col = i % 3, row = Math.floor(i / 3);
      const x = 0.4 + col * 4.32, y = 1.58 + row * 2.7;
      s2.addShape('rect', {x, y, w:4.1, h:2.45, fill:{color:CARD}, line:{color:DIM2, width:0.5}});
      s2.addText(c.l.toUpperCase(), {x:x+0.2, y:y+0.22, w:3.7, h:0.35, fontSize:8, color:DIM, fontFace:'Arial', charSpacing:1.5});
      s2.addText(c.v, {x:x+0.15, y:y+0.7, w:3.8, h:1.4, fontSize:28, color:c.c, fontFace:'Arial', bold:true, valign:'middle'});
    });
    addFooter(s2);

    // ── Slide 3: What Went Well ───────────────────────────
    const s3 = pres.addSlide();
    s3.background = {color: BG};
    accentBar(s3, GREEN); brand(s3);
    s3.addText('WHAT WENT WELL', {x:0.4, y:0.62, w:12, h:0.58, fontSize:30, color:WHITE, fontFace:'Arial', bold:true});
    rule(s3);

    const wellPts = content.well.length ? content.well :
      ['Strong engagement from key stakeholders this quarter','Core product adoption tracking above industry benchmark','Support ticket volume trending down quarter-over-quarter'];
    wellPts.slice(0,4).forEach((pt, i) => {
      const y = 1.62 + i * 1.35;
      s3.addShape('rect', {x:0.4, y:y+0.05, w:0.36, h:0.36, fill:{color:GREEN+'18'}, line:{color:GREEN+'55', width:0.5}});
      s3.addText('✓', {x:0.4, y:y+0.04, w:0.36, h:0.38, fontSize:11, color:GREEN, fontFace:'Arial', bold:true, align:'center', valign:'middle'});
      s3.addText(pt, {x:0.9, y, w:12, h:1.2, fontSize:18, color:WHITE, fontFace:'Arial', valign:'middle', wrap:true});
    });
    addFooter(s3);

    // ── Slide 4: What's At Risk ───────────────────────────
    const s4 = pres.addSlide();
    s4.background = {color: BG};
    accentBar(s4, RED); brand(s4);
    s4.addText("WHAT'S AT RISK", {x:0.4, y:0.62, w:12, h:0.58, fontSize:30, color:WHITE, fontFace:'Arial', bold:true});
    rule(s4);

    const riskPts = content.risk.length ? content.risk :
      [fd.challenge||'Monitor engagement trends heading into renewal window','Review current adoption blockers with key stakeholders'];
    riskPts.slice(0,4).forEach((pt, i) => {
      const y = 1.62 + i * 1.35;
      s4.addShape('rect', {x:0.4, y:y+0.05, w:0.36, h:0.36, fill:{color:RED+'18'}, line:{color:RED+'55', width:0.5}});
      s4.addText('!', {x:0.4, y:y+0.04, w:0.36, h:0.38, fontSize:14, color:RED, fontFace:'Arial', bold:true, align:'center', valign:'middle'});
      s4.addText(pt, {x:0.9, y, w:12, h:1.2, fontSize:18, color:WHITE, fontFace:'Arial', valign:'middle', wrap:true});
    });
    addFooter(s4);

    // ── Slide 5: Next 90 Days ─────────────────────────────
    const s5 = pres.addSlide();
    s5.background = {color: BG};
    accentBar(s5, BLUE); brand(s5);
    s5.addText('NEXT 90 DAYS', {x:0.4, y:0.62, w:12, h:0.58, fontSize:30, color:WHITE, fontFace:'Arial', bold:true});
    rule(s5);

    const nextPts = content.next.length ? content.next :
      ['Drive feature adoption to agreed activation threshold','Schedule executive business review before renewal window','Define expansion criteria and present growth proposal'];
    nextPts.slice(0,4).forEach((pt, i) => {
      const y = 1.62 + i * 1.35;
      s5.addShape('rect', {x:0.4, y:y+0.02, w:0.4, h:0.42, fill:{color:BLUE+'18'}, line:{color:BLUE+'55', width:0.5}});
      s5.addText(String(i+1).padStart(2,'0'), {x:0.4, y:y+0.02, w:0.4, h:0.42, fontSize:13, color:BLUE, fontFace:'Arial', bold:true, align:'center', valign:'middle'});
      s5.addText(pt, {x:0.95, y, w:12, h:1.2, fontSize:18, color:WHITE, fontFace:'Arial', valign:'middle', wrap:true});
      if (i < nextPts.length - 1)
        s5.addShape('rect', {x:0.4, y:y+1.3, w:12.5, h:0.02, fill:{color:DIM2}, line:{color:DIM2}});
    });
    addFooter(s5);

    pres.writeFile({fileName: `${company.replace(/[^\w\s-]/g,'').trim().replace(/\s+/g,'-')}-QBR.pptx`});

  } finally {
    if (btn) { btn.textContent = '↓ Download Slides'; btn.disabled = false; }
  }
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

// ── Playbooks — AI Build Loadouts ─────────────────────────
const examples = [
  "Gmail agent that answers emails and creates calendar events",
  "Time machine that lets people explore historical moments",
  "AI support assistant for a help inbox",
  "Dashboard that turns spreadsheets into weekly reports",
  "Client portal for requests, files, and status updates",
  "Ecommerce workflow for orders, refunds, and support",
  "Research agent that monitors competitors and drafts briefs"
];

const state = {
  quest:
    "Gmail agent that answers emails and creates calendar events",
  selectedLoadout: "",
  selectedAI: "codex",
  selectedModel: "openai",
  selectedChannel: "teams",
  aiResult: null,
  aiError: "",
  isLoading: false,
  copyNotice: ""
};

const AI_LOADOUT_ENDPOINT = WORKER_URL + '/loadouts';
let copyNoticeTimer = null;

const aiChoices = {
  codex: {
    name: "Codex",
    label: "Build in repo",
    intro:
      "Use this when the next step is implementation: scaffold files, wire APIs, add tests, and make the thing run.",
    instruction:
      "Act as a pragmatic coding agent. Read the existing project first, make the smallest working implementation, verify it locally, and report files changed."
  },
  claude: {
    name: "Claude",
    label: "Think it through",
    intro:
      "Use this when the next step is architecture, product reasoning, workflow design, or turning fuzzy intent into a clean spec.",
    instruction:
      "Act as a senior product-engineering architect. Clarify assumptions, design the workflow, identify risks, and produce a build-ready plan."
  },
  gemini: {
    name: "Gemini",
    label: "Research and compare",
    intro:
      "Use this when the next step is comparing tools, checking options, or working through Google-heavy products and docs.",
    instruction:
      "Act as a research-heavy technical planner. Compare tool options, call out tradeoffs, and produce a concise recommendation with sources to verify."
  }
};

const modelChoices = {
  claude: {
    name: "Claude",
    label: "Anthropic",
    note: "Strong for long context, careful writing, review, and planning-heavy automation."
  },
  openai: {
    name: "OpenAI",
    label: "GPT models",
    note: "Strong default for structured outputs, app features, agents, and broad automation."
  },
  gemini: {
    name: "Gemini",
    label: "Google AI",
    note: "Strong fit for Google Workspace-heavy builds and research/comparison tasks."
  }
};

const channelChoices = {
  teams: {
    name: "Microsoft Teams",
    label: "Work approvals",
    note: "Best when the company already lives in Microsoft 365."
  },
  slack: {
    name: "Slack",
    label: "Startup ops",
    note: "Best for fast internal routing, alerts, and lightweight approvals."
  },
  email: {
    name: "Email",
    label: "Universal",
    note: "Best when users or clients are not in the same chat workspace."
  }
};

function detectQuestType(text) {
  const value = text.toLowerCase();
  if (/(black hole|space|planet|orbit|gravity|star|galaxy|cosmos|universe|astronomy|physics)/.test(value)) return "space";
  if (/(time machine|timeline|history|historical|memory|archive|past|future|simulation|world|story|game|experience|museum)/.test(value)) return "speculative";
  if (/(gmail|email|inbox|calendar|meeting|event)/.test(value)) return "email";
  if (/(support|ticket|helpdesk|customer|reply|triage)/.test(value)) return "support";
  if (/(spreadsheet|report|dashboard|analytics|data|metric)/.test(value)) return "data";
  if (/(portal|client|request|file|status)/.test(value)) return "portal";
  if (/(shop|ecommerce|order|refund|inventory|store)/.test(value)) return "commerce";
  if (/(research|competitor|brief|monitor|news|lead)/.test(value)) return "research";
  return "custom";
}

function questName(type) {
  const names = {
    email: "Inbox Automation",
    support: "Support Agent",
    data: "Report Machine",
    portal: "Client Portal",
    commerce: "Commerce Ops",
    research: "Research Agent",
    speculative: "Speculative Build",
    space: "Space/Science Build",
    custom: "Custom AI Build"
  };
  return names[type] || names.custom;
}

function getLoadouts(type) {
  const loadouts = {
    email: [
      {
        id: "email-speed",
        title: "Speed Run",
        level: "Fastest",
        score: "No-code",
        tools: ["n8n", "Gmail", "Google Calendar", "AI model", "Google Sheets"],
        why: "Best for proving the flow quickly: trigger from Gmail, classify the message, draft a reply, create an event, and log the action.",
        moves: ["Trigger on new labeled Gmail messages.", "Classify intent with the selected AI model.", "Create reply draft or calendar event.", "Log every action in Sheets."]
      },
      {
        id: "email-review",
        title: "Review Queue",
        level: "Safer",
        score: "Human-in-loop",
        tools: ["Zapier", "Gmail", "Google Calendar", "Airtable", "AI model"],
        why: "Best when the AI should suggest actions but a person approves replies and meetings before anything is sent.",
        moves: ["Push emails into Airtable.", "Generate recommended reply and event details.", "Approve or edit.", "Sync approved actions back to Google."]
      },
      {
        id: "email-control",
        title: "Control Build",
        level: "Advanced",
        score: "Product-grade",
        tools: ["Google APIs", "Cloudflare Workers", "Supabase", "AI model", "Resend"],
        why: "Best when this becomes a real product with custom rules, durable logs, retries, and user accounts.",
        moves: ["Connect Google OAuth.", "Store rules and email events.", "Run classification in workers.", "Track every action and exception."]
      }
    ],
    support: [
      {
        id: "support-fast",
        title: "Ticket Boost",
        level: "Fastest",
        score: "Existing stack",
        tools: ["Zendesk or Intercom", "AI model", "Zapier", "Airtable"],
        why: "Best for adding AI drafting and triage on top of a helpdesk you already use.",
        moves: ["Detect new tickets.", "Summarize issue and urgency.", "Draft reply.", "Track repeated issues."]
      },
      {
        id: "support-router",
        title: "Ops Router",
        level: "Balanced",
        score: "Team workflow",
        tools: ["n8n", "Team channel", "Helpdesk API", "AI model", "Postgres"],
        why: "Best when tickets need routing, escalation, owners, and an auditable trail.",
        moves: ["Classify urgency.", "Assign owner.", "Notify the team channel.", "Store outcomes."]
      },
      {
        id: "support-product",
        title: "Support Product",
        level: "Advanced",
        score: "Custom app",
        tools: ["Next.js", "Supabase", "AI model", "Vector search", "Vercel"],
        why: "Best if the support assistant is part of the product experience rather than a back-office workflow.",
        moves: ["Index docs.", "Build chat/review UI.", "Add source citations.", "Track answer quality."]
      }
    ],
    data: [
      {
        id: "data-sheet",
        title: "Report Sprint",
        level: "Fastest",
        score: "Lightweight",
        tools: ["Google Sheets", "n8n", "AI model", "Looker Studio"],
        why: "Best for turning recurring spreadsheet work into automated summaries and dashboards.",
        moves: ["Clean input columns.", "Schedule refresh.", "Generate AI summary.", "Publish dashboard."]
      },
      {
        id: "data-backbone",
        title: "Data Backbone",
        level: "Balanced",
        score: "Reliable",
        tools: ["Postgres", "dbt", "Metabase", "AI model"],
        why: "Best when reports need trustworthy transformations, repeatable metrics, and explainable changes.",
        moves: ["Model source tables.", "Add transforms.", "Build metric views.", "Generate insight notes."]
      },
      {
        id: "data-product",
        title: "Insight App",
        level: "Advanced",
        score: "Customer-facing",
        tools: ["Next.js", "Supabase", "AI model", "Chart.js", "Vercel"],
        why: "Best when reporting becomes a real product with users, permissions, and interactive analysis.",
        moves: ["Build import flow.", "Create charts.", "Generate recommendations.", "Add saved reports."]
      }
    ],
    portal: [
      {
        id: "portal-fast",
        title: "Portal Sprint",
        level: "Fastest",
        score: "No-code",
        tools: ["Softr", "Airtable", "Zapier", "AI model"],
        why: "Best for quickly giving clients a place to submit requests and see status.",
        moves: ["Create client records.", "Build request form.", "Automate status updates.", "Draft responses with AI."]
      },
      {
        id: "portal-ops",
        title: "Ops Portal",
        level: "Balanced",
        score: "Internal + client",
        tools: ["Retool", "Postgres", "AI model", "Team channel"],
        why: "Best when the team needs an internal command center connected to a client-facing workflow.",
        moves: ["Model requests.", "Build review screen.", "Generate next action.", "Notify owners."]
      },
      {
        id: "portal-product",
        title: "Product Portal",
        level: "Advanced",
        score: "Scalable",
        tools: ["Next.js", "Supabase", "AI model", "Resend", "Stripe"],
        why: "Best when the portal needs accounts, billing, permissions, and polished UX.",
        moves: ["Create auth.", "Build request workspace.", "Add AI summaries.", "Send lifecycle emails."]
      }
    ],
    commerce: [
      {
        id: "commerce-zap",
        title: "Store Ops Sprint",
        level: "Fastest",
        score: "Automation",
        tools: ["Shopify", "Zapier", "Gmail", "AI model", "Google Sheets"],
        why: "Best for automating order/support admin without touching the storefront.",
        moves: ["Watch order events.", "Classify support email.", "Draft response.", "Track refund or exception."]
      },
      {
        id: "commerce-hub",
        title: "Ops Hub",
        level: "Balanced",
        score: "Operations",
        tools: ["Airtable", "Make", "Shopify", "AI model", "Team channel"],
        why: "Best when orders, refunds, content, and support need a visible workflow board.",
        moves: ["Create ops table.", "Connect Shopify events.", "Generate task drafts.", "Alert owners."]
      },
      {
        id: "commerce-app",
        title: "Seller App",
        level: "Advanced",
        score: "Product-grade",
        tools: ["Next.js", "Shopify API", "Supabase", "AI model", "Vercel"],
        why: "Best when ecommerce automation becomes a reusable app for multiple sellers.",
        moves: ["Connect Shopify OAuth.", "Model seller workspace.", "Add AI workflows.", "Deploy app shell."]
      }
    ],
    research: [
      {
        id: "research-watch",
        title: "Watchtower",
        level: "Fastest",
        score: "Monitoring",
        tools: ["RSS", "n8n", "AI model", "Notion", "Team channel"],
        why: "Best for monitoring competitors, news, or leads and sending readable briefs.",
        moves: ["Collect sources.", "Filter relevant updates.", "Summarize findings.", "Send daily brief."]
      },
      {
        id: "research-database",
        title: "Intel Base",
        level: "Balanced",
        score: "Searchable",
        tools: ["Apify", "Postgres", "AI model", "Metabase"],
        why: "Best when research needs structured storage, scoring, and trend dashboards.",
        moves: ["Scrape source data.", "Normalize records.", "Score importance.", "Build dashboard."]
      },
      {
        id: "research-agent",
        title: "Research Agent",
        level: "Advanced",
        score: "Autonomous",
        tools: ["AI model", "Browser API", "Supabase", "Trigger.dev", "Next.js"],
        why: "Best when the agent needs scheduled jobs, source checking, memory, and review.",
        moves: ["Define research tasks.", "Schedule runs.", "Store sources.", "Review generated briefs."]
      }
    ],
    speculative: [
      {
        id: "speculative-prototype",
        title: "Interactive Prototype",
        level: "Fastest",
        score: "Playable",
        tools: ["Lovable or Bolt", "Supabase", "AI model", "TimelineJS", "Vercel"],
        why: "Best for making the idea tangible fast: users pick a time, see a generated scene, and explore a branching experience.",
        moves: ["Define the core fantasy in one sentence.", "Create three eras or destinations.", "Generate scenes with the selected AI model.", "Publish a clickable prototype."]
      },
      {
        id: "speculative-sim",
        title: "Simulation Engine",
        level: "Balanced",
        score: "World model",
        tools: ["Next.js", "Supabase", "AI model", "Three.js", "Vercel"],
        why: "Best when the build needs a real interface, saved journeys, generated timelines, and immersive visuals.",
        moves: ["Model time periods, characters, and events.", "Build the journey screen.", "Generate consequences and alternate paths.", "Add visual timeline or 3D scene."]
      },
      {
        id: "speculative-research",
        title: "Research-backed Explorer",
        level: "Advanced",
        score: "Grounded",
        tools: ["Gemini or Perplexity", "Wikidata", "Supabase", "AI model", "Next.js"],
        why: "Best when the experience should be historically grounded instead of pure fantasy.",
        moves: ["Pull source facts for each era.", "Store citations and event data.", "Generate scenes from sourced facts.", "Show sources and uncertainty to users."]
      }
    ],
    space: [
      {
        id: "space-visual",
        title: "Cosmic Visualizer",
        level: "Fastest",
        score: "Interactive",
        tools: ["Three.js", "AI model", "NASA APIs", "Vercel"],
        why: "Best for making a space idea like a black hole tangible: users can see, rotate, and explore the concept instead of reading a static explanation.",
        moves: ["Define the core space object or phenomenon.", "Create a 3D scene.", "Use the selected AI model to explain what users are seeing.", "Add one interactive control."]
      },
      {
        id: "space-simulator",
        title: "Physics Sandbox",
        level: "Balanced",
        score: "Simulation",
        tools: ["Next.js", "Three.js", "Rapier or Cannon.js", "AI model", "Vercel"],
        why: "Best when the idea needs motion, gravity, forces, or cause-and-effect play.",
        moves: ["Choose the simplified physics rules.", "Build a sandbox scene.", "Add sliders for mass, speed, or distance.", "Explain outcomes in plain language."]
      },
      {
        id: "space-learning",
        title: "Learning Quest",
        level: "Advanced",
        score: "Educational",
        tools: ["Next.js", "Supabase", "AI model", "Wikidata or NASA", "Vercel"],
        why: "Best when the experience should teach, save progress, and adapt explanations to the user.",
        moves: ["Create lesson checkpoints.", "Pull trustworthy source facts.", "Generate explanations and quizzes.", "Track what the user has explored."]
      }
    ],
    custom: [
      {
        id: "custom-no-code",
        title: "No-Code Quest",
        level: "Fastest",
        score: "Prototype",
        tools: ["n8n", "Airtable", "AI model", "Team channel"],
        why: "Best for validating whether the workflow is useful before building a custom app.",
        moves: ["Define trigger.", "Create data table.", "Add AI action.", "Send result somewhere useful."]
      },
      {
        id: "custom-app",
        title: "App Quest",
        level: "Balanced",
        score: "Web app",
        tools: ["Next.js", "Supabase", "AI model", "Vercel"],
        why: "Best default for AI-enabled web products with users, data, and a clean interface.",
        moves: ["Define records.", "Build first screen.", "Add one AI action.", "Deploy preview."]
      },
      {
        id: "custom-agent",
        title: "Agent Quest",
        level: "Advanced",
        score: "Agentic",
        tools: ["AI model", "Trigger.dev", "Postgres", "Next.js"],
        why: "Best when the AI needs jobs, retries, memory, and human review.",
        moves: ["Define agent tasks.", "Add job execution.", "Store every run.", "Add review controls."]
      }
    ]
  };
  if (type === "custom") return createCustomLoadouts(state.quest);
  if (loadouts[type]) return loadouts[type];
  return createCustomLoadouts(state.quest);
}

function shortQuestName(text) {
  return text
    .replace(/^build\s+/i, "")
    .replace(/^an?\s+/i, "")
    .trim()
    .split(/\s+/)
    .slice(0, 5)
    .join(" ") || "custom idea";
}

function createCustomLoadouts(quest) {
  const name = shortQuestName(quest);
  return [
    {
      id: "custom-prototype",
      title: "Prototype Quest",
      level: "Fastest",
      score: "Playable",
      tools: ["Lovable or Bolt", "Airtable", "AI model", "Vercel"],
      why: `Best for quickly making "${name}" feel real enough to test with another person.`,
      moves: ["Define the one core interaction.", "Create a clickable screen.", "Connect simple storage.", "Use the selected AI model for the magic moment."]
    },
    {
      id: "custom-workflow",
      title: "Workflow Quest",
      level: "Balanced",
      score: "Useful",
      tools: ["n8n", "Airtable", "AI model", "Team channel"],
      why: `Best if "${name}" is mostly a repeatable process, approval loop, or automation.`,
      moves: ["Define the trigger.", "Create the data table.", "Add AI classification or generation.", "Send the result to the team channel."]
    },
    {
      id: "custom-product",
      title: "Product Quest",
      level: "Advanced",
      score: "Scalable",
      tools: ["Next.js", "Supabase", "AI model", "Vercel"],
      why: `Best if "${name}" needs users, saved state, permissions, and a polished interface.`,
      moves: ["Model users and records.", "Build the first product screen.", "Add one AI action.", "Deploy and test with real users."]
    }
  ];
}

function escapeHTML(value) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  };
  return String(value ?? "").replace(/[&<>"']/g, (char) => map[char]);
}

function getActiveAIResult() {
  if (!state.aiResult || state.aiResult.quest !== state.quest) return null;
  return state.aiResult;
}

function getCurrentLoadouts(type) {
  const activeAIResult = getActiveAIResult();
  if (activeAIResult?.needsClarification) return [];
  if (activeAIResult?.loadouts?.length) return activeAIResult.loadouts;
  return getLoadouts(type);
}

function getCurrentQuestName(type) {
  const activeAIResult = getActiveAIResult();
  return activeAIResult?.category || questName(type);
}

function getCurrentInterpretation(quest, type) {
  const activeAIResult = getActiveAIResult();
  return activeAIResult?.interpretation || interpretQuest(quest, type);
}

function getAIStatus() {
  if (state.isLoading) {
    return { tone: "busy", text: "Building your loadouts..." };
  }

  const activeAIResult = getActiveAIResult();
  if (activeAIResult?.needsClarification) {
    return null;
  }

  if (activeAIResult) {
    return { tone: "ok", text: "Quest reward unlocked." };
  }

  if (state.aiError) {
    return null;
  }

  return null;
}

function trackQuestEvent(action, payload = {}) {
  const type = detectQuestType(state.quest);
  const eventName = `playbook_${action}`;
  const detail = {
    quest: state.quest,
    questType: type,
    selectedLoadout: state.selectedLoadout,
    selectedAI: state.selectedAI,
    selectedModel: state.selectedModel,
    selectedChannel: state.selectedChannel,
    ...payload
  };

  window.dispatchEvent(new CustomEvent("playbookQuest:event", { detail: { action, ...detail } }));
  window.dataLayer?.push({ event: eventName, ...detail });
  window.gtag?.("event", eventName, detail);
  window.plausible?.(`Playbook ${action}`, { props: detail });
}

function showCopyNotice(message) {
  state.copyNotice = message;
  renderPrompt();
  bindEvents();

  if (copyNoticeTimer) window.clearTimeout(copyNoticeTimer);
  copyNoticeTimer = window.setTimeout(() => {
    state.copyNotice = "";
    renderPrompt();
    bindEvents();
  }, 2200);
}

function getSelectedLoadout(type) {
  const loadouts = getCurrentLoadouts(type);
  return loadouts.find((loadout) => loadout.id === state.selectedLoadout) || loadouts[0];
}

function cleanText(value, fallback, maxLength = 220) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  if (!text) return fallback;
  return text.slice(0, maxLength);
}

function cleanList(value, fallback, limit, maxLength = 80) {
  if (!Array.isArray(value)) return fallback;
  const items = value
    .map((item) => cleanText(item, "", maxLength))
    .filter(Boolean)
    .slice(0, limit);
  return items.length ? items : fallback;
}

function cleanMultiline(value, fallback, maxLength = 1800) {
  const text = String(value ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return (text || fallback).slice(0, maxLength);
}

function normalizeBlueprint(rawBlueprint) {
  if (!rawBlueprint || typeof rawBlueprint !== "object") return null;

  return {
    mvpDefinition: cleanText(
      rawBlueprint.mvpDefinition,
      `Build the smallest useful version of "${shortQuestName(state.quest)}" and prove the full loop end to end.`,
      420
    ),
    architecture: cleanList(rawBlueprint.architecture, [], 8, 180),
    devScope: cleanList(rawBlueprint.devScope, [], 14, 180),
    buildPhases: cleanList(rawBlueprint.buildPhases, [], 5, 180),
    loopEngineering: cleanList(rawBlueprint.loopEngineering, [], 12, 190),
    testingPlan: cleanList(rawBlueprint.testingPlan, [], 8, 170),
    acceptanceCriteria: cleanList(rawBlueprint.acceptanceCriteria, [], 8, 170),
    implementationTasks: cleanList(rawBlueprint.implementationTasks, [], 12, 180),
    filesServicesPackagesAccounts: cleanList(rawBlueprint.filesServicesPackagesAccounts, [], 14, 180),
    dataModel: cleanList(rawBlueprint.dataModel, [], 10, 180),
    apiContracts: cleanList(rawBlueprint.apiContracts, [], 6, 240),
    aiPrompt: cleanMultiline(rawBlueprint.aiPrompt, "", 1600),
    aiResponseSchema: cleanMultiline(rawBlueprint.aiResponseSchema, "", 1600),
    blockers: cleanList(rawBlueprint.blockers, [], 8, 180),
    decisions: cleanList(rawBlueprint.decisions, [], 8, 180)
  };
}

function numberLines(items) {
  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

function bulletLines(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

function makeLoadoutId(value, index) {
  const id = cleanText(value, `ai-loadout-${index + 1}`, 60)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return id || `ai-loadout-${index + 1}`;
}

function normalizeAIResponse(data) {
  if (data?.needsClarification) {
    return {
      quest: state.quest,
      needsClarification: true,
      category: cleanText(data.category, "One More Detail", 52),
      interpretation: cleanText(
        data.interpretation,
        "I need one clearer build target before I can make useful loadouts.",
        280
      ),
      clarificationQuestion: cleanText(
        data.clarificationQuestion,
        "Tell me what the tool should do, who uses it, and what output it should create.",
        180
      ),
      suggestions: cleanList(
        data.suggestions,
        examples.slice(0, 3),
        3,
        110
      )
    };
  }

  if (!data || typeof data !== "object" || !Array.isArray(data.loadouts)) return null;

  const usedIds = new Set();
  const loadouts = data.loadouts
    .slice(0, 3)
    .map((loadout, index) => {
      const rawId = makeLoadoutId(loadout.id || loadout.title, index);
      const id = usedIds.has(rawId) ? `${rawId}-${index + 1}` : rawId;
      usedIds.add(id);

      return {
        id,
        title: cleanText(loadout.title, `AI Path ${index + 1}`, 44),
        level: cleanText(loadout.level, index === 0 ? "Fastest" : index === 1 ? "Balanced" : "Advanced", 28),
        score: cleanText(loadout.score, index === 0 ? "Prototype" : index === 1 ? "Workflow" : "Product", 32),
        tools: cleanList(loadout.tools, ["AI model", "Airtable", "n8n", "Vercel"], 6, 34),
        why: cleanText(loadout.why, "Best for turning the custom idea into a practical first version.", 260),
        moves: cleanList(loadout.moves, ["Define the first user action.", "Pick the data source.", "Add one AI step.", "Test with a real example."], 5, 90),
        blueprint: normalizeBlueprint(loadout.blueprint)
      };
    });

  if (loadouts.length < 3) return null;

  return {
    quest: state.quest,
    category: cleanText(data.category, "AI Generated Build", 52),
    interpretation: cleanText(
      data.interpretation,
      `I read "${shortQuestName(state.quest)}" as a custom AI build and generated practical paths for it.`,
      280
    ),
    loadouts
  };
}

async function fetchAILoadouts(quest) {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(AI_LOADOUT_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        quest,
        buildRequest: quest,
        modelChoice: state.selectedModel,
        teamChannel: state.selectedChannel
      }),
      signal: controller.signal
    });

    if (!response.ok) throw new Error(`AI endpoint returned ${response.status}`);
    return normalizeAIResponse(await response.json());
  } finally {
    window.clearTimeout(timeout);
  }
}

async function generateLoadoutsForQuest() {
  const input = document.querySelector("[data-quest-input]");
  const nextQuest = (input?.value || "").trim();

  state.quest = nextQuest.slice(0, 240);
  state.selectedLoadout = "";
  state.aiResult = null;
  state.aiError = "";
  state.copyNotice = "";

  if (!state.quest) {
    state.aiResult = {
      quest: state.quest,
      needsClarification: true,
      category: "One More Detail",
      interpretation: "I need one clearer build target before I can make useful loadouts.",
      clarificationQuestion: "Tell me what the tool should do, who uses it, and what output it should create.",
      suggestions: examples.slice(0, 3)
    };
    trackQuestEvent("clarification_requested");
    renderPrompt();
    bindEvents();
    return;
  }

  state.isLoading = true;
  trackQuestEvent("input_submitted");
  renderPrompt();
  bindEvents();

  try {
    const aiResult = await fetchAILoadouts(state.quest);
    if (aiResult) {
      state.aiResult = aiResult;
    } else {
      state.aiError = "AI response did not match the expected blueprint shape.";
    }
  } catch (error) {
    state.aiError = error instanceof Error ? error.message : "AI endpoint unavailable";
  } finally {
    state.isLoading = false;
    renderPrompt();
    bindEvents();
  }
}

function renderPrompt() {
  const host = document.querySelector(".loadout-stage");
  const type = detectQuestType(state.quest);
  const activeAIResult = getActiveAIResult();
  const needsClarification = Boolean(activeAIResult?.needsClarification);
  const loadouts = getCurrentLoadouts(type);
  const selected = needsClarification ? null : getSelectedLoadout(type);
  const selectedAI = aiChoices[state.selectedAI] || aiChoices.codex;
  const selectedModel = modelChoices[state.selectedModel] || modelChoices.openai;
  const selectedChannel = channelChoices[state.selectedChannel] || channelChoices.teams;
  const currentQuestName = getCurrentQuestName(type);
  const currentInterpretation = getCurrentInterpretation(state.quest, type);
  const aiStatus = getAIStatus();
  const generateLabel = state.isLoading ? "Building..." : "Generate loadouts";
  const blueprintText = selected ? createBlueprint(selected, selectedAI) : "";

  host.innerHTML = `
    <div class="quest-console">
      <div>
        <div class="cap">Quest input</div>
        <h2>What do you want to build?</h2>
      </div>
      <textarea class="quest-input" data-quest-input>${escapeHTML(state.quest)}</textarea>
      <div class="quest-actions">
        <button class="quest-run" data-run type="button" ${state.isLoading ? 'disabled aria-busy="true"' : ""}>${generateLabel}</button>
        <div class="detected">Detected: <strong>${escapeHTML(currentQuestName)}</strong></div>
      </div>
      <div class="interpretation">${escapeHTML(currentInterpretation)}</div>
      ${aiStatus ? `<div class="ai-status ${aiStatus.tone}">${escapeHTML(aiStatus.text)}</div>` : ""}
      ${state.copyNotice ? `<div class="copy-notice" role="status">${escapeHTML(state.copyNotice)}</div>` : ""}
      <div class="example-row">
        ${examples.map((example) => `<button data-example="${escapeHTML(example)}" type="button">${escapeHTML(example)}</button>`).join("")}
      </div>
    </div>
    ${needsClarification ? renderClarification(activeAIResult) : `
    <div class="quest-brief">
      <div>
        <h3>${escapeHTML(currentQuestName)}</h3>
        <p>Pick a version based on how fast, safe, or custom you want the build to be.</p>
      </div>
      <div class="reward">
        <span>Loadouts</span>
        <strong>${loadouts.length} paths</strong>
      </div>
    </div>
    <div class="loadout-grid">
      ${loadouts.map((loadout) => renderLoadout(loadout, selected.id)).join("")}
    </div>
    <div class="work-choice-panel">
      <div>
        <div class="cap">Work choices</div>
        <h3>Pick the AI and team channel used in the build</h3>
        <p>These choices update the tool stack and the blueprint. They are separate from the AI you paste the blueprint into.</p>
      </div>
      <div class="choice-columns">
        <div>
          <span class="choice-label">AI model in the product</span>
          <div class="mini-choice-row">
            ${Object.entries(modelChoices)
              .map(
        ([id, model]) => `
                  <button class="mini-choice ${state.selectedModel === id ? "on" : ""}" data-model-choice="${id}" type="button">
                    <b>${escapeHTML(model.name)}</b>
                    <span>${escapeHTML(model.label)}</span>
                  </button>
                `
              )
              .join("")}
          </div>
          <p>${escapeHTML(selectedModel.note)}</p>
        </div>
        <div>
          <span class="choice-label">Team channel</span>
          <div class="mini-choice-row">
            ${Object.entries(channelChoices)
              .map(
                ([id, channel]) => `
                  <button class="mini-choice ${state.selectedChannel === id ? "on" : ""}" data-channel-choice="${id}" type="button">
                    <b>${escapeHTML(channel.name)}</b>
                    <span>${escapeHTML(channel.label)}</span>
                  </button>
                `
              )
              .join("")}
          </div>
          <p>${escapeHTML(selectedChannel.note)}</p>
        </div>
      </div>
    </div>
    <div class="selected-plan">
      <div>
        <span>Selected</span>
        <h3>${escapeHTML(selected.title)}</h3>
        <p>${escapeHTML(selected.why)}</p>
      </div>
      <button class="loadout-cta" data-copy type="button">Copy loadout</button>
    </div>
    <div class="blueprint-panel">
      <div class="blueprint-head">
        <div>
          <div class="cap">Quest reward</div>
          <h3>Blueprint unlocked</h3>
          <p>${escapeHTML(selectedAI.intro)}</p>
        </div>
        <button class="loadout-cta" data-copy-blueprint type="button">Copy ${escapeHTML(selectedAI.name)} blueprint</button>
      </div>
      <div class="reward-strip" aria-label="Blueprint reward summary">
        <div>
          <span>Mission</span>
          <strong>${escapeHTML(shortQuestName(state.quest))}</strong>
        </div>
        <div>
          <span>Loadout</span>
          <strong>${escapeHTML(selected.title)}</strong>
        </div>
        <div>
          <span>Paste into</span>
          <strong>${escapeHTML(selectedAI.name)}</strong>
        </div>
      </div>
      <div class="ai-choice-row">
        ${Object.entries(aiChoices)
          .map(
            ([id, ai]) => `
              <button class="ai-choice ${state.selectedAI === id ? "on" : ""}" data-ai-choice="${id}" type="button">
                <b>${escapeHTML(ai.name)}</b>
                <span>${escapeHTML(ai.label)}</span>
              </button>
            `
          )
          .join("")}
      </div>
      <div class="blueprint-preview">
        <div class="blueprint-preview-head">
          <span>Build spec</span>
          <strong>${escapeHTML(currentQuestName)}</strong>
        </div>
        <pre class="blueprint-box">${escapeHTML(blueprintText)}</pre>
      </div>
    </div>
    `}
  `;
}

function renderClarification(result) {
  const suggestions = result?.suggestions?.length ? result.suggestions : examples.slice(0, 3);
  return `
    <div class="quest-brief">
      <div>
        <h3>${escapeHTML(result?.category || "One More Detail")}</h3>
        <p>${escapeHTML(result?.clarificationQuestion || "Tell me what the tool should do, who uses it, and what output it should create.")}</p>
      </div>
      <div class="reward">
        <span>Next step</span>
        <strong>Clarify</strong>
      </div>
    </div>
    <div class="example-row">
      ${suggestions.map((example) => `<button data-example="${escapeHTML(example)}" type="button">${escapeHTML(example)}</button>`).join("")}
    </div>
  `;
}

function interpretQuest(quest, type) {
  const subject = shortQuestName(quest);
  const scripts = {
    space:
      `I read "${subject}" as a science/space experience. I will suggest visualizer, simulation, and learning loadouts.`,
    speculative:
      `I read "${subject}" as a creative/speculative experience. I will suggest prototype, simulation, and research-backed loadouts.`,
    custom:
      `I do not have an exact category for "${subject}" yet, so I will infer three build paths: quick prototype, workflow, and product-grade app.`,
    email:
      "I read this as inbox/calendar automation, so the loadouts focus on triggers, approvals, and message/event actions.",
    support:
      "I read this as support automation, so the loadouts focus on triage, routing, drafting, and review.",
    data:
      "I read this as a reporting/data product, so the loadouts focus on ingestion, dashboards, and insight generation.",
    portal:
      "I read this as a portal, so the loadouts focus on users, requests, status, and communication.",
    commerce:
      "I read this as commerce operations, so the loadouts focus on orders, exceptions, support, and store APIs.",
    research:
      "I read this as research automation, so the loadouts focus on source gathering, summarization, and brief generation."
  };
  return scripts[type] || scripts.custom;
}

function renderLoadout(loadout, selectedId) {
  return `
    <button class="loadout ${selectedId === loadout.id ? "on" : ""}" data-loadout="${escapeHTML(loadout.id)}" type="button">
      <div class="loadout-head">
        <h3>${escapeHTML(loadout.title)}</h3>
        <span class="badge">${escapeHTML(loadout.level)}</span>
      </div>
      <div class="tool-row">
        ${loadout.tools.map((tool) => `<span>${escapeHTML(resolveToolLabel(tool))}</span>`).join("")}
      </div>
      <p>${escapeHTML(loadout.why)}</p>
      <ol class="moves">
        ${loadout.moves.map((move) => `<li>${escapeHTML(move)}</li>`).join("")}
      </ol>
      <b>${escapeHTML(loadout.score)}</b>
    </button>
  `;
}

function resolveToolLabel(tool) {
  if (tool === "AI model") return modelChoices[state.selectedModel]?.name || modelChoices.openai.name;
  if (tool === "Team channel") return channelChoices[state.selectedChannel]?.name || channelChoices.teams.name;
  return tool;
}

function resolveTools(tools) {
  return tools.map(resolveToolLabel);
}

function bindEvents() {
  document.querySelector("[data-run]")?.addEventListener("click", async () => {
    await generateLoadoutsForQuest();
  });

  document.querySelectorAll("[data-example]").forEach((button) => {
    button.addEventListener("click", () => {
      state.quest = button.dataset.example;
      state.selectedLoadout = "";
      state.aiResult = null;
      state.aiError = "";
      state.copyNotice = "";
      renderPrompt();
      bindEvents();
      trackQuestEvent("example_selected", { example: button.dataset.example });
    });
  });

  document.querySelectorAll("[data-loadout]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedLoadout = button.dataset.loadout;
      renderPrompt();
      bindEvents();
      trackQuestEvent("loadout_selected", { loadoutId: state.selectedLoadout });
    });
  });

  document.querySelectorAll("[data-ai-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedAI = button.dataset.aiChoice;
      if (state.selectedAI === "claude") state.selectedModel = "claude";
      if (state.selectedAI === "gemini") state.selectedModel = "gemini";
      if (state.selectedAI === "codex") state.selectedModel = "openai";
      renderPrompt();
      bindEvents();
    });
  });

  document.querySelectorAll("[data-model-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedModel = button.dataset.modelChoice;
      renderPrompt();
      bindEvents();
    });
  });

  document.querySelectorAll("[data-channel-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedChannel = button.dataset.channelChoice;
      renderPrompt();
      bindEvents();
    });
  });

  document.querySelector("[data-copy]")?.addEventListener("click", async () => {
    const type = detectQuestType(state.quest);
    const selected = getSelectedLoadout(type);
    const text = `${state.quest}\n\n${selected.title}\nTools: ${resolveTools(selected.tools).join(", ")}\n\nWhy: ${selected.why}\n\nFirst moves:\n${selected.moves.map((move, index) => `${index + 1}. ${move}`).join("\n")}`;
    await navigator.clipboard.writeText(text);
    showCopyNotice("Loadout copied.");
    trackQuestEvent("loadout_copied", { loadoutId: selected.id });
  });

  document.querySelector("[data-copy-blueprint]")?.addEventListener("click", async () => {
    const type = detectQuestType(state.quest);
    const selected = getSelectedLoadout(type);
    const selectedAI = aiChoices[state.selectedAI] || aiChoices.codex;
    await navigator.clipboard.writeText(createBlueprint(selected, selectedAI));
    showCopyNotice(`${selectedAI.name} blueprint copied.`);
    trackQuestEvent("blueprint_copied", { loadoutId: selected.id, ai: selectedAI.name });
  });
}

function createArchitectureBlueprint(loadout) {
  if (loadout.blueprint?.architecture?.length) return numberLines(loadout.blueprint.architecture);

  const tools = resolveTools(loadout.tools);
  return `1. Frontend / user surface: one clean screen where the user gives input, reviews the AI result, edits if needed, and confirms the next action.
2. Backend API: a server-side endpoint that receives the request, validates it, calls the AI model, calls required tools, and returns structured results.
3. AI layer: prompt + structured output contract for the main AI action. Keep the prompt versioned so it can be improved without rewriting the product.
4. Workflow layer: use the selected orchestration tool or backend jobs to run multi-step actions, retries, approvals, and notifications.
5. Data layer: store user request, generated output, selected action, status, errors, and final outcome.
6. Integrations: connect only the APIs needed for the first working version: ${tools.join(", ")}.
7. Human review: add approval before any risky external action such as sending, deleting, charging, publishing, or notifying a customer.
8. Observability: log every run, model response, tool call, error, retry, and user correction.`;
}

function createDevScope(loadout) {
  if (loadout.blueprint?.devScope?.length) return bulletLines(loadout.blueprint.devScope);

  return `Frontend:
- Input form for the user's build/task request.
- Loadout selection and selected-tool explanation.
- Review screen for AI output before action.
- Copy/export action for the generated result.
- Error, loading, empty, and retry states.

Backend:
- POST endpoint for the AI action.
- Request validation and rate limiting.
- Server-side API key handling.
- Structured AI response parsing and fallback behavior.
- Integration adapters for the selected tools.
- Job/retry handling for slow or unreliable tool calls.

Data:
- Tables or collections for users, requests, runs, outputs, approvals, tool events, errors, and feedback.
- Audit trail for what the AI suggested, what the user approved, and what actually happened.
- Basic admin/debug view for failed runs.

AI/prompting:
- System prompt for role, constraints, and output format.
- JSON schema or equivalent structured response contract.
- Few-shot examples for good and bad outputs.
- Version field for prompt/model changes.
- Refusal or escalation rules when confidence is low.

Deployment:
- Environment variables for API keys.
- Preview deployment.
- Production deployment.
- Monitoring for endpoint failures, latency, and malformed AI output.`;
}

function createLoopEngineeringPlan(loadout) {
  if (loadout.blueprint?.loopEngineering?.length) return numberLines(loadout.blueprint.loopEngineering);

  return `Core loop:
1. Capture user input.
2. Normalize and validate the input.
3. Ask the AI model for a structured plan or action.
4. Run tool calls only after the output passes validation.
5. Show the result to the user for approval or correction.
6. Execute the approved action.
7. Log the outcome.
8. Feed user corrections and outcomes back into prompt/eval improvements.

Quality loop:
- Save successful and failed examples.
- Review failures weekly and tag the failure type: bad intent detection, wrong tool, bad copy, missing data, integration error, or unsafe action.
- Turn repeated failures into eval cases.
- Test every prompt/model change against those eval cases before release.
- Track useful metrics: completion rate, correction rate, approval rate, retry rate, and user-reported usefulness.

Safety loop:
- Never let the AI silently perform high-impact actions.
- Require user approval for external sends, writes, purchases, deletions, or calendar changes.
- Keep scoped OAuth/API permissions.
- Store minimal data.
- Add rate limits and abuse checks.
- Escalate to a person when the model is uncertain or required data is missing.`;
}

function createBuildPhases(loadout) {
  if (loadout.blueprint?.buildPhases?.length) return numberLines(loadout.blueprint.buildPhases);

  return `Phase 1 - Working prototype:
- Build the input screen.
- Wire one backend endpoint.
- Call the AI model with a structured response.
- Show the result in the UI.
- Add copy/export.

Phase 2 - Real workflow:
- Connect the first real integration from the loadout.
- Add auth and secure credential handling.
- Store requests, runs, outputs, and status.
- Add approval before external actions.
- Add retry and error states.

Phase 3 - Product-grade version:
- Add user accounts and permissions if needed.
- Add background jobs for slow work.
- Add run history and admin/debug views.
- Add eval set and prompt/version tracking.
- Add monitoring, analytics, and production deployment checks.`;
}

function createAcceptanceCriteria(loadout) {
  if (loadout.blueprint?.acceptanceCriteria?.length) return bulletLines(loadout.blueprint.acceptanceCriteria);

  return `- A new user can understand what to do without reading docs.
- A real example request can move through the full loop end to end.
- The AI response always matches the expected structure or falls back cleanly.
- The app stores every run and shows enough detail to debug failures.
- Risky actions require review before execution.
- The selected tools are actually connected or clearly marked as manual placeholders.
- The blueprint can be handed to Codex/Claude/Gemini and used as a build-ready spec.`;
}

function createImplementationTasks(loadout) {
  if (loadout.blueprint?.implementationTasks?.length) return numberLines(loadout.blueprint.implementationTasks);

  return `1. Create the app/workflow shell for the selected loadout.
2. Build the input screen or trigger that captures the user's request.
3. Add the backend endpoint or workflow step that validates the request.
4. Add the AI call with a strict response schema.
5. Add tool adapters for the selected tools: ${resolveTools(loadout.tools).join(", ")}.
6. Add a review/approval step before external actions.
7. Store every run, output, approval, error, and final outcome.
8. Add eval examples for normal, strange, empty, long, and failed inputs.
9. Add monitoring/logging for AI failures, tool failures, retries, and user corrections.
10. Ship the smallest end-to-end version, then improve based on real run logs.`;
}

function createBuildPieces(loadout) {
  if (loadout.blueprint?.filesServicesPackagesAccounts?.length) {
    return bulletLines(loadout.blueprint.filesServicesPackagesAccounts);
  }

  return `Files/modules:
- Frontend screen: input form, result review, approval controls, run history.
- API route or workflow trigger: receives user input and starts the run.
- AI module: prompt, schema, model call, output parser, fallback.
- Integration modules: one adapter per selected tool.
- Data module: request/run/output/approval/error records.
- Eval files: saved examples used to test prompt and model changes.
- Test files: validation, schema parsing, endpoint, integration, and end-to-end tests.

Services/accounts for this loadout:
${resolveTools(loadout.tools).map((tool) => `- ${tool}`).join("\n")}
- Hosting/deployment account.
- AI provider account and server-side API key.
- Database or storage account if the build needs saved state.
- OAuth/app credentials for any user-owned external tool.
- Team notification channel if approvals or alerts are part of the flow.

Packages/capabilities:
- UI framework or no-code workflow builder.
- Server runtime or workflow execution runtime.
- AI SDK/API client.
- Schema validation.
- Database client.
- Integration SDKs or HTTP client.
- Test runner and basic logging.`;
}

function createDataModelAndContracts(loadout) {
  if (loadout.blueprint?.dataModel?.length || loadout.blueprint?.apiContracts?.length) {
    const dataModel = loadout.blueprint?.dataModel?.length
      ? bulletLines(loadout.blueprint.dataModel)
      : "- Store user request, AI runs, tool events, approvals, outcomes, and eval cases.";
    const apiContracts = loadout.blueprint?.apiContracts?.length
      ? bulletLines(loadout.blueprint.apiContracts)
      : "- POST /api/runs, GET /api/runs/:id, POST /api/runs/:id/approve.";

    return `Data model:
${dataModel}

API contracts:
${apiContracts}`;
  }

  return `Data model:
- users: id, email, role, created_at.
- build_requests: id, user_id, raw_input, normalized_input, selected_loadout, status, created_at.
- ai_runs: id, request_id, model_provider, prompt_version, input_json, output_json, confidence, status, latency_ms, created_at.
- approvals: id, request_id, ai_run_id, reviewer_id, decision, edited_output, decided_at.
- tool_events: id, request_id, tool_name, action, payload_json, response_json, status, error, created_at.
- outcomes: id, request_id, result_summary, user_feedback, success_score, created_at.
- eval_cases: id, input, expected_shape, failure_type, notes, added_at.

API contracts:
- POST /api/runs
  Input: { request: string, loadoutId: string, modelProvider: string, teamChannel: string }
  Output: { runId: string, status: "queued" | "needs_review" | "completed" | "failed", result?: object, errors?: string[] }

- GET /api/runs/:id
  Output: { runId: string, request: object, aiRun: object, toolEvents: object[], outcome?: object }

- POST /api/runs/:id/approve
  Input: { decision: "approved" | "rejected", editedOutput?: object }
  Output: { runId: string, status: "completed" | "rejected" | "failed", outcome?: object }

- POST /api/evals/run
  Input: { promptVersion: string, modelProvider: string }
  Output: { passed: number, failed: number, failures: object[] }`;
}

function createPromptAndSchema(loadout) {
  if (loadout.blueprint?.aiPrompt || loadout.blueprint?.aiResponseSchema) {
    return `AI prompt:
${loadout.blueprint.aiPrompt || `Generate a structured plan for "${state.quest}" using ${loadout.title}.`}

AI response schema:
${loadout.blueprint.aiResponseSchema || '{ "summary": "string", "plan": [], "actions": [], "risks": [], "fallback": "string" }'}`;
  }

  return `AI prompt:
You are the planning and execution brain for this build: "${state.quest}".
Use the selected loadout: ${loadout.title}.
Use these tools when relevant: ${resolveTools(loadout.tools).join(", ")}.
Return only structured JSON.
Do not perform external actions directly.
If the request is ambiguous, make the smallest useful assumption and mark it in assumptions.
If the next action is risky, set needsApproval to true.

AI response schema:
{
  "summary": "short explanation of what will be done",
  "intent": "detected user intent",
  "assumptions": ["assumption 1"],
  "plan": [
    { "step": "step name", "tool": "tool name", "reason": "why this step exists" }
  ],
  "requiredData": ["data needed before execution"],
  "actions": [
    { "tool": "tool name", "action": "action name", "payload": {}, "needsApproval": true }
  ],
  "reviewMessage": "what the user should approve or edit",
  "risks": ["risk or failure point"],
  "fallback": "what to do if AI or tools fail"
}`;
}

function createAnsweredBlockers(loadout) {
  if (loadout.blueprint?.blockers?.length || loadout.blueprint?.decisions?.length) {
    const blockers = loadout.blueprint?.blockers?.length
      ? bulletLines(loadout.blueprint.blockers)
      : "- No true blocker identified before starting the MVP.";
    const decisions = loadout.blueprint?.decisions?.length
      ? bulletLines(loadout.blueprint.decisions)
      : "- Build one complete loop first, keep API keys server-side, and require approval for risky actions.";

    return `Known blockers and assumptions:
${blockers}

Decisions already made for the user:
${decisions}`;
  }

  return `Known blockers and assumptions:
- API keys and OAuth credentials must exist before real external actions can run.
- If a selected tool does not expose the required API, use a manual review/export step for MVP.
- If the user input is too vague, the MVP should still generate a draft plan and ask for approval before action.
- If the AI output fails schema validation, return the fallback loadout/plan and log the malformed output.
- If external tools fail, keep the run in failed/retryable status and show the exact failing tool.
- If privacy-sensitive data is used, store only what is required for debugging and audit.

Decisions already made for the user:
- Build one complete loop before adding more features.
- Keep AI keys server-side.
- Keep human approval for risky actions.
- Store run history from day one.
- Treat user corrections as eval data for future prompt/model improvements.
- Do not require the user to understand architecture before getting a usable plan.`;
}

function createBlueprint(loadout, ai) {
  const type = detectQuestType(state.quest);
  const currentQuestName = getCurrentQuestName(type);
  const mvpDefinition =
    loadout.blueprint?.mvpDefinition ||
    `Build the smallest useful version of "${state.quest}" using the selected loadout. The first version should prove the core loop, use real or realistic data, and avoid unnecessary features until the loop works end to end.`;
  const testingPlan = loadout.blueprint?.testingPlan?.length
    ? numberLines(loadout.blueprint.testingPlan)
    : `1. Unit test input validation, schema parsing, and fallback behavior.
2. Integration test the AI endpoint with mocked model responses.
3. Integration test each external tool adapter with sandbox credentials where possible.
4. End-to-end test the full user loop from input to approval to final action.
5. Regression test saved failure examples before changing prompts, models, or workflow logic.
6. Manually test empty input, strange input, long input, API failure, malformed AI output, and permission failure.`;

  return `You are ${ai.name}. ${ai.instruction}

Goal:
${state.quest}

Detected build category:
${currentQuestName}

Selected tool loadout:
${loadout.title}

Tools to use:
${resolveTools(loadout.tools).map((tool) => `- ${tool}`).join("\n")}

AI model/provider in the product:
${modelChoices[state.selectedModel]?.name || modelChoices.openai.name}

Team channel:
${channelChoices[state.selectedChannel]?.name || channelChoices.teams.name}

Why this loadout:
${loadout.why}

MVP definition:
${mvpDefinition}

First build moves from the loadout:
${loadout.moves.map((move, index) => `${index + 1}. ${move}`).join("\n")}

Architecture:
${createArchitectureBlueprint(loadout)}

Full dev scope:
${createDevScope(loadout)}

Build phases:
${createBuildPhases(loadout)}

Loop engineering:
${createLoopEngineeringPlan(loadout)}

Testing plan:
${testingPlan}

Acceptance criteria:
${createAcceptanceCriteria(loadout)}

Implementation tasks:
${createImplementationTasks(loadout)}

Files, services, packages, and accounts:
${createBuildPieces(loadout)}

Data model and API contracts:
${createDataModelAndContracts(loadout)}

AI prompt and response schema:
${createPromptAndSchema(loadout)}

Answered blockers and decisions:
${createAnsweredBlockers(loadout)}

Constraints:
- Keep the first version small.
- Prefer working automation over a perfect architecture.
- Do not invent credentials, API access, or product capabilities.
- Answer with reasonable assumptions and flag only truly blocking missing information.
- Keep all API keys server-side.
`;
}

renderPrompt();
bindEvents();

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
    return`<a class="acard" href="${h}"${h!=='#'?' target="_blank" rel="noopener"':''} style="animation-delay:${i*30}ms"><div class="atype">${a.type||'Article'}</div>${a.flag?`<div class="aflag">⚑ ${a.flag}</div>`:''}<div class="atitle">${a.title}</div><div class="ameta">${d}${a.topic?' · '+a.topic:''}</div></a>`;
  }).join('');
}
