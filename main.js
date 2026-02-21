// Nav scroll class
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// Hamburger menu
const navToggle = document.getElementById('navToggle');
const navMenu   = document.getElementById('navMenu');
navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('open');
  navMenu.classList.toggle('open');
});
navMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navToggle.classList.remove('open');
    navMenu.classList.remove('open');
  });
});
document.addEventListener('click', e => {
  if (!nav.contains(e.target)) {
    navToggle.classList.remove('open');
    navMenu.classList.remove('open');
  }
});

// GSAP horizontal scroll - desktop only
gsap.registerPlugin(ScrollTrigger);
const track = document.getElementById('track');
const isMobile = () => window.innerWidth <= 900;

if (!isMobile()) {
  const getScrollAmount = () => -(track.scrollWidth - window.innerWidth + 96);
  gsap.to(track, {
    x: getScrollAmount,
    ease: 'none',
    scrollTrigger: {
      trigger: '#projects',
      pin: true,
      scrub: 1,
      start: 'top top',
      end: () => '+=' + (track.scrollWidth - window.innerWidth + 96),
      invalidateOnRefresh: true,
    }
  });
}

// 3D card tilt - desktop only
document.querySelectorAll('[data-tilt]').forEach(card => {
  if (isMobile()) return;
  card.style.transformStyle = 'preserve-3d';
  card.style.transition = 'transform 0.08s ease-out, border-color 0.25s, box-shadow 0.25s';
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    card.style.transform = `perspective(700px) rotateY(${x*16}deg) rotateX(${-y*8}deg) translateZ(6px)`;
    card.style.boxShadow = `${-x*12}px ${-y*12}px 40px rgba(88,166,255,0.08),0 8px 32px rgba(0,0,0,0.4)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transition = 'transform 0.5s cubic-bezier(.23,1,.32,1),border-color 0.25s,box-shadow 0.4s';
    card.style.transform = 'perspective(700px) rotateY(0) rotateX(0) translateZ(0)';
    card.style.boxShadow = 'none';
  });
  card.addEventListener('mouseenter', () => {
    card.style.transition = 'transform 0.08s ease-out,border-color 0.25s,box-shadow 0.08s';
  });
});

// Glitch on hover
const heroName = document.getElementById('heroName');
if (heroName) {
  heroName.addEventListener('mouseenter', () => {
    heroName.querySelectorAll('.name-char').forEach((c, i) => {
      c.style.animation = 'none';
      void c.offsetWidth;
      c.style.animation = `charWave 0.6s ease ${i * 0.05}s forwards`;
    });
    heroName.classList.add('glitching');
    setTimeout(() => heroName.classList.remove('glitching'), 600);
  });
}

// Intersection Observer reveals
const revealEls = document.querySelectorAll('.reveal,.slide-left,.slide-right,.scale-in');
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
revealEls.forEach(el => revealObs.observe(el));

// Tech stagger
gsap.utils.toArray('.tech-item').forEach((item, i) => {
  gsap.from(item, {
    opacity: 0, scale: 0.85, duration: 0.4, delay: i * 0.04,
    ease: 'back.out(1.5)',
    scrollTrigger: { trigger: item, start: 'top 90%', once: true }
  });
});

// Stat count-up
const statObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const num = parseFloat(el.innerText.replace(/[^0-9.]/g, ''));
    const suf = el.innerText.replace(/[0-9.]/g, '');
    if (isNaN(num)) return;
    let t0 = 0;
    const step = ts => {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / 1200, 1);
      el.innerHTML = Math.floor((1 - Math.pow(1-p, 3)) * num) + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    statObs.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-n').forEach(s => statObs.observe(s));

// About parallax
gsap.to('.about-body', {
  y: -30, ease: 'none',
  scrollTrigger: { trigger: '#about', start: 'top bottom', end: 'bottom top', scrub: true }
});

// Custom Contribution Graph
(async function() {
  const canvas = document.getElementById('contribCanvas');
  const tooltip = document.getElementById('contribTooltip');
  const countEl = document.getElementById('contribCount');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const WEEKS = 53, DAYS = 7, GAP = 3, RADIUS = 3;

  function seededRand(seed) {
    let s = seed;
    return function() { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
  }
  function generateFallback() {
    const rand = seededRand(42), data = [], now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - start.getDay() - 52 * 7);
    for (let w = 0; w < WEEKS; w++) {
      for (let d = 0; d < DAYS; d++) {
        const date = new Date(start);
        date.setDate(start.getDate() + w * 7 + d);
        if (date > now) { data.push({ date, count: 0 }); continue; }
        const r = rand(); let count = 0;
        if (r > 0.55) count = Math.floor(rand() * 4) + 1;
        if (r > 0.80) count = Math.floor(rand() * 8) + 3;
        if (r > 0.95) count = Math.floor(rand() * 15) + 8;
        data.push({ date, count });
      }
    }
    return data;
  }
  async function fetchContributions() {
    try {
      const res = await fetch('https://github-contributions-api.jogruber.de/v4/rylena?y=last');
      if (!res.ok) throw new Error();
      const json = await res.json();
      const flat = [];
      json.contributions.forEach(day => { flat.push({ date: new Date(day.date), count: day.count }); });
      return flat.length > 0 ? flat : null;
    } catch { return null; }
  }
  let data = await fetchContributions();
  if (!data) data = generateFallback();
  const total = data.reduce((s, d) => s + d.count, 0);
  countEl.textContent = total.toLocaleString() + ' contributions this year';

  function getColor(count) {
    if (count === 0) return 'rgba(88,166,255,0.06)';
    if (count <= 2)  return 'rgba(88,166,255,0.22)';
    if (count <= 5)  return 'rgba(88,166,255,0.45)';
    if (count <= 10) return 'rgba(88,166,255,0.72)';
    return 'rgba(88,166,255,1)';
  }
  function getGlow(count) {
    if (count <= 5) return null;
    if (count <= 10) return 'rgba(88,166,255,0.35)';
    return 'rgba(88,166,255,0.65)';
  }
  const cells = [];
  const now2 = new Date(), startDate = new Date(now2);
  startDate.setDate(startDate.getDate() - startDate.getDay() - (WEEKS - 1) * 7);
  for (let w = 0; w < WEEKS; w++) {
    for (let d = 0; d < DAYS; d++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + w * 7 + d);
      const match = data.find(p => p.date.toDateString() === date.toDateString());
      cells.push({ w, d, date, count: match ? match.count : 0 });
    }
  }
  function draw(progress) {
    const dpr = window.devicePixelRatio || 1;
    const wrapW = canvas.parentElement.clientWidth;
    const CELL = Math.floor((wrapW - (WEEKS - 1) * GAP) / WEEKS);
    const totalW = WEEKS * CELL + (WEEKS - 1) * GAP;
    const totalH = DAYS * CELL + (DAYS - 1) * GAP;
    canvas.width = totalW * dpr; canvas.height = totalH * dpr;
    canvas.style.width = totalW + 'px'; canvas.style.height = totalH + 'px';
    ctx.scale(dpr, dpr); ctx.clearRect(0, 0, totalW, totalH);
    cells.forEach(({ w, d, count }) => {
      const x = w * (CELL + GAP), y = d * (CELL + GAP);
      const animProgress = Math.min(1, Math.max(0, progress * WEEKS - w + 1));
      const glow = getGlow(count);
      if (glow && animProgress > 0.5) { ctx.shadowColor = glow; ctx.shadowBlur = 6; } else { ctx.shadowBlur = 0; }
      ctx.globalAlpha = animProgress; ctx.fillStyle = getColor(count);
      roundRect(ctx, x, y, CELL, CELL, RADIUS); ctx.fill();
      ctx.shadowBlur = 0; ctx.globalAlpha = 1;
    });
    ctx.globalAlpha = 1;
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);
    ctx.quadraticCurveTo(x+w,y,x+w,y+r); ctx.lineTo(x+w,y+h-r);
    ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h); ctx.lineTo(x+r,y+h);
    ctx.quadraticCurveTo(x,y+h,x,y+h-r); ctx.lineTo(x,y+r);
    ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath();
  }
  let animated = false;
  const obs = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting || animated) return;
    animated = true; obs.disconnect();
    const dur = 1200; let start = null;
    function frame(ts) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      draw(1 - Math.pow(1 - p, 3));
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }, { threshold: 0.2 });
  obs.observe(canvas);
  draw(0);
  canvas.addEventListener('mousemove', e => {
    const wrapW = canvas.parentElement.clientWidth;
    const CELL = Math.floor((wrapW - (WEEKS - 1) * GAP) / WEEKS);
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const w = Math.floor(mx / (CELL + GAP)), d = Math.floor(my / (CELL + GAP));
    const idx = w * DAYS + d;
    if (idx >= 0 && idx < cells.length && w < WEEKS && d < DAYS) {
      const cell = cells[idx];
      const dateStr = cell.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const label = cell.count === 0 ? 'No contributions' : cell.count + ' contribution' + (cell.count !== 1 ? 's' : '');
      tooltip.textContent = label + ' \u00b7 ' + dateStr;
      tooltip.style.opacity = '1';
      tooltip.style.left = Math.min(mx + 12, rect.width - 160) + 'px';
      tooltip.style.top = Math.max(my - 36, 0) + 'px';
    } else { tooltip.style.opacity = '0'; }
  });
  canvas.addEventListener('mouseleave', () => { tooltip.style.opacity = '0'; });
  let resizeT;
  window.addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(() => draw(1), 150); });
})();
