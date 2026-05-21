/* ═══════════════════════════════════════════════
   MURMUR.RED — script.js
   ═══════════════════════════════════════════════ */

// ─── CONFIG ──────────────────────────────────────
// TODO: Replace with your Cloudflare Worker URL after deployment
const WORKER_URL   = 'https://murmur-qbr.YOUR_SUBDOMAIN.workers.dev';
const ARTICLES_URL = 'https://raw.githubusercontent.com/murmur-red/murmur/main/articles.json';

// ─── LOADER ──────────────────────────────────────
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  const bar    = document.getElementById('loaderBar');
  const status = document.getElementById('loaderStatus');
  const msgs   = ['INITIALIZING...', 'LOADING ASSETS...', 'READY.'];
  let p = 0;

  const tick = setInterval(() => {
    p += Math.random() * 22 + 10;
    if (p > 100) p = 100;
    bar.style.width = p + '%';
    status.textContent = msgs[Math.min(Math.floor(p / 40), msgs.length - 1)];
    if (p >= 100) {
      clearInterval(tick);
      setTimeout(() => {
        loader.classList.add('hidden');
        initTypewriter();
        initScrollReveal();
        initChapterReveal();
        loadArticles();
      }, 380);
    }
  }, 60);
});

// ─── CUSTOM CURSOR ────────────────────────────────
const cursorDot  = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursorDot.style.left = mx + 'px';
  cursorDot.style.top  = my + 'px';
});

(function animRing() {
  rx += (mx - rx) * .12;
  ry += (my - ry) * .12;
  cursorRing.style.left = rx + 'px';
  cursorRing.style.top  = ry + 'px';
  requestAnimationFrame(animRing);
})();

document.querySelectorAll('a, button, input, [onclick]').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
});

// ─── PARTICLE CANVAS ─────────────────────────────
const canvas = document.getElementById('bgCanvas');
const ctx    = canvas.getContext('2d');
let W, H, particles = [];

function resizeCanvas() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', () => { resizeCanvas(); buildParticles(); });

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.vx = (Math.random() - .5) * .28;
    this.vy = (Math.random() - .5) * .28;
    this.r  = Math.random() * 1.1 + .3;
    this.a  = Math.random() * .35 + .05;
    const r = Math.random();
    this.c  = r < .12 ? '#ff2056' : r < .26 ? '#38bdf8' : '#ffffff';
  }
  update() {
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

function buildParticles() {
  const n = Math.min(Math.floor(W * H / 18000), 90);
  particles = Array.from({length: n}, () => new Particle());
}
buildParticles();

(function renderCanvas() {
  ctx.clearRect(0, 0, W, H);
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(renderCanvas);
})();

// ─── NAVBAR SCROLL ───────────────────────────────
const mainNav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
  mainNav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ─── MOBILE NAV ──────────────────────────────────
function toggleMobileNav() {
  document.getElementById('mobileNav').classList.toggle('open');
  document.getElementById('mobileOverlay').classList.toggle('open');
}
function closeMobileNav() {
  document.getElementById('mobileNav').classList.remove('open');
  document.getElementById('mobileOverlay').classList.remove('open');
}

// ─── TYPEWRITER ──────────────────────────────────
function initTypewriter() {
  const phrases = [
    'AI Customer Lifecycle Expert',
    'Head of Customer Success',
    'Co-Founder @ YGames',
    'SaaS Churn Slayer',
  ];
  const el = document.getElementById('typewriter');
  let pi = 0, ci = 0, deleting = false, waitCycles = 0;

  function tick() {
    if (waitCycles > 0) { waitCycles--; setTimeout(tick, 80); return; }
    const phrase = phrases[pi];
    if (!deleting) {
      el.textContent = phrase.slice(0, ++ci);
      if (ci === phrase.length) { deleting = true; waitCycles = 24; }
    } else {
      el.textContent = phrase.slice(0, --ci);
      if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; waitCycles = 5; }
    }
    setTimeout(tick, deleting ? 42 : 82);
  }
  tick();
}

// ─── SCROLL REVEAL (.reveal elements) ────────────
function initScrollReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: .15 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

// ─── CHAPTER REVEAL ──────────────────────────────
let churnAnimated = false;

function initChapterReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('visible');
      if (e.target.id === 'chapterReplai' && !churnAnimated) {
        churnAnimated = true;
        setTimeout(animateChurn, 500);
      }
      obs.unobserve(e.target);
    });
  }, { threshold: .18 });
  document.querySelectorAll('.chapter').forEach(el => obs.observe(el));
}

