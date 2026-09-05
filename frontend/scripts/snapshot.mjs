// Writes public/data/{profile,projects,resume}.json from a running backend.
//
// The app serves these when the live API errors or takes too long (see
// src/app/services/api.ts): on Render's free tier the API sleeps after 15 min idle
// and needs about a minute to wake. The Pages workflow runs this against a freshly
// built backend on every deploy, so the snapshot always matches the seed data in
// the same commit — which is also why public/data/ is git-ignored.
//
//   npm run snapshot                      (API_URL defaults to http://localhost:8420)
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const API_URL = (process.env.API_URL ?? 'http://localhost:8420').replace(/\/$/, '');
const OUT_DIR = resolve('public/data');
mkdirSync(OUT_DIR, { recursive: true });

for (const name of ['profile', 'projects', 'resume']) {
  const response = await fetch(`${API_URL}/api/${name}`).catch(() => null);
  if (!response?.ok) {
    console.error(`✗ ${name}: ${response ? `HTTP ${response.status}` : 'no response'} from ${API_URL}`);
    process.exit(1);
  }
  const out = resolve(OUT_DIR, `${name}.json`);
  writeFileSync(out, JSON.stringify(await response.json(), null, 2) + '\n');
  console.log(`✓ ${name}.json  ← ${API_URL}/api/${name}`);
}
