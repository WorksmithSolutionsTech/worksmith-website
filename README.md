# worksmith.tech — v3

A static multi-page site with a hand-built WebGL2 figure. It has 18 pages, a Privacy Policy and Terms of Use, a custom 404, Previous / Next page forwarding and redirect rules for every common host. There are no runtime dependencies, and the fonts are self-hosted.

New here? Read `HANDOFF.md` first: how to build, how to deploy, where the agents plug in, and what is still open.

```
worksmith-website.html  ← the whole site in one file, for browsing and sharing (don't upload it as the site)
site/                   ← the website. Upload the contents of this folder.
src/                    ← source. Edit here, then rebuild.
  content.mjs     all copy (2026 Capabilities Portfolio; CA Workflow Automation removed)
  specimens.mjs   one "what this produces" figure per service page (illustrative, masked values)
  templates.mjs   page layouts
  pages.mjs       page list, and the order used by Previous / Next (legal pages sit outside it)
  legal.mjs       Privacy Policy and Terms of Use text (from the Aug 2026 draft), plus the review switch
  redirects.mjs   short links and old URLs, as one list compiled for every host
  styles.css      design system (ink · paper · ember)
  og.jpg          share image, copied to site/assets/
  js/scene.js     the 3D figure: plain WebGL2 with HDR bloom; stage motion comes from the original worksmith.tech build
  js/main.js      nav, services menu, services index, scoping form, keyboard page-turning, single-file router
  build.mjs       builds site/
  bundle.mjs      builds worksmith-website.html
  fonts.mjs       Outfit · JetBrains Mono · Poppins (wordmark), copied from npm into site/
```

## Preview

Double-click `site/index.html`. It works straight from disk, or you can open `worksmith-website.html` instead.

If you have Node installed:
- `npm install`, then `npm run build` rebuilds `site/`.
- `npm run bundle` rebuilds the single file.
- `npm run serve` serves the site at http://localhost:4321.

## The figure

Six systems float as stacks of smoked-glass record sheets, with lit edges and luminous record rows. Nothing is printed on the geometry: system names are small HTML tags that follow each stack. Records travel between the stacks, and value falls out in the gaps. The stacks drift out of alignment while value leaks, pulse when a record arrives, fan open on hover, and press flat onto the shared record layer. Each dark section declares a `data-stage`:

| Stage | Where | What the figure shows |
|---|---|---|
| 0 | Home hero | Six systems, each individually correct |
| 1 | Approach · 404 | Value leaving between systems |
| 2 | Vertical I · its services · Services | Gaps located, pinned with findings |
| 3 | Vertical II · its services · Pricing | Work carried end to end |
| 4 | Vertical III · its services · Data & limits | The record layer rises |
| 5 | Order · How we work | Diagnose, ground, then automate |
| 6 | Contact | Measured against the baseline |

Visitors without WebGL2 get a static backdrop. Visitors with reduced motion get slowed movement.

### v3 finish

- **Render.** The figure is drawn into an HDR, 4× MSAA buffer. A two-level bloom, soft highlight roll-off, vignette and dither are applied on top. The glass sheets are drawn back to front with a fresnel rim, additive edge light and anti-aliased record rows. Every shader avoids operations the GLSL spec leaves undefined (a negative `pow()` base, reversed `smoothstep()` edges, alpha above 1). The glow pass also discards any NaN or infinite pixel. Before this, a NaN from one `pow()` call showed up on Apple GPUs as white bars across the scene. Post-processing is off below 860px wide, to save battery.
- **Motion quality.** Camera moves between sections travel on an orbit around the figure (distance, azimuth and elevation are blended), so the view never cuts through the scene. Arcs are anti-aliased screen-space ribbons with smooth dashes, instead of 1-pixel lines. Points never render below 2px, so nothing twinkles. Glass stacks are drawn in a stable order, far stack to near stack and bottom sheet to top sheet. The vignette is centred on the figure, and triangular dither removes banding. If frames run long on a slower machine, the render resolution steps down (1.75× → 1.35× → 1×) instead of stuttering.
- **Frame-accurate review.** Add `?wsdebug` to any URL to stop the animation loop and expose `window.__wsScene.step(dt, n)` and `.hover(x, y)`. Every change was checked this way at exactly 30 fps: the full home-page scroll, hover, the first-visit entrance, the page-to-page handoff and the single-file route change. The checks found no frame-to-frame jumps and no blown-out pixels.
- **Entrance.** On a visitor's first page in a session, the site opens with a curtain. It lifts once the figure is ready. The record stacks then drop in, the arcs draw themselves and the camera settles.
- **Continuity between pages.** Later pages do not replay the entrance. The camera is handed over from the page you left and flies straight to the new view. Pages cross-fade without a flash. In the single file, the page fades in over the moving figure.
- **Inspect.** Hovering over any stack fans it open and shows a small record card. The card shows what that system is and its status at the current stage.
- **Per-page focus.** Any element can steer the figure:
  - `data-focus="0–5"` highlights one system (ERP, Ledger, Stock, WhatsApp, Sheets, Bank) and its links. Each service page sets this.
  - `data-caption="…"` replaces the figure caption.
