# Architecture — WebsiteHub

| | |
|---|---|
| **Version** | 0.3.0 |
| **Date** | 2026-09-04 |
| **Related** | [SRS.md](SRS.md) · [UI-DESIGN.md](UI-DESIGN.md) · [DEPLOYMENT.md](DEPLOYMENT.md) |

## 1. System Architecture

```
 Browser ──HTTPS──▶ GitHub Pages (static host)
    │                 └─ prerendered HTML per route + Angular bundle, fonts, resume.pdf, shots/, data/*.json (API snapshot taken at deploy time)
    │
    └──HTTPS/JSON──▶ Spring Boot API (Render free web service, Docker image; Cloud Run is the alternative)
                        ├─ GET /api/profile        ProfileController → ProfileService → ProfileRepository
                        ├─ GET /api/projects       ProjectController → ProjectService → ProjectRepository
                        ├─ GET /api/projects/{id}
                        ├─ GET /api/resume         ResumeController → ResumeService → ResumeRepository
                        └─ GET /actuator/health    (host health check)

 Each project card links OUT to that project's own deployment (TesseraApp on AWS, etc.).
 WebsiteHub never proxies or embeds another project.
```

**Data flow.** The routed page injects the data services, each service asks `Api`
for one resource and exposes the result as a signal (`toSignal`). What `Api` does
depends on where it runs (see *Rendering* below): at build time it GETs the local
backend and stores the answer in `TransferState`; in the browser it emits the
transferred data at once — or, when the page was not prerendered, the same-named
file under `data/` (the snapshot the Pages workflow captured at deploy time) — and
requests the live endpoint in parallel, letting the live response replace the
build-time data. The site therefore renders fully from the first byte while a
free-tier API wakes up.
Templates render skeletons until the signal is defined. `ProjectService` fetches the
list once (`shareReplay`) and serves both the landing layouts and the detail route,
which looks its `:id` up in that list on every param change (`switchMap`).

**Rendering.** `ng build` runs the app once in Node (`main.server.ts`,
`app.config.server.ts`, `outputMode: static`) and writes finished HTML for `/`,
`/resume` and every `/projects/<id>` the backend lists (`app.routes.server.ts` —
`getPrerenderParams` asks `/api/projects`; an id that appears later falls back to
client rendering). In the browser `provideClientHydration(withEventReplay())` adopts
that HTML instead of re-creating it. `index.csr.html` — the empty client shell —
becomes the Pages `404.html`, so unknown deep links still boot the app and land on
the not-found page. `ng serve` renders the same way on the fly, so dev matches
production. Per-page `<title>`, description and Open Graph tags are set by
`PageMeta` during that render, which is why each project page has its own social
preview.

**Hub-with-links-out** was chosen over a monorepo that hosts everything (couples
release cycles) and over embedding project UIs (iframes / micro-frontends — needless
complexity for a links page).

## 2. Technology Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Frontend | Angular 21 (standalone components, signals, zoneless), TypeScript 5.9, RxJS 7.8 | Vitest + jsdom for unit tests; `@angular/build:application` builder with `@angular/ssr` static prerendering + hydration |
| Styling | Plain CSS; Nocturne design-system token sheet copied into `src/styles.css`; Inter self-hosted from `src/fonts/` | No CSS framework, no third-party requests |
| Backend | Spring Boot 4.1.1, Java 21, Maven 3.9 | `spring-boot-starter-webmvc` + `-tomcat` + `-actuator`; slice tests via `spring-boot-starter-webmvc-test` |
| Data | In-memory Java records behind repository interfaces | No database yet — see §5 |
| Packaging | Multi-stage Docker image (`backend/Dockerfile`), Boot fat jar | `PORT` env var honoured for Cloud Run / Render |
| CI/CD | GitHub Actions (`ci.yml`, `deploy-pages.yml`, composite `actions/start-backend`), Render Blueprint (`render.yaml`) | Free for public repos; both workflows run the backend so builds prerender real data |

## 3. Directory Structure

