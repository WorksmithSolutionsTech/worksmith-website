// Page registry. The order of `seq` is the reading order used by Previous / Next forwarding.
import { verticals, services } from './content.mjs';
import {
  P, byId,
  renderHome, renderApproach, renderServicesIndex, renderVertical, renderService,
  renderHow, renderPricing, renderData, renderContact, renderLegal,
} from './templates.mjs';
import { legalMeta } from './legal.mjs';

// ---------- page sequence (this order drives Next / Previous forwarding) ----------
export const seq = [
  { key: 'home', path: P.home, label: 'Home', title: 'Worksmith — The loss lives in the gaps between systems', nav: 'home', group: 'start',
    description: 'Worksmith finds operational loss between your systems, puts a number on it in your own data, and builds only what the evidence justifies. Hyderabad, working globally.', render: renderHome },
  { key: 'approach', path: P.approach, label: 'Approach', title: 'Approach', nav: 'approach', group: 'start',
    description: 'Most operational loss is invisible because every system involved is working correctly. We open engagements with measurement, not software.', render: renderApproach },
  { key: 'services', path: P.services, label: 'Services', pagerLabel: 'Three verticals, eight services', title: 'Services', nav: 'services', group: 'start',
    description: 'Three verticals and eight services: Business Health Check, Workflow Automation and Digital Foundation — and the order they belong in.', render: renderServicesIndex },
];
for (const v of verticals) {
  seq.push({ key: `v-${v.id}`, path: P.vertical(v.id), label: `Vertical ${v.roman}: ${v.title}`, title: `${v.title} — Vertical ${v.roman}`, nav: 'services', group: v.roman,
    description: v.lede, render: (rel) => renderVertical(rel, v) });
  for (const sid of v.services) {
    const s = byId(services, sid);
    seq.push({ key: `s-${s.id}`, path: P.service(s.id), label: `${s.n} ${s.title}`, title: s.title, nav: 'services', group: v.roman,
      description: s.lede, render: (rel) => renderService(rel, s) });
  }
}
seq.push(
  { key: 'how', path: P.how, label: 'How we work', title: 'How we work', nav: 'how', group: 'close',
    description: 'Five phases, and two of them are exits: scoping, diagnostic, prioritisation, build in live slices, operate and measure.', render: renderHow },
  { key: 'pricing', path: P.pricing, label: 'Pricing', title: 'Pricing', nav: 'pricing', group: 'close',
    description: 'Fixed-fee diagnostic, fixed price per build slice, and an outcome-linked option at 25% of verified recovery. You own what we build.', render: renderPricing },
  { key: 'data', path: P.data, label: 'Data & limits', title: 'Data & limits', nav: 'data', group: 'close',
    description: 'NDA first, least privilege, defined retention, no external model training, DPDP Act 2023 and GDPR alignment — and what we will not do.', render: renderData },
  { key: 'contact', path: P.contact, label: 'Contact', title: 'Contact', nav: 'contact', group: 'close',
    description: 'Start with a scoping conversation. It costs nothing and it may end with us telling you there is nothing here.', render: renderContact },
);


// ---------- pages outside the reading order (no Previous / Next) ----------
export const extraPages = [
  { key: 'privacy', path: P.privacy, label: 'Privacy Policy', title: 'Privacy Policy', nav: '', noindex: !legalMeta.reviewed,
    description: 'How Worksmith Solutions Private Limited collects, uses, retains and protects personal data received through worksmith.tech, and your rights under the DPDP Act, 2023.',
    render: (rel) => renderLegal(rel, 'privacy') },
  { key: 'terms', path: P.terms, label: 'Terms of Use', title: 'Terms of Use', nav: '', noindex: !legalMeta.reviewed,
    description: 'The terms on which you may use worksmith.tech. They govern the website only; any engagement is governed by its own written agreement.',
    render: (rel) => renderLegal(rel, 'terms') },
];
