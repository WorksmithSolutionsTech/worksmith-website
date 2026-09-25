// Single-file preview: node src/bundle.mjs → worksmith-website.html
// Every page is embedded as a <template> and routed in the browser (#/services/…/),
// with CSS, fonts and the 3D engine inlined. For browsing and sharing — deploy site/ for the real thing.
process.env.BUNDLE = '1';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build as esbuild } from 'esbuild';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { seq, extraPages } = await import('./pages.mjs');
const T = await import('./templates.mjs');
const { site } = await import('./content.mjs');

const font = async (f) => `data:font/woff2;base64,${(await readFile(join(root, f))).toString('base64')}`;
const { FONT_FILES } = await import('./fonts.mjs');
const fonts = {};
for (const [name, from] of Object.entries(FONT_FILES)) fonts[name] = await font(from);
let css = await readFile(join(root, 'src/styles.css'), 'utf8');
css = css.replace(/url\('\.\.\/fonts\/([^']+)'\)/g, (m, f) => `url('${fonts[f]}')`);

const js = (await esbuild({
  entryPoints: [join(root, 'src/js/main.js')],
  bundle: true, minify: true, format: 'iife', target: ['es2020'], write: false, legalComments: 'none',
})).outputFiles[0].text.replace(/<\/script/gi, '<\\/script');

const favicon = `data:image/svg+xml;base64,${(await readFile(join(root, 'src/favicon.svg'))).toString('base64')}`;
const titleOf = (p) => (p.key === 'home' ? p.title : `${p.title} — Worksmith`);

const pageHtml = (p) => `${p.render('')}`;
const templates = seq.map((p) => `<template data-route="/${p.path}" data-title="${T.esc(titleOf(p))}"><main id="main">${pageHtml(p)}</main></template>`).join('\n');
const legalTpl = extraPages.map((p) => `<template data-route="/${p.path}" data-title="${T.esc(titleOf(p))}"><main id="main">${p.render('')}</main></template>`).join('\n');
const nf = `<template data-route="/404/" data-title="Page not found — Worksmith"><main id="main">${T.render404('')}</main></template>`;
const home = seq[0];

const html = `<!doctype html>
<html lang="en-IN" data-bundle="1">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Worksmith Website</title>
<meta name="description" content="Browsable single-file preview of worksmith.tech — ${seq.length} pages with page forwarding and the 3D scene.">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#171412">
<link rel="icon" href="${favicon}" type="image/svg+xml">
<style>
${css}
/* single-file preview */
#page { display: contents; }
</style>
${T.CURTAIN_FLAG}
</head>
<body class="pg-bundle">
${T.header('', 'home')}
${T.chrome()}
<div id="page"><main id="main">${pageHtml(home)}</main></div>
${T.footer('')}
${templates}
${legalTpl}
${nf}
<script>
${js}
</script>
</body>
</html>
`;

const out = join(root, 'worksmith-website.html');
await writeFile(out, html);
console.log(`Single-file preview → ${out} (${(Buffer.byteLength(html) / 1024).toFixed(0)} KB, ${seq.length} pages + 404) · ${site.domain}`);