// ─── CHURN COUNTER ───────────────────────────────
function animateChurn() {
  const el = document.getElementById('churnVal');
  let val = 30;
  const target = 4;
  const steps  = 55;
  const dec    = (val - target) / steps;
  let i = 0;

  const tick = setInterval(() => {
    val -= dec;
    i++;
    if (i >= steps) { val = target; clearInterval(tick); }
    el.textContent = Math.round(val);
  }, 28);
}

// ─── QBR STREAMING ───────────────────────────────
async function runQBR() {
  const account   = document.getElementById('qbrAccount').value.trim()   || 'Demo Company';
  const arr       = document.getElementById('qbrARR').value              || 120000;
  const health    = document.getElementById('qbrHealth').value           || 72;
  const challenge = document.getElementById('qbrChallenge').value.trim() || 'Improving product adoption';

  const btn    = document.getElementById('qbrBtn');
  const status = document.getElementById('qbrStatus');
  const output = document.getElementById('qbrOutput');

  // Check worker is configured
  if (WORKER_URL.includes('YOUR_SUBDOMAIN')) {
    output.classList.add('active');
    output.innerHTML = '<p style="color:var(--c3)">Worker not configured yet.</p><p style="color:var(--muted);font-size:.82rem;margin-top:.4rem">Deploy worker.js to Cloudflare and update WORKER_URL in script.js to enable live generation.</p>';
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v2M6.5 10v2M1 6.5h2M10 6.5h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg> Generating…';
  status.textContent = '';
  output.classList.add('active');
  output.innerHTML = '<span class="stream-cursor"></span>';

  let raw = '';

  try {
    const res = await fetch(WORKER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ account_name: account, arr, health_score: health, challenge })
    });

    if (!res.ok) throw new Error(`Worker returned ${res.status}: ${await res.text()}`);

    const reader = res.body.getReader();
    const dec    = new TextDecoder();
    const md     = typeof marked.parse === 'function' ? marked.parse : marked;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = dec.decode(value, { stream: true });
      for (const line of chunk.split('\n')) {
        if (!line.startsWith('data: ')) continue;
        const payload = line.slice(6).trim();
        if (payload === '[DONE]') break;
        try {
          const json  = JSON.parse(payload);
          const delta = json?.delta?.text ?? (json?.type === 'content_block_delta' ? json?.delta?.text : '');
          if (delta) {
            raw += delta;
            output.innerHTML = md(raw) + '<span class="stream-cursor"></span>';
          }
        } catch { /* skip malformed chunks */ }
      }
    }

    output.innerHTML = (typeof marked.parse === 'function' ? marked.parse : marked)(raw);
    status.textContent = '✓ Done';

  } catch (err) {
    output.innerHTML = `<p style="color:var(--c3)">Error: ${err.message}</p>`;
    status.textContent = 'Failed';
  }

  btn.disabled = false;
  btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 6.5h10M6.5 1.5l5 5-5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg> Generate QBR';
}

// ─── ARTICLES ────────────────────────────────────
let allArticles = [];

async function loadArticles() {
  const grid = document.getElementById('articlesGrid');
  try {
    const res  = await fetch(ARTICLES_URL + '?t=' + Date.now());
    const data = await res.json();
    allArticles = data.articles || [];

    const types = ['All', ...new Set(allArticles.map(a => a.type).filter(Boolean))];
    const tabs  = document.getElementById('filterTabs');
    tabs.innerHTML = types.map((t, i) =>
      `<button class="filter-tab${i === 0 ? ' active' : ''}" onclick="filterArticles('${t === 'All' ? 'all' : t}',this)">${t}</button>`
    ).join('');

    renderArticles(allArticles);
  } catch {
    grid.innerHTML = '<div class="articles-empty">Could not load articles.</div>';
  }
}

function filterArticles(type, btn) {
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderArticles(type === 'all' ? allArticles : allArticles.filter(a => a.type === type));
}

function renderArticles(list) {
  const grid = document.getElementById('articlesGrid');
  if (!list.length) {
    grid.innerHTML = '<div class="articles-empty">No articles found.</div>';
    return;
  }
  grid.innerHTML = list.map((a, i) => {
    const date = a.date
      ? new Date(a.date).toLocaleDateString('en-GB', { year:'numeric', month:'short', day:'numeric' })
      : '';
    const href = a.url && a.url !== '#' ? a.url : '#';
    const target = href !== '#' ? 'target="_blank" rel="noopener"' : '';
    return `<a class="article-card" href="${href}" ${target} style="animation-delay:${i * 35}ms">
      <div class="article-type">${a.type || 'Article'}</div>
      <div class="article-title">${a.title}</div>
      <div class="article-meta">${date}${a.topic ? ' · ' + a.topic : ''}</div>
    </a>`;
  }).join('');
}
