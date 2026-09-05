# Deployment — WebsiteHub

| | |
|---|---|
| **Version** | 0.3.0 |
| **Date** | 2026-09-04 (provider limits verified against vendor docs on this date — re-check before relying on them) |
| **Related** | [ARCHITECTURE.md](ARCHITECTURE.md) · [SRS.md](SRS.md) |

## 0. The decision

**Frontend on GitHub Pages, API on Render's free tier. $0/month, no card on file.**
Decided 2026-09-04; the owner delegated the choice with the brief "whatever is best,
and hopefully free".

Why this pair: the frontend is a static bundle, which GitHub Pages hosts for free
with HTTPS and a custom domain. The API is a small Docker image that answers a
handful of requests a day; Render runs it for free without a card. Render's catch is
that a free service sleeps after 15 minutes idle and takes about a minute to wake.
The repo covers that with a **deploy-time snapshot of the API data**: every Pages
deploy builds the backend, captures `/api/profile`, `/api/projects` and
`/api/resume` into `public/data/*.json`, and the app requests the snapshot and the
live API together, shows whichever answers first and lets the live response replace
the snapshot (`frontend/src/app/services/api.ts`). A visitor who arrives while the
API is asleep sees the complete site in well under a second; the API wakes in the
background and answers the next requests. The snapshot is regenerated from the same commit's seed
data on every deploy, so it cannot drift.

Google Cloud Run (§7) stays documented as the alternative if a card on file and
faster wake-ups are ever preferred — switching is a redeploy plus one repo variable.

## 1. Provider comparison (free tiers, Sept 2026)

| Provider | Free tier | Sleeps? | Card? | Custom domain | Verdict for WebsiteHub |
|----------|-----------|---------|-------|---------------|------------------------|
| **GitHub Pages** | 1 GB site, 100 GB/mo soft bandwidth, public repo | No | No | Yes (+ HTTPS) | **Frontend — chosen** |
| Cloudflare Pages | Unlimited bandwidth, 500 builds/mo | No | No | Yes | Frontend alternative if Pages bandwidth ever matters |
| **Render** (web service) | 750 instance-hours/mo per workspace, 512 MB | Sleeps after 15 min idle, ≈ 1 min wake | No | Yes | **API — chosen**; the snapshot fallback hides the wake-up |
| Google Cloud Run | 2M requests, 180k vCPU-s, 360k GiB-s per month | Scale-to-zero, cold start ≈ 2–5 s for this jar | **Yes** | Yes | API alternative (faster wake, needs a card) |
| Koyeb | 1 service, 0.1 vCPU / 512 MB | Sleeps after 1 h idle | No | Yes | Similar to Render; less battle-tested |
| Oracle Cloud Always Free | 2 OCPU / 12 GB ARM VM (halved June 2026) | Always on | Yes (identity check) | You manage DNS/TLS | Always-on but capacity errors are common and idle VMs get reclaimed; more ops than this site needs |
| Fly.io | No free tier (pay-as-you-go, ≈ $5/mo minimum) | Configurable | Yes | Yes | Out of budget |
| Aiven / TiDB Serverless | Free MySQL (1 GB / 5 GB) | Aiven powers off when idle | No | n/a | Only needed if a database is added later |

Numbers worth remembering: Render's 750 hours means **one** always-awake service per
workspace, which is exactly what this repo deploys.

## 2. Environments and configuration