```
Resume/
├── backend/
│   ├── Dockerfile                          multi-stage: maven build → JRE 21 runtime
│   ├── pom.xml
│   └── src/main/java/com/bobbylon/websitehub/
│       ├── WebsitehubApplication.java
│       ├── config/                         WebConfig (CORS from ALLOWED_ORIGIN, weak ETag, Cache-Control), OpenApiConfig (springdoc metadata)
│       ├── controller/                     ProfileController, ProjectController, ResumeController
│       ├── service/                        interfaces + *Impl (pass-through today)
│       ├── repository/                     interfaces + InMemory* seed implementations
│       └── model/                          Profile, SocialLink, Stat, Project, ProjectStatus,
│                                           Highlight, Resume, Experience, ResumeProject,
│                                           Education, Achievement (all Java records)
│   └── src/test/java/…                     @WebMvcTest slices + repository unit tests (13 tests)
├── frontend/
│   ├── angular.json · package.json · tsconfig*.json
│   ├── public/                             favicon.ico, resume.pdf, og.png, robots.txt, shots/ (WebP + social JPEG), data/ (generated, git-ignored)
│   ├── scripts/                            chrome.mjs (shared), resume-pdf.mjs, screenshots.mjs, snapshot.mjs, sitemap.mjs (postbuild: prerendered routes → sitemap.xml)
│   └── src/
│       ├── index.html · main.ts · main.server.ts · styles.css (Nocturne tokens, @font-face, page primitives, print)
│       ├── fonts/                          Inter variable woff2 (latin, latin-ext) + OFL licence
│       ├── environments/                   apiBaseUrl, apiTimeoutMs, prerenderApiBaseUrl, siteUrl, landingLayout
│       └── app/
│           ├── app.ts · app.config.ts · app.routes.ts · app.config.server.ts · app.routes.server.ts
│           ├── models/                     project, profile, resume, landing-layout
│           ├── services/                   Api (build-time data ∥ live, live replaces), ProfileService, ProjectService, ResumeService, PageMeta
│           ├── shared/                     nav, footer, status-tag, project-image (srcset), live-status, icons, pipes
│           └── pages/
│               ├── landing/                Landing (@switch) + ledger/ gallery/ dossier/
│               ├── resume/                 ResumePage
│               ├── project-detail/         ProjectDetail
│               └── not-found/              NotFound (catch-all route)
├── docs/                                   SRS, ARCHITECTURE, UI-DESIGN, DEPLOYMENT, BACKLOG,
│   ├── design-handoff.md                   the original Nocturne handoff spec
│   └── design/                             .dc.html mocks + _ds/ token sheet (references only)
├── .github/actions/start-backend/          composite: build the jar, run it, wait for /actuator/health
├── .github/workflows/ci.yml                build + test both halves (the frontend build prerenders against the backend), Docker image
├── .github/workflows/deploy-pages.yml      run backend → snapshot → prerender build → stamp site URL → publish to GitHub Pages
├── .github/dependabot.yml                  weekly npm / Maven / Docker / Actions updates
├── render.yaml · docker-compose.yml · run.sh
└── README.md
```

## 4. Key Design Patterns

- **Controller → Service → Repository (backend).** Controllers are thin; services
  are currently pass-through but exist so validation/caching/composition has a home;
  repositories are interfaces with in-memory implementations. Swapping to a database
  is "implement the interface, change nothing above it".
- **Records as models.** Immutable Java records serialize straight to JSON; the
  TypeScript interfaces in `frontend/src/app/models` mirror them field-for-field.
- **Signals over the HTTP layer (frontend).** `toSignal(http.get(...))` for
  fetch-once data; `Observable` + `switchMap` only where a route parameter drives
  re-fetching. No NgRx — three endpoints do not justify a store.
- **Layout strategy.** `Landing` is a `@switch` over a `LandingLayout` value
  resolved from the query string, then the environment. The three layouts are plain
  standalone components sharing `Nav`, `Footer`, `StatusTag`, `ProjectImage`,
  `ArrowUpRight` and `DomainPipe`.
- **Skeleton states.** Every data-bound block has an `@else` branch rendering
  `.skeleton` spans of the same footprint, so layout does not shift when data lands.
- **Render where the data is.** `Api` branches on `PLATFORM_ID`: during the build it
  fetches the local backend and stores the answer in `TransferState`; in the browser
  it reads that back (or the `data/` snapshot) and refreshes from the live API.
  Nothing else in the app knows whether it is prerendering.
- **Browser-side reachability.** `LiveStatus` probes a project's URL with a `no-cors`
  fetch from the visitor's browser after hydration: an opaque response means the host
  answered, a rejection or the 6 s timeout means it did not. No backend polling, and
  nothing baked into the prerendered HTML that could go stale.
