/* murmur.red — script.js */

const WORKER_URL   = 'https://murmur-qbr.YOUR_SUBDOMAIN.workers.dev';
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
            initChapters();
            loadArticles();
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
function initTW(){
  const phrases=['AI Customer Lifecycle Expert','Head of Customer Success','Co-Founder @ YGames','SaaS Churn Slayer'];
  const el=document.getElementById('tw');
  let pi=0,ci=0,del=false,w=0;
  (function tick(){
    if(w-->0){setTimeout(tick,80);return}
    const p=phrases[pi];
    if(!del){el.textContent=p.slice(0,++ci);if(ci===p.length){del=true;w=22}}
    else{el.textContent=p.slice(0,--ci);if(ci===0){del=false;pi=(pi+1)%phrases.length;w=4}}
    setTimeout(tick,del?40:78);
  })();
}

// ── Scroll reveal ────────────────────────────────────────
function initReveal(){
  const ob=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('vis');ob.unobserve(e.target)}})},{threshold:.14});
  document.querySelectorAll('.rev').forEach(el=>ob.observe(el));
}

// ── Chapters ─────────────────────────────────────────────
let churnDone=false;
function initChapters(){
  const ob=new IntersectionObserver(es=>{
    es.forEach(e=>{
      if(!e.isIntersecting)return;
      e.target.classList.add('vis');
      if(e.target.id==='chreplai'&&!churnDone){churnDone=true;setTimeout(animChurn,500)}
      ob.unobserve(e.target);
    });
  },{threshold:.18});
  document.querySelectorAll('.ch').forEach(el=>ob.observe(el));
}

// ── Churn counter ────────────────────────────────────────
function animChurn(){
  const el=document.getElementById('cv');
  let v=30,i=0;const steps=55,dec=26/steps;
  const t=setInterval(()=>{v-=dec;i++;if(i>=steps){v=4;clearInterval(t)}el.textContent=Math.round(v)},26);
}

// ── QBR ──────────────────────────────────────────────────
async function runQBR(){
  const acct=document.getElementById('qa').value.trim()||'Demo Company';
  const arr =document.getElementById('qr').value||120000;
  const hlth=document.getElementById('qh').value||72;
  const chlg=document.getElementById('qc').value.trim()||'Improving product adoption';
  const btn=document.getElementById('qbtn'),st=document.getElementById('qst'),out=document.getElementById('qout');

  if(WORKER_URL.includes('YOUR_SUBDOMAIN')){
    out.classList.add('on');
    out.innerHTML='<p style="color:var(--red)">Worker not deployed yet.</p><p style="color:var(--dim);font-size:.8rem;margin-top:.4rem">Deploy worker.js to Cloudflare and update WORKER_URL in script.js.</p>';
    return;
  }
  btn.disabled=true;btn.textContent='Generating…';st.textContent='';
  out.classList.add('on');out.innerHTML='<span class="scur"></span>';
  let raw='';
  const md=typeof marked.parse==='function'?marked.parse:marked;
  try{
    const res=await fetch(WORKER_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({account_name:acct,arr,health_score:hlth,challenge:chlg})});
    if(!res.ok)throw new Error(`${res.status}`);
    const reader=res.body.getReader(),dec=new TextDecoder();
    while(true){
      const{done,value}=await reader.read();if(done)break;
      for(const line of dec.decode(value,{stream:true}).split('\n')){
        if(!line.startsWith('data: '))continue;
        const pl=line.slice(6).trim();if(pl==='[DONE]')break;
        try{const j=JSON.parse(pl);const d=j?.delta?.text??'';if(d){raw+=d;out.innerHTML=md(raw)+'<span class="scur"></span>'}}catch{}
      }
    }
    out.innerHTML=md(raw);st.textContent='✓ Done';
  }catch(err){out.innerHTML=`<p style="color:var(--red)">Error: ${err.message}</p>`;st.textContent='Failed'}
  btn.disabled=false;btn.innerHTML='<svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1 5.5h9M5.5 1l4.5 4.5L5.5 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg> Generate QBR';
}

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
