# Backlog — WebsiteHub

Living list of what is next, what is open, and what was decided. Newest decisions at
the top of each section. Dates are when the item was added. See
[DEPLOYMENT.md](DEPLOYMENT.md) §3 for the go-live runbook (the owner's one-time steps).

## Owner's asks

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
- [ ] Decide whether the phone number and work e-mail in `InMemoryProfileRepository`
  should be public (they will be, once pushed).
- [ ] Real LinkedIn URL (placeholder today) and TesseraApp's repo URL (points at the
  GitHub profile until the repo is public).
- [ ] Pick the default landing layout (`landingLayout` in `frontend/src/environments/`);
  `?layout=` keeps all three reviewable. Ledger is the current default.
- [ ] Buy a domain (optional; DEPLOYMENT.md §8) and set `PAGES_CNAME`.

## Next up (no accounts needed)

- [ ] Regenerate `resume.pdf` in the Pages workflow, take two. `scripts/resume-pdf.mjs`
  now supports pointing headless Chrome at a finished build (`BUILD_DIR=…`, see
  below) and that works locally, but wiring it into `deploy-pages.yml` was tried
  and reverted (2026-09-05): Chrome's `--print-to-pdf` reliably hung for the
  entire timeout on the Actions runner specifically when combined with
  `--virtual-time-budget` under `--headless=new` — ruled out as the cause, in
  order: the sandbox (fixed separately, still hung), a live-API network wait
  (blocked entirely via `--host-resolver-rules`, still hung), the virtual-time
  budget size (shrunk to 4s, still hung — always for the *entire* timeout
  regardless of its length, e.g. exactly 60s then exactly 90s, never partway),
  and the build's base-href path serving (verified byte-correct with `curl`
  against the exact `/Resume/` prefix CI uses). That pattern points at a known
  Chromium flakiness in the `--print-to-pdf`/`--virtual-time-budget` combo under
  the new headless mode rather than anything in this app. A real fix likely
  needs driving Chrome over the DevTools protocol directly (e.g. `puppeteer-core`)
  instead of the CLI flag combo. Kept out of CI rather than leave a step that
  always burns ~90s doing nothing.

## Done

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
