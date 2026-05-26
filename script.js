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
    recipe:{name:'Auto-QBR Workflow',steps:[
      {tool:'Gong',action:'call transcribed + risks flagged'},
      {tool:'Claude',action:'QBR draft generated'},
      {tool:'Gainsight',action:'health score updated'},
      {tool:'Salesforce',action:'activities logged'},
      {tool:'Slack',action:'CSM briefed'}
    ]},
    tools:[
      {name:'Claude',cat:'Anthropic',desc:'Best for long-form CS work: QBRs, EBR decks, risk emails, success plans. Projects feature keeps full account context across every session — it remembers your clients.',connects:['Zapier','Make','Notion','Gmail']},
      {name:'ChatGPT',cat:'OpenAI',desc:'GPT-4o for quick CS tasks: summarize Gong calls, draft follow-ups, analyze NPS verbatims. o1 model is strong for complex renewal strategy and pricing scenarios.',connects:['Zapier','Make','Salesforce','Notion']},
      {name:'Gemini',cat:'Google',desc:'Deeply wired into Google Workspace. Summarizes Docs, drafts slides, pulls data from Sheets mid-meeting. If your CS team runs on Google, this is the AI layer to activate first.',connects:['Google Docs','Google Sheets','Gmail','Google Meet']},
      {name:'Gainsight',cat:'CS Platform',desc:'Enterprise standard for health scoring, lifecycle automation, and renewal management. Overkill below 50 enterprise accounts — above that, nothing comes close.',connects:['Salesforce','Slack','Mixpanel','Zendesk']},
      {name:'Vitally',cat:'CS Platform',desc:'The modern alternative to Gainsight. Better UX, faster implementation, built for B2B SaaS teams who want automation without a six-month onboarding project.',connects:['HubSpot','Intercom','Segment','Slack']},
      {name:'Gong',cat:'Revenue Intel',desc:'Records and transcribes every customer call. AI surfaces churn signals, competitor mentions, and expansion opportunities before your CSM even writes up their notes.',connects:['Salesforce','HubSpot','Slack','Zoom']},
      {name:'Intercom',cat:'Messaging',desc:'In-app chat, onboarding flows, and Fin AI for automated tier-1 support. Best for PLG companies where users self-serve before they ever talk to a human.',connects:['Salesforce','Mixpanel','Stripe','Zapier']},
      {name:'Mixpanel',cat:'Analytics',desc:'The leading-indicator layer. See who is disengaging in the product before they say anything. Feeds health scores directly into Gainsight and Vitally.',connects:['Segment','Salesforce','Gainsight','Vitally']},
      {name:'Notion AI',cat:'Knowledge',desc:'CS playbooks, runbooks, and EBR templates that write themselves. AI fills in account context, generates meeting summaries, and translates docs for global teams.',connects:['Slack','Zapier','Google Drive','Linear']},
      {name:'Salesforce',cat:'CRM',desc:'System of record. Einstein AI surfaces renewal risk, next best actions, and forecast accuracy. Every CS tool integrates here — it is the backbone, not optional.',connects:['Gainsight','Gong','Intercom','Mixpanel']},
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
      {name:'Clay',cat:'Enrichment',desc:'The most powerful GTM tool of the last three years. Pulls from 75+ data sources, runs AI research on every row, and writes personalized outreach at scale. Nothing else does what Clay does.',connects:['Apollo','HubSpot','Salesforce','Instantly']},
      {name:'Perplexity',cat:'AI Research',desc:'AI-powered search that cites real sources. Use it for competitive intel, ICP research, and market sizing — faster and more accurate than a Google deep-dive. Pro plan adds real-time web access.',connects:['Notion','Slack','Clay','Chrome']},
      {name:'Grok',cat:'xAI',desc:'Built on real-time X/Twitter data. Best tool for tracking competitor moves, industry conversations, and cultural signals as they happen. Free with X Premium — no other AI has live web access this fast.',connects:['X/Twitter','Notion','Slack','Clay']},
      {name:'ChatGPT',cat:'OpenAI',desc:'GPT-4o for ops tasks at scale: analyze cohorts, write GTM copy, build frameworks. Operator mode can browse web apps, fill forms, and take actions — early but powerful for workflow automation.',connects:['Zapier','Make','HubSpot','Notion']},
      {name:'Apollo',cat:'Prospecting',desc:'275M+ contacts. Build precise ICP-filtered lists, verify emails in real time, and launch sequences — all without leaving the platform. The entry point for most outbound motions.',connects:['Clay','HubSpot','Salesforce','LinkedIn']},
      {name:'Make',cat:'Automation',desc:'Visual automation builder that handles complexity Zapier cannot. Multi-branch logic, error handling, AI modules, and HTTP requests. The ops Swiss army knife.',connects:['Clay','HubSpot','Slack','Airtable']},
      {name:'n8n',cat:'Automation',desc:'Self-hosted Make alternative with no per-task pricing. Native AI agent nodes, full control over data, and the ability to run LLM workflows without SaaS cost blowing up.',connects:['Webhooks','Postgres','Claude API','Slack']},
      {name:'Amplitude',cat:'Analytics',desc:'Behavioral cohort analysis that actually tells you what drives 12-month retention. The best tool for finding the activation milestones that correlate with renewals.',connects:['Segment','Braze','Salesforce','Slack']},
      {name:'Instantly',cat:'Outreach',desc:'Cold email at scale with inbox rotation, AI personalization per-lead, and deliverability tooling. The default for outbound-heavy growth teams running Clay-sourced lists.',connects:['Clay','Apollo','HubSpot','Slack']},
      {name:'HubSpot',cat:'CRM',desc:'Best all-in-one for scaling teams. Breeze AI copilot writes emails, scores leads, and summarizes pipeline. Marketing, sales, and ops in one platform — and it actually talks to Clay.',connects:['Clay','Apollo','Segment','Intercom']},
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
      {name:'Midjourney',cat:'Image AI',desc:'Still the best for aesthetic quality and brand consistency. V7 has dramatically better prompt following and style control. The default for game art, ad creatives, and concept work.',connects:['Runway','Figma','Canva','Adobe Firefly']},
      {name:'ChatGPT',cat:'OpenAI',desc:'DALL-E 3 for image generation inside the chat interface, plus GPT-4o for writing briefs, ad copy, and scripts. The creative generalist — one tool for ideation through copy.',connects:['DALL-E 3','Canva','Make','Zapier']},
      {name:'Sora',cat:'OpenAI Video',desc:'OpenAI\'s text-to-video model generating up to 20-second cinematic clips. Available in ChatGPT Pro. Changing what is possible for indie studios and small ad teams with no video budget.',connects:['ChatGPT','ElevenLabs','CapCut','Adobe Premiere']},
      {name:'Kling',cat:'Video AI',desc:'Kuaishou\'s video model with top-tier motion quality, longer clips, and excellent character animation. Now the go-to for mobile game trailers and high-motion ad creatives.',connects:['Midjourney','ElevenLabs','CapCut','Runway']},
      {name:'Runway',cat:'Video AI',desc:'Gen-3 Alpha with the most complete ecosystem: inpainting, motion brush, camera controls, and Act-One for character animation. Preferred by professional studios who need precision.',connects:['Midjourney','ElevenLabs','CapCut','Adobe Premiere']},
      {name:'ElevenLabs',cat:'Audio AI',desc:'Hyper-realistic AI voices in 32 languages with instant voice cloning. Add sound effects and music generation. The audio layer every creative pipeline needs.',connects:['Runway','Kling','Sora','CapCut']},
      {name:'HeyGen',cat:'Avatar AI',desc:'Generate talking-head video ads with AI avatars or your own cloned likeness. Used by ad teams to localize video content into 40+ languages without reshooting a single frame.',connects:['ElevenLabs','CapCut','Canva','Meta Ads']},
      {name:'Ideogram',cat:'Image AI',desc:'The only AI that reliably renders text inside images. Essential for ad overlays, game UI mockups, and logo concepts — the one thing Midjourney still cannot do.',connects:['Figma','Canva','Midjourney','Adobe']},
      {name:'Suno',cat:'Music AI',desc:'Generate complete, royalty-free music tracks from a text prompt in seconds. Full vocal tracks, genre control, stem exports. The fastest way to soundtrack a mobile game or ad.',connects:['CapCut','Runway','ElevenLabs','Adobe Premiere']},
      {name:'Adobe Firefly',cat:'Image AI',desc:'Commercially indemnified AI generation built into Photoshop, Illustrator, and Premiere. The safe choice for agency work and brand campaigns where IP liability matters.',connects:['Adobe Premiere','Figma','Frame.io','Midjourney']},
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
      {name:'Claude',cat:'Anthropic',desc:'Best for writing real, production-quality code. 200K context window handles entire codebases. Projects remembers your stack, conventions, and constraints — the senior dev that never forgets.',connects:['GitHub','Cursor','Vercel','Supabase']},
      {name:'Bolt',cat:'AI Builder',desc:'StackBlitz full-stack AI builder. Describe your app → running Next.js + React project in 60 seconds, complete with routing, components, and API calls. The fastest MVP tool in existence.',connects:['Vercel','Supabase','GitHub','Stripe']},
      {name:'Lovable',cat:'AI Builder',desc:'AI-native web builder that outputs clean React code you own. No vendor lock-in. Excellent for landing pages, SaaS MVPs, and internal tools — without needing a developer on staff.',connects:['Supabase','GitHub','Vercel','Stripe']},
      {name:'ChatGPT',cat:'OpenAI',desc:'o1 and o3 models for complex architectural decisions, debugging hard problems, and code review. GPT-4o for fast iteration. The rubber duck that actually knows how to code.',connects:['GitHub','Cursor','Vercel','Supabase']},
      {name:'Cursor',cat:'AI IDE',desc:'The AI code editor engineers actually choose. Cmd+K edits inline, Composer rewrites files, and it indexes your whole codebase — not just the open file. The pro upgrade from VS Code.',connects:['GitHub','Vercel','Supabase','Cloudflare']},
      {name:'v0',cat:'Vercel UI Gen',desc:'Describe any UI → get production React + Tailwind code. Best for building design systems, complex components, and dashboards without touching Figma first.',connects:['Cursor','GitHub','Vercel','Figma']},
      {name:'Framer',cat:'No-Code',desc:'The highest-quality no-code tool for marketing sites. Real physics-based animations, CMS, and AI layout generation. If a site feels too good to be no-code — it is probably Framer.',connects:['Figma','HubSpot','Calendly','Lottie']},
      {name:'Vercel',cat:'Hosting',desc:'Git push → live URL in 30 seconds. The gold standard for frontend deployment. Edge functions, analytics, and AI SDK all built in. Free tier handles most early-stage projects.',connects:['GitHub','Supabase','Cloudflare','Next.js']},
      {name:'Supabase',cat:'Database',desc:'Postgres + auth + storage + realtime in one dashboard. Open source, no vendor lock-in, and a pgvector extension for AI search. The fastest way to add a real backend.',connects:['Vercel','Cloudflare','Next.js','Cursor']},
      {name:'Cloudflare',cat:'Infrastructure',desc:'Workers for serverless edge functions, Pages for hosting, R2 for object storage. Global by default, faster than Vercel for non-Node runtimes, and the free tier is remarkable.',connects:['GitHub','Supabase','Stripe','Resend']},
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
