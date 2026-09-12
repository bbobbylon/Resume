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

- [x] **Every file, method and variable carries a doc comment, and one concise
  map of the whole app** (2026-09-07, owner's ask): "make sure all the
  methods/variables, everything, is documented in comments in the code as well as an
  overall concise doc(s) for the app. Need to make sure each file is explained
  thoroughly, and how it relates to other files in the project, and how it relates to
  the project overall." Baseline measured the day it was asked: every class already
  carries a thorough header comment, but **209 declarations had no doc comment of
  their own** (29 backend — injected fields, constructors, `@Override` bodies; 180
  frontend — model interface fields, signals, computeds, inputs, private helpers).
  The standard for this repo is not "what it is" but "how it relates": each comment
  should say what the thing is for and which other file depends on it. `docs/CODE-MAP.md`
  is the concise whole-app doc that ask calls for — one entry per file, what it does,
  and what it talks to. **Done 2026-09-07**: backend 29 → 0, frontend 180 → 0 real gaps
  (the 10 the audit still prints are entries inside already-documented object literals),
  and `docs/CODE-MAP.md` is written and cross-linked from the README and the other four
  docs. Keep it current: a new file means a new row, and the two rules in its §8 are
  what a reviewer should check a change against.

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
  - [x] **Dev Hub is LIVE** (2026-09-06) at `https://bbobbylon.github.io/dev-hub/`.
    No Render needed — it's a plain client-rendered Vite 8 + React 19 app
    (`app/`, no backend). Pushed `implement-design-handoff` and fast-forwarded
    `master` (this repo's real default branch) to it. The first Pages run
    failed at `configure-pages` exactly as the Resume repo's did (the workflow
    token can't create a Pages site on a first deploy); the owner flipped
    `Settings → Pages → Source: GitHub Actions` and the re-run went green
    end-to-end (run 34060825135, attempt 2). Smoke-tested: `/` is 200; deep
    links like `/cli-basics` return a 404 status but serve the built shell
    (the `404.html` SPA fallback), so the app loads on them. The
    `InMemoryProjectRepository` entry was rewritten from the stale "static
    learn-to-code site" placeholder to what the app actually is (24 page
    archetypes, localStorage progress + SM-2 spaced repetition, Playwright
    audits, React 19/TypeScript/Vite), flipped to `LIVE` with three
    screenshots (`npm run shots -- --only dev-hub`: gallery, CLI Basics,
    Algorithm Visualizer).
  - [x] **`fullstack-starter` entry removed** (2026-09-05), not deployed. It
    turned out to describe the exact same codebase as the `tesseraapp` entry
    (`angularSpringBootFullStack`'s own `package.json` is named
    `tessera-e2e` — it's TesseraApp's actual source, backend at the repo
    root + Angular frontend in `tesseraapp/`, not a separate template).
    Deploying it to Render would have stood up a third, redundant copy of an
    already-live production CIAM platform. `InMemoryProjectRepository`,
    README.md updated; all backend (13) and frontend (43) tests still pass.
    **Correction (2026-09-07):** the note here that `tesseraapp`'s infra
    string ("AWS ECS Fargate · CloudFront · Aiven MySQL") had gone stale was
    itself wrong. That repo's workflow comments say production moved to Cloud
    Run on 2026-09-05, but its `aws/README.md` banner (2026-09-06) says the
    move is "decided, not executed", and `curl -I https://tesseraapp.dev`
    answers 200 through CloudFront (`Via: … cloudfront.net`, `X-Amz-Cf-Pop`).
    AWS is still what serves the site, so the string stays. What *was* stale
    is fixed below.
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
- [ ] Buy a domain and set `PAGES_CNAME` — **deferred (2026-09-06)**: staying on the
  free URLs (`bbobbylon.github.io/Resume` + `bobs-resume.onrender.com`) for now.
  Optional; DEPLOYMENT.md §8 has the steps whenever it's revisited.

## Done

- 2026-09-11 — Switching landing layout no longer throws away the visitor's filters.
  The README has promised since the search shipped that the three landing params
  combine — `/?layout=gallery&tech=Angular&q=api` is a valid, shareable view — and
  they do, if you type them yourself. `LayoutSwitcher`'s links did not: they set
  `[queryParams]="{ layout: l.id }"` with no `queryParamsHandling`, and Angular's
  default **replaces** the whole query string. Confirmed in a real browser from
  `/?tech=Angular&q=api`: the three hrefs read `/?layout=ledger|gallery|dossier` — the
  other params were not even in the link, so copying one lost them too — and clicking
  Gallery landed on `/?layout=gallery` with the search box empty and the filter gone.
  `TechFilter`'s chips have always merged, which is what makes this an inconsistency
  rather than a design choice: a layout switch changes *how* the projects are shown,
  never *which*. Added `queryParamsHandling="merge"` and a test pinning the exact
  hrefs (116 tests). Verified: the links now read
  `/?tech=Angular&q=api&layout=gallery`, and the switch keeps both the box and the
  one matching card.

- 2026-09-11 — The Ctrl+K palette's highlight can no longer end up somewhere the
  visitor cannot see. The palette moves a *virtual* cursor — `aria-activedescendant`
  on the search input, which never loses real focus — and that is what lets the focus
  trap be a one-line `Tab` swallow. The cost, which had not been paid: a browser only
  scrolls for the element it is actually focusing, so nothing scrolled the list. The
  panel is capped at `60vh` with `.cp-results { overflow-y: auto }`, so on a 600 px-tall
  window the eleven rows (two pages, six projects, two legal pages, one action) are
  475 px of content in a 308 px box — and ArrowUp from the first row, which wraps to
  the last, highlighted a row four rows below the fold. Fixed with an
  `afterRenderEffect` that calls `scrollIntoView({ block: 'nearest' })` on the active
  row. Verified in a real browser at 1100×600: ArrowUp now scrolls the list to 159 and
  "Toggle theme" is inside the viewport; three ArrowDowns wrap back and scroll to 8.
  One new test (115 total); jsdom implements no `scrollIntoView` at all, so the spec
  installs one and asserts which row was scrolled to.

  Also corrected a false claim in `app.routes.ts`: GitHub Pages serves **404.html**,
  not index.html, for a path it has no file for. The fallback works — the deploy
  workflow has been copying `index.csr.html` to `404.html` all along, and
  `/Resume/projects/does-not-exist` was confirmed live to return the app shell with a
  404 status — but the comment described a mechanism that does not exist, which is the
  kind of thing that gets "simplified" away later. The eager-import rationale in the
  same comment was rewritten too: the real reason is that a lazy chunk would delay
  hydration of an already-painted prerendered page, not that round-trips are
  expensive.

- 2026-09-11 — The performance budget is real now, and one dependency was fiction.
  The SRS promised "≤ 400 kB raw initial JS (currently ~370 kB)"; a fresh measurement
  says **415.15 kB raw / 106.43 kB transferred**, and nothing enforced the ceiling —
  `angular.json` carried the CLI's default 500 kB warning / 1 MB error, so the app
  could have doubled without a single build complaining. Budgets are now
  `maximumWarning: 440kB` / `maximumError: 500kB`: roughly 25 kB of headroom before it
  nags and 85 kB before `ng build` fails, which is enough for ordinary feature work
  and not nearly enough to smuggle in a charting library. A breakdown of the bundle
  (`ng build --stats-json`) shows why there is nothing to cut: ~295 kB is the Angular
  runtime (`core` 150, `router` 79, `common` 32, `rxjs` 21, `platform-browser` 14) and
  all application code together is ~100 kB. Lazy routes were reconsidered and rejected
  again for a written-down reason: every route is prerendered, so a lazy chunk would
  delay *hydration* of a page whose HTML has already arrived. Separately,
  `@angular/forms` was in `package.json` and imported by nothing — an `ng new` default
  that never got used. Removed: the bundle is unchanged (it was already tree-shaken
  out), but `npm ci` installs one less package and Dependabot has one less thing to
  open PRs about. Build and 114 tests green after both changes.

- 2026-09-11 — Two real bugs in the `?q=` search, found by driving the running app in
  a headless browser rather than by reading the code, and both about history rather
  than matching:
  1. **Back left the site.** The first search called `router.navigate` with
     `replaceUrl: true`, so `/` → `/?q=jwt` consumed the only history entry the visit
     had: `history.length` stayed at 2 and Back went to `about:blank`. `search()` now
     pushes when `?q=` is *not* already on the URL and replaces only when it is, so the
     first search is a step you can take back and refining one still doesn't stack an
     entry per pause. Verified: `history.length` 2 → 3, Back lands on `/`; typing
     "angular" across three separate pauses is still one entry, and one Back clears it.
  2. **Clicking a project inside the debounce window bounced you back out of it.**
     `ProjectFilter` is root-provided, so a pending 200 ms timer outlived the search
     box that scheduled it — type "tess", click the TesseraApp card immediately, and a
     moment later the navigation fired and returned you to `/?q=tess`. `ProjectSearch`
     now cancels that write from `DestroyRef.onDestroy` via a new
     `ProjectFilter.cancelSearch()`. Verified: the click sticks.

  Plus a third, smaller one: typing a character and deleting it inside one debounce
  window used to navigate to the URL the browser was already on, duplicating the
  current history entry for nothing — `search()` now returns early when an empty box
  matches an empty `?q=`. Five new tests cover the three cases and the two that
  encoded the old behaviour were rewritten (114 frontend tests across 24 files, 13
  backend). SRS FR-31, CODE-MAP, UI-DESIGN, the README's "Using the site" table and
  the class doc comments all described the pre-fix behaviour and now state the rule
  they implement: **Back means return to the unfiltered list**.

- 2026-09-11 — WebsiteHub lists itself as `LIVE`, and `npm start` actually works. Two
  things the doc pass turned up by checking claims against reality:
  1. **The site advertised itself as `WIP` with no live URL** while a visitor was
     looking at it — the `websitehub` entry had never been flipped after the site went
     up on 2026-09-05. Now `LIVE` at `https://bbobbylon.github.io/Resume/`, with
     `hosting` "GitHub Pages · Render (Docker)" (it was `null`), `delivery` widened
     from "GitHub Actions CI" to "GitHub Actions · automated Pages deploy", and the
     case study's outcome restated to what actually shipped (prerendered static site,
     free-tier Docker API, deploy-time snapshot covering the wake-up). Five of six
     entries are now live; only Luv2Shop is `WIP`. Verified on the real detail page:
     the Live tag, the "Open bbobbylon.github.io" button, and the `LiveStatus` probe
     answering "Up now" against the deployed site.
  2. **`npm start` served on 4200, but CORS only allows 4222** — so following the
     README's own instructions gave you a dev session where every API call came back
     `403` (confirmed by curling both origins). Everything else in the repo agreed on
     4222 — `run.sh` (which passes `--port 4222` explicitly, which is why nobody
     noticed), `docker-compose.yml`'s `ALLOWED_ORIGIN`, and the backend's own default
     — only bare `ng serve` disagreed. Fixed at the source: `angular.json`'s `serve`
     target now sets `"port": 4222`, so `ng serve`, `npm start` and `run.sh` all land
     on the same port as the CORS whitelist.
  Also re-captured this project's screenshots and `og.png`, which dated to 2026-09-04
  and predated five shipped features — the card and social preview were showing a
  version of the site that no longer exists. The new ones carry the layout switcher,
  the ⌘K trigger, the theme toggle, the GitHub activity strip (with its "+4 more"
  disclosure) and the search box + chip row. 110 frontend and 13 backend tests green.

