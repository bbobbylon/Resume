// Shared helpers for the headless-Chrome scripts (resume-pdf.mjs, screenshots.mjs).
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/** Locates a Chrome/Chromium binary: `$CHROME` first, then the usual install paths. */
export function findChrome() {
  const candidates = [
    process.env.CHROME,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean);
  const chrome = candidates.find((p) => existsSync(p));
  if (!chrome) {
    console.error('Chrome not found. Set CHROME=/path/to/chrome and retry.');
    process.exit(1);
  }
  return chrome;
}

/**
 * Runs `fn(profileDir)` with a throwaway Chrome profile and deletes it afterwards.
 * A fresh profile matters: Chrome's default profile caches the dev server's
 * stylesheet, which silently produces stale PDFs and screenshots after CSS edits.
 */
export function withProfile(fn) {
  const profile = mkdtempSync(join(tmpdir(), 'websitehub-chrome-'));
  try {
    return fn(profile);
  } finally {
    rmSync(profile, { recursive: true, force: true });
  }
}

/**
 * Runs Chrome headless once with the given args and returns its exit status
 * (`null` if it had to be killed for running past `timeoutMs`, rather than hanging the
 * caller forever). `--virtual-time-budget` lets the Angular app finish rendering (and
 * its API calls settle) before the page is captured.
 *
 * In CI (`$CI`, set by GitHub Actions), also passes `--no-sandbox` and
 * `--disable-dev-shm-usage` — without them Chrome's renderer segfaults on the
 * runner (no user namespaces for the SUID sandbox, and a too-small `/dev/shm`).
 * Every URL this runs against is either localhost or a project's own public
 * deploy, never arbitrary content, so the reduced sandboxing is an acceptable
 * trade-off; local runs keep the full sandbox.
 */
export function runChrome(chrome, profile, args, budgetMs = 12000, timeoutMs = 90000) {
  const ciArgs = process.env.CI ? ['--no-sandbox', '--disable-dev-shm-usage'] : [];
  const result = spawnSync(chrome, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', ...ciArgs,
    `--user-data-dir=${profile}`, `--virtual-time-budget=${budgetMs}`,
    ...args,
  ], { stdio: 'inherit', timeout: timeoutMs });
  if (result.error) console.error(`Chrome did not finish within ${timeoutMs}ms: ${result.error.message}`);
  return result.status;
}
