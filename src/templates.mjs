import {
  site, verticals, services, principles, phases, pricing, dataTerms, limits, whereToday,
  honestVersion, orderSequence, leakDomains,
} from './content.mjs';
import { specimen } from './specimens.mjs';
import { legalMeta, entity, privacySrc, termsSrc, parseLegal } from './legal.mjs';

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// copy that intentionally carries <strong>/<em>: escape stray ampersands only
const rich = (s) => String(s).replace(/&(?![a-z#0-9]+;)/gi, '&amp;');

export const byId = (list, id) => list.find((x) => x.id === id);
export const vOf = (svc) => byId(verticals, svc.vertical);

const ARR = '<span class="arr" aria-hidden="true">→</span>';
const BACK = '<span class="arr arr-back" aria-hidden="true">←</span>';
const DOWN = '<span class="arr arr-down" aria-hidden="true">↓</span>';

// ---------- routes ----------
export const P = {
  home: '',
  approach: 'approach/',
  services: 'services/',
  how: 'how-we-work/',
  pricing: 'pricing/',
  data: 'data-and-limits/',
  contact: 'contact/',
  privacy: 'privacy/',
  terms: 'terms/',
  vertical: (id) => `verticals/${id}/`,
  service: (id) => `services/${id}/`,
};

// BUNDLE=1 → hash routes for the single-file preview · EXPLICIT_INDEX=1 → links end in index.html
const ENV = typeof process !== 'undefined' ? process.env : {};
const EXPLICIT = ENV.EXPLICIT_INDEX === '1';
const BUNDLE = ENV.BUNDLE === '1';
export const href = (rel, path) => (BUNDLE ? `#/${path}` : EXPLICIT ? `${rel}${path}index.html` : path ? rel + path : rel || './');

// ---------- global chrome ----------
function brand(rel, label = 'Worksmith — home') {
  return `<a class="brand" href="${href(rel, P.home)}" aria-label="${label}">
      <span class="mark" aria-hidden="true"><span>W<i></i></span></span>
      <span class="word">Worksmith<sup>.tech</sup></span>
    </a>`;
}

function mega(rel) {
  const cols = verticals.map((v) => `
        <div class="mega-col">
          <a class="mega-v" href="${href(rel, P.vertical(v.id))}">
            <span class="mono">Vertical ${v.roman} · ${esc(v.verb)}</span>
            <strong>${esc(v.title)}</strong>
          </a>
          <ul>
            ${v.services.map((sid) => { const s = byId(services, sid); return `<li><a href="${href(rel, P.service(s.id))}"><span class="mono">${s.n}</span>${esc(s.title)}</a></li>`; }).join('')}
          </ul>
        </div>`).join('');
  return `<div class="mega" id="mega" hidden>
      <div class="wrap mega-inner">
        ${cols}
        <div class="mega-col mega-aside">
          <p class="mono">Not sure where to start?</p>
          <p>The diagnostic tells you which of the other two you actually need — and in what order.</p>
          <a class="link-arrow" href="${href(rel, P.services)}">All three verticals ${ARR}</a>
        </div>
      </div>
    </div>`;
}

export function header(rel, nav) {
  const cur = (k) => (nav === k ? ' aria-current="page"' : '');
  return `<a class="skip" href="#main">Skip to content</a>
<header class="nav" id="nav">
  <div class="wrap nav-inner">
    ${brand(rel)}
    <nav class="nav-links" id="nav-links" aria-label="Primary">
      <a href="${href(rel, P.approach)}" data-key="approach"${cur('approach')}>Approach</a>
      <div class="nav-drop">
        <button class="drop-btn" type="button" aria-expanded="false" aria-controls="mega" data-key="services"${nav === 'services' ? ' data-current' : ''}>Services <span class="chev" aria-hidden="true"></span></button>
        ${mega(rel)}
      </div>
      <a href="${href(rel, P.how)}" data-key="how"${cur('how')}>How we work</a>
      <a href="${href(rel, P.pricing)}" data-key="pricing"${cur('pricing')}>Pricing</a>

      <a class="only-menu" href="${href(rel, P.contact)}" data-key="contact"${cur('contact')}>Contact</a>
    </nav>
    <div class="nav-end">
      <a class="btn btn-ember nav-cta" href="${href(rel, P.contact)}">Book a scoping call ${ARR}</a>
      <button class="menu-btn" id="menu-btn" type="button" aria-expanded="false" aria-controls="nav-links"><span class="bars" aria-hidden="true"></span>Menu</button>
    </div>
  </div>
</header>`;
}

export const CURTAIN_FLAG = `<script>(function(d){try{if(!sessionStorage.getItem('ws-seen')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('js-loading');setTimeout(function(){d.classList.remove('js-loading')},4500)}}catch(e){}})(document.documentElement)</script>`;

export function chrome() {
  return `<div class="curtain" aria-hidden="true">
  <div class="curtain-in">
    <span class="c-mark">W<i></i></span>
    <div class="c-bar"><i></i></div>
    <div class="c-meta mono"><span>Assembling six systems · measuring the gaps</span><span class="c-count">00</span></div>
  </div>
</div>
<canvas id="scene" aria-hidden="true"></canvas>
<div class="shade" aria-hidden="true"></div>
<div class="grain" aria-hidden="true"></div>
<aside class="hud" id="hud" aria-hidden="true">
  <p class="fig"><b id="fig-no">Fig. 01</b><span id="fig-text">Six systems, each individually correct.</span></p>
  <ul class="legend">
    <li><i class="dot dot-rec"></i>Record in motion</li>
    <li><i class="dot dot-loss"></i>Value lost between systems</li>
    <li class="legend-note">Illustrative model</li>
  </ul>
</aside>
<div class="findings" aria-hidden="true">
  <div class="tag"><div class="tag-in"><b>ERP / Ledger</b><span>Delivered, never invoiced</span><small>Revenue &amp; billing accuracy</small></div></div>
  <div class="tag"><div class="tag-in"><b>Stock / WhatsApp</b><span>Same item, three prices</span><small>Procurement &amp; vendor spend</small></div></div>
  <div class="tag"><div class="tag-in"><b>Sheets / Bank</b><span>A receivable nobody chases</span><small>Receivables &amp; collection</small></div></div>
  <div class="tag"><div class="tag-in"><b>Ledger / Sheets</b><span>Input credit at risk</span><small>Compliance &amp; tax exposure</small></div></div>
</div>`;
}

export function footer(rel) {
  return `<footer class="footer" data-tone="ink">
  <div class="wrap">
    <div class="foot-grid">
      <div class="foot-brand">
        ${brand(rel, 'Worksmith — home')}
        <p>Evidence first, build second, measured against a baseline agreed before we start.</p>
        <a class="btn btn-ember" href="${href(rel, P.contact)}">Book a scoping call ${ARR}</a>
      </div>
      <div>
        <h4>Verticals</h4>
        <ul>${verticals.map((v) => `<li><a href="${href(rel, P.vertical(v.id))}"><span class="mono">${v.roman}</span>${esc(v.title)}</a></li>`).join('')}</ul>
      </div>
      <div class="foot-svc">
        <h4>Services</h4>
        <ul>${services.map((s) => `<li><a href="${href(rel, P.service(s.id))}"><span class="mono">${s.n}</span>${esc(s.title)}</a></li>`).join('')}</ul>
      </div>
      <div>
        <h4>Company</h4>
        <ul>
          <li><a href="${href(rel, P.approach)}">Approach</a></li>
          <li><a href="${href(rel, P.how)}">How we work</a></li>
          <li><a href="${href(rel, P.pricing)}">Pricing</a></li>
          <li><a href="${href(rel, P.data)}">Data &amp; limits</a></li>
          <li><a href="${href(rel, P.contact)}">Contact</a></li>
        </ul>
      </div>
      <div>
        <h4>Write to us</h4>
        <ul>
          <li><a href="mailto:${site.email}">${site.email}</a></li>
          <li class="muted">${esc(site.location)}</li>
        </ul>
      </div>
    </div>
    <div class="foot-legal">
      <p class="foot-co">${esc(entity.name)} · CIN ${entity.cin} · Registered office: ${esc(entity.office)} · <a href="tel:${entity.phone.replace(/\s/g, '')}">${esc(entity.phone)}</a></p>
      <p>${esc(site.disclaimer)}</p>
      <p class="foot-links"><a href="${href(rel, P.privacy)}">Privacy Policy</a><a href="${href(rel, P.terms)}">Terms of Use</a><a href="${href(rel, P.data)}">Data &amp; limits</a></p>
      <p class="foot-end"><span class="clock mono"><i aria-hidden="true"></i><span data-clock>Hyderabad</span></span><span>© <span data-year>2026</span> ${esc(site.legal)}</span></p>
    </div>
  </div>
  <div class="foot-w" aria-hidden="true">W.</div>
</footer>`;
}

// ---------- page forwarding ----------
const GROUPS = [
  ['start', 'Start'],
  ['I', 'I · Find it'],
  ['II', 'II · Carry it'],
  ['III', 'III · Ground it'],
  ['close', 'Method & terms'],
];

export function pager(rel, seq, key) {
  const i = seq.findIndex((p) => p.key === key);
  if (i < 0) return '';
  const total = String(seq.length).padStart(2, '0');
  const num = (n) => String(n + 1).padStart(2, '0');
  const prev = seq[i - 1];
  const next = seq[i + 1];
  const cur = seq[i];

  const rail = GROUPS.map(([g, label]) => {
    const items = seq.map((p, n) => ({ p, n })).filter(({ p }) => p.group === g);
    if (!items.length) return '';
    const here = items.some(({ n }) => n === i);
    return `<div class="rail-group${here ? ' is-here' : ''}" style="--n:${items.length}">
        <span class="rail-label mono">${label}</span>
        <div class="rail-ticks">
          ${items.map(({ p, n }) => `<a href="${href(rel, p.path)}" class="${n < i ? 'is-past' : n === i ? 'is-now' : ''}" data-label="${num(n)} · ${esc(p.label)}" aria-label="Page ${n + 1}: ${esc(p.label)}"${n === i ? ' aria-current="page"' : ''}></a>`).join('')}
        </div>
      </div>`;
  }).join('');

  const cell = (p, dir) => {
    if (!p) {
      return dir === 'next'
        ? `<a class="pager-cell pager-next" href="${href(rel, P.home)}" rel="first"><span class="mono">Back to the start · 01 / ${total}</span><span class="pager-title"><span>Home</span>${ARR}</span></a>`
        : '';
    }
    const n = seq.indexOf(p);
    return `<a class="pager-cell pager-${dir} spot" href="${href(rel, p.path)}" rel="${dir}">
        <span class="mono">${dir === 'prev' ? 'Previous' : 'Next'} · ${num(n)} / ${total}</span>
        <span class="pager-title">${dir === 'prev' ? BACK : ''}<span>${esc(p.pagerLabel || p.label)}</span>${dir === 'next' ? ARR : ''}</span>
      </a>`;
  };

  return `<nav class="pager" aria-label="Page forwarding" data-tone="paper">
  <div class="wrap">
    <div class="rail">${rail}</div>
    <div class="pager-meta mono"><span>Page ${num(i)} of ${total} · ${esc(cur.label)}</span><span class="keys" aria-hidden="true"><kbd>←</kbd><kbd>→</kbd> turn pages</span></div>
    <div class="pager-grid${prev ? '' : ' is-single'}">${cell(prev, 'prev')}${cell(next, 'next')}</div>
  </div>
</nav>`;
}

// ---------- document ----------
const FONTS = ['outfit-latin-wght-normal.woff2', 'jetbrains-mono-latin-400-normal.woff2', 'poppins-latin-700-normal.woff2'];

export function layout({ rel, page, seq, body, canonicalPath, prevNext = true, noindex = false, jsonld = '' }) {
  const i = seq.findIndex((p) => p.key === page.key);
  const prev = i > 0 ? seq[i - 1] : null;
  const next = i >= 0 && i < seq.length - 1 ? seq[i + 1] : null;
  const canonical = `${site.domain}/${canonicalPath}`;
  const title = page.key === 'home' ? page.title : `${page.title} — Worksmith`;
  return `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(page.description)}">
<link rel="canonical" href="${canonical}">
${prevNext && prev ? `<link rel="prev" href="${href(rel, prev.path)}">\n` : ''}${prevNext && next ? `<link rel="next" href="${href(rel, next.path)}">\n` : ''}${noindex ? '<meta name="robots" content="noindex">\n' : ''}<meta name="theme-color" content="#171412">
<meta name="color-scheme" content="dark light">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Worksmith">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${site.domain}/assets/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${site.domain}/assets/og.jpg">
${CURTAIN_FLAG}
<link rel="icon" href="${rel}assets/favicon.svg" type="image/svg+xml">
${FONTS.map((f) => `<link rel="preload" href="${rel}assets/fonts/${f}" as="font" type="font/woff2" crossorigin>`).join('\n')}
<link rel="stylesheet" href="${rel}assets/css/styles.css">
${jsonld}
</head>
<body class="pg-${page.key.replace(/[^a-z0-9-]/g, '-')}">
${header(rel, page.nav)}
${chrome()}
<main id="main">
${body}
</main>
${footer(rel)}
<script src="${rel}assets/js/app.js" defer></script>
</body>
</html>
`;
}

// ---------- shared pieces ----------
function crumbs(rel, items) {
  return `<nav class="crumbs mono" aria-label="Breadcrumb"><ol>
      <li><a href="${href(rel, P.home)}">Worksmith</a></li>
      ${items.map((it, n) => (n === items.length - 1 ? `<li aria-current="page">${esc(it.label)}</li>` : `<li><a href="${href(rel, it.path)}">${esc(it.label)}</a></li>`)).join('')}
    </ol></nav>`;
}

function pageHero({ rel, stage, crumbItems, eyebrow, title, lede, actions = '', badge = '', size = '', focus = null, caption = '' }) {
  const extra = `${focus !== null && focus !== undefined ? ` data-focus="${focus}"` : ''}${caption ? ` data-caption="${esc(caption)}"` : ''}`;
  return `<section class="page-hero dark${size ? ` is-${size}` : ''}" data-stage="${stage}"${extra} data-canvas data-tone="dark">
  <div class="wrap">${crumbItems ? crumbs(rel, crumbItems) : ''}</div>
  <div class="wrap ph-copy">
    ${badge ? `<span class="badge-n" aria-hidden="true">${badge}</span>` : ''}
    <p class="eyebrow">${eyebrow}</p>
    <h1 class="display display--${size || 'page'}"><span class="ln"><span>${title}</span></span></h1>
    ${lede ? `<p class="lede">${lede}</p>` : ''}
    ${actions ? `<div class="actions">${actions}</div>` : ''}
  </div>
</section>`;
}

function orderList(rel, current) {
  return `<ol class="order-list">
      ${orderSequence.map((vid) => {
        const v = byId(verticals, vid);
        const on = v.id === current;
        return `<li${on ? ' class="is-current"' : ''}><span class="k">${esc(v.order)}</span><div><a class="ol-v" href="${href(rel, P.vertical(v.id))}"${on ? ' aria-current="page"' : ''}><strong>Vertical ${v.roman}</strong><span>${esc(v.title)}</span></a><p>${esc(v.orderBody)}</p></div></li>`;
      }).join('')}
    </ol>`;
}

const tickItem = (it) => `<li>${it.k ? `<b>${esc(it.k)}</b> — ` : ''}${esc(it.v)}</li>`;

// compact rendering (home accordion)
function compactBlock(b) {
  const h = `<h4>${esc(b.label)}</h4>`;
  if (b.type === 'steps') return `${h}<ol class="steps">${b.items.map((it, n) => `<li><span class="mono">${n + 1}</span><div><b>${esc(it.k)}</b> — ${esc(it.v)}</div></li>`).join('')}</ol>`;
  if (b.type === 'list') return `${h}<ul class="ticks">${b.items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;
  const items = b.type === 'table' ? b.rows : b.items;
  return `${h}<ul class="ticks">${items.map(tickItem).join('')}</ul>`;
}

// full rendering (service pages)
function fullBlock(b) {
  const h = `<h2 class="blk-h mono">${esc(b.label)}</h2>`;
  if (b.type === 'bullets') return `<section class="blk">${h}<ul class="ticks ticks-lg${b.cols === 2 ? ' two' : ''}">${b.items.map(tickItem).join('')}</ul></section>`;
  if (b.type === 'table') return `<section class="blk">${h}<dl class="receive receive-lg">${b.rows.map((r) => `<div><dt>${esc(r.k)}</dt><dd>${esc(r.v)}</dd></div>`).join('')}</dl></section>`;
  if (b.type === 'steps') return `<section class="blk">${h}<ol class="stepline">${b.items.map((it, n) => `<li><span class="mono">${String(n + 1).padStart(2, '0')}</span><b>${esc(it.k)}</b><p>${esc(it.v)}</p></li>`).join('')}</ol></section>`;
  if (b.type === 'list') return `<section class="blk">${h}<ul class="ticks ticks-lg">${b.items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></section>`;
  return '';
}

function servicesIndex(rel) {
  return services.map((s, n) => {
    const v = vOf(s);
    const open = n === 0;
    const right = s.id === 'business-health-check'
      ? `<h4>${esc(s.blocks[1].label)}</h4><dl class="receive">${s.blocks[1].rows.map((r) => `<div><dt>${esc(r.k)}</dt><dd>${esc(r.v)}</dd></div>`).join('')}</dl>`
      : `<h4>What you gain</h4>${s.gain.map((g) => `<p>${rich(g)}</p>`).join('')}`;
    return `
        <article class="svc${open ? ' is-open' : ''}" data-v="${v.roman}">
          <button class="svc-row" type="button" id="svc-${s.n}-btn" aria-expanded="${open}" aria-controls="svc-${s.n}-body">
            <span class="n mono">${s.n}</span><span class="name">${esc(s.title)}</span><span class="v mono">Vertical ${v.roman}</span>
            <span class="sum">${esc(s.lede)}</span><span class="plus" aria-hidden="true"></span>
          </button>
          <div class="svc-body" id="svc-${s.n}-body" role="region" aria-labelledby="svc-${s.n}-btn"${open ? '' : ' hidden'}>
            <div class="svc-cols">
              <div>${compactBlock(s.blocks[0])}</div>
              <div class="gain">
                ${right}
                ${s.bestFit ? `<p class="fit"><b>Best fit when</b> ${esc(s.bestFit)}</p>` : ''}
                <a class="link-arrow" href="${href(rel, P.service(s.id))}">The full page for ${s.n} ${ARR}</a>
              </div>
            </div>
          </div>
        </article>`;
  }).join('');
}

function phaseStrip() {
  return `<ol class="phases">
        ${phases.map((p) => `
        <li${p.exit ? ' class="exit"' : ''}>
          <span class="ph mono">Phase ${p.n}</span>
          <h3>${esc(p.title)}</h3>
          <p class="term">${esc(p.tag)}</p>
          <p class="desc">${esc(p.body)}</p>
          ${p.exit ? '<span class="exit-tag">You can stop here</span>' : ''}
        </li>`).join('')}
      </ol>`;
}

function pricingRows() {
  return `<dl class="rows">
        ${pricing.map((r) => `<div${r.highlight ? ' class="is-hot"' : ''}><dt>${esc(r.k)}</dt><dd>${esc(r.v)}</dd></div>`).join('')}
      </dl>`;
}

function figure25() {
  return `<aside class="figure-25" aria-label="Outcome-linked option">
        <p class="cap">Outcome-linked option</p>
        <p class="num"><b data-count="25">25</b><span>%</span></p>
        <p>of verified recovery, in place of a build fee — offered only where a finding has a measurable value, an agreed baseline, and a written measurement method both sides can compute independently.</p>
      </aside>`;
}

function limitsList() {
  return `<ul class="nots">
          ${limits.map((l) => `<li>${esc(l.lead)}${l.more ? `<span>${esc(l.more)}</span>` : ''}</li>`).join('')}
        </ul>`;
}

const todayNote = () => `<p class="today"><strong>Where we are today.</strong> ${esc(whereToday)}</p>`;
const honestNote = () => `<p class="note"><strong>The honest version:</strong> ${esc(honestVersion)}</p>`;

function contactSection(rel, { asPage = false } = {}) {
  const tag = asPage ? 'h1' : 'h2';
  return `<section class="contact dark${asPage ? ' is-page' : ''}" id="contact" data-stage="6" data-canvas data-no-hud data-tone="dark">
    ${asPage ? `<div class="wrap">${crumbs(rel, [{ label: 'Contact' }])}</div>` : ''}
    <div class="wrap contact-grid">
      <div class="contact-copy">
        <p class="eyebrow">Phase 00 <span class="mono">Scoping conversation · no charge</span></p>
        <${tag} class="display-2">Start with the scoping conversation.</${tag}>
        <p class="lede">It costs nothing, and it may end with us telling you there is nothing here. If there is, you will have a fixed-fee, time-boxed diagnostic and a findings register in your own numbers before any larger decision is put in front of you.</p>
        <dl class="people">
          <div><dt>Email</dt><dd><a href="mailto:${site.email}">${site.email}</a></dd></div>
          <div><dt>Web</dt><dd>worksmith.tech</dd></div>
        </dl>
        ${asPage ? `<ol class="next-steps">
          <li><span class="mono">01</span>A short call to understand how the operation runs.</li>
          <li><span class="mono">02</span>We say plainly whether anything is worth investigating.</li>
          <li><span class="mono">03</span>If it is, a fixed-fee diagnostic proposal — in writing, before any work.</li>
        </ol>` : ''}
      </div>

      <form class="brief" data-brief data-to="${site.email}" data-endpoint="" novalidate>
        <div class="brief-head"><p>Scoping request</p><span>Phase 00 · no charge</span></div>
        <div class="row2">
          <div class="field"><label for="f-name">Your name</label><input id="f-name" name="name" type="text" autocomplete="name" placeholder="Full name" required></div>
          <div class="field"><label for="f-company">Company</label><input id="f-company" name="company" type="text" autocomplete="organization" placeholder="Company name"></div>
        </div>
        <div class="field"><label for="f-email">Work email</label><input id="f-email" name="email" type="email" autocomplete="email" placeholder="name@company.com" required></div>
        <div class="field"><label for="f-msg">Your thoughts</label><textarea id="f-msg" name="message" rows="3" placeholder="Share any details, context, or questions..."></textarea></div>
        <div class="consent">
          <label for="f-consent"><input id="f-consent" name="consent" type="checkbox" value="yes" required><span>I agree that Worksmith may use these details to reply to this enquiry.</span></label>
          <details class="notice">
            <summary>What we collect and why</summary>
            <p>We ask for your name, company, work email and message only to reply to this enquiry and to judge whether we can help. Please do not send financial records, ledgers or client data here. You can withdraw consent, or ask to see, correct or erase these details, by writing to <a href="mailto:${site.email}">${site.email}</a>. Details: <a href="${href(rel, P.privacy)}">Privacy Policy</a>.</p>
          </details>
        </div>
        <button class="btn btn-ember" type="submit">Compose email to Worksmith ${ARR}</button>
        <p class="status" data-status role="status" aria-live="polite">Opens your email app with this request filled in, addressed to ${site.email}. We ask for no data at this stage.</p>
      </form>
    </div>
  </section>`;
}

// ---------- pages ----------
export function renderHome(rel) {
  const verticalSections = verticals.map((v) => `
  <section class="vertical dark" id="${v.roman === 'I' ? 'find' : v.roman === 'II' ? 'carry' : 'ground'}" data-stage="${v.stage}" data-canvas data-tone="dark">
    <div class="wrap">
      <div class="v-sticky">
        <p class="eyebrow"><span class="mono">Vertical ${v.roman}</span> ${esc(v.verb)}</p>
        <h2 class="v-title">${esc(v.title)}</h2>
        <p class="v-lede">${esc(v.homeLede)}</p>
        <ul class="svc-list">
          ${v.services.map((sid) => { const s = byId(services, sid); return `<li><a href="${href(rel, P.service(s.id))}"><span class="mono">${s.n}</span><div><h3>${esc(s.title)}</h3><p>${esc(s.short)}</p></div><span class="arr" aria-hidden="true">→</span></a></li>`; }).join('')}
        </ul>
        <a class="link-arrow" href="${href(rel, P.vertical(v.id))}">Inside Vertical ${v.roman} ${ARR}</a>
      </div>
    </div>
  </section>`).join('');

  return `
  <nav class="scrub" aria-label="Figure chapters">
    <ol>
      ${[['top', 'Systems'], ['approach', 'The leak'], ['find', 'Find it'], ['carry', 'Carry it'], ['ground', 'Ground it'], ['order', 'The order']].map(([id, label], n) => `<li><a href="#${id}" data-stage-link="${n}" aria-label="${label}"></a></li>`).join('')}
    </ol>
  </nav>
  <section class="hero dark" id="top" data-stage="0" data-canvas data-tone="dark">
    <div class="wrap hero-copy">
      <p class="eyebrow">Operational intelligence <span class="mono">Hyderabad · working globally</span></p>
      <h1 class="display">
        <span class="ln"><span>The loss lives</span></span>
        <span class="ln"><span>in the <em>gaps</em></span></span>
        <span class="ln"><span>between systems.</span></span>
      </h1>
      <p class="lede">The invoice was raised. The stock was booked. The credit was claimed. Each record is individually right — and the money still leaves.</p>
      <div class="actions">
        <a class="btn btn-ember" href="${href(rel, P.contact)}">Book a scoping call ${ARR}</a>
        <a class="btn btn-ghost" href="#approach">See where it leaks ${DOWN}</a>
      </div>
    </div>
    <div class="wrap">
      <dl class="sequence">
        <div><dt>First</dt><dd>Evidence</dd></div>
        <div><dt>Second</dt><dd>Build</dd></div>
        <div><dt>Throughout</dt><dd>Measured against a baseline agreed before we start</dd></div>
      </dl>
    </div>
  </section>

  <section class="approach dark" id="approach" data-stage="1" data-canvas data-tone="dark">
    <div class="wrap">
      <div class="col-text">
        <p class="eyebrow">Where we start</p>
        <h2 class="h2">Most operational loss is invisible because every system involved is working correctly.</h2>
        <p class="body-d">That is why we do not open an engagement with software. We open it with measurement. Before anything is built, we establish what is actually leaking, what it costs in your own currency, and whether a system would fix it — because some of what we find is a process problem, and selling software for a process problem is how buyers end up paying twice.</p>
        <a class="link-arrow" href="${href(rel, P.approach)}">Our approach, in full ${ARR}</a>
      </div>
      <ul class="principles">
        ${principles.map((p) => `<li><span class="mono">${p.n}</span><h3>${esc(p.title)}</h3><p>${esc(p.body)}</p></li>`).join('')}
      </ul>
    </div>
  </section>
${verticalSections}

  <section class="order dark" id="order" data-stage="5" data-canvas data-tone="dark">
    <div class="wrap">
      <div class="col-text">
        <p class="eyebrow">The order they belong in</p>
        <h2 class="h2">Diagnose first. Fix the records if they need fixing. Automate last.</h2>
      </div>
      ${orderList(rel, null)}
      ${honestNote()}
    </div>
  </section>
`;
}

export function renderApproach(rel) {
  return `
${pageHero({
  rel, stage: 1,
  crumbItems: [{ label: 'Approach' }],
  eyebrow: 'Where we start',
  title: 'Most operational loss is invisible because every system involved is working correctly.',
  lede: 'Each record is individually right, and the money still leaves — because the loss lives in the gaps between systems, not inside any one of them.',
})}

<section class="paper" data-tone="paper">
  <div class="wrap split">
    <div class="ledger" data-ledger>
      <p class="ledger-cap mono">Month-end, as each system sees it</p>
      <div class="ledger-head mono"><span>Record</span><span>System</span><span>Status</span></div>
      <div class="ledger-row" style="--d:0"><span>The invoice was raised.</span><span class="mono">ERP</span><span class="ok mono">✓ Correct</span></div>
      <div class="ledger-row" style="--d:1"><span>The stock was booked.</span><span class="mono">Stock</span><span class="ok mono">✓ Correct</span></div>
      <div class="ledger-row" style="--d:2"><span>The credit was claimed.</span><span class="mono">Ledger</span><span class="ok mono">✓ Correct</span></div>
      <div class="ledger-row is-loss" style="--d:3"><span>And the money still leaves.</span><span class="mono">Between them</span><span class="loss mono">Unowned</span></div>
    </div>
    <div class="prose">
      <p class="eyebrow">Measurement before software</p>
      <p class="lead">That is why we do not open an engagement with software. We open it with measurement.</p>
      <p>Before anything is built, we establish what is actually leaking, what it costs in your own currency, and whether a system would fix it — because some of what we find is a process problem, and selling software for a process problem is how buyers end up paying twice.</p>
      <p>Everything we do is built on that sequence: evidence first, build second, measurement against a baseline we agreed before we started.</p>
    </div>
  </div>
</section>

<section class="ink" data-tone="ink">
  <div class="wrap">
    <header class="sec-head">
      <p class="eyebrow">Three commitments</p>
      <h2 class="h2">What holds, whichever vertical you buy.</h2>
    </header>
    <ul class="principles principles-lg">
      ${principles.map((p) => `<li><span class="mono">${p.n}</span><h3>${esc(p.title)}</h3><p>${esc(p.body)}</p></li>`).join('')}
    </ul>
    <div class="pull">
      <p class="eyebrow">Why this matters commercially</p>
      <p class="quote">A buyer’s real risk is not the price of the software. It is committing budget and eighteen months of internal disruption to a system that turns out to solve a problem the business did not have. Diagnosing first is how that risk gets priced down to a fixed, time-boxed fee before the large decision is made.</p>
    </div>
  </div>
</section>

<section class="paper" data-tone="paper">
  <div class="wrap">${todayNote()}</div>
</section>
`;
}

export function renderServicesIndex(rel) {
  return `
${pageHero({
  rel, stage: 2,
  crumbItems: [{ label: 'Services' }],
  eyebrow: 'Three verticals <span class="mono">Eight services</span>',
  title: 'One finds the loss, one carries the work, one holds the ground both stand on.',
  lede: 'They are sold separately. The diagnostic in Vertical I is what tells you which of the other two you actually need — and in what order.',
})}

<section class="paper" data-tone="paper">
  <div class="wrap">
    <div class="v-cols">
      ${verticals.map((v) => `
      <article class="v-col">
        <p class="eyebrow"><span class="mono">Vertical ${v.roman}</span> ${esc(v.verb)}</p>
        <h2><a href="${href(rel, P.vertical(v.id))}">${esc(v.title)}</a></h2>
        <p class="v-sum">${esc(v.summary)}</p>
        <ul class="v-svcs">
          ${v.services.map((sid) => { const s = byId(services, sid); return `<li><a href="${href(rel, P.service(s.id))}"><span class="mono">${s.n}</span><span class="t">${esc(s.title)}</span>${ARR}</a><p>${esc(s.short)}</p></li>`; }).join('')}
        </ul>
      </article>`).join('')}
    </div>
  </div>
</section>

<section class="ink" data-tone="ink">
  <div class="wrap">
    <header class="sec-head">
      <p class="eyebrow">The order they belong in</p>
      <h2 class="h2">Not the order they are numbered in.</h2>
    </header>
    ${orderList(rel, null)}
    ${honestNote()}
  </div>
</section>
`;
}

export function renderVertical(rel, v) {
  const svcs = v.services.map((sid) => byId(services, sid));
  return `
${pageHero({
  rel, stage: v.stage, size: 'vertical',
  crumbItems: [{ label: 'Services', path: P.services }, { label: `Vertical ${v.roman}` }],
  badge: v.roman,
  eyebrow: `Vertical ${v.roman} <span class="mono">${esc(v.verb)}</span>`,
  title: esc(v.title),
  lede: esc(v.lede),
  actions: `<a class="btn btn-ember" href="#in-this-vertical">The ${svcs.length} services ${DOWN}</a><a class="btn btn-ghost" href="${href(rel, P.contact)}">Book a scoping call</a>`,
})}

<section class="paper" id="in-this-vertical" data-tone="paper">
  <div class="wrap">
    <header class="sec-head">
      <p class="eyebrow">Services in Vertical ${v.roman}</p>
    </header>
    <ul class="vrows">
      ${svcs.map((s) => `
      <li><a class="spot" href="${href(rel, P.service(s.id))}">
        <span class="n mono">${s.n}</span>
        <span class="name">${esc(s.title)}</span>
        <span class="sum">${esc(s.short)}</span>
        <span class="go">Open ${ARR}</span>
      </a></li>`).join('')}
    </ul>
  </div>
</section>

<section class="ink" data-tone="ink">
  <div class="wrap">
    <header class="sec-head">
      <p class="eyebrow">Where this sits in the sequence</p>
      <h2 class="h2">${esc(v.orderHead)}</h2>
    </header>
    ${orderList(rel, v.id)}
    ${v.id !== 'business-health-check' ? honestNote() : ''}
  </div>
</section>
`;
}

export function renderService(rel, s) {
  const v = vOf(s);
  const siblings = v.services.map((sid) => byId(services, sid));
  return `
${pageHero({
  rel, stage: v.stage, size: 'service',
  crumbItems: [{ label: 'Services', path: P.services }, { label: `Vertical ${v.roman}`, path: P.vertical(v.id) }, { label: s.n }],
  badge: s.n,
  focus: s.focus,
  caption: s.caption,
  eyebrow: `Vertical ${v.roman} · ${esc(v.title)} <span class="mono">Service ${s.n} of 08</span>`,
  title: esc(s.title),
  lede: esc(s.lede),
})}

<section class="paper svc-page" data-tone="paper">
  <div class="wrap svc-layout">
    <aside class="svc-aside">
      <div class="aside-card">
        <p class="mono">Vertical ${v.roman} · ${esc(v.verb)}</p>
        <a class="aside-v" href="${href(rel, P.vertical(v.id))}">${esc(v.title)}</a>
        <ul>
          ${siblings.map((x) => `<li><a href="${href(rel, P.service(x.id))}"${x.id === s.id ? ' aria-current="page"' : ''}><span class="mono">${x.n}</span>${esc(x.title)}</a></li>`).join('')}
        </ul>
      </div>
      <div class="aside-card is-ink">
        <p class="mono">Phase 00 · no charge</p>
        <p>A scoping conversation costs nothing — and may end with us telling you there is nothing here.</p>
        <a class="btn btn-ember" href="${href(rel, P.contact)}">Book a scoping call ${ARR}</a>
      </div>
    </aside>
    <div class="svc-main">
      ${specimen(s.id)}
      ${s.blocks.map(fullBlock).join('')}
      <div class="gain-ink">
        <p class="eyebrow">What you gain</p>
        ${s.gain.map((g) => `<p>${rich(g)}</p>`).join('')}
      </div>
      ${s.bestFit ? `<p class="fit-lg"><b>Best fit when</b> ${esc(s.bestFit)}</p>` : ''}
    </div>
  </div>
</section>
`;
}

export function renderHow(rel) {
  return `
${pageHero({
  rel, stage: 5,
  crumbItems: [{ label: 'How we work' }],
  eyebrow: 'The sequence',
  title: 'Five phases, and two of them are exits.',
  lede: 'A build should not begin until there is evidence it is worth doing, and it should be possible to stop at the end of the diagnostic with something useful in hand.',
})}

<section class="paper" data-tone="paper">
  <div class="wrap">
    <ol class="timeline">
      ${phases.map((p) => `
      <li${p.exit ? ' class="is-exit"' : ''}>
        <span class="tl-n">${p.n}</span>
        <div class="tl-body">
          <h2>${esc(p.title)}</h2>
          <p class="tl-tags"><span class="mono">${esc(p.tag)}</span>${p.exit ? '<span class="mono exit">You can stop here</span>' : ''}</p>
          <p>${esc(p.body)}</p>
          ${p.n === '01' ? `<a class="link-arrow" href="${href(rel, P.service('business-health-check'))}">What the diagnostic produces ${ARR}</a>` : ''}
          ${p.n === '03' ? `<a class="link-arrow" href="${href(rel, P.vertical('digital-foundation'))}">Why foundation comes before automation ${ARR}</a>` : ''}
        </div>
      </li>`).join('')}
    </ol>
  </div>
</section>

<section class="ink" data-tone="ink">
  <div class="wrap">
    <div class="pull is-first">
      <p class="eyebrow">Why the sequence is the product</p>
      <p class="quote">Almost every failed implementation we have examined failed at a decision made before any code was written: a system was selected against an assumed problem. Phases 00 to 02 exist to make that decision on evidence, and they are deliberately cheap and short so that making them properly is never the expensive option.</p>
    </div>
  </div>
</section>
`;
}

export function renderPricing(rel) {
  return `
${pageHero({
  rel, stage: 3,
  crumbItems: [{ label: 'Pricing' }],
  eyebrow: 'How we charge',
  title: 'Priced so the risk of being wrong sits with us, not only with you.',
  lede: 'The structure varies by vertical. What does not vary: the price is agreed in writing before the work starts, and there is no licence rent on systems you paid us to build.',
})}

<section class="paper pricing" data-tone="paper">
  <div class="wrap pricing-grid">
    ${figure25()}
    ${pricingRows()}
    <div class="two-up">
      <article class="spot">
        <p class="eyebrow">For the buyer</p>
        <h2>What this removes</h2>
        <p>The two standard risks in buying operational software: paying a large sum before knowing whether it solves anything, and discovering afterwards that leaving costs more than staying. The diagnostic addresses the first. The ownership terms address the second.</p>
      </article>
      <article class="spot">
        <p class="eyebrow">For us</p>
        <h2>What this costs us</h2>
        <p>We turn down work when the diagnostic does not justify a build, and outcome-linked pricing means a finding that does not hold up is a finding we do not get paid for. That is deliberate — it is what makes the numbers in our register worth reading.</p>
      </article>
    </div>
  </div>
</section>
`;
}

export function renderData(rel) {
  return `
${pageHero({
  rel, stage: 4,
  crumbItems: [{ label: 'Data & limits' }],
  eyebrow: 'Handling your data',
  title: 'A diagnostic requires access to real records. So the terms come first.',
  lede: 'An NDA before any data moves. Read-only where read-only is enough. Your data never trains a model outside your engagement.',
})}

<section class="paper terms" data-tone="paper">
  <div class="wrap">
    <dl class="data-grid">
      ${dataTerms.map((t, n) => `<div><dt><span class="mono">${String(n + 1).padStart(2, '0')}</span>${esc(t.k)}</dt><dd>${esc(t.v)}</dd></div>`).join('')}
    </dl>
    <div class="limits">
      <div>
        <p class="eyebrow">Limits</p>
        <h2 class="h-limits">What we will not do.</h2>
      </div>
      ${limitsList()}
    </div>
    ${todayNote()}
  </div>
</section>
`;
}

export function renderContact(rel) {
  return contactSection(rel, { asPage: true });
}

// ---------- legal ----------
const LEGAL = {
  privacy: {
    part: 'Part A', title: 'Privacy Policy', path: () => P.privacy, src: privacySrc,
    lede: 'How we collect, use, keep and protect personal data that reaches us through this website, and the rights you have under the Digital Personal Data Protection Act, 2023.',
    glance: [
      ['We do not sell personal data.', 'c-4-3'],
      ['Enquiry data where no engagement follows is kept 24 months from last contact, then erased.', 'c-8-1'],
      ['Every grievance is acknowledged on receipt and answered within ninety days.', 'c-13-2'],
    ],
  },
  terms: {
    part: 'Part B', title: 'Terms of Use', path: () => P.terms, src: termsSrc,
    lede: 'The terms on which you may use this website. They govern the website only. An engagement is governed by its own written agreement.',
    glance: [
      ['These Terms govern the Website only. They are not an offer and create no client relationship.', 'c-2-1'],
      ['Worksmith is not a firm of chartered accountants and gives no legal, tax or audit advice.', 'c-3-1'],
      ['Figures on the Website are illustrative unless expressly stated to be measured results.', 'c-3-4'],
    ],
  },
};

function legalInline(rel, text) {
  return esc(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\{\{(.+?)\}\}/g, '<mark class="ph" title="To complete before publishing">$1</mark>')
    .replace(/\[\[([a-z]*)(#[a-z0-9-]+)?\|(.+?)\]\]/g, (_, doc, frag, label) => `<a href="${doc ? href(rel, LEGAL[doc].path()) : ''}${frag || ''}">${label}</a>`)
    .replace(/(?<![\w/:.])contact@worksmith\.tech/g, '<a href="mailto:contact@worksmith.tech">contact@worksmith.tech</a>');
}

function legalContact() {
  return `<dl class="lg-card">
      <div><dt>Grievance Officer</dt><dd>${esc(entity.grievance)}</dd></div>
      <div><dt>Email</dt><dd><a href="mailto:${entity.email}">${entity.email}</a></dd></div>
      <div><dt>Telephone</dt><dd><a href="tel:${entity.phone.replace(/\s/g, '')}">${esc(entity.phone)}</a></dd></div>
      <div><dt>Address</dt><dd>${esc(entity.office)}</dd></div>
    </dl>`;
}

function legalBlock(rel, b) {
  if (b.t === 'p') return `<p>${legalInline(rel, b.text)}</p>`;
  if (b.t === 'list') return `<ol class="lg-list">${b.items.map((it) => `<li><span class="mono">(${it.k})</span><span>${legalInline(rel, it.text)}</span></li>`).join('')}</ol>`;
  if (b.t === 'contact') return legalContact();
  return `<div class="lg-table"><table>
      <thead><tr>${b.head.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead>
      <tbody>${b.rows.map((r) => `<tr>${r.map((c, n) => (n ? `<td>${legalInline(rel, c)}</td>` : `<th scope="row">${legalInline(rel, c)}</th>`)).join('')}</tr>`).join('')}</tbody>
    </table></div>`;
}

export function renderLegal(rel, key) {
  const doc = LEGAL[key];
  const other = LEGAL[key === 'privacy' ? 'terms' : 'privacy'];
  const sections = parseLegal(doc.src());
  const draft = !legalMeta.reviewed;
  return `
${pageHero({
  rel, stage: 4,
  crumbItems: [{ label: doc.title }],
  eyebrow: `${doc.part} <span class="mono">Website legal terms</span>`,
  title: doc.title,
  lede: doc.lede,
  caption: key === 'privacy' ? 'What reaches us, what we keep, and for how long.' : 'The website is the record layer. An engagement has its own agreement.',
})}

<section class="paper legal" data-tone="paper">
  <div class="wrap lg-layout">
    <aside class="lg-aside">
      <nav class="lg-switch" aria-label="Legal documents">
        ${['privacy', 'terms'].map((k) => `<a href="${href(rel, LEGAL[k].path())}"${k === key ? ' aria-current="page"' : ''}><span class="mono">${LEGAL[k].part}</span>${LEGAL[k].title}</a>`).join('')}
      </nav>
      <nav class="lg-toc" aria-label="Contents">
        <p class="mono">Contents</p>
        <ol>${sections.map((sec) => `<li><a href="#${sec.id}"><span class="mono">${sec.n.padStart(2, '0')}</span>${esc(sec.title)}</a></li>`).join('')}</ol>
      </nav>
    </aside>

    <article class="lg-doc">
      ${draft ? `<div class="lg-draft" role="note"><p class="mono">Draft for review</p><p>This text has not yet been settled by counsel. <mark class="ph">Highlighted</mark> items are still to be completed before publication.</p></div>` : ''}
      <dl class="lg-meta mono">
        <div><dt>Entity</dt><dd>${esc(entity.name)}</dd></div>
        <div><dt>CIN</dt><dd>${entity.cin}</dd></div>
        <div><dt>Version</dt><dd>${draft ? `<mark class="ph">[${legalMeta.version}]</mark>` : legalMeta.version}</dd></div>
        <div><dt>Effective</dt><dd>${legalMeta.effective ? esc(legalMeta.effective) : '<mark class="ph">[insert date]</mark>'}</dd></div>
      </dl>
      <ul class="lg-glance">
        ${doc.glance.map(([t, id]) => `<li><p>${esc(t)}</p><a class="mono" href="#${id}">Clause ${id.slice(2).replace('-', '.')}</a></li>`).join('')}
      </ul>
      ${sections.map((sec) => `
      <section class="lg-sec" id="${sec.id}" aria-labelledby="${sec.id}-h">
        <h2 id="${sec.id}-h"><span class="mono">${sec.n.padStart(2, '0')}</span>${esc(sec.title)}</h2>
        ${sec.clauses.map((c) => `<div class="lg-clause" id="${c.id}"><a class="lg-n mono" href="#${c.id}">${c.n}</a><div class="lg-body">${c.blocks.map((b) => legalBlock(rel, b)).join('')}</div></div>`).join('')}
      </section>`).join('')}
      <div class="lg-end">
        <p>Questions about this document: <a href="mailto:${entity.email}">${entity.email}</a> · <a href="tel:${entity.phone.replace(/\s/g, '')}">${esc(entity.phone)}</a></p>
        <a class="link-arrow" href="${href(rel, other.path())}">${other.part} · ${other.title} ${ARR}</a>
      </div>
    </article>
  </div>
</section>
`;
}

export function render404(rel) {
  return pageHero({
    rel, stage: 1,
    eyebrow: 'Error 404',
    title: 'This page fell through a gap.',
    lede: 'The address may have changed when the site was reorganised. Everything we do is still here.',
    actions: `<a class="btn btn-ember" href="${href(rel, P.home)}">Back to the start ${ARR}</a><a class="btn btn-ghost" href="${href(rel, P.services)}">All services</a><a class="btn btn-ghost" href="${href(rel, P.contact)}">Contact</a>`,
  });
}

export function redirectStub({ to, toAbs }) {
  return `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<title>Redirecting — Worksmith</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${toAbs}">
<meta http-equiv="refresh" content="0; url=${to}">
<script>location.replace(${JSON.stringify(to)} + location.hash)</script>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#171412;color:#f3eee6;font:15px/1.5 system-ui,sans-serif}a{color:#e5602f}</style>
</head>
<body><p>This page has moved to <a href="${to}">${toAbs.replace('https://', '')}</a>.</p></body>
</html>
`;
}
