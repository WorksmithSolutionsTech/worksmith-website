/* Worksmith.tech — page behaviour
   nav tone + figure HUD · services menu · mobile menu · services index (filter + accordion)
   · scoping form · ledger · page forwarding (←/→) · single-file router · the figure */
import { startScene } from './scene.js';

const root = document.documentElement;
const BUNDLE = root.dataset.bundle === '1';
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
root.classList.add('js-ready');

/* ---------- opened from disk: folder links → index.html ---------- */
if (location.protocol === 'file:' && !BUNDLE) {
  document.querySelectorAll('a[href]').forEach((a) => {
    const h = a.getAttribute('href');
    if (/^(https?:|mailto:|tel:|#)/.test(h)) return;
    const [path, hash] = h.split('#');
    if (path && path.endsWith('/')) a.setAttribute('href', `${path}index.html${hash ? `#${hash}` : ''}`);
  });
}

/* ---------- nav tone follows the section underneath; HUD shows while the figure is on screen ---------- */
const nav = document.getElementById('nav');
const menuBtn = document.getElementById('menu-btn');
const dropBtn = nav && nav.querySelector('.drop-btn');
const mega = document.getElementById('mega');
let toned = [];
let ticking = false;

function sync() {
  ticking = false;
  if (!nav) return;
  const yTop = 36, yBottom = window.innerHeight - 44;
  let tone = 'dark', modelAtBottom = false;
  for (const s of toned) {
    const r = s.getBoundingClientRect();
    if (r.top <= yTop && r.bottom > yTop) tone = s.dataset.tone;
    if (r.top <= yBottom && r.bottom > yBottom) modelAtBottom = s.hasAttribute('data-canvas') && !s.hasAttribute('data-no-hud');
  }
  const covered = nav.classList.contains('is-open') || nav.classList.contains('is-drop');
  nav.classList.toggle('is-paper', tone === 'paper' && !covered);
  nav.classList.toggle('is-scrolled', window.scrollY > 24);
  root.classList.toggle('hud-on', modelAtBottom);
}
const requestSync = () => { if (!ticking) { ticking = true; requestAnimationFrame(sync); } };
window.addEventListener('scroll', requestSync, { passive: true });
window.addEventListener('resize', requestSync, { passive: true });

/* ---------- services menu ---------- */
const wide = window.matchMedia('(min-width: 1061px)');
const hover = window.matchMedia('(hover: hover)');
let dropTimer = 0;
function setDrop(open) {
  if (!dropBtn || !mega) return;
  dropBtn.setAttribute('aria-expanded', String(open));
  mega.hidden = !open;
  nav.classList.toggle('is-drop', open && wide.matches);
  sync();
}
if (dropBtn && mega) {
  const holder = dropBtn.parentElement;
  dropBtn.addEventListener('click', () => setDrop(dropBtn.getAttribute('aria-expanded') !== 'true'));
  holder.addEventListener('mouseenter', () => { if (hover.matches && wide.matches) { clearTimeout(dropTimer); setDrop(true); } });
  holder.addEventListener('mouseleave', () => { if (hover.matches && wide.matches) dropTimer = setTimeout(() => setDrop(false), 160); });
  holder.addEventListener('focusout', (e) => { if (wide.matches && !holder.contains(e.relatedTarget)) setDrop(false); });
  document.addEventListener('click', (e) => { if (wide.matches && !holder.contains(e.target)) setDrop(false); });
}

/* ---------- mobile menu ---------- */
function setMenu(open) {
  if (!nav || !menuBtn) return;
  nav.classList.toggle('is-open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  if (!open) setDrop(false);
  sync();
}
if (menuBtn) menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
if (nav) nav.addEventListener('click', (e) => { if (e.target.closest('.nav-links a')) { setMenu(false); setDrop(false); } });
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (dropBtn && dropBtn.getAttribute('aria-expanded') === 'true') { setDrop(false); dropBtn.focus(); }
  else if (nav && nav.classList.contains('is-open')) { setMenu(false); menuBtn.focus(); }
});

/* ---------- per-page behaviour ---------- */
function initServices(scope) {
  const svcs = Array.from(scope.querySelectorAll('.svc'));
  svcs.forEach((item) => {
    const btn = item.querySelector('.svc-row');
    const body = item.querySelector('.svc-body');
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      body.hidden = open;
      item.classList.toggle('is-open', !open);
    });
  });
  const filterBtns = Array.from(scope.querySelectorAll('.filters [data-filter]'));
  const setFilter = (v) => {
    filterBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === v)));
    let first = null;
    svcs.forEach((s) => {
      const show = v === 'all' || s.dataset.v === v;
      s.hidden = !show;
      if (show && !first) first = s;
    });
    // narrowing to one vertical opens its first service, so the filter lands on detail
    if (v !== 'all' && first && !first.classList.contains('is-open')) first.querySelector('.svc-row').click();
  };
  filterBtns.forEach((b) => b.addEventListener('click', () => setFilter(b.dataset.filter)));
}

