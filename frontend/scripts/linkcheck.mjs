// Checks every link this portfolio advertises, from outside a browser — the one
// vantage point where the truth is actually visible.
//
// The dot in the UI (src/app/shared/live-status) probes from the visitor's browser
// with a `no-cors` fetch, so what comes back is opaque: it separates "the host
// answered" from "the host did not", and knows nothing else. A project whose server
// returns 503 *answers*, so the dot reads "Responding" while a visitor who clicks
// through lands on an error page. Node is not bound by the same-origin policy and
// sees the real status code, so this is the check that can catch a dead link before
// a recruiter does.
//
//   npm run linkcheck                                   (the deployed site)
//   SITE=http://localhost:4222/ npm run linkcheck       (the dev server)
//   BUILD_DIR=dist/frontend/browser npm run linkcheck   (a finished build)
//
// The failing/advisory split follows a11y.mjs: a link the site presents as working
// and which does not work fails the run; anything short of that is printed and left
// to a human. A Render free-tier service that is merely asleep answers *slowly*
// rather than badly, so every target gets a second chance after a pause before it
// counts as down — without that, one cold start would cry wolf.
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const SITE = (process.env.SITE ?? 'https://bbobbylon.github.io/Resume/').replace(/\/?$/, '/');
const BUILD_DIR = process.env.BUILD_DIR ? resolve(process.env.BUILD_DIR) : null;
const TIMEOUT_MS = Number(process.env.TIMEOUT_MS ?? 30000);
const RETRY_PAUSE_MS = 3000;
const CONCURRENCY = 6;
// Default Node has no User-Agent at all, and a few CDNs answer 403 to that.
const USER_AGENT = 'websitehub-linkcheck (+https://github.com/bbobbylon/Resume)';

/**
 * Loads one of the catalogue files the app serves, from wherever this run points:
 * a build directory on disk, or over HTTP from the dev server or the deployed site.
 *
 * @param {string} name `projects` or `profile`
 */
async function catalogue(name) {
  if (BUILD_DIR) return JSON.parse(await readFile(resolve(BUILD_DIR, 'data', `${name}.json`), 'utf8'));
  const response = await fetch(`${SITE}data/${name}.json`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) throw new Error(`${SITE}data/${name}.json answered HTTP ${response.status}`);
  return response.json();
}

/**
 * Every outbound link the site puts in front of a visitor, with the severity a
 * failure carries.
 *
 * `required` marks a link the site actively claims works: a project it labels LIVE,
 * the repository behind any project's "Code" button, a social profile in the header.
 * A project that is not LIVE still renders its link if it has one, but a WIP demo
 * being down is information, not a defect — those stay advisory.
 */
async function targets() {
  const [projects, profile] = await Promise.all([catalogue('projects'), catalogue('profile')]);
  const out = [];
  for (const project of projects) {
    if (project.url) out.push({ url: project.url, what: `${project.id} live site`, required: project.status === 'LIVE' });
    if (project.repoUrl) out.push({ url: project.repoUrl, what: `${project.id} repo`, required: true });
  }
  for (const link of profile.socialLinks ?? []) {
    out.push({ url: link.url, what: `profile: ${link.platform}`, required: true });
  }
  return out;
}

/**
 * One request. Never throws: a refused connection, a bad certificate and a timeout
 * are all results, and the caller decides what they mean.
 *
 * @returns {Promise<{status: number, ms: number, note: string|null}>} `status` 0 means
 *          the host never answered at all
 */
async function probe(url) {
  const started = Date.now();
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { 'user-agent': USER_AGENT },
    });
    await response.body?.cancel(); // we only wanted the status line
    const landed = response.url.replace(/\/$/, '') !== url.replace(/\/$/, '') ? `→ ${response.url}` : null;
    return { status: response.status, ms: Date.now() - started, note: landed };
  } catch (error) {
    const timedOut = error?.name === 'TimeoutError' || error?.name === 'AbortError';
    return { status: 0, ms: Date.now() - started, note: timedOut ? `no answer in ${TIMEOUT_MS / 1000}s` : (error?.cause?.code ?? error?.message ?? String(error)) };
  }
}

/**
 * Probes one target, retrying a failure once. The retry is what keeps a sleeping
 * free-tier service from reading as a dead one: Render holds the connection open
 * while it wakes, so a cold start shows up as a slow 200, and a genuinely suspended
 * service answers 5xx instantly both times.
 */
async function check(target) {
  let result = await probe(target.url);
  if (result.status < 200 || result.status >= 400) {
    await new Promise((r) => setTimeout(r, RETRY_PAUSE_MS));
    const retry = await probe(target.url);
    result = { ...retry, note: [retry.note, 'after one retry'].filter(Boolean).join(', ') };
  }
  return { ...target, ...result, ok: result.status >= 200 && result.status < 400 };
}

/** Runs `check` over every target, a few at a time, preserving input order. */
async function checkAll(list) {
  const results = new Array(list.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, list.length) }, async () => {
      while (next < list.length) {
        const index = next++;
        results[index] = await check(list[index]);
        process.stdout.write(results[index].ok ? '.' : '!');
      }
    }),
  );
  return results;
}

const list = await targets();
console.log(`Checking ${list.length} advertised links from ${BUILD_DIR ?? SITE}`);
const results = await checkAll(list);

console.log('\n');
for (const r of results) {
  const status = r.status === 0 ? '---' : String(r.status);
  console.log(`  ${r.ok ? '✓' : '✗'} ${status}  ${String(r.ms).padStart(5)}ms  ${r.what}  ${r.url}${r.note ? `  (${r.note})` : ''}`);
}

const broken = results.filter((r) => !r.ok && r.required);
const advisories = results.filter((r) => !r.ok && !r.required);
const slow = results.filter((r) => r.ok && r.ms > 10000);

if (advisories.length) {
  console.log('\nNot answering, but the site does not claim they do (advisory):');
  for (const r of advisories) console.log(`  ${r.what} — ${r.url}`);
}
if (slow.length) {
  console.log('\nAnswered, but slowly — probably a free tier waking up (advisory):');
  for (const r of slow) console.log(`  ${r.what} — ${Math.round(r.ms / 1000)}s`);
}

if (broken.length) {
  console.error(`\n${broken.length} advertised link(s) not working:`);
  for (const r of broken) console.error(`  ${r.what} — ${r.url} — ${r.status === 0 ? r.note : `HTTP ${r.status}`}`);
  console.error('\nA visitor clicking these gets an error page. Fix the service, or change the project\'s status in the backend catalogue so the site stops advertising it.');
  process.exitCode = 1;
} else {
  console.log('\nEvery advertised link works.');
}