- **Home chapter scrub.** A thin index sits on the left edge on screens 1240px and wider. Hover over it to read the chapter names.
- **Details.**
  - Headlines rise word by word.
  - Cards carry a cursor spotlight, and the primary buttons are magnetic.
  - The footer shows a live Hyderabad clock.
  - Pages carry a share image at `assets/og.jpg` (source: `src/og.jpg`).

## Legal pages

`/privacy/` (Part A) and `/terms/` (Part B) carry the text of the August 2026 draft word for word. Each page has a contents list that follows the reader, links to every clause, the grievance officer card, and a switch between the two documents. The footer shows the company name, CIN, registered office and telephone number, with links to both documents.

The draft says it has not been reviewed by counsel. Until it is, each page shows a "Draft for review" note, carries `noindex`, and highlights the items still to be filled in: the effective date, the version, and the Cookie Policy link. Once counsel signs off:

1. In `src/legal.mjs`, set `reviewed: true` and fill in `effective`.
2. Rebuild.

The scoping form now asks for consent and shows a short notice of what is collected and why. Have counsel check that notice as well. It is in `contactSection()` in `src/templates.mjs`.

Short links: `/privacy-policy`, `/legal` → Privacy Policy. `/terms-of-use`, `/terms-and-conditions`, `/tos` → Terms of Use.

## Page forwarding

**Reading order.** Every page ends with a chapter rail (all 18 pages, grouped Start · I · II · III · Method & terms) and Previous / Next links. The ← and → keys turn pages. The order is:
Home → Approach → Services → Vertical I → 01 → 02 → Vertical II → 03 → 04 → 05 → Vertical III → 06 → 07 → 08 → How we work → Pricing → Data & limits → Contact.

**Short links.** Each one redirects with a 301:

| Short link | Goes to |
|---|---|
| `/diagnostic`, `/health-check` | 01 Business Health Check |
| `/intelligence` | 02 Operational Intelligence Systems |
| `/automation` | Vertical II · Workflow Automation |
| `/agents` | 04 AI Agent Development |
| `/whatsapp` | 05 WhatsApp & Communication Automation |
| `/foundation` | Vertical III · Digital Foundation |
| `/crm` | 06 Custom Software, CRM & Portals |
| `/apps` | 07 Mobile Applications |
| `/analytics` | 08 Growth & Analytics Infrastructure |
| `/book`, `/scoping`, `/start`, `/contact-us` | Contact |
| `/about`, `/about-us` | Approach |
| `/method`, `/process` | How we work |
| `/fees` | Pricing |
| `/security` | Data & limits |

**Removed service.** `/services/ca-workflow-automation` and `/ca-workflow-automation` point to Workflow Automation until the CA product has its own site. To change that, edit `src/redirects.mjs`, then rebuild.

## Deploy (pick one)

| Host | What to do | Redirects come from |
|---|---|---|
| **Netlify** | Drag the `site` folder onto app.netlify.com/drop | `site/_redirects` |
| **Vercel** | Run `vercel deploy site --prod`, or set the output directory to `site` | `site/vercel.json` |
| **cPanel / Hostinger / GoDaddy** | Upload everything inside `site/` to `public_html/`. Turn on "show hidden files", because `.htaccess` must go up too. | `site/.htaccess` |
| **GitHub Pages / S3 / any static host** | Upload `site/` | HTML fallback pages |

## Scoping form

The form works without a server. It opens the visitor's email app with a request to contact@worksmith.tech already filled in.

To receive submissions directly instead:

1. Create an endpoint with a form service such as Formspree or Basin.
2. In `src/templates.mjs`, put that endpoint in `data-endpoint=""` on the form.
3. Rebuild.
