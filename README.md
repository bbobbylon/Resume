# WebsiteHub

Robert Oliver, Jr.'s portfolio hub: an Angular 21 frontend over a Spring Boot 4.1
REST API that serves an in-app resume and a catalogue of projects. Every project
links **out** to its own live deployment and GitHub repo — this app never embeds
another project's code or UI, it just points at it.

Styled on the **Nocturne** design system with three interchangeable landing layouts
(Ledger, Gallery, Dossier), a resume page and project detail pages.

| Doc | What it covers |
|-----|----------------|
| [docs/SRS.md](docs/SRS.md) | requirements, user stories, success criteria |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | components, data models, API, patterns |
| [docs/CODE-MAP.md](docs/CODE-MAP.md) | every file, what it does, and what it talks to |
| [docs/UI-DESIGN.md](docs/UI-DESIGN.md) | tokens, components, layouts, breakpoints, a11y |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | hosting plan (free tier), CI/CD, domains, rollback |
| [docs/BACKLOG.md](docs/BACKLOG.md) | what is next, what needs the owner, what was decided |
| [docs/design-handoff.md](docs/design-handoff.md) | the original Nocturne handoff spec; mocks in `docs/design/` |

## Running it locally

Requirements: JDK 21, Maven, Node 20+ (no database — the API is in-memory).

```bash
# backend → http://localhost:8420  (try: curl localhost:8420/api/projects)
cd backend && mvn spring-boot:run

# frontend → http://localhost:4222  (pre-wired to the local backend)
cd frontend && npm install && npm start

# or both, from the repo root in Git Bash
./run.sh
```

Pages to try: `/`, `/resume`, `/projects/tesseraapp`, `/terms`, `/privacy`,
`/projects/nope` (not-found state), `/any/typo` (not-found page).

`docker compose up --build` runs the backend as a container the way the hosts will.

**Tests**

```bash
cd backend  && mvn -B verify              # JUnit 5 + MockMvc slices (13 tests)
cd frontend && npm test -- --watch=false  # Vitest / jsdom (116 tests across 24 files)
cd frontend && npm run build              # prerenders every route + writes sitemap.xml
```

## Using the site

Every view is a URL, so anything you can see you can link or bookmark.

| What | How | Notes |
|------|-----|-------|
| Switch landing layout | The pill above the hero, or `?layout=ledger\|gallery\|dossier` | Default is `landingLayout` in `frontend/src/environments/`; an unknown value falls back to it |
| Filter projects by technology | The chip row in the Projects section, or `?tech=Angular` | Matches by *family*, so `?tech=Angular` also matches a project listing `Angular 21`; a value no project uses shows everything rather than an empty page |
| Search projects | The box beside the chips, or `?q=jwt` | Matches name, tagline and stack, case-insensitive; typing rewrites the URL (debounced). Starting a search adds one history entry, refining it replaces that entry, so a single Back always returns to the unfiltered list |
| Command palette | `Ctrl+K` / `Cmd+K`, or the search button in the nav | Home, Resume, every project, both legal pages and a theme action; arrows move, Enter runs, Escape closes |
| Light / dark | The sun/moon button in the nav | Follows the OS until you pick one; that choice is the only `localStorage` key the site writes |
| Skip to content | `Tab` as the first keypress on any page | Moves focus (not just scroll) into that page's `<main>` |
| Save it to a home screen | Safari/Chrome on mobile → Share/menu → "Add to Home Screen" | Uses `manifest.webmanifest` + the monogram icons, and opens without browser chrome (`display: standalone`). There is deliberately **no service worker**, so no offline mode — and Chrome's automatic install prompt, which requires one, will not appear |
| Download the resume | The PDF button in the nav | `frontend/public/resume.pdf`, regenerated from `/resume` on every deploy |

The landing params combine and survive Back: `/?layout=gallery&tech=Angular&q=api`
is a valid, shareable view. Filters apply only after hydration, so the prerendered
HTML a crawler sees always lists every project.

## Scripts

All from `frontend/`. The three generators write files that are committed
(`resume.pdf`, `shots/`, `icons/`); `snapshot` writes git-ignored data. The three
Chrome-driven ones (`a11y`, `resume:pdf`, `shots`) need a Chrome already on the
machine — they drive it through `puppeteer-core` or its own CLI, and neither
downloads one. `snapshot` and `linkcheck` only make HTTP requests, so they run
anywhere Node does.

