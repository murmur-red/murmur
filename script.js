/* ═══════════════════════════════════════════════════
   MURMUR.RED — script.js
   ═══════════════════════════════════════════════════ */

const WORKER_URL   = 'https://murmur-qbr.YOUR_SUBDOMAIN.workers.dev'; // TODO: set after Cloudflare deploy
const ARTICLES_URL = 'https://raw.githubusercontent.com/murmur-red/murmur/main/articles.json';

// ── Scramble text effect ─────────────────────────────
function scramble(el, finalText, duration) {
  const pool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%·';
  const len  = finalText.length;
  const start = performance.now();

  const frame = (now) => {
    const t = Math.min((now - start) / duration, 1);
    // how many chars have "resolved" (from left)
    const resolved = Math.floor(t * len);

    el.textContent = finalText.split('').map((ch, i) => {
      if (ch === ' ') return ' ';
      if (i < resolved) return ch;
      return pool[Math.floor(Math.random() * pool.length)];
    }).join('');

    if (t < 1) requestAnimationFrame(frame);
    else el.textContent = finalText;
  };
  requestAnimationFrame(frame);
}

// ── Loader ───────────────────────────────────────────
window.addEventListener('load', () => {
  const loader  = document.getElementById('loader');
  const bar     = document.getElementById('loaderBar');
  const pct     = document.getElementById('loaderPct');
  const logoEl  = document.getElementById('loaderLogo');

  // Start scramble immediately
  logoEl.textContent = '';
  scramble(logoEl, 'MURMUR.RED', 1400);

  let p = 0;
  const tick = setInterval(() => {
    p += Math.random() * 18 + 8;
    if (p > 100) p = 100;
    bar.style.width  = p + '%';
    pct.textContent  = Math.round(p) + '%';
    if (p >= 100) {
      clearInterval(tick);
      // flash red → reveal
      setTimeout(() => {
        loader.style.transition = 'background .07s';
        loader.style.background = '#ff2056';
        setTimeout(() => {
          loader.style.background = '';
          loader.classList.add('out');
          setTimeout(() => {
            loader.style.display = 'none';
            initTypewriter();
            initScrollReveal();
            initChapters();
            loadArticles();
          }, 380);
        }, 90);
      }, 420);
    }
  }, 65);
});

// ── Custom cursor ─────────────────────────────────────
const cursorDot  = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursorDot.style.left = mx + 'px';
  cursorDot.style.top  = my + 'px';
});
(function loop() {
  rx += (mx - rx) * .12;
  ry += (my - ry) * .12;
  cursorRing.style.left = rx + 'px';
  cursorRing.style.top  = ry + 'px';
  requestAnimationFrame(loop);
})();
document.querySelectorAll('a,button,input,[onclick]').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
});

// ── Particle canvas ───────────────────────────────────
const canvas = document.getElementById('bgCanvas');
const ctx    = canvas.getContext('2d');
let W, H, pts = [];

function resize() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', () => { resize(); buildPts(); }, { passive:true });

class Pt {
  constructor() { this.reset(); }
  reset() {
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.vx = (Math.random() - .5) * .25;
    this.vy = (Math.random() - .5) * .25;
    this.r  = Math.random() * 1.0 + .25;
    this.a  = Math.random() * .3 + .05;
    const r = Math.random();
    this.c  = r < .1 ? '#ff2056' : r < .22 ? '#38bdf8' : '#ffffff';
  }
  step() {
    this.x += this.vx; this.y += this.vy;
    if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.c + Math.floor(this.a * 255).toString(16).padStart(2, '0');
    ctx.fill();
  }
}
function buildPts() {
  const n = Math.min(Math.floor(W * H / 20000), 80);
  pts = Array.from({length: n}, () => new Pt());
}
buildPts();
(function render() {
  ctx.clearRect(0, 0, W, H);
  pts.forEach(p => { p.step(); p.draw(); });
  requestAnimationFrame(render);
})();

// ── Nav ───────────────────────────────────────────────
const mainNav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
  mainNav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive:true });

// ── Mobile nav ────────────────────────────────────────
function toggleMobileNav() {
  document.getElementById('mobileNav').classList.toggle('open');
  document.getElementById('mobileOverlay').classList.toggle('open');
}
function closeMobileNav() {
  document.getElementById('mobileNav').classList.remove('open');
  document.getElementById('mobileOverlay').classList.remove('open');
}

// ── Typewriter ────────────────────────────────────────
function initTypewriter() {
  const phrases = [
    'AI Customer Lifecycle Expert',
    'Head of Customer Success',
    'Co-Founder @ YGames',
    'SaaS Churn Slayer',
  ];
  const el = document.getElementById('typewriter');
  let pi = 0, ci = 0, del = false, wait = 0;

  (function tick() {
    if (wait-- > 0) { setTimeout(tick, 80); return; }
    const p = phrases[pi];
    if (!del) {
      el.textContent = p.slice(0, ++ci);
      if (ci === p.length) { del = true; wait = 24; }
    } else {
      el.textContent = p.slice(0, --ci);
      if (ci === 0) { del = false; pi = (pi + 1) % phrases.length; wait = 5; }
    }
    setTimeout(tick, del ? 40 : 80);
  })();
}

