# Code Map — WebsiteHub

| | |
|---|---|
| **Version** | 0.2.3 |
| **Date** | 2026-09-11 |
| **Related** | [ARCHITECTURE.md](ARCHITECTURE.md) · [SRS.md](SRS.md) · [UI-DESIGN.md](UI-DESIGN.md) · [DEPLOYMENT.md](DEPLOYMENT.md) · [BACKLOG.md](BACKLOG.md) |

Every tracked source file, what it does, and what it talks to. ARCHITECTURE.md explains
the *system*; this file is the *inventory* — the page to open when you know what you want
to change but not which file holds it. Each source file also carries its own header
comment saying the same thing in more detail, and every declaration inside it is
documented; this map is the index over those.

## 1. The shape in one paragraph

A visitor loads static HTML from **GitHub Pages** — HTML that `ng build` already rendered
for `/`, `/resume` and every `/projects/:id` (`main.server.ts`). Angular hydrates it, and
each page injects a data service (`ProfileService`, `ProjectService`, `ResumeService`),
each of which asks the single `Api` service for one resource. `Api` emits build-time data
(`TransferState`) or the deploy-time `data/*.json` snapshot immediately, then lets a live
response from the **Spring Boot API on Render** replace it. On the backend the request
walks `Controller → Service → Repository`, and the repositories are in-memory seed
data — so *the portfolio's content lives in three Java files*, not a database.

## 2. Repository root

| File | What it is, and what it talks to |
|---|---|
| `README.md` | Quick start, ports, the `npm run` catalogue. Entry point for a human; points at `docs/`. |
| `run.sh` | One command for local dev: builds and starts the backend (8420) and the Angular dev server (4222), opens the app, and stops both on Ctrl+C. The prerender step needs the backend up, which is why this script exists rather than two terminals. |
| `docker-compose.yml` | Runs the backend image locally the way Render runs it (`ALLOWED_ORIGIN`, `PORT`), for reproducing a deploy problem without deploying. |
| `render.yaml` | Render blueprint for the `bobs-resume` web service: Docker runtime, free plan, health check `/actuator/health`, `ALLOWED_ORIGIN` set to the Pages origin. The deploy hook itself is **never** committed — it lives only in the owner's notes. |
| `.gitignore` | Notably ignores `frontend/public/data/` — the API snapshot is generated at deploy time so it can never drift from the seed data in the same commit. |

## 3. Backend — Spring Boot 4.1 / Java 21 (`backend/`)

Read-only JSON over three endpoints. No database, no auth, no writes: the repositories
hold seed data in memory, which is the whole point — the content is version-controlled
with the code and a free host has nothing to keep awake but a JVM.

### 3.1 Entry point and configuration

| File | Role |
|---|---|
| `pom.xml` | Spring Boot parent, Java 21, `web` + `actuator` + `springdoc`. Deliberately thin: no data-jdbc, no security starter, because there is no database and nothing to protect. |
| `Dockerfile` | Multi-stage build (Maven → JRE) producing the image Render runs; `.dockerignore` keeps `target/` out of the build context. |
| `src/main/resources/application.yml` | Port `${PORT:8420}`, gzip over 1 KB, `app.allowed-origin` (read by `WebConfig`), Swagger UI at `/docs`, and only `health` exposed from actuator. |
| `WebsitehubApplication.java` | `@SpringBootApplication` main class — the only thing Docker's `ENTRYPOINT` runs. |
| `config/WebConfig.java` | CORS (the Pages origin, from `app.allowed-origin`) **and** the HTTP caching policy for `/api/**`: a `ShallowEtagHeaderFilter` bean plus a `WebContentInterceptor` cache-control rule, so a repeat visitor gets 304s instead of payloads. |
| `config/OpenApiConfig.java` | The `OpenAPI` bean — title, version, blurb, contact, license. Everything else springdoc infers from the controllers. |

### 3.2 Controllers — `controller/`

Thin. Each one maps a URL to a service call and returns the record; there is no
request body anywhere, so there is nothing to validate.

| File | Endpoint → what it calls |
|---|---|
| `ProfileController.java` | `GET /api/profile` → `ProfileService`. Feeds the nav, hero, contact block and footer of every page. |
| `ProjectController.java` | `GET /api/projects` and `GET /api/projects/{id}` → `ProjectService`. The frontend only uses the list form; the by-id endpoint exists for API consumers (and is covered by tests) but the SPA looks projects up in the list it already has. |
| `ResumeController.java` | `GET /api/resume` → `ResumeService`. Renders `/resume`, and through that page's print stylesheet, `resume.pdf`. |

