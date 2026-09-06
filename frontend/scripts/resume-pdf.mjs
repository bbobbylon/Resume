// Regenerates resume.pdf from a rendered /resume page using headless Chrome and
// the app's print stylesheet (see @media print in src/styles.css and
// pages/resume/resume.css). Two ways to point it at a page:
//
//   1. Local, against the dev server (`npm start` on port 4222 + the backend on
//      port 8420 already running):
//        npm run resume:pdf
//
//   2. Against a finished `ng build`, no servers needed — every route is
//      already static HTML, so this spins up a throwaway static server on the
//      build output itself (used by deploy-pages.yml so the PDF can never lag
//      the seed data it was built from):
//        BUILD_DIR=dist/frontend/browser BASE_HREF=/Resume/ npm run resume:pdf
//
// Uses a throwaway Chrome profile so a cached stylesheet can't produce a stale
// PDF, and (in BUILD_DIR mode) a throwaway server so the build's base href
// resolves its absolute asset URLs the same way GitHub Pages would.
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { findChrome, runChrome, withProfile } from './chrome.mjs';
import { serveStatic } from './static-server.mjs';

const chrome = findChrome();
const out = resolve(process.env.RESUME_OUT ?? 'public/resume.pdf');
const basePath = (process.env.BASE_HREF ?? '/').replace(/\/?$/, '/');
const server = process.env.BUILD_DIR ? await serveStatic(resolve(process.env.BUILD_DIR), basePath) : null;
const url = process.env.RESUME_URL ?? (server ? `http://127.0.0.1:${server.port}${basePath}resume` : 'http://localhost:4222/resume');

withProfile((profile) => {
  const status = runChrome(chrome, profile, ['--no-pdf-header-footer', `--print-to-pdf=${out}`, url]);
  server?.close();
  if (status !== 0 || !existsSync(out)) {
    console.error(`Chrome exited with ${status}; is the page reachable at ${url}?`);
    process.exit(1);
  }
  console.log(`Wrote ${out}`);
});