// ── Scroll reveal (.reveal) ───────────────────────────
function initScrollReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
    });
  }, { threshold: .14 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

// ── Chapter reveal ────────────────────────────────────
let churnDone = false;

function initChapters() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('visible');
      if (e.target.id === 'chapterReplai' && !churnDone) {
        churnDone = true;
        setTimeout(animateChurn, 480);
      }
      obs.unobserve(e.target);
    });
  }, { threshold: .2 });
  document.querySelectorAll('.chapter').forEach(el => obs.observe(el));
}

// ── Churn counter ─────────────────────────────────────
function animateChurn() {
  const el  = document.getElementById('churnVal');
  const end = 4;
  let val   = 30;
  const steps = 52;
  const dec   = (val - end) / steps;
  let i = 0;

  const t = setInterval(() => {
    val -= dec; i++;
    if (i >= steps) { val = end; clearInterval(t); }
    el.textContent = Math.round(val);
  }, 28);
}

// ── QBR streaming ─────────────────────────────────────
async function runQBR() {
  const account   = document.getElementById('qbrAccount').value.trim()   || 'Demo Company';
  const arr       = document.getElementById('qbrARR').value              || 120000;
  const health    = document.getElementById('qbrHealth').value           || 72;
  const challenge = document.getElementById('qbrChallenge').value.trim() || 'Improving product adoption';

  const btn    = document.getElementById('qbrBtn');
  const status = document.getElementById('qbrStatus');
  const output = document.getElementById('qbrOutput');

  if (WORKER_URL.includes('YOUR_SUBDOMAIN')) {
    output.classList.add('active');
    output.innerHTML = '<p style="color:var(--c3)">Worker not deployed yet.</p><p style="color:var(--muted);font-size:.82rem;margin-top:.4rem">Deploy worker.js to Cloudflare and update WORKER_URL in script.js to enable live generation.</p>';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Generating…';
  status.textContent = '';
  output.classList.add('active');
  output.innerHTML = '<span class="stream-cursor"></span>';

  let raw = '';
  const md = typeof marked.parse === 'function' ? marked.parse : marked;

  try {
    const res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({account_name:account, arr, health_score:health, challenge})
    });
    if (!res.ok) throw new Error(`Worker ${res.status}: ${await res.text()}`);

    const reader = res.body.getReader();
    const dec    = new TextDecoder();

    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      for (const line of dec.decode(value, {stream:true}).split('\n')) {
        if (!line.startsWith('data: ')) continue;
        const payload = line.slice(6).trim();
        if (payload === '[DONE]') break;
        try {
          const j     = JSON.parse(payload);
          const delta = j?.delta?.text ?? '';
          if (delta) {
            raw += delta;
            output.innerHTML = md(raw) + '<span class="stream-cursor"></span>';
          }
        } catch { /* skip bad chunks */ }
      }
    }
    output.innerHTML = md(raw);
    status.textContent = '✓ Done';
  } catch (err) {
    output.innerHTML = `<p style="color:var(--c3)">Error: ${err.message}</p>`;
    status.textContent = 'Failed';
  }

  btn.disabled = false;
  btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 6h10M6 1l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg> Generate QBR';
}

// ── Articles ──────────────────────────────────────────
let allArticles = [];

async function loadArticles() {
  const grid = document.getElementById('articlesGrid');
  try {
    const res  = await fetch(ARTICLES_URL + '?t=' + Date.now());
    const data = await res.json();
    allArticles = data.articles || [];

    const types = ['All', ...new Set(allArticles.map(a => a.type).filter(Boolean))];
    document.getElementById('filterTabs').innerHTML = types.map((t, i) =>
      `<button class="filter-tab${i===0?' active':''}" onclick="filterArticles('${t==='All'?'all':t}',this)">${t}</button>`
    ).join('');

    renderArticles(allArticles);
  } catch {
    grid.innerHTML = '<div class="art-empty">Could not load articles.</div>';
  }
}

function filterArticles(type, btn) {
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderArticles(type === 'all' ? allArticles : allArticles.filter(a => a.type === type));
}

function renderArticles(list) {
  const grid = document.getElementById('articlesGrid');
  if (!list.length) { grid.innerHTML = '<div class="art-empty">No articles found.</div>'; return; }
  grid.innerHTML = list.map((a, i) => {
    const d    = a.date ? new Date(a.date).toLocaleDateString('en-GB',{year:'numeric',month:'short',day:'numeric'}) : '';
    const href = (a.url && a.url !== '#') ? a.url : '#';
    const tgt  = href !== '#' ? 'target="_blank" rel="noopener"' : '';
    return `<a class="art-card" href="${href}" ${tgt} style="animation-delay:${i*32}ms">
      <div class="art-type">${a.type||'Article'}</div>
      <div class="art-title">${a.title}</div>
      <div class="art-meta">${d}${a.topic?' · '+a.topic:''}</div>
    </a>`;
  }).join('');
}