function initBrief(scope) {
  const form = scope.querySelector('[data-brief]');
  if (!form) return;
  const status = form.querySelector('[data-status]');
  const to = form.dataset.to;
  const say = (msg, kind) => {
    status.textContent = msg;
    status.classList.toggle('is-error', kind === 'error');
    status.classList.toggle('is-ok', kind === 'ok');
  };
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const company = String(data.get('company') || '').trim();
    const message = String(data.get('message') || '').trim();

    const missing = [];
    if (!name) missing.push('your name');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) missing.push('a work email we can reply to');
    if (missing.length) {
      say(`Add ${missing.join(' and ')}, then send again.`, 'error');
      (name ? form.elements.email : form.elements.name).focus();
      return;
    }
    if (form.elements.consent && !form.elements.consent.checked) {
      say('Tick the consent box so we can reply, then send again.', 'error');
      form.elements.consent.focus();
      return;
    }

    if (form.dataset.endpoint) {
      try {
        say('Sending…');
        const res = await fetch(form.dataset.endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(String(res.status));
        form.reset();
        say('Received. We reply within two working days.', 'ok');
      } catch (_) {
        say(`That did not go through. Write to ${to} and we will pick it up.`, 'error');
      }
      return;
    }

    const lines = [
      `Name: ${name}`,
      `Company: ${company || '—'}`,
      `Email: ${email}`,
    ];
    if (message) {
      lines.push('', 'Your thoughts:', message);
    }
    const subject = `Scoping conversation${company ? ` — ${company}` : ''}`;
    say(`Your email app should open with the request filled in. If it doesn’t, write to ${to}.`, 'ok');
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
  });
}

function initLedger(scope) {
  const ledger = scope.querySelector('[data-ledger]');
  if (!ledger) return;
  if (reduced || !('IntersectionObserver' in window)) { ledger.classList.add('is-run'); return; }
  const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { ledger.classList.add('is-run'); io.disconnect(); } }, { threshold: 0.3 });
  io.observe(ledger);
}

/* headings rise word by word as they enter */
function initSplits(scope) {
  const heads = Array.from(scope.querySelectorAll('.h2, .v-title, .h-limits, .display-2, .tl-body h2'))
    .filter((el) => !el.dataset.split && el.children.length === 0);
  if (reduced || !('IntersectionObserver' in window)) return;
  const vh = window.innerHeight;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -12% 0px' });
  heads.forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.dataset.split = '1';
    el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = words.map((w, i) => `<span class="rw" aria-hidden="true"><span style="--i:${i}">${w.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span></span>`).join(' ');
    el.classList.add('rise');
    if (el.getBoundingClientRect().top < vh * 0.9) {
      const go = () => (root.classList.contains('js-loading') ? setTimeout(go, 120) : requestAnimationFrame(() => el.classList.add('is-in')));
      go();
    } else io.observe(el);
  });
}