- 2026-09-11 — Doc refresh over the whole set, after checking every claim against the
  code. The two most recent features had reached **no** doc at all: `?q=` search and
  the PWA manifest/icons are now in SRS (FR-31, FR-32, a recruiter user story, the
  §2 feature list), ARCHITECTURE (the tree, plus two new patterns — "the URL is the
  view state" and "query params apply only after hydration", which was previously
  only a footnote in §8 of CODE-MAP), UI-DESIGN (a `ProjectSearch` row, a rewritten
  `TechFilter`/`GithubActivity` row, a search user flow, an a11y bullet), CODE-MAP
  (rows for the new component, spec and script; the `?tech=`/`?q=` asymmetry written
  down) and the README. Stale numbers fixed everywhere: the test count was quoted as
  37 in two places and 76 in another (really 110 across 24 files). DEPLOYMENT gained
  the `resume.pdf` regeneration step in §5 (it has been in `deploy-pages.yml` since
  2026-09-06 and was documented nowhere), the build-directory form of `resume:pdf`,
  an `npm run icons` section, `?tech=`/`?q=` in both the local and live smoke tests,
  and two new release-checklist lines (privacy-page rule, and the owner's
  green-push rule). Its §3 runbook is relabelled from "what is left" to the rebuild
  recipe, with steps 1–2 marked done and the first-deploy Pages gotcha written down
  as something to expect on every new repo. README gained two sections the repo never
  had: **Using the site** (every feature, its keyboard/URL affordance, and what it
  does *not* do) and **Scripts** (all seven `npm run` targets and when to run each).
  Two claims were corrected rather than copied forward: "a visit makes no third-party
  request" has been false since the GitHub activity strip shipped, and installability
  was overstated — with no service worker there is no Chrome install prompt, only
  Add to Home Screen, and both docs now say so.

