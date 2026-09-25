# worksmith.tech — handoff

This guide is for whoever takes over deployment and the agent integration. Read it first; `README.md` has the full technical reference.

## 1 · What you have

| Path | What it is | Edit it? |
| :---- | :---- | :---- |
| `src/` | The source: copy, page templates, styles, the 3D scene, build scripts | **Yes. This is the only place to make changes.** |
| `site/` | The built website, ready to upload | No. `npm run build` regenerates it. |
| `worksmith-website.html` | The whole site in one file, for previews | No. `npm run bundle` regenerates it. |
| `README.md` | Technical reference: structure, 3D stages, redirects, hosts | Keep it current. |

The site is static: plain HTML, CSS and JS, with no framework, no server and no runtime dependencies. Fonts are self-hosted, and there are no third-party requests.

## 2 · Start

Requires Node 18 or later.

```shell
npm ci              # installs exactly the versions in package-lock.json
npm run build       # src/ → site/
npm run bundle      # src/ → worksmith-website.html
npm run serve       # http://localhost:4321
```

Before sharing any change, run `npm run build && npm run bundle`, then check both outputs in a browser.

Where things live:

| To change… | Edit |
| :---- | :---- |
| Any copy (services, pricing, limits, founders, contact) | `src/content.mjs` |
| Page layouts, footer, the scoping form | `src/templates.mjs` |
| Page list and the Previous / Next order | `src/pages.mjs` |
| Short links and old URLs | `src/redirects.mjs` (compiled for Netlify, Vercel, Apache and HTML fallbacks) |
| Privacy Policy and Terms of Use | `src/legal.mjs` |
| Visual design | `src/styles.css` |
| The 3D figure | `src/js/scene.js` |
| Navigation, form behaviour, single-file router | `src/js/main.js` |

## 3 · Deployment

### Before go-live (blocking)

1. **Legal sign-off.**  
   - The Privacy Policy and Terms of Use are an unreviewed draft. Both pages show a "Draft for review" banner and carry `noindex`.  
   - After counsel signs off, set `reviewed: true` and `effective: '<date>'` in `src/legal.mjs`, then rebuild.  
   - Clause 6 describes a cookie banner and a Cookie Policy page. **The site has neither, and it sets no cookies.** Counsel must either cut that clause, or both pieces must be built before launch.  
2. **Form endpoint.** Until one is set, the scoping form opens the visitor's email app. See section 4\.  
3. **Pick a host.** Section 3.2 lists the options.  
4. **Real-device check.** Test on a real Mac, a Windows laptop, an iPhone and an Android phone: scroll every page, hover over the 3D stacks, submit the form. All automated checks so far ran headless on a software renderer.

### Hosts (all supported)

| Host | Deploy | Redirects come from |
| :---- | :---- | :---- |
| Netlify | Drag `site/` onto app.netlify.com/drop, or connect the repo with build command `npm run build` and publish directory `site` | `site/_redirects` |
| Vercel | Run `vercel deploy site --prod`, or set output directory `site` and build command `npm run build` | `site/vercel.json` |
| cPanel / Hostinger / GoDaddy | Upload the contents of `site/` to `public_html/`. **Turn on hidden files so `.htaccess` is uploaded.** | `site/.htaccess` |
| GitHub Pages / S3 / others | Upload `site/` | HTML fallback pages |

After deploying, check:

- [ ] `https://worksmith.tech/` loads over HTTPS, and `www` redirects to the bare domain (or the other way round; pick one).  
- [ ] `/diagnostic`, `/book` and `/services/ca-workflow-automation` redirect with a 301\.  
- [ ] `/does-not-exist` shows the custom 404\.  
- [ ] `/sitemap.xml` and `/robots.txt` are served.  
- [ ] A shared link shows the preview image (`/assets/og.jpg`). Test with a LinkedIn or WhatsApp preview.  
- [ ] Previous / Next links and the ← / → keys work.  
- [ ] Nothing fails with a 404 in the browser network panel.

Recommended: put the repository on GitHub and connect the host to it, so every push rebuilds automatically. `.gitignore` already excludes `node_modules/`.

## 4 · Where the agents plug in

The site has **one integration point today: the scoping form** on `/contact/` and at the end of the home page. There is no chat widget or other agent surface yet.

### The form contract

