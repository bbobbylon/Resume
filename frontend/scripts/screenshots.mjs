// Captures project screenshots with headless Chrome and writes them as WebP into
// public/shots/:
//   <id>-<n>.webp       1600×1000 (16:10 — what cards and rows show; the detail
//                       hero crops it to 21:9 from the top)
//   <id>-<n>-800.webp   half size, for the 320 px row/card slots (srcset)
//   <id>-social.jpg     1200×630 crop of shot 1, the page's Open Graph image
//                       (JPEG because link unfurlers do not all read WebP)
// plus public/og.png, a 1200×630 capture of the landing page for the site-wide
// social preview. Every project the API returns with a live `url` is captured;
// the PAGES table adds further pages per project and a base URL for projects
// without a live URL yet (WebsiteHub itself, captured from the dev server).
//
//   1. Start the backend (port 8420) and `npm start` (port 4222).
//   2. npm run shots                       all projects
//      npm run shots -- --only tesseraapp  one project
//      npm run shots -- --skip-og          projects only
//   Environment: API_URL (default http://localhost:8420), SELF_URL (default
//   http://localhost:4222), CHROME (path to the browser).
//
// Then reference the files from the project's `imageUrls` in
// backend/…/repository/InMemoryProjectRepository.java as "shots/<id>-1.webp" etc.
// (no leading slash, so the <base href> of a GitHub Pages sub-path still works);
// ProjectImage derives the -800 variant and PageMeta the -social.jpg from that.
import { existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import sharp from 'sharp';
import { findChrome, runChrome, withProfile } from './chrome.mjs';

const API_URL = process.env.API_URL ?? 'http://localhost:8420';
const SELF_URL = process.env.SELF_URL ?? 'http://localhost:4222';
const OUT_DIR = resolve('public/shots');
const SIZE = { width: 1600, height: 1000 };

/** Extra pages per project id (paths appended to the project's base URL). */
const PAGES = {
  tesseraapp: { paths: ['/', '/features', '/register'] },
  // No live URL yet — captured from the local dev server instead.
  websitehub: { base: SELF_URL, paths: ['/', '/resume', '/projects/tesseraapp'] },
};

const args = process.argv.slice(2);
const only = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',') : null;
const skipOg = args.includes('--skip-og');

const response = await fetch(`${API_URL}/api/projects`).catch(() => null);
if (!response?.ok) {
  console.error(`Could not read ${API_URL}/api/projects — is the backend running?`);
  process.exit(1);
}
const projects = (await response.json()).filter((p) => !only || only.includes(p.id));

mkdirSync(OUT_DIR, { recursive: true });
const tmp = mkdtempSync(join(tmpdir(), 'websitehub-shots-'));
const chrome = findChrome();
const captured = [];
let failures = 0;

// Chrome runs synchronously (one process per capture); conversion happens after.
withProfile((profile) => {
  for (const project of projects) {
    const config = PAGES[project.id] ?? { paths: ['/'] };
    const base = (config.base ?? project.url)?.replace(/\/$/, '');
    if (!base) {
      console.log(`- ${project.id}: no live URL, skipped`);
      continue;
    }
    config.paths.forEach((path, i) => {
      const png = join(tmp, `${project.id}-${i + 1}.png`);
      const url = base + path;
      const status = runChrome(chrome, profile, [
        `--window-size=${SIZE.width},${SIZE.height}`, `--screenshot=${png}`, url,
      ], 15000);
      const ok = status === 0 && existsSync(png);
      if (ok) captured.push({ png, id: project.id, n: i + 1 });
      else failures++;
      console.log(`${ok ? '✓' : '✗'} ${project.id}-${i + 1}  ← ${url}`);
    });
  }

  if (!skipOg) {
    const out = resolve('public/og.png');
    const status = runChrome(chrome, profile, ['--window-size=1200,630', `--screenshot=${out}`, `${SELF_URL}/`], 15000);
    const ok = status === 0 && existsSync(out);
    if (!ok) failures++;
    console.log(`${ok ? '✓' : '✗'} og.png  ← ${SELF_URL}/`);
  }
});

for (const { png, id, n } of captured) {
  const source = sharp(png);
  await source.clone().webp({ quality: 82 }).toFile(resolve(OUT_DIR, `${id}-${n}.webp`));
  await source.clone().resize({ width: 800 }).webp({ quality: 80 }).toFile(resolve(OUT_DIR, `${id}-${n}-800.webp`));
  if (n === 1) {
    await source.clone().resize(1200, 630, { fit: 'cover', position: 'top' }).jpeg({ quality: 82 })
      .toFile(resolve(OUT_DIR, `${id}-social.jpg`));
  }
  console.log(`  → ${id}-${n}.webp, ${id}-${n}-800.webp${n === 1 ? `, ${id}-social.jpg` : ''}`);
}
rmSync(tmp, { recursive: true, force: true });

if (failures) {
  console.error(`${failures} capture(s) failed.`);
  process.exit(1);
}