### 3.3 Services — `service/`

Interface + `Impl` per resource, so a controller depends on the contract and the
repository swap (in-memory today, a database later) never reaches the web layer.

| File | Role |
|---|---|
| `ProfileService.java` / `ProfileServiceImpl.java` | Contract and delegate for the single profile record. |
| `ProjectService.java` / `ProjectServiceImpl.java` | The list, plus the by-id lookup that translates "absent" into a 404 for the controller. |
| `ResumeService.java` / `ResumeServiceImpl.java` | Contract and delegate for the resume. |

### 3.4 Repositories — `repository/`

**This is where the site's content lives.** Editing a seed list here changes the live
site; nothing else does.

| File | Role |
|---|---|
| `ProfileRepository.java` + `InMemoryProfileRepository.java` | Name, brand, title, tagline, bio, public contact details, social links and Gallery's stat band. |
| `ProjectRepository.java` + `InMemoryProjectRepository.java` | The project catalogue: every field behind the cards, the rows, the detail pages and the case studies. `techStack` here is also what produces the `?tech=` filter chips, so spelling matters (`ProjectFilter` groups `"Angular 21"` under `"Angular"`). |
| `ResumeRepository.java` + `InMemoryResumeRepository.java` | Summary, skill groups, experience, resume projects, education, achievements. Note that the Deloitte experience entries are the owner's real history — unlike the project seed data, they are not editable for presentation reasons. |

### 3.5 Models — `model/`

Java records, serialized straight to JSON. Each has a mirror-image TypeScript interface
in `frontend/src/app/models/`; changing a field name here without changing it there is
the one way to break the contract silently.

| File | Mirrors |
|---|---|
| `Profile.java`, `SocialLink.java`, `Stat.java` | `profile.model.ts` |
| `Project.java`, `ProjectStatus.java`, `Highlight.java`, `CaseStudy.java` | `project.model.ts` |
| `Resume.java`, `Experience.java`, `ResumeProject.java`, `Education.java`, `Achievement.java`, `SkillGroup.java` | `resume.model.ts` |

### 3.6 Backend tests — `src/test/java/`

| File | What it pins down |
|---|---|
| `WebsitehubApplicationTests.java` | The context loads — catches a broken bean wiring before a deploy does. |
| `controller/ProfileControllerTest.java`, `ProjectControllerTest.java`, `ResumeControllerTest.java` | `MockMvc` over each endpoint: status, content type, and the fields the frontend actually reads. `ProjectControllerTest` also covers the 404 for an unknown id. |
| `controller/ApiCachingTest.java` | That `/api/**` answers with an `ETag` and a `Cache-Control` and returns 304 when the client sends the tag back — i.e. that `WebConfig`'s filter and interceptor are still wired. |
| `repository/InMemoryProjectRepositoryTest.java` | Seed-data invariants, so a content edit cannot quietly break a page: ids unique and URL-safe, every LIVE project has a `url` to open, every project has what the detail page needs, exactly one is `featured`, and `findById` matches exactly. |

## 4. Frontend — Angular 21 (`frontend/`)

Standalone components, signals throughout, zoneless. Every component's template and
styles are either inline (small ones) or a `.html` + `.css` pair beside the `.ts`; the
pair is listed once, with the `.ts`.

### 4.1 Bootstrap, routing and rendering

