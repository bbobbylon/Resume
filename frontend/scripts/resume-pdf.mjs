// Regenerates resume.pdf from a rendered /resume page using the app's print
// stylesheet (see @media print in src/styles.css and pages/resume/resume.css).
// Drives Chrome over the DevTools protocol via puppeteer-core rather than the
// `--print-to-pdf` CLI flag: that flag reliably hung for the entire timeout when
// combined with `--virtual-time-budget` under `--headless=new` on GitHub Actions'
// Ubuntu runner (see docs/BACKLOG.md), regardless of budget size or what the page
// itself was waiting on. Puppeteer waits for the network to go idle instead of a
// fixed virtual-time budget, and calls the same `Page.printToPDF` CDP method
// through a well-exercised code path rather than Chrome's single-shot CLI mode.
//
// Two ways to point it at a page:
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
import puppeteer from 'puppeteer-core';
import { findChrome, withProfile } from './chrome.mjs';
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
// instead of actually waiting on it.
const hostResolverArgs = server ? ['--host-resolver-rules=MAP * 127.0.0.1'] : [];
// Without these, Chrome's renderer segfaults on the Actions runner (no user
// namespaces for the SUID sandbox, and a too-small /dev/shm). Every URL this runs
// against is either localhost or a project's own public deploy, never arbitrary
// content, so the reduced sandboxing is an acceptable trade-off; local runs keep
// the full sandbox.
const ciArgs = process.env.CI ? ['--no-sandbox', '--disable-dev-shm-usage'] : [];

async function capture(profile) {
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: true,
    userDataDir: profile,
    args: ['--disable-gpu', '--hide-scrollbars', ...ciArgs, ...hostResolverArgs],
  });
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.emulateMediaType('print');
    // preferCSSPageSize honors the app's own `@page` rule (Letter, 14mm margins —
    // see docs/UI-DESIGN.md's print section) instead of Puppeteer's A4 default.
    await page.pdf({ path: out, printBackground: true, displayHeaderFooter: false, preferCSSPageSize: true });
  } finally {
    await browser.close();
  }
}

try {
  await withProfile(capture);
} catch (err) {
  console.error(`PDF capture failed: ${err.message}\nIs the page reachable at ${url}?`);
  process.exitCode = 1;
} finally {
  server?.close();
}

if (!process.exitCode && existsSync(out)) {
  console.log(`Wrote ${out}`);
} else {
  process.exitCode = 1;
}
