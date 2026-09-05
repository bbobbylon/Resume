// Regenerates public/resume.pdf from the running dev server's /resume page using
// headless Chrome and the app's print stylesheet (see @media print in
// src/styles.css and pages/resume/resume.css).
//
//   1. Start the backend (port 8420) and `npm start` (port 4222).
//   2. npm run resume:pdf            (or: CHROME="/path/to/chrome" npm run resume:pdf)
//
// Uses a throwaway Chrome profile so a cached stylesheet can't produce a stale PDF.
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { findChrome, runChrome, withProfile } from './chrome.mjs';

const chrome = findChrome();
const url = process.env.RESUME_URL ?? 'http://localhost:4222/resume';
const out = resolve('public/resume.pdf');

withProfile((profile) => {
  const status = runChrome(chrome, profile, ['--no-pdf-header-footer', `--print-to-pdf=${out}`, url]);
  if (status !== 0 || !existsSync(out)) {
    console.error(`Chrome exited with ${status}; is the dev server running at ${url}?`);
    process.exit(1);
  }
  console.log(`Wrote ${out}`);
});
