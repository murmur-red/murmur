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
        content.innerHTML = '<span class="qintel-loading">No public intel found — internal data will drive the QBR</span>';
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

  <!-- CTA -->
  <div class="report-cta no-print">
    <div class="rcta-eyebrow">murmur.red</div>
    <div class="rcta-headline">Want this for every account, automatically?</div>
    <p class="rcta-body">This QBR was generated in under 60 seconds. In production, your CS team receives one for every account — data pulled automatically from Salesforce, Mixpanel, and Stripe. No manual entry. No assembly time.</p>
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

// ── Playbooks ────────────────────────────────────────────
const CATC={
  'Input Layer':'#38bdf8','Core Layer':'#a78bfa','AI Engine':'#d97706',
  'Output Layer':'#34d399','Memory':'#fb923c','Trigger':'#ff2056',
  'Scoring':'#f59e0b','Communication':'#34d399','Detection':'#ff2056',
  'Routing':'#a78bfa',
};
const STACKS={
  qbr:{label:'QBR Agent',color:'#38bdf8',
    recipe:{name:'QBR Agent Pipeline',steps:[
      {tool:'Stripe / Salesforce',action:'account data pulled'},
      {tool:'Mixpanel / Amplitude',action:'usage snapshot built'},
      {tool:'Zendesk / Intercom',action:'support health pulled'},
      {tool:'Claude Opus',action:'narrative generated'},
      {tool:'Notion / Slides',action:'report delivered'}
    ]},
    tools:[
      {name:'Account Mapping',cat:'Core Layer',desc:'Stitches the customer across Stripe, Salesforce, Mixpanel, and Zendesk. Without this join layer the agent cannot assemble a coherent picture. The hardest 60% of the build — and the part most teams skip.',connects:['Revenue Data','Usage Signals','Support Health','Claude Engine'],use:'Build a lookup table: Stripe customer_id → Salesforce account_id → Mixpanel org_id. Build this first. Every other component depends on it.'},
      {name:'Revenue Data',cat:'Input Layer',desc:'MRR, ARR, renewal date, plan tier, payment status. Stripe for PLG, Salesforce + Chargebee for enterprise. The financial spine of the QBR — without renewal date, you cannot frame urgency.',connects:['Account Mapping','Claude Engine'],use:'Cache renewal dates locally. Don\'t call Stripe on every QBR run — pull weekly, store per account. One stale renewal date in a live QBR kills credibility.'},
      {name:'Usage Signals',cat:'Input Layer',desc:'Feature adoption %, DAU/MAU ratio, core workflow completion. The most predictive section of any QBR. Lives in Mixpanel, Amplitude, or your data warehouse. This data changes the narrative more than any other input.',connects:['Account Mapping','Health Score','Claude Engine'],use:'Define 3 activation events per segment. Adoption score = % of accounts that fired all 3 last month. One number replaces ten dashboard screenshots in the QBR.'},
      {name:'Support Health',cat:'Input Layer',desc:'Ticket volume trend, open critical issues, avg resolution time. High ticket count isn\'t bad — it\'s the trend and severity that matter. A spike that resolved fast tells a very different story.',connects:['Account Mapping','Claude Engine'],use:'Weight by severity: 1 critical ticket = 5 low-priority tickets in the health formula. This changes the QBR narrative for roughly 30% of accounts.'},
      {name:'Goals Layer',cat:'Memory',desc:'Stores last quarter\'s objectives and compares against actuals. The hardest part to automate — most teams skip it. Without this, the QBR has no memory and every quarter starts from zero.',connects:['Claude Engine','Report Builder'],use:'Start simple: a JSON per account with {q1_goals:[], q2_goals:[]}. Claude reads it and writes "you hit 2 of 3 goals from last quarter" — no template can do this.'},
      {name:'Claude Engine',cat:'AI Engine',desc:'Reads the full customer snapshot and writes the QBR narrative: what improved, what\'s at risk, what the next 90 days should look like. Opus for executive accounts, Sonnet for volume runs.',connects:['Account Mapping','Goals Layer','Report Builder'],use:'Cache the system prompt. Pass only delta data — what changed this quarter. Token cost drops 70% with no quality loss. Never send the full account history on every call.'},
      {name:'Report Builder',cat:'Output Layer',desc:'Formats Claude\'s output into a deliverable QBR document. Notion for speed, Google Slides for exec presentations, PDF for formal reviews. Don\'t over-engineer this layer first.',connects:['Claude Engine','Delivery Layer'],use:'Build Notion first — one API call creates the page, export to PDF from browser when needed. Move to Slides only when a specific customer requires it.'},
      {name:'Delivery Layer',cat:'Output Layer',desc:'Sends the finished QBR to CSM and customer. Preview link 24 hours before the call. CSM approves, then it goes to the customer. Never auto-send QBRs without a human reviewing.',connects:['Report Builder','Account Mapping'],use:'CSM gets a "looks good?" email with a single approve button. Approval triggers the send. This one step protects against bad data ever reaching the customer.'},
    ]
  },
  lifecycle:{label:'CS Lifecycle',color:'#a78bfa',
    recipe:{name:'CS Lifecycle Automation',steps:[
      {tool:'Product Event',action:'trigger fires'},
      {tool:'Health Engine',action:'score evaluated'},
      {tool:'Playbook Router',action:'action matched'},
      {tool:'Intercom / HubSpot',action:'message sent'},
      {tool:'Salesforce / Gainsight',action:'CRM updated'}
    ]},
    tools:[
      {name:'Event Source',cat:'Input Layer',desc:'Product events that start lifecycle actions: user completes onboarding, feature unused for 21 days, health drops below 60. Fires from Intercom, Mixpanel, Segment, or a custom webhook.',connects:['Health Engine','Playbook Router'],use:'Start with 5 trigger events maximum. Validate each fires correctly before wiring downstream actions. Premature automation on bad triggers is worse than no automation.'},
      {name:'Health Engine',cat:'Scoring',desc:'Composite score from usage (40%), revenue signals (30%), support load (20%), engagement (10%). The brain that drives every routing decision in the system. Recalculate weekly, not daily.',connects:['Event Source','Playbook Router','Escalation Engine','CRM Sync'],use:'Recalculate weekly. Daily creates noise. Flag accounts that dropped more than 10 points in one week — that\'s your true alert signal, not the absolute score.'},
      {name:'Playbook Router',cat:'Core Layer',desc:'Matches trigger + health score to the right response. Low health + 45 days to renewal gets a different playbook than low health + just onboarded. This is the intelligence layer — the decision matrix.',connects:['Health Engine','Communication Layer','Escalation Engine'],use:'Build a 3×4 decision matrix: health tiers × lifecycle stages = 12 situations. Each maps to exactly one playbook. No overlapping rules — ambiguity kills automation.'},
      {name:'Communication Layer',cat:'Communication',desc:'Sends the right message through the right channel. In-app via Intercom for product events. Email via HubSpot for lifecycle milestones. Slack to CSM for escalations. Channel discipline prevents fatigue.',connects:['Playbook Router','CRM Sync'],use:'Never use the same channel for different intent. In-app = usage nudges. Email = business milestones. Slack = CSM escalations. Mixing channels for the same trigger confuses customers.'},
      {name:'Escalation Engine',cat:'Routing',desc:'Decides when to involve a human CSM. High-value account + red health = CSM call, not an automated email. The rule that stops automation from making a bad situation worse.',connects:['Playbook Router','Communication Layer','CRM Sync'],use:'Never auto-email an account with ARR above your threshold and health below 40. Route those to a CSM task instead. High-value accounts need judgment, not templates.'},
      {name:'Expansion Trigger',cat:'Detection',desc:'Fires when usage signals indicate readiness for a larger plan: seats near capacity, feature adoption above threshold, power users spreading across departments. The revenue layer.',connects:['Health Engine','Playbook Router','CRM Sync'],use:'"Seats at 85% capacity" is the cleanest expansion signal. Set it precisely. Auto-create a CSM task with pre-written expansion talking points. Don\'t automate the conversation — prepare the CSM for it.'},
      {name:'CRM Sync',cat:'Output Layer',desc:'Logs every triggered action back to Salesforce or HubSpot. CSMs need full visibility into what the system did. The audit trail that makes automation trustworthy and accountability clear.',connects:['Communication Layer','Escalation Engine','Expansion Trigger'],use:'Log to a custom object: automation_action_type, trigger_reason, timestamp, playbook_fired. CSMs should never wonder why a customer received an automated message.'},
      {name:'Goals Tracker',cat:'Memory',desc:'Monitors account progress toward agreed success milestones. Triggers a check-in when they fall behind. The loop that turns one-time automation into an ongoing success system.',connects:['Health Engine','CRM Sync','Communication Layer'],use:'Define 2-3 measurable milestones per segment at onboarding. Milestone not hit by day 30 = automatic check-in trigger. Simple. Specific. Measurable. If you can\'t measure it, don\'t track it.'},
    ]
  },
  churn:{label:'Churn Detection',color:'#ff2056',
    recipe:{name:'Churn Detection Pipeline',steps:[
      {tool:'Usage Events',action:'trend detected'},
      {tool:'Risk Model',action:'score calculated'},
      {tool:'Threshold Crossed',action:'alert fired'},
      {tool:'CSM Assigned',action:'context delivered'},
      {tool:'Outcome Logged',action:'model improved'}
    ]},
    tools:[
      {name:'Usage Collector',cat:'Input Layer',desc:'Continuously collects usage events: logins, feature calls, core workflow triggers. The raw feed the risk model reads. Lives in Mixpanel, Amplitude, Segment, or your data warehouse.',connects:['Trend Analyzer','Risk Model'],use:'Define your "core event" per customer segment — the one action most predictive of retention. Usage of this single event is a better churn signal than any composite metric.'},
      {name:'Trend Analyzer',cat:'Scoring',desc:'Detects usage trends over time — not just current usage, but the slope. An account at 40% trending down from 80% is a far bigger risk than one steady at 40%. Direction beats absolute level.',connects:['Usage Collector','Risk Model'],use:'30-day rolling average vs 90-day baseline. When 30-day drops 20%+ below baseline — that\'s your early signal, before the account says anything or CSM notices anything.'},
      {name:'Risk Model',cat:'Core Layer',desc:'Combines usage trend, support load, billing signals, and engagement into a churn probability score. Updated weekly. The number that drives every downstream action in the system.',connects:['Trend Analyzer','Alert Engine','Dashboard'],use:'Start with 4 inputs: usage trend (40%), days since last login (25%), open critical tickets (20%), renewal proximity (15%). Validate weights against your historical churn data quarterly.'},
      {name:'Alert Engine',cat:'Detection',desc:'Fires when risk score crosses a threshold. Routes high-risk accounts to CSM immediately, medium-risk to a nurture playbook, low-risk to monitoring. Three tiers, not binary.',connects:['Risk Model','CSM Assignment','Playbook Router'],use:'Set 3 thresholds: above 75% = urgent (CSM call within 24h), 50-75% = watch (automated nurture), below 50% = monitor. Alert fatigue kills the system — every non-actionable alert trains CSMs to ignore them.'},
      {name:'CSM Assignment',cat:'Routing',desc:'Assigns the at-risk account to the right CSM with full context: score, main signals, last interaction date, suggested first action. Not just a ping — a briefing.',connects:['Alert Engine','CRM Sync','Playbook Router'],use:'"Usage dropped 45% in 30 days, last CSM contact 62 days ago, renewal in 41 days." The CSM should know exactly what to do before they open the account — zero archaeology.'},
      {name:'Playbook Router',cat:'Core Layer',desc:'Matches the churn risk profile to the right intervention. Price-sensitive + low usage gets a different play than high usage + frustrated support. Risk type changes everything.',connects:['Alert Engine','Communication Layer'],use:'Build 5 churn archetypes from your historical data. Each maps to a specific save playbook. Generic save plays underperform archetype-specific ones by 3-4x — the data will prove this within 2 quarters.'},
      {name:'Communication Layer',cat:'Communication',desc:'Executes the automated portion of the save play: check-in email, in-app prompt, executive outreach request. Timed and staged — not all interventions at once.',connects:['Playbook Router','CRM Sync'],use:'Space interventions 5-7 days apart. First touch is always a personal check-in, not a product tip. Lead with curiosity: "How are things going with X?" not "Try this feature."'},
      {name:'Outcome Logger',cat:'Memory',desc:'Records whether each intervention worked: saved, churned, or expanded. This data trains the risk model over time, improving accuracy every quarter. The system should get smarter.',connects:['CRM Sync','Risk Model','Dashboard'],use:'After every churn: 5-field post-mortem. When did risk score first cross 50%? What interventions fired? What was the final CSM note? This is your model training data — never skip it.'},
    ]
  },
  onboarding:{label:'Onboarding',color:'#34d399',
    recipe:{name:'Onboarding Automation',steps:[
      {tool:'Account Created',action:'kickoff triggered'},
      {tool:'Milestones Tracked',action:'progress monitored'},
      {tool:'Stall Detected',action:'intervention fired'},
      {tool:'Activation Hit',action:'health score set'},
      {tool:'CSM Handoff',action:'lifecycle begins'}
    ]},
    tools:[
      {name:'Account Trigger',cat:'Trigger',desc:'Fires when a new account is confirmed in your billing system. The starting gun for the entire onboarding sequence. Stripe webhook, Salesforce flow, or HubSpot enrollment — pick the most reliable event.',connects:['Kickoff Engine','Milestone Tracker','CSM Assignment'],use:'Trigger on payment confirmed, not trial started. Paid accounts get the full sequence. Trials get a lighter version. One webhook, two sequences — segment at the source.'},
      {name:'Kickoff Engine',cat:'Communication',desc:'Sends the onboarding kickoff: welcome email from the assigned CSM, booking link for kickoff call, access to the right resources. Personalized by tier and segment. First impression of the experience.',connects:['Account Trigger','Milestone Tracker'],use:'Subject line with company name and CSM first name. "Acme + Sarah — let\'s get you started." Open rates are 40% higher when it reads like a personal email rather than a sequence.'},
      {name:'CSM Assignment',cat:'Routing',desc:'Assigns the right CSM by ARR tier, segment, and geography. High-ARR gets dedicated. SMB gets pooled. The logic lives here — not in a Slack message, not in someone\'s head.',connects:['Account Trigger','Kickoff Engine','Stall Detector'],use:'For accounts above your ARR threshold, auto-create a CSM task within 2 hours of payment. Speed of first contact is the highest single predictor of successful onboarding.'},
      {name:'Milestone Tracker',cat:'Core Layer',desc:'Defines and monitors the activation milestones for each segment. Setup complete, first core action, team invited. Three milestones. Not ten. Complexity in milestone definitions kills adoption.',connects:['Account Trigger','Stall Detector','Health Scoring','CRM Sync'],use:'Week 1: setup complete. Week 2: first core action. Week 3: team invited. Miss any → intervention triggered. Hit all three → account is activated. This is the entire onboarding model.'},
      {name:'Stall Detector',cat:'Detection',desc:'Detects when an account has gone quiet: no login in 5 days, milestone not hit by target date, no response to kickoff email. Fires before the stall becomes a churn risk.',connects:['Milestone Tracker','Intervention Layer','CSM Assignment'],use:'Day 3 no login = in-app nudge. Day 5 = CSM personal email. Day 8 = CSM task with escalation flag. Response escalates with each day — it doesn\'t repeat the same message louder.'},
      {name:'Intervention Layer',cat:'Communication',desc:'Executes the right intervention for the right stall. Product tips for low-usage stalls, setup help for configuration stalls, executive outreach for strategic accounts.',connects:['Stall Detector','Milestone Tracker','CRM Sync'],use:'"You set up your first project but haven\'t invited your team yet" converts 3x better than "we noticed you haven\'t logged in." Name the specific milestone that was missed.'},
      {name:'Health Scoring',cat:'Scoring',desc:'Tracks onboarding health in real time: milestones hit, time-to-activation, resource engagement. Seeds the main health score system once the customer crosses the activation threshold.',connects:['Milestone Tracker','CRM Sync','Handoff Trigger'],use:'"Time to first core action" is the single most predictive onboarding metric for 90-day retention. Measure it for every customer. Set a target. Optimize everything toward it.'},
      {name:'Handoff Trigger',cat:'Output Layer',desc:'Fires when onboarding is complete: all milestones hit, health above threshold, first QBR booked. Transitions the account from onboarding mode to ongoing lifecycle management.',connects:['Milestone Tracker','Health Scoring','CRM Sync'],use:'Don\'t handoff on day 30 regardless of status. Handoff when milestones hit AND health above 70. Some accounts need 45 days — the system should accommodate that, not punish it.'},
    ]
  },
  expansion:{label:'Expansion Engine',color:'#fb923c',
    recipe:{name:'Expansion Signal Engine',steps:[
      {tool:'Usage Spike',action:'signal detected'},
      {tool:'Signal Scorer',action:'readiness calculated'},
      {tool:'Claude Engine',action:'proposal drafted'},
      {tool:'CSM Alerted',action:'conversation primed'},
      {tool:'Outcome Logged',action:'model improved'}
    ]},
    tools:[
      {name:'Usage Signals',cat:'Input Layer',desc:'Detects expansion readiness in product: seats near capacity, feature adoption above threshold, power users emerging, usage spreading across departments. The strongest revenue signal a CS team can monitor.',connects:['Signal Scorer','Account Context'],use:'"Seats at 85% capacity" is your cleanest trigger. Set it precisely. 85% = expansion conversation. 95% = urgent. Below 70% = don\'t bring it up. False expansion conversations destroy trust.'},
      {name:'Revenue Signals',cat:'Input Layer',desc:'Billing and contract signals: plan tier relative to usage, annual renewal approaching, recent upsell conversation in CRM notes. Combines with usage signals for the highest-converting moment.',connects:['Signal Scorer','Account Context'],use:'"Seats near limit" + "renewal in 60-90 days" = highest-converting expansion window. Both signals together = CSM priority task. Either alone = monitor. The combination is the trigger.'},
      {name:'Account Context',cat:'Core Layer',desc:'Pulls the full account picture at trigger time: ARR, tenure, health score, CSM notes, last interaction sentiment. Gives Claude everything it needs to write a relevant proposal instead of a generic one.',connects:['Usage Signals','Revenue Signals','Signal Scorer','Claude Engine'],use:'Include sentiment from last 3 Gong calls in the context. Positive sentiment = direct expansion ask. Neutral = value-reinforcement email first. Same signal, different play.'},
      {name:'Signal Scorer',cat:'Scoring',desc:'Combines usage signals, revenue signals, and health into an expansion readiness score. Filters false positives — not every usage spike means the customer wants to expand.',connects:['Usage Signals','Revenue Signals','CSM Alert','Dashboard'],use:'Score = (usage × 0.4) + (revenue × 0.35) + (health × 0.25). Threshold above 7 = expansion opportunity. Below = keep monitoring. Validate this formula against your last 12 months of expansion data.'},
      {name:'Claude Engine',cat:'AI Engine',desc:'Drafts the expansion proposal: what the account has achieved, why the next tier makes sense for where they\'re heading, specific ROI projection for their situation. Opus for enterprise, Sonnet for volume.',connects:['Account Context','Proposal Builder','CSM Alert'],use:'"Given this account\'s usage of [features] and their business outcome, write a one-page expansion proposal for upgrading from [current] to [next tier]." First draft in 30 seconds. CSM edits to taste.'},
      {name:'CSM Alert',cat:'Communication',desc:'Notifies the CSM with readiness score, the 3 signals that triggered it, and the Claude-drafted proposal. CSM reviews and adjusts — never sends blind.',connects:['Signal Scorer','Claude Engine','CRM Sync'],use:'Alert format: company name, score, top 3 signals, one-click link to proposal draft, one-click to dismiss with reason. The CSM should decide in under 2 minutes — or the alert is too complex.'},
      {name:'Proposal Builder',cat:'Output Layer',desc:'Formats the expansion proposal for delivery. One-pager in Notion, PDF for formal accounts, a well-crafted email for SMB. The format should match the account relationship.',connects:['Claude Engine','Delivery Layer'],use:'For accounts under €30k ARR, a well-written email IS the proposal. Don\'t send PDFs to SMB accounts — it signals you\'re running a corporate sales process, not a partnership conversation.'},
      {name:'Outcome Tracker',cat:'Memory',desc:'Logs the result of every expansion conversation: expanded, not ready, lost. Feeds back into the signal scorer over time, improving readiness model accuracy every quarter.',connects:['CRM Sync','Signal Scorer','Dashboard'],use:'Track time-to-close on expansions that converted. If average is 22 days, time your CSM alert 30 days before renewal — align the signal timing to your actual sales motion, not a generic rule.'},
    ]
  }
};

const CATC_ALPHA='18';
let activeStack='qbr';
function initStacks(){switchStack('qbr',document.querySelector('.stab'))}
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
