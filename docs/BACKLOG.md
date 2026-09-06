# Backlog — WebsiteHub

Living list of what is next, what is open, and what was decided. Newest decisions at
the top of each section. Dates are when the item was added. See
[DEPLOYMENT.md](DEPLOYMENT.md) §3 for the go-live runbook (the owner's one-time steps).

## Owner's asks

- [ ] **Every push must go green, no exceptions** (2026-09-06, restated): "Each
  deployment must not have errors — I am talking about GitHub Actions. Many times I
  am getting failed CI/CD or deployment notices, so let's clean that up and make
  sure each time a push is made, it's not affecting [things negatively]." A standing
  requirement, not a one-off ask (first raised 2026-09-05 — see the Dependabot
  npm-grouping fix and the reverted headless-Chrome PDF step below). Checked
  2026-09-06: this repo's last 15 `main`-branch runs and all 8 open Dependabot PRs
  are currently green — no active failures here right now — but treat this as the
  bar for every future CI change: verify a real push goes green (not just a local
  test) before calling any CI-touching work done, and default new steps to
  best-effort/non-blocking until proven reliable.
- [x] **CI/CD pre-configured for the chosen hosting route** (2026-09-04). GitHub Actions
  are in place for the decided route — GitHub Pages (frontend) + Render (API):
  `ci.yml` builds and tests both halves on every push/PR, `deploy-pages.yml`
  publishes the frontend, `render.yaml` is the Render Blueprint. Nothing runs until
  the repo is pushed (§3 of DEPLOYMENT.md). If the route ever changes (e.g. Cloud
  Run, DEPLOYMENT.md §7), the workflows are where to change it.

## Open — needs the owner

- [x] Push the repo (2026-09-04) and create the Render service — live as
  `bobs-resume` at `https://bobs-resume.onrender.com`.
- [x] Enable Pages (2026-09-05): `Settings → Pages → Source: GitHub Actions` — the
  workflow's own `configure-pages --enablement` can't do this on a repo's first
  deploy (needs repo-admin rights the default `GITHUB_TOKEN` doesn't have), so it
  needed the one-time manual flip. Confirm the next `deploy-pages` run goes green at
  `https://bbobbylon.github.io/Resume/`.
- [x] Two more repos brought live (2026-09-05): `angular-concepts`
  (`AngularDevelopment`, an Angular 21 learning curriculum) and `dev-learning-hub`
  (`OOPFundamentals`, a 515-visualizer learning hub for Java/Spring Boot/Angular/
  TypeScript/Python) — both added to `InMemoryProjectRepository` with real
  screenshots (`npm run shots -- --only angular-concepts,dev-learning-hub`). Note:
  `OOPFundamentals` 404s on the public GitHub API, so it's likely a private repo —
  its "Source on GitHub" link may 404 for visitors until it's made public.
- [ ] Bring the other repos onto Render the same way (Dockerfile + `render.yaml`,
  free web service) and flip each project's entry to `LIVE` with its URL.
  - [ ] **Luv2Shop** (`AngularECommerceAppv2`, local `AngularlnewEcommerce`) is
    prepped (2026-09-05): CORS made configurable (`ALLOWED_ORIGIN` env var,
    `SecurityConfig`/`MyDataRestConfig`/5 controllers), `server.port=${PORT:8543}`,
    `render.yaml` (Docker web service, health check `/api/products`, MySQL
    datasource as Render secrets), `.github/workflows/deploy-pages.yml` (plain
    CSR Angular, no prerendering needed), `environment.prod.ts` pointed at
    `https://luv2shop-api.onrender.com/api`, and `docs/DEPLOYMENT.md` (full
    runbook) — all added on branch `BranchDivergeFix`, uncommitted, alongside
    an unrelated in-flight port-bump WIP already on that branch (needs owner
    review before committing/merging). Still needs: merge to `main` (or point
    Render at `BranchDivergeFix`), an Aiven MySQL free-tier database (Render
    has no free managed MySQL), and the Render service itself created from
    the Blueprint. Okta/Stripe stay inert (by design) until real accounts are
    added later — not required to go live.
  - [ ] **Dev Hub** (`dev-hub`, local `devhub/repo`) is prepped (2026-09-05) —
    no Render needed, it's a plain client-rendered Vite 8 + React 19 app
    (`app/`, no backend). Note: this repo's entry in `InMemoryProjectRepository`
    is stale — it describes a "static learn-to-code site" but the repo has
    since grown into a real Vite/React/TypeScript app (Claude Design handoff,
    persistence, spaced repetition, a11y/responsive/interaction audits via
    Playwright) with its own `DEPLOYMENT.md` at the repo root now. Changes:
    `vite.config.ts` base path + `main.tsx` router `basename` for the Pages
    sub-path (`/dev-hub/`), `@types/node` devDependency (needed for `tsc -b`
    to check `vite.config.ts`), `.github/workflows/deploy-pages.yml`. This
    repo's working tree was clean (no stray WIP) and its default GitHub
    branch is **`master`**, not `main` (a stale, never-updated local `main`
    also exists — not what's deployed) — the workflow triggers on `master`.
    All uncommitted, not yet pushed. Once live: update this repo's `url` →
    `LIVE` + the Pages URL, `npm run shots -- --only dev-hub`, and refresh its
    description here to match what the app actually is now.
  - [x] **`fullstack-starter` entry removed** (2026-09-05), not deployed. It
    turned out to describe the exact same codebase as the `tesseraapp` entry
    (`angularSpringBootFullStack`'s own `package.json` is named
    `tessera-e2e` — it's TesseraApp's actual source, backend at the repo
    root + Angular frontend in `tesseraapp/`, not a separate template).
    Deploying it to Render would have stood up a third, redundant copy of an
    already-live production CIAM platform. `InMemoryProjectRepository`,
    README.md updated; all backend (13) and frontend (43) tests still pass.
    Left as-is per the owner: `tesseraapp`'s listed infra string ("AWS ECS
    Fargate · CloudFront · Aiven MySQL") is now stale too — production moved
    to Google Cloud Run the same day (2026-09-05, per that repo's
    `aws/README.md`) — but updating it wasn't asked for this pass.
- [x] Content flags resolved (2026-09-06): work e-mail swapped to the personal
  address, phone number swapped to a new public number (both were live under the
  old values), the placeholder LinkedIn link removed entirely rather than ship a
  fake slug (re-add once a real vanity URL exists), and TesseraApp's repo link now
  points at `github.com/bbobbylon/angularSpringBootFullStack` instead of the bare
  GitHub profile. Backend tests still pass (13/13).
- [x] Default landing layout decided (2026-09-06): Ledger stays the default after
  reviewing screenshots of all three (Ledger/Gallery/Dossier) with corrected contact
  info. No code change needed — `landingLayout` in `frontend/src/environments/` was
  already `'ledger'`. `?layout=` still keeps all three reviewable.
- [ ] Buy a domain (optional; DEPLOYMENT.md §8) and set `PAGES_CNAME`.

## Done

- 2026-09-06 — `resume.pdf` regeneration wired into `deploy-pages.yml`, take two.
  `scripts/resume-pdf.mjs` now drives Chrome over the DevTools protocol via
  `puppeteer-core` instead of the CLI `--print-to-pdf` flag that reliably hung for
  the entire timeout in CI (see the 2026-09-05 dead end below): `page.goto(...,
  { waitUntil: 'networkidle0' })` replaces the fixed `--virtual-time-budget`, and
  PDF capture goes through the same `Page.printToPDF` CDP method via a
  well-exercised library path rather than Chrome's single-shot CLI mode.
  `chrome.mjs`'s `withProfile` now awaits an async callback before deleting the
  throwaway profile (it previously assumed a synchronous `runChrome` call, which
  would have deleted the profile out from under a still-running async browser).
  Verified locally end-to-end against a real `--base-href /Resume/` build (valid
  2-page PDF, correct content streams, `#43/43` frontend tests and `13/13` backend
  tests still pass) before wiring into the workflow. Kept best-effort in CI (a
  60s hard timeout backstops it; failure logs a `::warning::` and keeps the
  previous `resume.pdf` rather than failing the deploy) — confirm the next real
  push actually regenerates it before treating this as fully proven, per the
  "every push must go green" standing requirement above.
- 2026-09-05 — `resume:pdf` (`scripts/resume-pdf.mjs`) can now regenerate the PDF
  from a finished `ng build` instead of requiring the dev server: point it at
  `BUILD_DIR=dist/frontend/browser BASE_HREF=/Resume/` and it spins up a
  throwaway static server (`scripts/static-server.mjs`) over the build output —
  the `/resume` route is already static HTML by build time, so no live server is
  needed. Verified locally end-to-end (correct two-page PDF, real seed data).
  Not yet wired into CI — see "Next up".
- 2026-09-05 — Tablet-width hero skeleton: measured the real breakpoint where the
  Ledger hero's heading drops from 3 wrapped lines to 2 (viewport ≳614px, up to the
  existing 880px cutoff) and hid the skeleton's third bar (`.sk-h1.short`) in that
  range so the loading state matches the loaded content's line count instead of
  overshooting by one line.
- 2026-09-05 — Live-status dots on the landing cards: `LiveStatus` gained a
  `compact` input (dot only, label moved to `title`/`aria-label`) and now probes
  lazily behind an `IntersectionObserver` — a dot only fires its `no-cors` fetch
  once it scrolls into view, and only once, so a landing with many projects
  doesn't fire one request per card on every visit. Wired into Ledger's title
  row, Gallery's featured card and grid cards, and Dossier's status column.
  Environments without `IntersectionObserver` (jsdom in tests) probe immediately;
  tests stub `fetch` so this never hits the network in CI.
- 2026-09-05 — Shared-element hero transition: every `app-project-image` that shows
  a project's first screenshot (landing cards/rows and the detail hero) now carries
  `[viewTransitionName]="'shot-' + project.id"`, bound to `view-transition-name` on
  its `.frame`. Combined with the router's existing `withViewTransitions`, opening a
  project morphs its card image into the detail hero instead of cross-fading the
  whole page (Dossier has no card imagery, so it still gets a plain fade). Skipped
  automatically under reduced motion via the existing global check.
- 2026-09-05 — Light theme toggle: `data-theme` on `<html>` over the Nocturne tokens
  (`:root[data-theme="light"]` in `styles.css`), a pre-paint script in `index.html`
  (saved choice → OS preference → dark, no flash on prerendered pages),
  `services/theme.ts` + a sun/moon `theme-toggle` in the nav and the Dossier aside.
  A toggle is saved to `localStorage`; an OS preference keeps following the system.
  Verified in both themes across all three landings, resume and project detail.
- 2026-09-04 — Live-status dot on project pages (browser-side `no-cors` probe of the
  live URL, `LiveStatus`) and cross-fade route transitions (skipped under reduced motion).
- 2026-09-04 — Per-page title/description/Open Graph tags with a social JPEG per
  project (`PageMeta`), self-hosted Inter, WebP screenshots with `srcset` and priority
  hints, `sitemap.xml` generated from the prerendered routes. Lighthouse mobile
  99 / 100 / 96 / 100, 200 kB transferred, no third-party requests.
- 2026-09-04 — Workflows run the backend (composite `actions/start-backend`) so CI and
  the Pages deploy prerender real data and fail if they cannot; the deploy stamps the
  site URL into html/js and ships the client shell as `404.html`.
- 2026-09-04 — Prerendering: every route is rendered to static HTML at build time
  (`outputMode: static`), hydrated in the browser, live API data layered on top.
- 2026-09-04 — API hardening (gzip, weak ETag/304, Cache-Control), OpenAPI at `/docs`,
  not-found page, JSON-LD, Dependabot, hero skeletons sized to the loaded content.
- 2026-09-04 — Hosting decided: GitHub Pages + Render free tier + build-time data.
