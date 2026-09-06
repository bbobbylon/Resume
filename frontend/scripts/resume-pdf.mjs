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
// In BUILD_DIR mode the page's data is already correct (baked in at build time), so
// the client's live re-fetch of the real API is pure downside here: it only adds the
// chance of blocking on a real, possibly cold-starting network round-trip for no
// benefit. Route every hostname except loopback nowhere so that fetch fails instantly
// instead of actually waiting on it, and shrink the virtual-time budget to match —
// nothing left running that needs the full budget the live-API case wants.
const offlineArgs = server ? ['--host-resolver-rules=MAP * 127.0.0.1'] : [];
const budgetMs = server ? 4000 : 12000;

withProfile((profile) => {
  const status = runChrome(chrome, profile, [...offlineArgs, '--no-pdf-header-footer', `--print-to-pdf=${out}`, url], budgetMs);
  server?.close();
  if (status !== 0 || !existsSync(out)) {
    console.error(`Chrome exited with ${status}; is the page reachable at ${url}?`);
    process.exit(1);
  }
  console.log(`Wrote ${out}`);
});