| Setting | Where | Local | Production |
|---------|-------|-------|------------|
| API base URL | `frontend/src/environments/environment*.ts` → `apiBaseUrl` | `http://localhost:8420` | `https://bobs-resume.onrender.com`, the live service (Render derives the URL from the service name, `bobs-resume` in `render.yaml`). If the service is ever recreated under another name, set repo variable `API_BASE_URL` instead of editing the file — the Pages workflow substitutes it |
| Live API timeout | same files → `apiTimeoutMs` (the snapshot stays on screen if the API takes longer) | 4000 | 4000 |
| Landing layout | same files → `landingLayout` | `ledger` | owner's choice; `?layout=` still overrides |
| Allowed CORS origins | env var `ALLOWED_ORIGIN` (comma-separated), set in `render.yaml` | `http://localhost:4222` | `https://bbobbylon.github.io`; append `,https://bobbylon.dev` when the domain exists |
| API port | env var `PORT` | 8420 | injected by Render |
| JVM flags | env var `JAVA_TOOL_OPTIONS`, set in `render.yaml` | — | C1-only JIT, SerialGC, 70 % of the 512 MB for heap |
| Pages base href | repo variable `PAGES_BASE_HREF` | — | `/` with a custom domain, `/Resume/` (default) on `bbobbylon.github.io/Resume` |
| Pages custom domain | repo variable `PAGES_CNAME` | — | e.g. `bobbylon.dev` |
| Site URL in SEO files | placeholder `https://bobbylon.dev` (`environment.siteUrl`, `index.html`, `robots.txt`, the generated `sitemap.xml`) | left as-is | stamped by the Pages workflow into every `*.html`, `*.js`, `robots.txt` and `sitemap.xml`: `https://<PAGES_CNAME>`, else `https://bbobbylon.github.io/Resume` |
| API data snapshot | `frontend/public/data/*.json` (git-ignored) | `npm run snapshot` with the backend running | captured by the Pages workflow on every deploy |

No secrets exist. If any are added, use GitHub Actions secrets / Render environment
settings — never the repo.

## 3. Go-live runbook (what is left, in order)

Each step is a one-time action that needs the owner's own accounts; the repo is
ready for all of them.

1. **Push the repo.** The remote `github.com/bbobbylon/Resume` already exists and is
   empty. From the repo root:

   ```bash
   git add -A
   git commit -m "WebsiteHub: Angular 21 + Spring Boot 4.1 portfolio hub"
   git push -u origin main
   ```

   The repo must be public for free GitHub Pages. Everything in the seed data becomes
   public with it — currently that includes the phone number and the Deloitte e-mail
   in `InMemoryProfileRepository`; remove anything that should stay private first.
   The push runs `ci.yml` (build + tests, both halves) and `deploy-pages.yml`.

2. **Check Pages is on.** The workflow asks GitHub to enable Pages for the repo by
   itself (`actions/configure-pages` with `enablement: true`). If the deploy job
   fails with a Pages-not-enabled error instead: repo → Settings → Pages → Build and
   deployment → Source: **GitHub Actions**, then Actions → "Deploy frontend to GitHub
   Pages" → Run workflow. The site comes up at `https://bbobbylon.github.io/Resume/`,
   rendering from the snapshot until the API exists.

3. **Create the API on Render.** ✅ Done 2026-09-04, by hand: New → Web Service →
   `bbobbylon/Resume`, name `bobs-resume`, runtime Docker, root directory `backend`,
   Free instance, env vars `ALLOWED_ORIGIN=https://bbobbylon.github.io` and the
   `JAVA_TOOL_OPTIONS` from `render.yaml`, health check `/actuator/health`,
   auto-deploy on commit. Live at `https://bobs-resume.onrender.com` (verified:
   `/actuator/health` 200, `/api/projects` answers with CORS for the Pages origin).
   `render.yaml` mirrors these settings for a rebuild in a fresh workspace. The
   Render deploy hook and outbound IPs are not used by anything — keep the hook
   private.

4. **Connect the two.** ✅ Nothing to set: `apiBaseUrl` in `environment.ts` is the
   live URL, so the next push builds the frontend against it. The repo variable
   `API_BASE_URL` is only for a service recreated under another name.

5. **Smoke test** on the live site: `/`, `/resume`, `/projects/tesseraapp`,
   `/projects/nope` (not-found state), `/any/typo` (not-found page), the Download
   PDF button, `https://bobs-resume.onrender.com/docs` (Swagger UI), and

   ```bash
   curl https://bobs-resume.onrender.com/actuator/health    # first call may take ~1 min
   ```

   In the browser dev tools, a fresh visit after the API slept should show
   `[api] … unavailable — showing the deploy-time snapshot` warnings and full
   content anyway, instantly.