| File | Role |
|---|---|
| `src/main.ts` | Browser entry point: `bootstrapApplication(App, appConfig)`. |
| `src/main.server.ts` | Server entry point. Nothing serves it at runtime — `ng build` runs it once per route to write finished HTML (`outputMode: "static"`). |
| `src/app/app.ts` | Root component: a `RouterOutlet` plus the two pieces of shared shell — the "Skip to content" link and `CommandPalette`. The skip link lives here rather than in `Nav` because Dossier renders no `Nav`, and a bypass link some layouts lack is worse than none; it moves focus into that page's `<main id="main" tabindex="-1">`. Nav and footer are *not* here — each page composes its own. |
| `src/app/app.config.ts` | Browser providers: router (in-memory scrolling + view transitions), `HttpClient` with `fetch`, and `provideClientHydration(withEventReplay())`. |
| `src/app/app.config.server.ts` | The same config merged with `provideServerRendering(withRoutes(serverRoutes))` for the prerender pass. |
| `src/app/app.routes.ts` | `/` → `Landing`, `/resume` → `ResumePage`, `/projects/:id` → `ProjectDetail`, `/terms` → `TermsPage`, `/privacy` → `PrivacyPage`, `**` → `NotFound`. |
| `src/app/app.routes.server.ts` | Which routes get prerendered — `/`, `/resume`, `/terms`, `/privacy`, and one page per project id — fetched from the backend running on localhost during the build. Without a backend the build still succeeds; detail pages just render in the browser instead. |
| `src/index.html` | The shell: fonts, meta/OG defaults, and the pre-paint inline script that applies the saved theme before first paint so a prerendered page never flashes the wrong one (`ThemeService` adopts whatever it set). |
| `src/styles.css` | The Nocturne token sheet — colours, type scale, spacing, the `.tag`/`.btn`/`.nav` primitives every component builds on, and the `@media print` rules that turn `/resume` into the PDF. `:root[data-theme="light"]` redefines the tokens, which is the whole of light mode. |
| `src/environments/environment.ts` | Production config: the Render API URL, the live-request timeout, the localhost URL the prerender step reads, the site origin, the default landing layout, and the GitHub username `GithubActivity` polls. |
| `src/environments/environment.development.ts` | The same keys pointed at `localhost:8420` for `ng serve`. |

### 4.2 Pages — `src/app/pages/`

| File | Role |
|---|---|
| `landing/landing.ts` | The `/` route. Picks one of three interchangeable layouts (`environment.landingLayout`, overridable with `?layout=`; an unknown value falls back rather than erroring), renders `LayoutSwitcher` above it, and sets the site-level page metadata. |
| `landing/ledger/ledger.ts` (+ `.html`, `.css`) | Layout 1a — one numbered row per project, contact section at the foot. |
| `landing/gallery/gallery.ts` (+ `.html`, `.css`) | Layout 1b — featured card, three-column grid, stat band. Owns `emptySlots`, which pads a short grid *except* under an active tech filter, where a short list is the filter's doing. |
| `landing/dossier/dossier.ts` (+ `.html`, `.css`) | Layout 1c — sticky 360px aside (its own brand, links, theme toggle and palette trigger, hence no `Nav`) beside a projects table and an experience column read from `ResumeService`. |
| `project-detail/project-detail.ts` (+ `.html`, `.css`) | `/projects/:id`. Looks the id up in the list `ProjectService` already holds (`switchMap` on the param), renders hero, case study, highlights, meta lines, a Stack list whose tags link back to the landing page filtered to that technology, and a "Next project" teaser, sets per-project meta tags, and shows the not-found block for an unknown id. |
| `resume/resume.ts` (+ `.html`, `.css`) | `/resume`. A `280px │ 1fr` grid: sticky aside (contact, skills, PDF button) beside summary, experience, projects, education and achievements. Its print stylesheet *is* the PDF layout. |
| `legal/terms.ts` (+ `terms.html`) | The `/terms` route: what the site is, content and code ownership, links elsewhere, and fair use of the free public API. |
| `legal/privacy.ts` (+ `privacy.html`) | The `/privacy` route: no accounts, no cookies, no analytics; the one `localStorage` key; and every host the visitor's browser contacts. Its claims are about the code, so a new outbound request means editing this page too. |
| `legal/legal.ts`, `legal/legal.css` | The one `LEGAL_UPDATED` date both pages print, and the prose column both use. |
| `not-found/not-found.ts` | The `**` route. GitHub Pages serves the app for unknown paths, so this is what a typo or a stale link lands on — a real not-found page rather than a silent redirect home. Sets its own meta through `PageMeta`: on a client-side navigation it would otherwise keep the previous page's title, description and canonical, so the tab would name a project while the page said there was nothing there. |

### 4.3 Services — `src/app/services/`