| Script | What it does | When to run it |
|--------|--------------|----------------|
| `npm start` | Dev server on :4222, pre-wired to the local backend | Day-to-day work |
| `npm run build` | Prerenders every route against the backend, then writes `sitemap.xml` (`postbuild`) | Before a release; CI runs it too |
| `npm test -- --watch=false` | Vitest/jsdom suite | Every change |
| `npm run a11y` | axe-core over 15 page states x both themes in real Chrome; fails on any WCAG 2.x A/AA violation | After UI or colour-token changes. Add `BUILD_DIR=dist/frontend/browser` to audit a finished build instead of the dev server |
| `npm run linkcheck` | Requests every link the catalogue advertises (live sites, repos, social) and fails on any that a visitor would find broken | Before a release, and any time a project's hosting changes. Defaults to the deployed catalogue; `SITE=` or `BUILD_DIR=` point it elsewhere |
| `npm run snapshot` | Captures `/api/{profile,projects,resume}` into `public/data/*.json` | Needs the backend up; the Pages deploy does it automatically |
| `npm run resume:pdf` | Prints `/resume` to `public/resume.pdf` via headless Chrome | After resume content changes (the deploy also regenerates it, best-effort) |
| `npm run shots` | Project screenshots (WebP 1600/800 + social JPEG) and `og.png` | After a project's UI changes; `-- --only <id>` for one |
| `npm run icons` | Regenerates the PWA icons and `apple-touch-icon.png` from the monogram | Only if the Nocturne background/accent tokens change |

## Stack, and why

| Layer | Choice |
|-------|--------|
| Frontend | Angular 21 — standalone components, signals, zoneless; every route prerendered to static HTML at build time and hydrated in the browser; plain CSS on the Nocturne token sheet, self-hosted Inter |
| Backend | Spring Boot 4.1.1, Java 21, Maven; Controller → Service → Repository with in-memory repositories behind interfaces |
| Hosting | Frontend on GitHub Pages; API on Render's free tier (no card), with a deploy-time data snapshot the site falls back to while the API wakes. Cloud Run is the documented alternative — see [DEPLOYMENT.md](docs/DEPLOYMENT.md) |
| CI/CD | GitHub Actions: `ci.yml` (build + test both halves) and `deploy-pages.yml` (publish frontend); both start the backend so the build prerenders real data |

**Spring Boot 4.1** split the old `spring-boot-starter-web` into `spring-boot-starter-webmvc`
plus a separately chosen servlet container (`spring-boot-starter-tomcat`), and moved
slice tests to `spring-boot-starter-webmvc-test` (`@WebMvcTest` now lives in
`org.springframework.boot.webmvc.test.autoconfigure`; `@MockitoBean` replaces `@MockBean`).

**In-memory repositories behind interfaces** mean a real database later is "one new
class that implements the interface" with no change to services or controllers.

**No CSS framework** — the design is a token sheet plus a dozen component classes;
Tailwind or Material would be more setup than it saves.

## API

| Method | Path | Returns |
|--------|------|---------|
| GET | `/api/profile` | name, brand, title, employer, tagline, bio, contact, resume URL, social links, stats |
| GET | `/api/projects` | all projects (id, name, tagline, description, longDescription, url?, repoUrl, status `LIVE\|WIP\|ARCHIVED`, techStack, imageUrls, highlights, hosting?, delivery?, featured) |
| GET | `/api/projects/{id}` | one project, or 404 |
| GET | `/api/resume` | summary, skills, experience, projects, education, achievements, pdfUrl |
| GET | `/actuator/health` | health check for the hosts |
| GET | `/v3/api-docs` | OpenAPI 3.1 description of the API (springdoc) |
| GET | `/docs` | Swagger UI over that description |

CORS is limited to the origins in `ALLOWED_ORIGIN` (comma-separated; default
`http://localhost:4222`).

Responses are gzipped and carry a weak `ETag` plus `Cache-Control: max-age=300,
public`, so repeat visits revalidate with a 304 instead of re-downloading.

The frontend reaches the API through one `Api` service. At build time every page is
prerendered against the backend, so the HTML already carries its data (handed to the
browser as Angular `TransferState`). In the browser the service shows that build-time
data at once — or, for a page that was not prerendered, the `public/data/*.json`
snapshot the Pages workflow captures with `npm run snapshot` — and requests the live
endpoint in parallel, letting the live response replace it. A sleeping free-tier API
therefore never blanks or delays the site.

## Project structure

```
Resume/
├── backend/                       Spring Boot API (Javadoc'd throughout)
│   └── src/main/java/com/bobbylon/websitehub/{controller,service,repository,model,config}
├── frontend/                      Angular app
│   ├── public/                    resume.pdf, og.png, shots/ (WebP + social JPEG), robots.txt,
│   │                              manifest.webmanifest + icons/ + apple-touch-icon.png, data/ (generated)
│   ├── scripts/                   resume-pdf.mjs, screenshots.mjs, icons.mjs, snapshot.mjs,
│   │                              sitemap.mjs (postbuild), chrome.mjs + static-server.mjs (helpers)
│   └── src/
│       ├── fonts/                 self-hosted Inter (variable woff2, latin + latin-ext)
│       ├── main.ts · main.server.ts   browser bootstrap · prerender bootstrap
│       └── app/
│           ├── app.config.ts · app.config.server.ts · app.routes.ts · app.routes.server.ts
│           ├── models/  services/ TS mirrors of the records; Api (build-time data ∥ live) → signals;
│           │                      ProjectFilter (?tech= + ?q=), PageMeta, Theme, CommandPaletteService
│           ├── shared/            nav, footer, status-tag, project-image, live-status, github-activity,
│           │                      theme-toggle, command-palette (+trigger), layout-switcher,
│           │                      tech-filter, project-search, icons, pipes
│           └── pages/             landing (+ ledger / gallery / dossier), resume, project-detail, legal (terms + privacy), not-found
├── docs/                          SRS, ARCHITECTURE, CODE-MAP, UI-DESIGN, DEPLOYMENT, BACKLOG, design handoff + mocks
├── .github/                       workflows (ci.yml, deploy-pages.yml), actions/start-backend, dependabot.yml
├── render.yaml                    Render Blueprint (no-card hosting option)
├── docker-compose.yml · run.sh    local convenience
```