- 2026-09-11 — Free-text project search, a GitHub activity history disclosure, and
  PWA installability. A new `ProjectSearch` (`app-project-search`) sits next to
  `TechFilter`'s chip row in all three landing layouts and writes `?q=` through
  `ProjectFilter.search()`, debounced 200ms so a fast typist produces one navigation
  per pause instead of one per keystroke; the input itself stays a dumb
  `[value]`/`(input)` binding onto `filter.queryText()`, so it also follows the URL
  on a Back/Forward through search history or a deep link like `/?q=angular`.
  `ProjectFilter` now filters on two independent axes — the existing `?tech=` and
  the new `?q=` — a project must satisfy whichever are set; `?q=` matches a
  project's name, tagline, or any tech-stack entry, case-insensitive. `TechFilter`'s
  result-summary line ("Showing N of M projects…") now keys off the new
  `filter.active()` instead of `filter.selected()`, so it appears for a search with
  no tech chip too, and composes both ("built with Angular matching \"api\"") when
  they're both active. All three layouts gained a "No projects match your search."
  empty state, distinct from the existing "no projects yet" one — Gallery also
  suppresses its dashed placeholder slots under it, same as it already does for an
  active tech filter. Same commit, unrelated but shipped together: `GithubActivity`
  now keeps up to 5 recognized events instead of 1 — the newest stays the
  always-visible badge, the rest sit behind a "+N more" disclosure that closes on
  an outside click or Escape (`compact` mode never renders it — there's no room for
  a second control in a sidebar dot). And the site is now installable:
  `manifest.webmanifest`, three PNG icons (192/512/maskable-512) and
  `apple-touch-icon.png`, generated by a new `npm run icons` (`scripts/icons.mjs`,
  a Nocturne "b" monogram rendered via `sharp` since no separate logo asset
  exists) and linked from `index.html`. Not a service worker — the site stays a
  plain static page, just offers a real icon instead of a screenshot thumbnail on
  "Add to Home Screen". Frontend gained 34 new tests (110/110 total, up from 76);
  backend unaffected (13/13, no backend files touched). Verified: a real `npm test`
  run confirms 110/110 green, the push went green end-to-end on both workflows
  (`CI` run 34576131490, `Deploy frontend to GitHub Pages` run 34576131516), and a
  post-deploy spot check confirms `bbobbylon.github.io/Resume/` and its
  `manifest.webmanifest` both 200, and the Render API still answers
  `/api/projects`.

