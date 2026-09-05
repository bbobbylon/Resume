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
- [ ] Confirm the Pages deploy is green and the site answers at
  `https://bbobbylon.github.io/Resume/` (DEPLOYMENT.md §3 step 2); then push the
  prerendered frontend so it talks to the live API.
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

- [ ] Light theme toggle (`prefers-color-scheme` + a switch in the nav); the print
  palette already proves the tokens flip cleanly.
- [ ] Live-status dots on the landing cards too (kept to the detail page for now so
  the landing does not fire one request per project on every visit).
- [ ] Tablet-width hero skeleton (700–880 px) is one heading line taller than the
  loaded hero; harmless, but could mirror the tagline wrap there too.
- [ ] Regenerate `resume.pdf` in the Pages workflow so it can never lag the seed data.
- [ ] Give the detail hero a `view-transition-name` so opening a project morphs the
  card image into the hero instead of cross-fading the whole page.

## Done

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