6. **Custom domain (optional, ≈ $10/yr):** §8. Then set `PAGES_CNAME`,
   `PAGES_BASE_HREF=/`, append the domain to `ALLOWED_ORIGIN` in `render.yaml`, push.

## 4. CI (already in place)

`.github/workflows/ci.yml` runs on push/PR to `main` and on demand:
backend `mvn -B verify` (13 tests) + Docker image build; frontend `npm ci`,
`npm test -- --watch=false` (37 tests), then the backend is started (composite
action `.github/actions/start-backend`: build the jar, run it, wait for
`/actuator/health`) and `npm run build` prerenders every route against it — the
job fails if no `/projects/<id>` page came out. CI never deploys.

## 5. Frontend on GitHub Pages (what the deploy workflow does)

`.github/workflows/deploy-pages.yml` runs on every push to `main` that touches
`frontend/**` or `backend/src/main/**` (seed-data edits change the snapshot), and on
demand. Steps: enable Pages if needed → start the backend (the same composite action
CI uses) → `npm run snapshot` → substitute `API_BASE_URL` into `environment.ts` if
the variable is set → `npm run build -- --base-href …`, which prerenders every route
against the local backend and writes `sitemap.xml` (fails if no project page was
prerendered) → stop the backend → stamp the site URL into every `*.html`, `*.js`,
`robots.txt` and `sitemap.xml` (replacing the `https://bobbylon.dev` placeholder) →
copy the client shell `index.csr.html` to `404.html` (known deep links such as
`/projects/tesseraapp` are real files; unknown ones boot the SPA and reach the
not-found page) → write `CNAME` → deploy.

Without a custom domain the site lives at `https://bbobbylon.github.io/Resume/`
(base href `/Resume/`, the workflow default).

## 6. API on Render (chosen)

`render.yaml` describes the backend as a Docker web service on the free plan with
`/actuator/health` as the health check, `ALLOWED_ORIGIN` pointed at the Pages origin,
and JVM flags sized for the 512 MB container. Render redeploys it on every push to
`main` (Blueprint auto-deploy).

Known free-tier behaviour: the service sleeps after 15 minutes idle and needs about
a minute to wake; the snapshot fallback (§0) keeps the site whole meanwhile. Free
Postgres (if ever added) expires after 30 days — use Aiven or TiDB for a free
database instead.

**Rollback:** Render → service → Events/Deploys → "Rollback" on the previous deploy.
Frontend rollback: re-run the Pages workflow from the previous commit (Actions →
run → "Re-run all jobs"), or revert and push.

## 7. API on Google Cloud Run (alternative, card required)

Free tier covers this API many times over; set a **$1 budget alert** at creation so
nothing surprises you.

```bash
# once: install gcloud, then
gcloud auth login
gcloud projects create websitehub-<something> && gcloud config set project websitehub-<something>
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com

# each deploy (from the repo root) — builds the Dockerfile in the cloud, no local Docker needed
gcloud run deploy websitehub-api \
  --source backend \
  --region us-west1 \
  --allow-unauthenticated \
  --min-instances 0 --max-instances 1 \
  --memory 512Mi --cpu 1 \
  --set-env-vars ALLOWED_ORIGIN=https://bbobbylon.github.io,https://bobbylon.dev
```

Then set the repo variable `API_BASE_URL` to the printed service URL and re-run the
Pages workflow. To map `api.bobbylon.dev`: Cloud Run → Manage custom domains → add
the CNAME it gives you at your DNS provider.

**Rollback:** `gcloud run services update-traffic websitehub-api --to-revisions
<previous-revision>=100` (Cloud Run keeps every revision).

## 8. Domain and subdomain plan

Buy one domain at Cloudflare Registrar or Porkbun (`.dev` or `.com`, ≈ $10–13/yr;
`.dev` forces HTTPS, which suits this site). Suggested layout:

| Host | Points at |
|------|-----------|
| `bobbylon.dev` (apex) + `www` | GitHub Pages (A/AAAA records per GitHub docs, `CNAME www → bbobbylon.github.io`) |
| `api.bobbylon.dev` | Render custom domain (free plan supports it) |
| `hub.bobbylon.dev`, `shop.bobbylon.dev`, … | one subdomain per project as each goes live (free on every host above) |

TesseraApp already owns `tesseraapp.dev`; it stays where it is.

## 9. Local run and verification

```bash
# backend
cd backend && mvn -B verify && java -jar target/websitehub-backend-0.1.0.jar     # :8420
# frontend
cd frontend && npm ci && npm test -- --watch=false && npm start                  # :4222
# or both at once from the repo root (Git Bash)
./run.sh
```

Check: `http://localhost:4222/?layout=ledger|gallery|dossier`, `/resume`,
`/projects/tesseraapp`, `/projects/nope` (not-found state), and
`curl localhost:8420/actuator/health`.

To see the production path locally: with the backend running, `npm run snapshot` and
`npm run build` (the build prerenders against `prerenderApiBaseUrl`, the local
backend), then serve `dist/frontend/browser` with a gzip-capable static server
(`npx serve -l 4334 dist/frontend/browser`) — the build points at the Render URL,
which fails or times out, and every page is already complete from its prerendered
HTML (`data/*.json` covers a page that was not prerendered). Verified this way on
2026-09-04: Lighthouse mobile 99 / 100 / 96 / 100, 200 kB transferred.

## 10. Regenerating the resume PDF, screenshots and snapshot

`frontend/public/resume.pdf` is printed from the live `/resume` page (print
stylesheet, Letter, 14 mm margins). With the backend and dev server running:

```bash
cd frontend && npm run resume:pdf        # needs Chrome; override with CHROME=/path/to/chrome
```

Commit the new PDF alongside the content change that motivated it.

Project screenshots — `frontend/public/shots/<id>-<n>.webp` (1600×1000), the
`-800.webp` variant for `srcset`, and `<id>-social.jpg` (1200×630) for the page's
social preview — and the landing preview (`public/og.png`, 1200×630) come from the
same setup (sharp encodes the WebP/JPEG):

```bash
cd frontend && npm run shots                     # every project with a live URL, + og.png
cd frontend && npm run shots -- --only tesseraapp
```

Extra pages per project (and the dev-server base for WebsiteHub itself) are listed
in `scripts/screenshots.mjs`; new files are referenced from `imageUrls` in
`InMemoryProjectRepository`. Restart `ng serve` after adding files under `public/`
— the dev server only indexes assets at start-up.

The API snapshot (`public/data/*.json`) is `npm run snapshot` with the backend
running. It is git-ignored: the Pages workflow regenerates it on every deploy.

The sitemap is not a file to edit: `npm run build` writes
`dist/frontend/browser/sitemap.xml` from the routes it prerendered
(`scripts/sitemap.mjs`, the `postbuild` hook), so a new project is listed as soon as
the API returns it.

## 11. Release checklist

- [ ] `mvn -B verify` and `npm test -- --watch=false` green locally.
- [ ] `ALLOWED_ORIGIN` in `render.yaml` lists every production frontend origin; `API_BASE_URL` set if the Render URL differs from the placeholder.
- [ ] `landingLayout` set to the chosen layout.
- [ ] `resume.pdf` regenerated if resume content changed; `npm run shots` re-run if a project's UI changed.
- [ ] The build log's `prerendered:` line lists every project id in `InMemoryProjectRepository` (`sitemap.xml` follows from it).
- [ ] Push to `main` → CI green → Pages deploy green → Render deploy green → smoke-test the five pages on the real domain, once with the API awake and once after it slept.

## 12. Cost flags outside this repo

- TesseraApp on AWS ECS Fargate + ALB + CloudFront typically costs on the order of
  $25/month. Moving it to Render or Cloud Run (same Docker image) would bring it
  under a free tier if that ever matters.
- Nothing in WebsiteHub itself can incur charges on the plan above: neither GitHub
  Pages nor Render's free plan has a card to bill.
