// Captures project screenshots with headless Chrome into public/shots/<id>-<n>.png.
//
// Every project the API returns with a live `url` gets a capture of that URL; the
// PAGES table below adds further pages per project (and a base URL for projects
// that have no live URL yet, such as WebsiteHub itself, captured from the dev
// server). Shots are 1600×1000 (16:10 — what cards and rows show); the project
// detail hero crops the same image to 21:9 from the top. The landing page is also
// captured at 1200×630 as public/og.png, the social-preview image referenced from
// index.html.
//
//   1. Start the backend (port 8420) and `npm start` (port 4222).
//   2. npm run shots                       all projects
//      npm run shots -- --only tesseraapp  one project
//      npm run shots -- --skip-og          projects only
//   Environment: API_URL (default http://localhost:8420), SELF_URL (default
//   http://localhost:4222), CHROME (path to the browser).
//
// After capturing, reference the files from the project's `imageUrls` in
// backend/…/repository/InMemoryProjectRepository.java as "shots/<id>-1.png" etc.
// (no leading slash, so the <base href> of a GitHub Pages sub-path still works).
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
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
const chrome = findChrome();
let failures = 0;

withProfile((profile) => {
  for (const project of projects) {
    const config = PAGES[project.id] ?? { paths: ['/'] };
    const base = (config.base ?? project.url)?.replace(/\/$/, '');
    if (!base) {
      console.log(`- ${project.id}: no live URL, skipped`);
      continue;
    }
    config.paths.forEach((path, i) => {
      const out = resolve(OUT_DIR, `${project.id}-${i + 1}.png`);
      const url = base + path;
      const status = runChrome(chrome, profile, [
        `--window-size=${SIZE.width},${SIZE.height}`, `--screenshot=${out}`, url,
      ], 15000);
      const ok = status === 0 && existsSync(out);
      if (!ok) failures++;
      console.log(`${ok ? '✓' : '✗'} ${project.id}-${i + 1}.png  ← ${url}`);
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

if (failures) {
  console.error(`${failures} capture(s) failed.`);
  process.exit(1);
}