## Editing content

All content is seed data in `backend/src/main/java/com/bobbylon/websitehub/repository/`:
`InMemoryProfileRepository` (profile, contact, stats), `InMemoryProjectRepository`
(projects — keep exactly one `featured`, three highlights each; the repository test
enforces this), `InMemoryResumeRepository` (resume text). Screenshots are captured by `npm run shots` (headless Chrome, see
`frontend/scripts/screenshots.mjs`) into `frontend/public/shots/` and referenced from a
project's `imageUrls` as `shots/<id>-<n>.webp` (hero first, up to three); the script also
writes the `-800.webp` variant each `srcset` needs and `<id>-social.jpg` for the page's
social preview. `sitemap.xml` is generated from the prerendered routes on every build,
so a new project needs no SEO bookkeeping.
The landing layout default is `landingLayout` in `frontend/src/environments/`.

## Status (2026-09-11)

**Live:** frontend at <https://bbobbylon.github.io/Resume/>, API at
<https://bobs-resume.onrender.com> (`/api/projects`, `/docs`). The last push
(`d3e482e`) was green on both `CI` and `Deploy frontend to GitHub Pages`.

- Backend and frontend build and pass their tests locally (13 backend, 116 frontend)
  and in CI; the Pages deploy and Dependabot run on GitHub.
- Landing is browsable three ways (Ledger / Gallery / Dossier via the switcher or
  `?layout=`), filterable by technology (`?tech=`) and searchable (`?q=`), with a
  Ctrl+K command palette over every page and project. A live GitHub activity strip
  in the hero shows recent public events, newest inline and up to four more behind a
  disclosure.
- Installable as an app (`manifest.webmanifest` + monogram icons); no service
  worker, so no offline mode — the site is still a plain static bundle.
- Rendering: every route is prerendered to static HTML at build time (project pages
  from the ids the API returns) and hydrated in the browser; the client shell doubles
  as the Pages `404.html`. Lighthouse (mobile) against the deployed site on
  2026-09-11: performance 100, accessibility 100, best practices 96, SEO 100;
  FCP 1.0 s, LCP 1.0 s, CLS 0.019, 280 kB transferred.
- Content: five of the six catalogue entries are `LIVE` with real URLs — TesseraApp,
  Angular Concepts, Dev Learning Hub, Dev Hub, and WebsiteHub itself (this site, listed
  like any other project). Only Luv2Shop is still `WIP`, waiting on its database and
  Render service. (A former `fullstack-starter` entry was removed 2026-09-05: it
  described the same codebase as TesseraApp, not a separate project.)
- Screenshots exist for TesseraApp, WebsiteHub, Angular Concepts, Dev Learning Hub
  and Dev Hub (WebP at 1600 and 800 px plus a 1200×630 social JPEG, captured with
  `npm run shots`); projects without a live URL render the initial placeholder.
  Inter is self-hosted, so page rendering needs no third-party host; the only
  cross-origin requests a visit makes are the API, `api.github.com` for the activity
  strip, and a project's own URL when its status dot scrolls into view — the same
  set `/privacy` enumerates, which is why a new outbound request means editing that
  page in the same commit.
- SEO: per-page `<title>`, description and Open Graph/Twitter tags (each project page
  previews with its own screenshot), JSON-LD (`Person` site-wide, plus
  `SoftwareSourceCode` + `BreadcrumbList` on each project page), `robots.txt`, a
  generated `sitemap.xml`; the production origin is stamped in by the Pages workflow.
  Unknown paths get a real not-found page.
- Project detail pages probe the project's live URL from the visitor's browser and
  say whether it answers right now; route changes cross-fade where the browser
  supports view transitions.
- API hardened for public exposure: gzip, weak ETags with 304 revalidation,
  `Cache-Control`, OpenAPI docs at `/docs`. Dependabot watches npm, Maven, Docker
  and Actions weekly.
- Hosting: the API is live on Render's free tier at `https://bobs-resume.onrender.com`
  (created 2026-09-04) and the frontend deploys to GitHub Pages from `main` on every
  push that touches it. The go-live runbook is [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
  §3 (all steps done except the optional custom domain, deliberately deferred), and
  everything else open or next lives in [docs/BACKLOG.md](docs/BACKLOG.md).
