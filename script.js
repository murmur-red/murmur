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
            initChapters();
            initStacks();
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

// ── AI Stacks ────────────────────────────────────────────
const STACKS={
  cs:{label:'CS Teams',color:'#38bdf8',
    recipe:{name:'Churn Early Warning',steps:[
      {tool:'Mixpanel',action:'usage drop detected'},
      {tool:'Gainsight',action:'health score updated'},
      {tool:'Claude',action:'risk email drafted'},
      {tool:'Salesforce',action:'activity logged'},
      {tool:'Slack',action:'CSM alerted'}
    ]},
    tools:[
      {name:'Gainsight',cat:'CS Platform',desc:'The gold standard for health scoring, lifecycle automation, and renewal forecasting at scale.',connects:['Salesforce','Slack','Mixpanel','Zendesk']},
      {name:'ChurnZero',cat:'CS Platform',desc:'Real-time CS automation with in-app messaging, health scores, and playbook triggers.',connects:['HubSpot','Intercom','Segment','Zapier']},
      {name:'Gong',cat:'Revenue Intel',desc:'Records every customer call. AI surfaces risks, objections, and next steps automatically.',connects:['Salesforce','HubSpot','Slack','Zoom']},
      {name:'Intercom',cat:'Messaging',desc:'In-app chat, onboarding flows, and AI support in one. Best for PLG and mid-market SaaS.',connects:['Salesforce','Mixpanel','Stripe','Zapier']},
      {name:'Mixpanel',cat:'Analytics',desc:'Event-based product analytics. Track feature adoption, activation funnels, and leading churn indicators.',connects:['Segment','Salesforce','Gainsight','Slack']},
      {name:'Claude',cat:'AI',desc:'Write QBRs, EBR decks, risk emails, and success plans in seconds. Best output for long-form CS content.',connects:['Zapier','Make','Notion','Gmail']},
      {name:'Notion AI',cat:'Knowledge',desc:'CS playbooks, runbooks, and wikis with AI-generated summaries and auto-fill templates.',connects:['Slack','Zapier','Google Drive','Linear']},
      {name:'Zapier',cat:'Automation',desc:'The connective tissue. Trigger CS workflows across any tool without writing code.',connects:['Gainsight','Mixpanel','Salesforce','Slack']},
      {name:'Loom',cat:'Async Video',desc:'Record walkthroughs and QBR summaries. AI generates transcripts and shareable chapters.',connects:['Notion','Intercom','Gmail','Slack']},
      {name:'Salesforce',cat:'CRM',desc:'System of record for accounts, contacts, and renewals. Everything flows in and out of Salesforce.',connects:['Gainsight','Gong','Intercom','Mixpanel']},
    ]
  },
  ops:{label:'Ops & Growth',color:'#a78bfa',
    recipe:{name:'Outbound Pipeline',steps:[
      {tool:'Apollo',action:'prospect list built'},
      {tool:'Clay',action:'data enriched'},
      {tool:'Claude',action:'emails personalized'},
      {tool:'Instantly',action:'sequence launched'},
      {tool:'HubSpot',action:'replies tracked'}
    ]},
    tools:[
      {name:'Clay',cat:'Enrichment',desc:'The most powerful enrichment tool built. Pulls from 75+ sources and runs AI research on every lead.',connects:['Apollo','HubSpot','Salesforce','Instantly']},
      {name:'Apollo',cat:'Prospecting',desc:'275M+ contacts with email and mobile. Build precise ICP lists and launch sequences directly.',connects:['Clay','HubSpot','Salesforce','LinkedIn']},
      {name:'Make',cat:'Automation',desc:'Visual automation builder more powerful than Zapier. Handles complex multi-step ops workflows.',connects:['Clay','HubSpot','Slack','Airtable']},
      {name:'HubSpot',cat:'CRM',desc:'Best-in-class for inbound and mid-market. Marketing, sales, and ops all in one platform.',connects:['Clay','Apollo','Segment','Intercom']},
      {name:'Segment',cat:'CDP',desc:'Routes customer data from every source to every destination. The data backbone of modern SaaS.',connects:['Mixpanel','Amplitude','Salesforce','Intercom']},
      {name:'Amplitude',cat:'Analytics',desc:'Product analytics with powerful behavioral cohorts and predictive analytics for retention.',connects:['Segment','Braze','Salesforce','Slack']},
      {name:'n8n',cat:'Automation',desc:'Self-hosted automation for teams wanting full control. No per-task pricing. Runs complex AI workflows.',connects:['Webhooks','Postgres','Claude','Slack']},
      {name:'Instantly',cat:'Outreach',desc:'Cold email at scale with AI personalization and inbox rotation. Used by top GTM teams.',connects:['Clay','Apollo','HubSpot','Slack']},
      {name:'Clearbit',cat:'Enrichment',desc:'Real-time B2B data enrichment on website visitors and form fills. Now part of HubSpot.',connects:['HubSpot','Salesforce','Segment','Marketo']},
      {name:'Hotjar',cat:'Analytics',desc:'Session recordings, heatmaps, and feedback widgets. Understand exactly why users drop off.',connects:['Google Analytics','Segment','Slack','Jira']},
    ]
  },
  creative:{label:'Creative',color:'#ff2056',
    recipe:{name:'Ad Creative Pipeline',steps:[
      {tool:'Midjourney',action:'concepts generated'},
      {tool:'Runway',action:'video animated'},
      {tool:'ElevenLabs',action:'voiceover added'},
      {tool:'CapCut',action:'final edit'},
      {tool:'Meta Ads',action:'A/B launched'}
    ]},
    tools:[
      {name:'Midjourney',cat:'Image AI',desc:'Best aesthetic quality for ad creatives, game art, and brand visuals. Prompt → stunning image in seconds.',connects:['Runway','Figma','Canva','Adobe']},
      {name:'Runway',cat:'Video AI',desc:'Gen-3 Alpha turns images or text into cinematic video clips. Used by real studios and ad agencies.',connects:['Midjourney','ElevenLabs','CapCut','Adobe Premiere']},
      {name:'ElevenLabs',cat:'Audio AI',desc:'Hyper-realistic AI voices in 30+ languages. Clone your own voice or pick from 1000+ presets.',connects:['Runway','CapCut','Descript','Pika']},
      {name:'Pika',cat:'Video AI',desc:'Fast video generation for mobile-first content, game trailers, and social ads.',connects:['ElevenLabs','CapCut','Midjourney','Canva']},
      {name:'Spline',cat:'3D Design',desc:'Browser-based 3D design and animation. Build interactive 3D elements for web — no Three.js needed.',connects:['Webflow','Framer','React','Figma']},
      {name:'Adobe Firefly',cat:'Image AI',desc:'Commercially safe AI image generation inside Photoshop and Illustrator. IP-indemnified.',connects:['Adobe Premiere','Figma','Frame.io','Midjourney']},
      {name:'CapCut',cat:'Video Edit',desc:'AI-powered editing with auto-captions, background removal, beat sync, and viral templates.',connects:['Runway','ElevenLabs','Pika','TikTok']},
      {name:'Krea',cat:'Image AI',desc:'Real-time AI image generation and enhancement. Flux-based, excellent for brand consistency.',connects:['Midjourney','Figma','Canva','Webflow']},
      {name:'Figma AI',cat:'Design',desc:'The design standard. AI auto-fills layouts, generates copy, and turns designs into code.',connects:['Webflow','Framer','GitHub','Zeplin']},
      {name:'Canva AI',cat:'Design',desc:'Fastest path from idea to polished creative. Magic Studio handles resizing, translation, and remixing.',connects:['Midjourney','Meta Ads','HubSpot','Slack']},
    ]
  },
  web:{label:'Build a Website',color:'#34d399',
    recipe:{name:'Ship a Landing Page',steps:[
      {tool:'Figma',action:'design mocked'},
      {tool:'v0',action:'code generated'},
      {tool:'Cursor',action:'refined with AI'},
      {tool:'Cloudflare',action:'worker deployed'},
      {tool:'GitHub',action:'live on push'}
    ]},
    tools:[
      {name:'Cursor',cat:'AI Coding',desc:'The best AI code editor. Knows your entire codebase context. Tab-complete entire features, not just lines.',connects:['GitHub','Vercel','Supabase','Cloudflare']},
      {name:'v0',cat:'UI Gen',desc:"Vercel's UI generator. Describe a component → get production React/Tailwind code instantly.",connects:['Cursor','GitHub','Vercel','Figma']},
      {name:'Framer',cat:'No-Code',desc:'The best no-code tool for beautiful marketing sites. CMS, animations, and AI layout built in.',connects:['Figma','HubSpot','Calendly','Lottie']},
      {name:'Figma',cat:'Design',desc:'Design your site here first. Dev Mode exports exact CSS. Plugins generate real code from frames.',connects:['Cursor','Framer','Webflow','v0']},
      {name:'Cloudflare',cat:'Infrastructure',desc:'Workers for serverless functions, Pages for hosting, R2 for storage. Fast, cheap, global edge.',connects:['GitHub','Supabase','Stripe','Resend']},
      {name:'Vercel',cat:'Hosting',desc:'Deploy any frontend in seconds. Git push → live URL. Best DX in the industry, free tier is generous.',connects:['GitHub','Supabase','Cloudflare','Next.js']},
      {name:'Supabase',cat:'Database',desc:'Postgres + auth + storage + realtime — all with a great dashboard. Open source Firebase alternative.',connects:['Vercel','Cloudflare','Next.js','Cursor']},
      {name:'Webflow',cat:'No-Code',desc:'Most powerful no-code builder. Full CSS control, CMS, and ecommerce. High ceiling, steep learning curve.',connects:['Figma','Zapier','HubSpot','Lottie']},
      {name:'Resend',cat:'Email',desc:'Modern email API. Send transactional emails from your domain with React templates.',connects:['Vercel','Supabase','Cloudflare','GitHub']},
      {name:'GitHub',cat:'Version Control',desc:'Every project lives here. Actions for CI/CD, Pages for free hosting, Copilot for AI code completion.',connects:['Vercel','Cloudflare','Cursor','Linear']},
    ]
  }
};

