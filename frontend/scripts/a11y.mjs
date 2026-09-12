// Runs axe-core over every page state the site can be in and fails on any
// WCAG 2.0/2.1 A or AA violation — the level docs/UI-DESIGN.md → "Accessibility"
// commits to. Static analysis cannot see contrast, focus order or a live region,
// so this drives a real Chrome the same way resume-pdf.mjs and screenshots.mjs do.
//
// Two ways to point it at a page, matching resume-pdf.mjs:
//
//   1. Local, against the dev server (`npm start` on port 4222 + the backend on
//      port 8420 already running):
//        npm run a11y
//
//   2. Against a finished `ng build`, no servers needed — every route is already
//      static HTML, so this spins up a throwaway static server on the build output:
//        BUILD_DIR=dist/frontend/browser BASE_HREF=/Resume/ npm run a11y
//
// Every route is audited in **both themes**: the palettes are different colours,
// so a contrast failure can exist in one and not the other, and only one of them
// is ever on screen at a time.
//
// Best-practice rules are reported but never fail the run: they are advisory by
// design, and some are static heuristics that can disagree with what the browser
// actually exposes. Read them, decide, don't obey them blindly — when one looks
// wrong, check Chrome's own accessibility tree (`page.accessibility.snapshot()`)
// before changing markup to satisfy a linter.
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import puppeteer from 'puppeteer-core';
import { findChrome, withProfile } from './chrome.mjs';
import { serveStatic } from './static-server.mjs';

const axePath = createRequire(import.meta.url).resolve('axe-core/axe.min.js');
const chrome = findChrome();
const basePath = (process.env.BASE_HREF ?? '/').replace(/\/?$/, '/');
const server = process.env.BUILD_DIR ? await serveStatic(resolve(process.env.BUILD_DIR), basePath) : null;
const origin = server ? `http://127.0.0.1:${server.port}${basePath}` : 'http://localhost:4222/';

/**
 * The page states worth auditing: every route, plus the landing page in each of
 * its three layouts and under each filter axis. A filtered or searched landing
 * page is a different DOM from an unfiltered one — it grows a `role="status"`
 * summary and can render an empty state — so auditing only `/` would miss them.
 */
const STATES = [
  '',
  '?layout=gallery',
  '?layout=dossier',
  '?tech=Angular',
  '?q=api',
  '?tech=Angular&q=api',
  '?q=nothing-matches-this',
  '?layout=gallery&q=nothing-matches-this',
  '?layout=dossier&q=nothing-matches-this',
  'resume',
  'projects/tesseraapp',
  'projects/websitehub',
  'terms',
  'privacy',
  'no-such-page',
];

/** WCAG 2.0/2.1 A and AA — the tags a violation must carry to fail the run. */
const FAILING_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

async function audit(profile) {
  const browser = await puppeteer.launch({
    executablePath: chrome,
    headless: true,
    userDataDir: profile,
    args: ['--disable-gpu', ...(process.env.CI ? ['--no-sandbox', '--disable-dev-shm-usage'] : [])],
  });
  const failures = [];
  const advisories = [];
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    for (const theme of ['dark', 'light']) {
      for (const state of STATES) {
        const url = origin + state;
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
        // The theme is read from localStorage before first paint, so set it and
        // mirror it onto the attribute the stylesheet keys off rather than
        // reloading the page a second time.
        await page.evaluate((t) => {
          try {
            localStorage.setItem('theme', t);
          } catch {
            /* private mode — the attribute below is what actually matters here */
          }
          document.documentElement.setAttribute('data-theme', t);
        }, theme);
        await page.addScriptTag({ path: axePath });
        const { violations } = await page.evaluate(() =>
          window.axe.run(document, {
            runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] },
          }),
        );
        for (const v of violations) {
          const entry = {
            where: `${theme} /${state}`,
            id: v.id,
            impact: v.impact,
            help: v.help,
            nodes: v.nodes.map((n) => n.target.join(' ')),
          };
          (v.tags.some((t) => FAILING_TAGS.includes(t)) ? failures : advisories).push(entry);
        }
        process.stdout.write(violations.length ? '!' : '.');
      }
    }
  } finally {
    await browser.close();
  }
  return { failures, advisories };
}

function report(title, entries) {
  if (!entries.length) return;
  console.log(`\n${title}`);
  for (const e of entries) {
    console.log(`  [${e.impact}] ${e.id} — ${e.help}`);
    console.log(`      on ${e.where}: ${e.nodes.slice(0, 3).join(', ')}${e.nodes.length > 3 ? ` (+${e.nodes.length - 3} more)` : ''}`);
  }
}

try {
  const { failures, advisories } = await withProfile(audit);
  console.log(`\naxe-core over ${STATES.length} page states x 2 themes`);
  report('Best practice (advisory, does not fail the run):', advisories);
  report('WCAG 2.x A/AA violations:', failures);
  if (failures.length) {
    console.error(`\n${failures.length} WCAG A/AA violation(s).`);
    process.exitCode = 1;
  } else {
    console.log('\nNo WCAG 2.x A/AA violations.');
  }
} finally {
  server?.close();
}