- **Design tokens in one file.** All colours, spacing, radii and shadows are CSS
  custom properties in `styles.css`; component CSS only consumes them.

## 5. Data Models

```
Profile ─┬─ socialLinks: SocialLink[] {platform, url}
         └─ stats: Stat[] {value, label}

Project {id (slug), name, tagline, description, longDescription,
         url?, repoUrl, status: LIVE|WIP|ARCHIVED, techStack[],
         imageUrls[] (hero first), highlights: Highlight[3] {title, body},
         hosting?, delivery?, featured}

Resume ─┬─ experience: Experience[] {role, employer, location, period, bullets[]}
        ├─ projects: ResumeProject[] {name, subtitle (stack line), bullets[], url?}
        ├─ education: Education[] {degree, school, year, note?}
        ├─ achievements: Achievement[] {name, org, period}
        └─ skills[], summary, pdfUrl
```

Exactly one project is `featured` (enforced by `InMemoryProjectRepositoryTest`).
`Project.url` is null until a project is deployed; the UI omits the "Open" button
and shows "Not deployed yet" on the detail page.

**Future database.** The natural shape is one table per record plus join tables
for the lists; the global scaffold recipe (Spring JDBC, `schema.sql`) applies if
the site ever needs editable content. Until then, content changes are code changes
reviewed in Git, which is acceptable for a single-owner site.

## 6. API Endpoints

| Method | Path | Response | Errors |
|--------|------|----------|--------|
| GET | `/api/profile` | `Profile` | — |
| GET | `/api/projects` | `Project[]` in display order | — |
| GET | `/api/projects/{id}` | `Project` | 404 when unknown |
| GET | `/api/resume` | `Resume` | — |
| GET | `/actuator/health` | `{"status":"UP"}` | — |
| GET | `/v3/api-docs` | OpenAPI 3.1 document (springdoc; `/api/**` only) | — |
| GET | `/docs` | Swagger UI over the document | — |

All endpoints are unauthenticated, read-only, JSON, and CORS-restricted to the
origins in `ALLOWED_ORIGIN` (default `http://localhost:4222`). Ports: API 8420,
dev server 4222 (non-default on purpose so they coexist with other local apps).

`/api/**` responses carry `Cache-Control: max-age=300, public` (a
`WebContentInterceptor` in `WebConfig`) and a **weak** ETag from
`ShallowEtagHeaderFilter`, so a repeat request with `If-None-Match` gets a 304 with
no body. The ETag is weak on purpose: Tomcat refuses to gzip a response that carries
a strong ETag, and `server.compression` is on (responses over 1 KB shrink ~3×).
Controllers are annotated for springdoc (`@Tag`, `@Operation`, `@ApiResponse`), and
`WebsitehubApplicationTests` asserts the generated document lists exactly the four
`/api` paths.

## 7. Scalability Considerations

Traffic is tiny (a portfolio). The API is stateless and in-memory, so it scales
horizontally trivially and, more relevantly, scales **to zero** on Cloud Run/Render
free tiers. The frontend is static and CDN-served. The only real "bottleneck" is
cold start latency on scale-to-zero hosts (seconds on Cloud Run, ~a minute on Render
free). Prerendered HTML absorbs it (with the deploy-time snapshot behind it for a page
that was not prerendered): the full site renders from the static host, and the live
response replaces it if it comes within `apiTimeoutMs`. API responses are gzipped and cacheable (weak ETag + 304,
`Cache-Control: max-age=300`), which keeps a metered free host's bandwidth low.

## 8. Security Considerations

- No authentication, no PII beyond the owner's published contact details. Note:
  the seed data contains a work email and phone number that are therefore public
  in the repo and the API — the owner should confirm that is intended.
- CORS whitelist; only GET/OPTIONS allowed on `/api/**`.
- Actuator exposes `health` only.
- Docker image runs a JRE (no build tools) and reads `PORT` from the environment;
  no secrets are needed, so none are stored.
- External links use `rel="noopener"`; no user-supplied HTML is rendered.
- Fonts are self-hosted and screenshots are local files, so a visit makes no
  third-party request. The only cross-origin calls are to the API and the
  `LiveStatus` probe: a credential-less `no-cors` GET of each project's public URL
  from its detail page, which learns nothing but whether the host answered.
- Dependencies are pinned by `package-lock.json` / Maven; CI builds from scratch on
  every push so drift is caught early.