In `src/templates.mjs`, function `contactSection()`, the form is declared as:

```html
<form class="brief" data-brief data-to="contact@worksmith.tech" data-endpoint="" novalidate>
```

**When `data-endpoint` is empty,** the form opens the visitor's email client with the request filled in.

**When `data-endpoint` is set to a URL,** `src/js/main.js` (`initBrief`) sends:

- `POST <endpoint>`, body `multipart/form-data`, header `Accept: application/json`  
- Any 2xx response shows the visitor: *"Received. We reply within two working days."*  
- Any other response, or a network error, shows: *"That did not go through. Write to [contact@worksmith.tech](mailto:contact@worksmith.tech)…"*  
- The endpoint is on a different origin, so it **must allow CORS** from the site's domain.

| Field | Type | Notes |
| :---- | :---- | :---- |
| `name` | text | Required. Validated in the browser. |
| `email` | text | Required. Basic format check in the browser. |
| `company` | text | Optional. |
| `domain` | repeated | Zero or more of: `Revenue & billing`, `Procurement & vendors`, `Inventory & working capital`, `Receivables & collection`, `Compliance & tax`, `Manual effort & duplication`, `Data integrity across systems`, `Not sure yet` |
| `message` | text | Optional. |
| `consent` | `yes` | Required. The visitor must tick the consent box. |

**Treat every field as untrusted.** Validate again on the server, and treat `message` as untrusted input to any language model (it can carry prompt-injection text).

### Suggested build (to discuss)

1. Build an intake endpoint, as a serverless function on the chosen host or a separate service. It should:  
   - validate the fields;  
   - store the enquiry together with **the consent timestamp and the policy version** (Privacy Policy clause 8 keeps consent records);  
   - send an acknowledgement.  
2. An intake/triage agent reads each stored enquiry, maps the ticked domains to Vertical I–III, drafts a reply for a human to approve, and creates the CRM record. **No automatic sending without human review.**  
3. Set `data-endpoint` to that URL, then rebuild.

### Privacy obligations to keep in step

The DPDP Act applies, and the Privacy Policy already makes these commitments:

- Any new processor (hosting, email, CRM, analytics, LLM provider) must fit clause 7: written contract, no use for the processor's own purposes, cross-border terms.  
- Enquiry data must not be used to train models (clause 4.3).  
- Retention: 24 months if no engagement follows, 8 years after an engagement (clause 8).  
- **Analytics** requires the cookie banner first (clause 6), and the banner doesn't exist yet.  
- If any of this changes, update `src/legal.mjs` together with counsel.

## 5 · Rules the content must keep

- **CA Workflow Automation is not on this site.** There are 8 services, numbered 01–08. Old CA URLs redirect to `/verticals/workflow-automation/`.  
- **No client names and no invented results.** The "specimen" figures on service pages are marked *illustrative* and use masked values. Keep it that way; Terms of Use clause 3.4 depends on it.  
- Worksmith is early-stage, and the copy says so. Don't add testimonials, logos or metrics that can't be evidenced.  
- The 3D stacks must not shake or bob, and nothing is printed on the geometry. Both were deliberate owner decisions.

## 6 · Testing the 3D

- Add `?wsdebug` to any URL to freeze the animation loop. Then, in the console:  
  - `__wsScene.step(1/30, n)` advances the scene by exact frames.  
  - `__wsScene.hover(x, y)` simulates the pointer.  
- Use it to reproduce a glitch at an exact moment.  
- On slow machines the renderer steps its resolution down (1.75× → 1.35× → 1×) instead of stuttering.  
- Visitors without WebGL2 get a static backdrop. With reduced motion switched on, movement is slowed.  
- Details are in `README.md` → *The figure*.

## 7 · Open items

| Item | Owner |
| :---- | :---- |
| Counsel review of both legal documents and the form's consent notice | Founders \+ counsel |
| Clause 6 (cookies): cut it, or build the banner and Cookie Policy | Counsel → dev |
| Hosting provider and domain DNS | Dev |
| Form endpoint and intake agent | Dev |
| Official logo SVG (the wordmark is currently typeset) | Design |
| Re-issue the 2026 portfolio PDF (it still lists CA Workflow Automation and "nine services") | Founders |
| Real-device QA | Dev |

Questions: [contact@worksmith.tech](mailto:contact@worksmith.tech)

&nbsp;