- 2026-09-07 — Keyboard bypass block and one real `<main>` per route. The first Tab on
  any page now reveals a "Skip to content" link that moves *focus* (not just scroll)
  into `<main id="main" tabindex="-1">`; the project detail page had no `<main>` at all
  before this and now does. The link lives in `App` rather than `Nav`, since Dossier
  renders no `Nav`. Verified with real keypresses in headless Chrome across all six
  page types: first Tab lands on the link, it is on-screen, Enter puts focus on
  `main#main`, one `<main>` per page, and no `#main` left in the URL.

- 2026-09-07 — Project pages now carry schema.org JSON-LD in their prerendered HTML:
  the project as `SoftwareSourceCode` (repository, stack as `programmingLanguage`, the
  live deployment as `targetProduct`, hero screenshot) plus a `BreadcrumbList`, built
  from the same `Project` the page renders so the two cannot drift. `PageMeta` owns the
  block — one per page, replaced on navigation and removed when a page sets none — and
  the deploy's existing origin substitution already covers the URLs inside it (it seds
  every `*.html`/`*.js`), so no workflow change was needed. Confirmed in the built
  `projects/tesseraapp/index.html`.

- 2026-09-07 — A project detail page's Stack tags are now links to the landing page
  filtered to that technology (`/?tech=Angular%2021#projects`), which closes the loop
  the `?tech=` filter opened: from one project you can reach its siblings without
  going back to the hub and hunting for the chip. Family matching means the versioned
  spelling on the tag ("Angular 21") still selects the whole family. Verified in
  headless Chrome against a full 10-route prerender: the click lands on the filtered
  landing page showing 5 of 6 projects, with the Angular chip marked current.