/* legal documents: contents follow the reader */
function initLegal(scope) {
  const toc = scope.querySelector('.lg-toc');
  if (!toc || !('IntersectionObserver' in window)) return;
  const links = new Map(Array.from(toc.querySelectorAll('a[href^="#"]')).map((a) => [a.getAttribute('href').slice(1), a]));
  const seen = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => (en.isIntersecting ? seen.add(en.target.id) : seen.delete(en.target.id)));
    const first = Array.from(links.keys()).find((id) => seen.has(id));
    if (!first) return;
    links.forEach((a, id) => (id === first ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
  }, { rootMargin: '-20% 0px -55% 0px' });
  scope.querySelectorAll('.lg-sec').forEach((sec) => io.observe(sec));
}

/* figures count up once */
function initCounters(scope) {
  const els = Array.from(scope.querySelectorAll('[data-count]'));
  if (!els.length || reduced || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      const el = en.target, to = +el.dataset.count, t0 = performance.now();
      const tick = (now) => {
        const k = Math.min(1, (now - t0) / 1300);
        el.textContent = String(Math.round(to * (1 - Math.pow(1 - k, 4))));
        if (k < 1) requestAnimationFrame(tick);
      };
      el.textContent = '0';
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.4 });
  els.forEach((el) => io.observe(el));
}

function initPage(scope = document) {
  toned = Array.from(document.querySelectorAll('[data-tone]'));
  initServices(scope);
  initBrief(scope);
  initLedger(scope);
  initSplits(scope);
  initCounters(scope);
  initLegal(scope);
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
  sync();
}
initPage();

/* ---------- page forwarding from the keyboard ---------- */
document.addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
  if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
  if (e.target.closest && e.target.closest('input, textarea, select, button, [contenteditable], .spec-scroll, .nav-links')) return;
  if ((nav && nav.classList.contains('is-open')) || (mega && !mega.hidden)) return;
  const link = document.querySelector(e.key === 'ArrowRight' ? '.pager a[rel="next"], .pager a[rel="first"]' : '.pager a[rel="prev"]');
  if (link) { e.preventDefault(); link.click(); }
});

/* ---------- entrance curtain (first visit in a session) ---------- */
(function curtain() {
  if (!root.classList.contains('js-loading')) return;
  const el = document.querySelector('.curtain');
  if (!el) { root.classList.remove('js-loading'); return; }
  const count = el.querySelector('.c-count');
  const bar = el.querySelector('.c-bar i');
  const t0 = performance.now();
  const MIN = 1250;
  const step = (now) => {
    const ready = root.classList.contains('scene-ready') || root.classList.contains('no-webgl');
    const k = Math.min(1, (now - t0) / MIN);
    const shown = ready ? k : Math.min(k, 0.86);
    const v = Math.round(100 * (1 - Math.pow(1 - shown, 2.2)));
    count.textContent = String(v).padStart(2, '0');
    bar.style.transform = `scaleX(${v / 100})`;
    if (shown < 1) { requestAnimationFrame(step); return; }
    root.classList.add('curtain-lift');
    setTimeout(() => root.classList.remove('js-loading'), 380);
    setTimeout(() => root.classList.remove('curtain-lift'), 1100);
    try { sessionStorage.setItem('ws-seen', '1'); } catch (_) { /* private mode */ }
  };
  requestAnimationFrame(step);
})();

/* ---------- chapter scrubber (home) ---------- */
document.addEventListener('ws:stage', (e) => {
  document.querySelectorAll('.scrub [data-stage-link]').forEach((a) => {
    if (+a.dataset.stageLink === e.detail) a.setAttribute('aria-current', 'step');
    else a.removeAttribute('aria-current');
  });
});