| File | Role |
|---|---|
| `api.ts` | **The one door to the backend.** Decides where data comes from: at build time it GETs the local backend and stores the result in `TransferState`; in the browser it emits that transferred data (or, for a non-prerendered route, the deploy-time `data/*.json` snapshot) at once *and* races a live request against `environment.apiTimeoutMs`, letting a live answer replace the fallback. This is why a sleeping free-tier API never delays a page. |
| `profile.service.ts` | `Api.get('profile')` as a signal. Read by the nav, all three layouts, the resume page and the footer. |
| `project.service.ts` | The catalogue as a signal, fetched once and shared; `getById` looks up that same list, so a sleeping API costs one fallback, not two. |
| `resume.service.ts` | `Api.get('resume')` as a signal. Read by `/resume` and by Dossier's experience column. |
| `project-filter.ts` | Both landing filters, on one signal graph. `?tech=` derives facet chips from every project's `techStack` and matches by *family* (so `Angular` catches `Angular 21` while `React Router` stays separate from `React 19`); `?q=` matches free text against name, tagline and stack. They compose — a project must satisfy whichever are set — and `search()` owns the 200 ms debounce plus the navigation a chip gets for free from `routerLink`. That navigation is where the history rule lives: it **pushes** when `?q=` is not yet on the URL and **replaces** when it is, so Back leads to the unfiltered list rather than off the site, and refining a term does not stack one entry per pause. It also carries `fragment: 'projects'` — not cosmetic: `app.config.ts` turns on `scrollPositionRestoration`, which scrolls an anchor-less navigation to the top of the page, and this one fires mid-keystroke in a box below the fold. The chips carry the same fragment, which is why they never had the bug. `cancelSearch()` exists because the service is root-provided and outlives the box: without it a keystroke still in the debounce would fire after the visitor opened a project and drag them back to `/`. Exposes the filtered list all three layouts render, plus `active()` for the "is anything narrowing this?" question layouts ask before showing placeholder slots or a no-match message. The two axes fail **differently on purpose**: an unknown `?tech=` shows everything (a chip the visitor never chose shouldn't empty the page), while a `?q=` that matches nothing shows nothing (they typed it, so an empty result is the honest answer) — hence the no-match copy exists for search but not for tech. Only applies the filter after `afterNextRender` — `/` is prerendered with no query string, so filtering during first render would be a hydration mismatch. An unknown `?tech=` shows everything, mirroring the forgiving `?layout=` rule. |
| `page-meta.ts` | Sets `<title>`, description, `<link rel="canonical">` and OG/Twitter tags per page, with the site-wide defaults `index.html` already ships, and owns the one `application/ld+json` block a page may carry (replaced on each navigation, removed when the next page sets none). The canonical is built from the same clean `path` as `og:url`, which is what keeps `/?layout=gallery`, `/?tech=Angular` and `/?q=api` from being indexed as rivals to `/`. `absolute()` builds the absolute URLs Open Graph, schema.org and the canonical all require, on the placeholder origin the Pages deploy rewrites. Used by the landing, resume, legal and detail pages. |
| `theme.ts` | Dark/light as a `data-theme` attribute on `<html>`, plus the `theme-color` meta. Adopts what the pre-paint script in `index.html` chose, saves only an explicit toggle (an OS preference is re-read every visit), and touches nothing on the server. |
| `command-palette.ts` | One signal: is the palette open. A service rather than component state so the nav's trigger, Dossier's trigger and the Ctrl+K shortcut all drive the same overlay. |

### 4.4 Shared components — `src/app/shared/`