- 2026-09-07 — Terms of Use (`/terms`) and Privacy Policy (`/privacy`), and the footer
  reshaped to the owner's preferred pattern (© line + one-line privacy note, both legal
  links, "Contact" set apart underneath; Ledger's compact variant keeps the © and the
  links, Dossier's inline `.foot` gained the same two). Both pages are prerendered, so
  the sitemap went from 2 to 4 URLs, and both are in the command palette — below the
  projects, since an empty query should surface the work, not the policies. The privacy
  text is deliberately a description of the code, not boilerplate: it names the one
  `localStorage` key (`theme`) and the four hosts a visitor's browser contacts (Pages,
  the API on Render, `api.github.com` for the activity line, and each project's own site
  when its status dot scrolls into view). **Adding any new outbound request means editing
  `privacy.html` in the same commit** — that rule is now in CODE-MAP's "where to change
  what" table and in SRS FR-27. Not legal advice; the owner should read both pages and
  say if anything overstates or understates what they want to promise.

- 2026-09-07 — Doc pass over the whole codebase, and `docs/CODE-MAP.md` written.
  Every declaration in `backend/src/main/java` and `frontend/src` now carries a comment
  saying what it is for and which other file depends on it (209 gaps closed), and the
  code map indexes all ~150 tracked source files by area, with a "where to change what"
  table and the two invariants that are easy to break (the Java↔TypeScript model
  contract, and the prerender/hydration rule). 76 frontend tests and 13 backend tests
  still green afterwards.