/* ---------- pointer craft (desktop): spotlight + magnetic actions ---------- */
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduced) {
  document.addEventListener('pointermove', (e) => {
    const spot = e.target.closest && e.target.closest('.spot');
    if (spot) {
      const r = spot.getBoundingClientRect();
      spot.style.setProperty('--mx', `${e.clientX - r.left}px`);
      spot.style.setProperty('--my', `${e.clientY - r.top}px`);
    }
    const mag = e.target.closest && e.target.closest('.btn-ember:not([type="submit"])');
    if (mag) {
      const r = mag.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      mag.style.transform = `translate(${(dx * 8).toFixed(1)}px, ${(dy * 6).toFixed(1)}px)`;
    }
  }, { passive: true });
  document.addEventListener('pointerout', (e) => {
    const mag = e.target.closest && e.target.closest('.btn-ember');
    if (mag && !mag.contains(e.relatedTarget)) mag.style.transform = '';
  });
}

/* ---------- Hyderabad time ---------- */
(function clock() {
  const els = () => document.querySelectorAll('[data-clock]');
  let fmt;
  try { fmt = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false }); } catch (_) { return; }
  const tick = () => els().forEach((el) => { el.textContent = `Hyderabad · ${fmt.format(new Date())} IST`; });
  tick();
  setInterval(tick, 20000);
})();

/* ---------- the figure ---------- */
startScene();

/* ---------- single-file preview: pages live in <template>s, routed by #/path/ ---------- */
if (BUNDLE) {
  const slot = document.getElementById('page');
  const routes = new Map(Array.from(document.querySelectorAll('template[data-route]')).map((t) => [t.dataset.route, t]));
  const routeOf = (h) => (h && h.startsWith('#/') ? h.slice(1).split('#')[0] : '/');
  const jumpTo = (id) => requestAnimationFrame(() => { const t = id && document.getElementById(id); if (t) t.scrollIntoView({ block: 'start' }); });
  let current = '/';

  const markNav = (route) => {
    nav.querySelectorAll('.nav-links > a[data-key]').forEach((a) => {
      const p = routeOf(a.getAttribute('href'));
      if (p !== '/' && route.startsWith(p)) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    if (dropBtn) dropBtn.toggleAttribute('data-current', /^\/(services|verticals)\//.test(route));
  };

  const render = (route, { scroll = true } = {}) => {
    const t = routes.get(route) || routes.get('/404/');
    current = routes.has(route) ? route : '/404/';
    slot.replaceChildren(t.content.cloneNode(true));
    document.title = t.dataset.title;
    markNav(current);
    if (scroll) { root.style.scrollBehavior = 'auto'; window.scrollTo(0, 0); root.style.scrollBehavior = ''; }
    initPage(slot);
    document.dispatchEvent(new Event('ws:route'));
  };

  const go = (route, push) => {
    if (route === current) { window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); return; }
    setMenu(false);
    setDrop(false);
    current = routes.has(route) ? route : '/404/';
    if (push) { try { history.pushState({ route }, '', `#${route}`); } catch (_) { /* sandboxed preview: route in memory */ } }
    // the figure carries the transition (it flies to the new view), so the page only fades in over it
    render(route);
    if (!reduced && slot.animate) slot.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 380, easing: 'cubic-bezier(0.2, 0.7, 0.1, 1)' });
  };

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const h = a.getAttribute('href');
    e.preventDefault();
    if (h.startsWith('#/')) { go(routeOf(h), true); jumpTo(h.slice(2).split('#')[1]); return; }
    const target = h.length > 1 && document.getElementById(h.slice(1));
    if (target) target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  });
  window.addEventListener('popstate', () => go(routeOf(location.hash), false));
  window.addEventListener('hashchange', () => { const r = routeOf(location.hash); if (r !== current) go(r, false); });

  const start = routeOf(location.hash);
  if (start !== '/') render(start, { scroll: false });
  else markNav('/');
}
