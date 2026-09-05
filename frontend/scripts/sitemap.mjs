/**
 * Writes dist/frontend/browser/sitemap.xml from the routes `ng build` prerendered
 * (dist/frontend/prerendered-routes.json), so a new project gets into the sitemap by
 * existing in the backend — nothing to maintain by hand. Runs as `postbuild`, i.e.
 * automatically after `npm run build`.
 *
 * The site origin defaults to the same placeholder as index.html and robots.txt
 * (https://bobbylon.dev); the Pages workflow rewrites it to the real origin
 * (including the base href, e.g. https://bbobbylon.github.io/Resume) afterwards.
 * Override with SITE_URL. Route keys from a `--base-href` build already carry that
 * base href (e.g. "/Resume/projects/x"), so it is stripped back off here — the
 * origin substitution downstream re-adds it exactly once. Trailing slashes follow
 * GitHub Pages, which serves `/resume/index.html` at `/resume/`.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const dist = resolve(import.meta.dirname, '../dist/frontend');
const manifest = resolve(dist, 'prerendered-routes.json');
const origin = (process.env.SITE_URL ?? 'https://bobbylon.dev').replace(/\/$/, '');

if (!existsSync(manifest)) {
  console.error(`sitemap: ${manifest} not found — run \`ng build\` first`);
  process.exit(1);
}

const indexHtml = readFileSync(resolve(dist, 'browser/index.html'), 'utf8');
const baseHref = (indexHtml.match(/<base href="([^"]*)"/)?.[1] ?? '/').replace(/\/$/, '');

const parsed = JSON.parse(readFileSync(manifest, 'utf8'));
const routes = Array.isArray(parsed) ? parsed : Object.keys(parsed.routes ?? parsed);
const today = new Date().toISOString().slice(0, 10);
const urls = routes
  .filter((route) => !route.includes('*') && !route.includes(':'))
  .map((route) => (baseHref && route.startsWith(baseHref) ? route.slice(baseHref.length) : route))
  .map((route) => (route === '' || route === '/' ? '/' : `${route.replace(/\/$/, '')}/`))
  .sort((a, b) => a.split('/').length - b.split('/').length || a.localeCompare(b))
  .map((path) => `  <url>\n    <loc>${origin}${path}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`);

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
writeFileSync(resolve(dist, 'browser/sitemap.xml'), xml);
console.log(`sitemap: ${urls.length} URLs → dist/frontend/browser/sitemap.xml`);