- 2026-09-07 — TesseraApp's "Azure CI/CD" claim corrected to "GitHub Actions"
  (4 places in `InMemoryProjectRepository`: tech stack, the "Hardened by default"
  highlight, the `delivery` meta line and the case study's outcome; 2 more in
  `InMemoryResumeRepository`'s TesseraApp resume project). Checked against the
  repo itself: delivery runs from `.github/workflows/` (`ci.yml`, `deploy.yml`
  → ECR/ECS, `deploy-gcp.yml`), and the `azure-pipelines.yml` still in the tree
  was last touched 2026-08-07 — legacy, not the pipeline that ships it. The
  Deloitte experience entry's own "Azure CI/CD" skill is untouched: that is the
  owner's actual job history, not a claim about this project. Backend 13/13.
- 2026-09-07 — Filter the landing by technology. A chip row (`TechFilter`) in
  each layout's Projects section lists "All" plus every technology family used by
  two or more projects, with counts; each chip is a link that sets `?tech=`, so a
  filtered view is shareable, survives Back, and merges with `?layout=` instead of
  dropping it. `ProjectFilter` (root service) holds the state and the matching, and
  all three layouts now read their project list from it instead of `ProjectService`.
  Three decisions worth remembering: (1) matching is by **family** — a trailing
  version is stripped, so `?tech=Angular` also matches `Angular 21` and
  `Spring Boot 4.1`, while `React Router` stays its own family rather than folding
  into `React 19`; (2) a `?tech=` no project uses shows **everything**, the same
  forgiving rule `Landing` applies to an unknown `?layout=`, so no layout ever needs
  a "nothing matched" state; (3) the param is honoured only **after hydration** —
  `/` is prerendered with no query string, so filtering during the first render would
  hand the browser markup that disagrees with the HTML it is adopting (the
  `afterNextRender` pattern `LiveStatus` and `GithubActivity` already use). Chips link
  with `fragment="projects"` so a click doesn't bounce the visitor to the top of the
  page, and Gallery's dashed "next project" placeholder slots are suppressed while a
  filter is active (a short list is then the filter's doing, not an empty portfolio).
  Frontend gained 17 tests (76/76 total); backend unaffected (13/13). Verified in a
  real `--base-href /Resume/` build served statically and driven with headless Chrome:
  clicked the Angular chip in all three layouts, deep-linked `?tech=MySQL` (2 of 6) and
  `?tech=NotAThing` (falls back to all 6), checked both themes, confirmed Gallery drops
  its placeholder slots under a narrow filter, and confirmed the console carries **no
  hydration mismatch** — only the expected offline-API warnings.
- 2026-09-06 — Layout switcher. The three landing layouts (Ledger/Gallery/Dossier)
  were only reachable by hand-typing `?layout=`; the owner wanted all three
  actually reachable to a visitor, not just reviewable. New `LayoutSwitcher`
  (`app-layout-switcher`) — a centered `.seg` pill reusing the token sheet's
  until-now-unused segmented-control style — renders once above the chosen
  layout (in `Landing`, so it's identical across all three, not duplicated
  into each layout's own header) with a real link to each variant via the
  existing `?layout=` param; the current one gets `aria-current="page"` and
  no `href` change on click. Frontend gained 2 new tests (59/59 total).
  Verified: `ng build --base-href /Resume/`, served the static output
  locally, clicked through all three layouts in both themes — switcher stays
  centered and legible, correctly absent from `/resume` and project detail
  (it's landing-only).
- 2026-09-06 — Command palette (Ctrl+K / Cmd+K). A `CommandPaletteService`
  (just an `open` signal) is shared by `CommandPalette`, the global overlay
  mounted once at the app root, and `CommandPaletteTrigger`, a small
  icon-button opener wired into the nav bar and Dossier's aside header (the
  one layout without a `Nav`). Lists Home, Resume, every project (live from
  `ProjectService`) and a "Toggle theme" action, filtered by substring as the
  visitor types. Follows the ARIA combobox/listbox pattern — the search field
  is the only real focusable element and `aria-activedescendant` tracks the
  highlighted row — so trapping focus is just swallowing Tab; Escape or a
  backdrop click closes it and restores focus to whatever was focused before
  it opened. New `SearchIcon` (Phosphor magnifying-glass, matches
  `ArrowUpRight`'s inline-SVG pattern). Frontend gained 8 new tests (57/57
  total: opening/closing, listing pages+projects+the theme action, substring
  filtering, arrow-key + Enter selection, Escape, backdrop click, the trigger
  button); backend unaffected (13/13). Verified visually in a real `ng build`
  + static serve: opened via the trigger button and via a raw Ctrl+K keydown
  from both the Ledger and Dossier layouts, filtered to a single project,
  navigated to it, ran "Toggle theme" from inside the palette and confirmed
  `data-theme` actually flipped, confirmed Tab keeps focus on the search
  field, and checked the highlighted-row contrast in both themes.
- 2026-09-06 — Live GitHub activity strip on the landing hero. New `GithubActivity`
  component fetches `https://api.github.com/users/bbobbylon/events/public` directly
  from the browser (public, unauthenticated, CORS-enabled — no token, no
  third-party stats-image service) and shows the most recent recognized event
  ("Pushed to Resume · 7m ago") as a link to its repo. Browser-only via
  `afterNextRender` (same pattern as `LiveStatus`), so prerendered and hydrated
  markup never mismatch; renders nothing on a rate limit, network error, or no
  public activity in the last 90 days — a portfolio hero shouldn't show a broken
  widget when GitHub's API hiccups. `:host { display: contents }` so an empty
  render contributes no box to the parent flex layout; wired into all three
  landing layouts (Ledger and Gallery's hero `.actions`, Dossier's aside
  `.contact`) as a genuine flex item so spacing comes from the existing `gap`,
  not a hardcoded margin. Frontend gained 6 new tests (49/49 total) covering
  event selection, unrecognized-event skipping, fetch failure, empty events,
  403 rate-limit, and compact mode; backend unaffected (13/13). Verified against
  the real API (curled `events/public` directly to confirm live activity exists)
  and visually via a real `ng build` + static serve, screenshotted across all
  three layouts. `docs/SRS.md`'s Performance non-functional requirement
  (FR-23) now notes this as a deliberate, best-effort, non-blocking exception to
  the earlier "no third-party host" Lighthouse baseline.
- 2026-09-06 — Deeper case studies on project detail pages. Added a
  `CaseStudy(problem, approach, outcome)` record to `Project`; every one of the
  6 projects now carries one, restated from that project's own already-approved
  tagline, description and highlights — no new facts, technologies or claims
  introduced. Renders as a three-column "Case study" section on
  `/projects/:id`, above the existing numbered "What it does" highlights.
  Backend (13/13) and frontend (43/43) tests updated and pass; verified
  visually in a real `ng build` output (TesseraApp's case study and the
  existing highlights both render correctly, no layout overlap).
- 2026-09-06 — Grouped skills on the resume page. Added a `SkillGroup(category,
  skills)` record; `Resume.skills` is now `List<SkillGroup>` instead of a flat
  `List<String>`. The 15 existing skills (no new claims added) are grouped into
  "Languages & Frameworks", "Identity & Security", "Data & APIs" and
  "Infrastructure & DevOps" — deliberately no fabricated proficiency levels, since
  that would be an unverified claim about the resume owner. `resume.html` renders
  each group with its own sub-label above a `tag-row`, still inside the same
  wrapper `<div>` that is the aside's 3rd child (the print stylesheet's
  `.aside > div:nth-child(3)` selector depends on that position). Backend (13/13)
  and frontend (43/43) tests updated and pass; `resume.pdf` regenerated locally
  from a `--base-href /Resume/` build and confirmed to still produce a valid
  2-page PDF with real text content streams.
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
  previous `resume.pdf` rather than failing the deploy). **Confirmed live**: the
  push (`3a8ea1d`) went green end-to-end (`deploy-pages.yml` run 34033593924, all
  steps succeeded, no `::warning::` emitted), and the deployed
  `bbobbylon.github.io/Resume/resume.pdf` (153 KB) differs byte-for-byte from the
  committed fallback copy (198 KB) — proof the CI step actually regenerated it
  rather than silently falling through to the fallback.
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