let activeStack='cs';
function initStacks(){switchStack('cs',document.querySelector('.stab'))}
function switchStack(key,btn){
  activeStack=key;
  document.querySelectorAll('.stab').forEach(t=>t.classList.remove('on'));
  if(btn)btn.classList.add('on');
  const s=STACKS[key];
  document.getElementById('stacks').style.setProperty('--scolor',s.color);
  document.getElementById('srlabel').textContent=s.recipe.name;
  const rc=document.getElementById('srecipe');
  rc.innerHTML=s.recipe.steps.map((step,i)=>`
    <div class="sritem"><div class="srtool">${step.tool}</div><div class="sraction">${step.action}</div></div>
    ${i<s.recipe.steps.length-1?'<span class="srarr">→</span>':''}
  `).join('');
  const g=document.getElementById('sgrid');
  g.innerHTML=s.tools.map((t,i)=>`
    <div class="stcard" style="animation-delay:${i*20}ms">
      <div class="stcard-top">
        <div class="stcard-name">${t.name}</div>
        <div class="stcard-cat">${t.cat}</div>
      </div>
      <div class="stcard-desc">${t.desc}</div>
      <div class="stcard-conn">${t.connects.map(c=>`<span class="stconn">${c}</span>`).join('')}</div>
    </div>
  `).join('');
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