| File | Role |
|---|---|
| `nav/nav.ts` (+ `.html`, `.css`) | The top nav used by Ledger, Gallery, the resume page and the detail page: brand, Projects, Resume, Contact, theme toggle, palette trigger and the PDF button. Sets `aria-current` by hand, because a fragment link's active state doesn't cover the detail routes. |
| `footer/footer.ts` (+ `.html`, `.css`) | Site footer in the owner's preferred shape: © line and a one-line privacy note, Terms/Privacy links (`aria-current` on the one you are reading), and Contact set apart under a hairline. `compact` (Ledger) keeps the © and the legal links only. Dossier has no `app-footer` — its inline `.foot` carries the same two links. |
| `tech-filter/tech-filter.ts` | The chip row that drives `ProjectFilter`. Every chip is a real link setting `?tech=` (shareable, Back-friendly, merges with `?layout=`) with `fragment="projects"` so picking one doesn't scroll the visitor back to the hero. Also carries the `role="status"` summary line for **both** filters — "Showing 5 of 6 projects built with Angular matching \"api\"" — which is why the line is outside the chips' own `@if`: a search with no chips still needs it. |
| `project-search/project-search.ts` | The search box beside the chips. A live-typed field cannot be a `routerLink`, so it writes through `ProjectFilter.search()` instead and reads `filter.queryText()` back for its value — which is what makes Back/Forward and `/?q=…` deep links move the box, not just the list. Its one piece of logic is a `DestroyRef.onDestroy` that cancels a pending search write, since `ProjectFilter` is root-provided and would otherwise navigate a visitor who has already left. |
| `layout-switcher/layout-switcher.ts` | Three links above the landing layout, one per variant, so `?layout=` is discoverable rather than a hidden parameter. Each is `queryParamsHandling="merge"` — Angular's default replaces the whole query string, which would silently drop the visitor's `?tech=` and `?q=` on a switch that is only meant to change presentation. |
| `command-palette/command-palette.ts` (+ `.html`, `.css`) | The Ctrl+K / Cmd+K overlay. Flattens pages, projects, the legal pages and actions into one row shape, filters on label+hint, and drives selection with `aria-activedescendant` — real focus never leaves the search input, which is what makes the focus trap a one-line `Tab` swallow. That choice has a cost the component pays back explicitly: the browser will not scroll for a highlight it is not focusing, so an `afterRenderEffect` calls `scrollIntoView({ block: 'nearest' })` on the active row. Without it, ArrowUp from the first row wraps to the last and — on any window short enough for the 60vh panel to clip the list — highlights a row the visitor cannot see. Mounted once, in `App`. |
| `command-palette-trigger/command-palette-trigger.ts` | The icon button that opens it, sized to match `ThemeToggle`; mounted in the nav and in Dossier's aside. |
| `theme-toggle/theme-toggle.ts` | The sun/moon button over `ThemeService`. Both icons are always in the DOM and CSS picks one, so the server and browser markup match. |
| `status-tag/status-tag.ts` | The Live / WIP / Archived chip beside every project title, plus the accent "Featured" variant. |
| `project-image/project-image.ts` | A screenshot in the Nocturne `.lighten` treatment, with `srcset` over the `-800`/full pair `npm run shots` writes, and an initial-letter placeholder when a project has no capture yet — so layouts hold their shape before screenshots exist. |
| `live-status/live-status.ts` | The "is it actually up?" dot beside a live project link. A `no-cors` probe, so it can only distinguish answered from didn't-answer; runs after render, never during prerendering. |
| `github-activity/github-activity.ts` | The hero's "last push" line, from the public GitHub events API. Reduces each event to one sentence via the `EVENT_VERBS` table, shows the newest inline and keeps up to four more behind a "+N more" disclosure; silent when the API is unreachable or rate-limited. The disclosure wraps onto its own flex line instead of floating, because Dossier's sticky aside would clip a popover. |
| `icons/arrow-up-right.ts`, `icons/search.ts` | Inline Phosphor SVGs on `currentColor` — no icon font, no runtime fetch. |
| `pipes/domain.pipe.ts` | `https://tesseraapp.dev/` → `tesseraapp.dev` for the "Open …" buttons; keeps the path for repo links. |

### 4.5 Models — `src/app/models/`

Types only; no logic. Each mirrors a Java record field-for-field (§3.5) and is the
contract the templates are written against.

| File | Role |
|---|---|
| `profile.model.ts` | `Profile`, `SocialLink`, `Stat`. |
| `project.model.ts` | `Project`, `ProjectStatus`, `Highlight`, `CaseStudy`. |
| `resume.model.ts` | `Resume`, `Experience`, `ResumeProject`, `Education`, `Achievement`, `SkillGroup`. |
| `landing-layout.ts` | The `LandingLayout` union, the list of all three, and the `isLandingLayout` guard `Landing` uses to validate `?layout=`. Frontend-only — the backend knows nothing about layouts. |

### 4.6 Tests — `*.spec.ts` (Vitest, 120 tests across 24 files)

Run with `npm test` from `frontend/`. Always the full suite: `npx vitest run <file>`
bypasses the Angular builder's setup and fails with "describe is not defined".

