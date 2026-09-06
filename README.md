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

Pages to try: `/` (add `?layout=ledger`, `?layout=gallery` or `?layout=dossier`),
`/resume`, `/projects/tesseraapp`, `/projects/nope` (not-found state).

`docker compose up --build` runs the backend as a container the way the hosts will.

**Tests**

```bash
cd backend  && mvn -B verify              # JUnit 5 + MockMvc slices (13 tests)
cd frontend && npm test -- --watch=false  # Vitest / jsdom (37 tests)
cd frontend && npm run build              # prerenders every route + writes sitemap.xml (~370 kB raw JS)
```

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
│   ├── public/                    resume.pdf, og.png, shots/ (WebP + social JPEG), robots.txt, data/ (generated)
│   ├── scripts/                   resume-pdf.mjs, screenshots.mjs, snapshot.mjs, sitemap.mjs (postbuild)
│   └── src/
│       ├── fonts/                 self-hosted Inter (variable woff2, latin + latin-ext)
│       ├── main.ts · main.server.ts   browser bootstrap · prerender bootstrap
│       └── app/
│           ├── app.config.ts · app.config.server.ts · app.routes.ts · app.routes.server.ts
│           ├── models/  services/ TS mirrors of the records; Api (build-time data ∥ live) → signals; PageMeta
│           ├── shared/            nav, footer, status-tag, project-image, live-status, icons, pipes
│           └── pages/             landing (+ ledger / gallery / dossier), resume, project-detail, not-found
├── docs/                          SRS, ARCHITECTURE, UI-DESIGN, DEPLOYMENT, BACKLOG, design handoff + mocks
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

## Status (2026-09-04)

- Backend and frontend build and pass their tests locally. `main` is pushed and CI,
  the Pages deploy and Dependabot run on GitHub.
- Rendering: every route is prerendered to static HTML at build time (project pages
  from the ids the API returns) and hydrated in the browser; the client shell doubles
  as the Pages `404.html`. Lighthouse (mobile, gzip static host): performance 99,
  accessibility 100, best practices 96, SEO 100; 200 kB total transfer.
- Content: resume, TesseraApp, Angular Concepts, Dev Learning Hub and Dev Hub are real
  and live (Dev Hub went live on GitHub Pages 2026-09-06). Luv2Shop and WebsiteHub are
  `WIP` with no live URL. (A former `fullstack-starter` entry was removed 2026-09-05:
  it described the same codebase as TesseraApp, not a separate project.)
- Screenshots exist for TesseraApp and WebsiteHub (WebP at 1600 and 800 px plus a
  1200×630 social JPEG, captured with `npm run shots`); projects without a live URL
  render the initial placeholder. Inter is self-hosted, so a visit makes no
  third-party request.
- SEO: per-page `<title>`, description and Open Graph/Twitter tags (each project page
  previews with its own screenshot), JSON-LD `Person` data, `robots.txt`, a generated
  `sitemap.xml`; the production origin is stamped in by the Pages workflow. Unknown
  paths get a real not-found page.
- Project detail pages probe the project's live URL from the visitor's browser and
  say whether it answers right now; route changes cross-fade where the browser
  supports view transitions.
- API hardened for public exposure: gzip, weak ETags with 304 revalidation,
  `Cache-Control`, OpenAPI docs at `/docs`. Dependabot watches npm, Maven, Docker
  and Actions weekly.
- Hosting: the API is live on Render's free tier at `https://bobs-resume.onrender.com`
  (created 2026-09-04) and the frontend deploys to GitHub Pages from `main`; the
  remaining go-live checks are in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) §3, and
  everything else that is open or next lives in [docs/BACKLOG.md](docs/BACKLOG.md).