| File | What it pins down |
|---|---|
| `app.spec.ts` | The root component creates and renders its router outlet, and the skip link is the page's first element, points at `#main`, and moves focus there (falling back to the plain fragment link when a route has no landmark). |
| `pages/landing/landing.spec.ts` | Layout selection: the Ledger default, the `?layout=` override, and an unknown value ignored rather than erroring. |
| `pages/landing/layouts.spec.ts` | Each layout renders the same data its own way: Ledger's numbered rows with Open/Source links, Gallery's lead card and padded grid, Dossier's projects table and experience column — plus, through a real navigation to `/?q=…`, that each one says "no projects match your search" rather than showing an empty catalogue or a stuck skeleton. |
| `pages/project-detail/project-detail.spec.ts` | The project renders once the list resolves, its schema.org graph describes the source and the breadcrumb trail, each stack tag links to `/?tech=…#projects` with a describing `aria-label`, the meta description is the project's `description` alone rather than the tagline joined to it, and an id that is not in the list gets the not-found state. |
| `pages/resume/resume.spec.ts` | Experience, projects, education and achievements all render from `GET /api/resume`. |
| `pages/not-found/not-found.spec.ts` | The miss is explained and links back to the hub, and the page replaces the previous route's title, description and canonical rather than inheriting them. |
| `pages/legal/legal.spec.ts` | Both pages render dated, with the contact address coming from the API rather than a literal; the privacy page names every host it claims to talk to; the footer marks the page you are on; each links to the other. |
| `services/api.spec.ts` | The whole fallback dance: both requests in flight, snapshot first then replaced by the live response, a late snapshot ignored, the snapshot kept when the API errors, `TransferState` used instead of a fetch on a prerendered page, and a clean completion when everything fails — plus the build-time side, with and without a backend running. |
| `services/project-filter.spec.ts` | Version stripping and what is *not* a version, facet counting and ordering, case-insensitive family matching, the rare-technology chip when deep-linked, an unknown `?tech=` showing everything, and no filtering before hydration — then the same for `?q=`: matching name/tagline/stack, case- and whitespace-insensitivity, composing with `?tech=`, and the navigation `search()` performs — that it debounces to one write per pause, pushes the first search but replaces a refinement or a clear, skips the navigation entirely when an emptied box already matches an empty URL, and that `cancelSearch()` drops a write that has not fired. |
| `services/page-meta.spec.ts` | Title, description, canonical and social tags are written to the document and updated rather than duplicated (one canonical link, moved not stacked, always the clean route); the JSON-LD block is replaced rather than stacked and removed when a page sets none; `absolute()` handles paths with or without a leading slash. |
| `services/theme.spec.ts` | Adopting the pre-paint script's choice, the saved-choice → OS → dark fallback chain, and a toggle updating the attribute, the `theme-color` meta and storage together. |
| `shared/tech-filter/tech-filter.spec.ts` | The All chip plus one per shared technology with counts, real hrefs like `/?tech=Angular#projects`, the `?layout=` merge (and dropping `?tech=` on All), `aria-current`, the summary line in all three of its shapes (tech, search, both), and rendering nothing when no technology is shared. |
| `shared/project-search/project-search.spec.ts` | The box is empty with no `?q=`, preloads its value from `?q=` on a deep link, passes what is typed to `ProjectFilter.search()` with the push-not-replace flag a first search expects, and cancels a pending write when the box is destroyed (the debounce and the matching itself are `project-filter.spec.ts`'s job). |
| `shared/nav/nav.spec.ts` | The profile links render and Projects is marked current on the landing page. |
| `shared/command-palette/command-palette.spec.ts`, `command-palette-trigger/command-palette-trigger.spec.ts` | Ctrl+K opens and toggles shut, the list covers pages/actions/projects, filtering, ArrowDown+Enter, Escape, click-to-navigate, backdrop dismiss, that a wrapped highlight is scrolled into view — and that the trigger button drives the same signal. (jsdom implements no `scrollIntoView` at all, so the spec installs one.) |
| `shared/footer/footer.spec.ts` | The copyright line and social links, and the link row omitted in compact mode. |
| `shared/status-tag/status-tag.spec.ts` | Live outline, WIP neutral, Archived dimmed, and the accent Featured chip. |
| `shared/project-image/project-image.spec.ts` | The initial-letter placeholder when there is no screenshot, and the lighten blend when there is. |
| `shared/live-status/live-status.spec.ts` | "Responding" on any answer (even opaque), "Not reachable" on failure, nothing without a URL, compact mode, and that it only probes once the dot scrolls into view. |
| `shared/github-activity/github-activity.spec.ts` | Event → linked sentence, skipping unrecognized event types, compact mode, and silence on a failed, empty or rate-limited response — plus the disclosure: the count it advertises, expanding to the rest of the history newest-first, collapsing on Escape, and never appearing in compact mode. |
| `shared/layout-switcher/layout-switcher.spec.ts` | One link per layout, each setting `?layout=`, with the current one marked — and that each href keeps a `?tech=`/`?q=` already on the URL rather than replacing it. |
| `shared/theme-toggle/theme-toggle.spec.ts` | A labelled button that flips the theme. |
| `shared/pipes/domain.pipe.spec.ts` | Bare hostname by default, path kept when asked, non-URLs and blanks passed through. |

### 4.7 Build and asset scripts — `frontend/scripts/`

Node scripts wired to `npm run` targets. None ship to the browser; they produce
things that do.

| File | Role |
|---|---|
| `chrome.mjs` | Shared helpers for the headless-Chrome scripts: finds a Chrome binary (`$CHROME` first, then the usual install paths) and lends each run a throwaway profile directory. |
| `a11y.mjs` (`npm run a11y`) | Runs axe-core over 15 page states (every route, each landing layout, each filter axis, the no-match state, the 404) in **both themes** and exits non-zero on any WCAG 2.0/2.1 A or AA violation. Best-practice rules are printed but never fail the run — some are static heuristics that disagree with what the browser actually exposes, so they want a decision, not obedience. Points at the dev server by default, or at a finished build with `BUILD_DIR=dist/frontend/browser`. Not wired into CI: headless Chrome has been unreliable on this repo's Actions runner (see BACKLOG), so it is a release-checklist step. |
| `resume-pdf.mjs` (`npm run resume:pdf`) | Regenerates `public/resume.pdf` from a rendered `/resume` using the app's own print stylesheet, so the PDF can never drift from the page. Drives Chrome through `puppeteer-core` rather than the `--print-to-pdf` flag, which hung on the CI runner. |
| `screenshots.mjs` | `npm run shots` — captures every live project into `public/shots/` as WebP at two widths plus a JPEG social crop, and the landing page as `public/og.png`. Feeds `ProjectImage`'s `srcset` and the OG tags `PageMeta` sets. |
| `icons.mjs` (`npm run icons`) | Renders the PWA icons (192/512/maskable) and `apple-touch-icon.png` from an inline SVG monogram via `sharp`. There is no logo asset to resize — the brand mark is a wordmark — so the glyph is drawn here, with the Nocturne background/accent as literals because this runs outside the Angular build. Re-run only if those tokens change. |
| `linkcheck.mjs` (`npm run linkcheck`) | Requests every link the catalogue advertises — each project's live URL, each project's repo, each profile social link — and exits non-zero when one the site presents as working does not. Exists because `LiveStatus` cannot do this: its `no-cors` browser probe gets an opaque response, so a host answering 503 still reads as "Responding". Node sees the status code. Each failure is retried once after a pause, so a Render free tier waking up (a slow success) is not mistaken for a suspended one (an instant 5xx twice). Defaults to the deployed catalogue; `SITE=` or `BUILD_DIR=` aim it elsewhere. |
| `snapshot.mjs` | Writes `public/data/{profile,projects,resume}.json` from a running backend. This is the fallback `Api` serves while a sleeping Render service wakes; the Pages workflow regenerates it every deploy, which is why `public/data/` is git-ignored. |
| `sitemap.mjs` | `postbuild` — turns the routes `ng build` actually prerendered into `sitemap.xml`, so a new project reaches the sitemap by existing in the backend. Strips the `--base-href` prefix that the origin substitution downstream re-adds. |
| `static-server.mjs` | A minimal static server for pointing headless Chrome at a finished `ng build` without the dev server or the backend. Models GitHub Pages closely enough to be worth trusting: `--base-href` prefixes, `<path>/index.html` for extension-less routes, and — for a path with no file — the body of `404.html` (or `index.csr.html`, which is what the deploy copies into it) with a 404 status. Without that last part, auditing a built site's not-found path silently measured *Chrome's* error page. |

### 4.8 Frontend tooling

| File | Role |
|---|---|
| `package.json` (+ `package-lock.json`) | Scripts (`start`, `build`, `test`, `shots`, `icons`, `snapshot`, `resume:pdf`) and dependencies. **`npm test` runs the whole suite; there is no `--run` flag** (the Angular builder owns the Vitest setup). |
| `angular.json` | The build: `outputMode: "static"` (prerender everything), the Vitest test builder, budgets, and the `environment.ts` file replacement per configuration. |
| `tsconfig.json` / `tsconfig.app.json` / `tsconfig.spec.json` | Strict TypeScript, app sources vs spec sources. |
| `.prettierrc`, `.editorconfig` | Formatting, matched by the CI format check. |
| `.vscode/*.json` | Editor conveniences: recommended extensions, launch/debug config, tasks, MCP config. Not used by any build. |
| `public/` | Served verbatim: `favicon.ico`, `og.png`, `resume.pdf`, `robots.txt` (which points at the sitemap), `manifest.webmanifest` + `icons/` + `apple-touch-icon.png` (what makes the site installable — `index.html` links them), plus generated `shots/` and `data/`. |
| `src/fonts/` | Self-hosted Inter subsets (`OFL.txt` is its licence) — no third-party font request, so nothing to consent to and nothing to slow first paint. |

## 5. CI/CD — `.github/`

| File | Role |
|---|---|
| `workflows/ci.yml` | Every push and PR to `main`: backend `mvn -B verify` plus a Docker image build, then the frontend's `npm ci`, `npm test`, and a full `ng build` **against a running backend** — and it fails the job if no `/projects/*` page was prerendered, so a build that silently produced skeleton pages cannot pass. CI never deploys. This is the gate the owner requires to stay green on every push. |
| `workflows/deploy-pages.yml` | The deploy. Starts the backend, snapshots the API (`npm run snapshot`), points the build at the live API URL, builds with `--base-href /Resume/`, regenerates `resume.pdf` from the built site (best-effort, so a Chrome failure never blocks a deploy), rewrites the placeholder origin in `sitemap.xml`/`robots.txt`, copies `index.csr.html` to `404.html` so deep links boot the app, writes the `CNAME`, and publishes to GitHub Pages. |
| `actions/start-backend/action.yml` | The shared composite step both workflows use to build and start the API on localhost and wait for `/actuator/health`. |
| `dependabot.yml` | Weekly grouped updates. Angular packages and `typescript` share one group (`@angular/build` pins a narrow peer range) and majors are ignored — both after a 2026-09-05 PR paired Angular 22 with an incompatible TypeScript and broke CI. |

## 6. Documentation — `docs/`

| File | Role |
|---|---|
| `SRS.md` | What the site must do, as numbered functional requirements plus user stories. The place a new feature is described before it is built. |
| `ARCHITECTURE.md` | The system: data flow, rendering strategy, directory tree, API surface, security and scaling notes. Read it before this file. |
| `UI-DESIGN.md` | The design system: tokens, component inventory, the three landing variants, responsive rules, accessibility commitments. |
| `DEPLOYMENT.md` | How the two halves ship, the environment variables each host needs, and how to roll back. |
| `CODE-MAP.md` | This file. |
| `BACKLOG.md` | What is done, what is next, and what needs the owner. Also the record of decisions that turned out wrong and were corrected. |
| `design-handoff.md` | The original Nocturne handoff the frontend was built from — the source of truth for names like "Ledger", "Dossier" and `.tag-outline`. |
| `design/*.dc.html`, `design/_ds/**`, `design/support.js`, `design/image-slot.js` | The exported design comps with the bundled stylesheet and the two scripts that make them interactive offline. Reference material — nothing here is built, served or imported by the app. |

## 7. Where to change what

| If you want to… | Touch |
|---|---|
| Add or edit a project (text, stack, links, case study) | `InMemoryProjectRepository.java` — and nothing else; the chips, cards, rows, detail page and sitemap all follow. |
| Change the resume | `InMemoryResumeRepository.java`, then `npm run resume:pdf` to refresh the committed PDF. |
| Change name, tagline, contact details or social links | `InMemoryProfileRepository.java`. |
| Add a field to any of those | The Java record **and** its TypeScript mirror in `models/`, then the template that shows it. |
| Add a page | `app.routes.ts` + a component under `pages/`, and add it to `app.routes.server.ts` if it should be prerendered and to `command-palette.ts`'s page list. |
| Add anything that calls out to another host | The code, **and** `pages/legal/privacy.html` — that page lists the hosts a visitor's browser contacts, and a stale privacy policy is worse than none. |
| Change colours, type or spacing | `src/styles.css` tokens — components read tokens, not literals. If the background or accent moves, also `npm run icons`, whose monogram copies those two values. |
| Change what the landing page shows by default | `environment.ts` → `landingLayout`. |
| Point the site at a different API | The repo variable `API_BASE_URL` (the Pages workflow substitutes it), not `environment.ts`. |
| Add a caching or CORS rule | `WebConfig.java`. |

## 8. Two rules that are easy to break

1. **The two model sets must stay in step.** A Java record and its TypeScript interface
   are the same contract written twice; nothing checks that at compile time. Renaming a
   field on one side produces `undefined` in a template, not an error.
2. **Nothing may change what the first render produces.** Every route is prerendered
   with no query string and no browser APIs available, so anything that reads
   `localStorage`, `window`, a query param or the network has to wait for
   `afterNextRender` (or be identical on both sides) or hydration will mismatch.
   `ProjectFilter`, `ThemeService`, `LiveStatus` and `GithubActivity` are all shaped
   around this.
