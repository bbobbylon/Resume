# Software Requirements Specification — WebsiteHub

| | |
|---|---|
| **Version** | 0.3.0 (prerendered) |
| **Date** | 2026-09-04 |
| **Status** | Baseline complete; hosting decided (see [DEPLOYMENT.md](DEPLOYMENT.md)), go-live pending the owner; open items in [BACKLOG.md](BACKLOG.md) |
| **Related** | [ARCHITECTURE.md](ARCHITECTURE.md) · [UI-DESIGN.md](UI-DESIGN.md) · [DEPLOYMENT.md](DEPLOYMENT.md) · [design-handoff.md](design-handoff.md) |

## 1. Executive Summary

WebsiteHub is Robert Oliver, Jr.'s personal portfolio site: an in-app resume plus a
catalogue of software projects, where every project links **out** to its own live
deployment and GitHub repository. It exists so that a recruiter or collaborator can
read the resume, click a project, and use the real running application — not a
screenshot.

**Stakeholders:** the owner (Robert Oliver, Jr. — content, hosting budget, final
design choice); visitors (recruiters, hiring managers, peers).

**Goals**
1. Present the resume and project catalogue in a polished, consistent design (Nocturne).
2. Keep every project independently deployable; the hub only stores names, copy and URLs.
3. Run on free or near-free hosting, with automated build/test/deploy (CI/CD) from GitHub.

## 2. System Overview

**Problem.** A GitHub profile shows code, not running software, and a PDF resume can't
link to anything. WebsiteHub combines both: one URL that carries the resume and
opens each project's live app.

**Users.**
- *Visitor* — reads the profile, opens live projects and source, downloads the PDF resume.
- *Owner* — edits content (currently Java seed classes), picks a landing layout,
  deploys.

**Main features.**
- Landing page in one of three interchangeable layouts (Ledger, Gallery, Dossier).
- Project detail pages with highlights, stack, hosting/delivery metadata and screenshots.
- In-app resume page mirroring the PDF, plus PDF download.
- JSON API (`/api/profile`, `/api/projects`, `/api/projects/{id}`, `/api/resume`)
  that the frontend renders and that could feed other clients later.

## 3. Functional Requirements

| ID | Requirement | Where |
|----|-------------|-------|
| FR-1 | `GET /api/profile` returns name, brand, title, employer, tagline, bio, contact fields, resume URL, social links and stat cells. | `ProfileController` |
| FR-2 | `GET /api/projects` returns all projects in display order, each with id, name, tagline, description, long description, live URL (nullable), repo URL, status (`LIVE`/`WIP`/`ARCHIVED`), tech stack, image URLs, three highlights, hosting, delivery, featured flag and a problem/approach/outcome case study. | `ProjectController` |
| FR-3 | `GET /api/projects/{id}` returns one project or HTTP 404. | `ProjectController` |
| FR-4 | `GET /api/resume` returns summary, skills (grouped into labeled categories), experience, resume projects, education, achievements and the PDF URL. | `ResumeController` |
| FR-5 | The landing route `/` renders the layout named by `environment.landingLayout`; a `?layout=ledger\|gallery\|dossier` query parameter overrides it for review. Unknown values fall back to the default. | `Landing` |
| FR-6 | Every layout shows all projects with status tags, stack chips, an "Open <domain>" button when a live URL exists, a "Source" link, and a link to the detail page. | `Ledger`, `Gallery`, `Dossier` |
| FR-7 | `/projects/:id` renders the detail page (tags, title, lede, actions, meta grid, 21:9 hero, a problem/approach/outcome case study, numbered highlights, extra screenshots, stack, "Next project" teaser) and a not-found state for unknown ids. | `ProjectDetail` |
| FR-8 | `/resume` renders the full resume from `/api/resume`, with contact details from `/api/profile`, and a "Download PDF" link to `profile.resumeUrl`. | `ResumePage` |
| FR-9 | `frontend/public/resume.pdf` is generated from the `/resume` page's print stylesheet (`npm run resume:pdf`). | `scripts/resume-pdf.mjs` |
| FR-10 | Nav marks the current section with `aria-current="page"`; external links open in a new tab with `rel="noopener"`. | `Nav`, all layouts |
| FR-11 | While data loads, pages render skeleton blocks of the same footprint rather than "Loading…" text. | all pages |
| FR-12 | Unknown routes render a not-found page (404 kicker, the requested path, links home and to the resume) with the app's nav and footer; on Pages the client shell (`index.csr.html`) is served as `404.html`, so unknown deep links boot the app and reach it. | `NotFound`, `app.routes.ts` |
| FR-13 | CORS allows only the origins listed in `ALLOWED_ORIGIN` (comma-separated), GET/OPTIONS only. | `WebConfig` |
| FR-14 | `/api/**` responses are gzipped and carry `Cache-Control: max-age=300, public` plus a weak ETag; `If-None-Match` revalidates with 304. | `WebConfig`, `application.yml` |
| FR-15 | The API publishes an OpenAPI 3.1 document at `/v3/api-docs` (the four `/api` paths only) and Swagger UI at `/docs`. | `OpenApiConfig`, controllers |
| FR-16 | The frontend shows build-time data immediately — the prerendered page's `TransferState`, else the deploy-time snapshot — and lets the live API response replace it. | `Api`, `scripts/snapshot.mjs` |
| FR-17 | Every route is prerendered to static HTML at build time (`/`, `/resume`, each `/projects/<id>` the API lists) and hydrated in the browser; an id unknown at build time renders client-side. | `app.routes.server.ts`, `main.server.ts` |
| FR-18 | Each page sets its own `<title>`, meta description and Open Graph/Twitter tags; a project page uses its first screenshot (1200×630 JPEG) as the preview image. | `PageMeta` |
| FR-19 | Screenshots are served as WebP with an 800 px `srcset` variant; the first image on a page loads eagerly with high fetch priority, the rest lazily. | `ProjectImage`, `scripts/screenshots.mjs` |
| FR-20 | `sitemap.xml` is generated from the prerendered routes on every build. | `scripts/sitemap.mjs` |
| FR-21 | The project detail page shows whether the project's live URL answers right now — checking, up, or not reachable — probed from the visitor's browser. | `LiveStatus` |
| FR-22 | Route changes cross-fade where the browser supports view transitions; the fade is skipped under reduced motion. | `app.config.ts` |
| FR-23 | The landing page shows the most recent recognized public GitHub event (push, PR, issue, star, fork or release) for `environment.githubUsername`, fetched live client-side from GitHub's public REST API; nothing renders on a rate limit, network error, or no public activity in the last 90 days. | `GithubActivity` |
| FR-24 | Ctrl+K / Cmd+K opens a global search overlay (also reachable from a trigger button in the nav and Dossier's aside) listing Home, Resume, every project and a theme-toggle action, filtered by substring as the visitor types; arrow keys move the highlight, Enter runs the highlighted item, Escape or a backdrop click closes it, and Tab is swallowed so focus never leaves the search field. | `CommandPalette`, `CommandPaletteTrigger`, `CommandPaletteService` |

## 4. Non-Functional Requirements

- **Performance.** Static frontend ≤ 400 kB raw initial JS (currently ~370 kB / ~96 kB
  transferred). Lighthouse on the static build served with gzip, mobile emulation,
  API unreachable: performance 99, accessibility 100, best practices 96, SEO 100;
  FCP 1.7 s, LCP 1.9 s, CLS 0.01; 200 kB total transfer and no third-party host
  (fonts self-hosted, screenshots WebP with `srcset`) (2026-09-04) — measured
  before `GithubActivity` (FR-23) existed. That widget deliberately adds exactly
  one small, deferred, client-side call to `api.github.com` (chosen over an
  embeddable third-party stats-image service for this reason); it never blocks
  render, adds no bundled script, and fails silently, so its effect on the score
  above is expected to be minor but has not been re-measured. API responses
  are in-memory and answer in single-digit milliseconds once the JVM is warm. Cold
  starts on scale-to-zero hosting are hidden by prerendering: every page arrives
  complete from the static host even when the API is asleep.
- **Cost.** Target $0/month for hosting; domain ≤ ~$15/year. No paid tier without
  the owner's explicit decision.
- **Security.** Read-only public API, no authentication, no user data. HTTPS is
  provided by the host. CORS whitelist. No secrets in the repo; configuration via
  environment variables.
- **Availability.** Best-effort; free tiers may sleep. The frontend must render full
  content from the prerendered HTML (or the deploy-time snapshot) when the API is
  cold or down, and at least its shell (nav, skeletons) when even that is missing.
- **Accessibility.** Semantic landmarks, `aria-current`, keyboard-visible focus
  rings (2 px accent), reduced motion respected for the skeleton shimmer, the
  live-status pulse and route transitions. The command palette (FR-24) follows
  the ARIA combobox/listbox pattern (`aria-activedescendant` tracks the
  highlighted option) and traps focus on its one real focusable control, the
  search field. Target WCAG 2.1 AA.
- **Responsiveness.** Usable from 360 px to 1440 px wide; breakpoints at 880 / 720 / 480 px.
- **Maintainability.** Controller → Service → Repository layering on the backend;
  standalone signal-based components on the frontend; every new endpoint gets a
  slice test; docs updated alongside code.

## 5. User Stories

- As a **recruiter**, I want to open a project and use the live app so that I can
  judge the work, not just the write-up.
- As a **recruiter**, I want to read the resume in the browser and download a PDF
  so that I can share it internally.
- As the **owner**, I want to switch between three landing layouts without
  rebuilding so that I can pick one after seeing them with real content.
- As the **owner**, I want the site to deploy automatically on push so that I never
  hand-upload a build.
- As the **owner**, I want project data behind an API so that a database or CMS can
  replace the seed classes later without touching the UI.

## 6. Success Criteria

- All three landing layouts, the resume page and the detail page render from live
  API data with no console errors (verified locally on 2026-09-04).
- CI (`.github/workflows/ci.yml`) is green: backend `mvn verify` (13 tests) and
  frontend `ng test` (37 tests) + `npm run build`, which must prerender every
  project page.
- Every page's HTML carries its content and its own title, description and social
  tags before any JavaScript runs, and Lighthouse stays ≥ 95 on performance with
  100 on accessibility and SEO.
- The site is reachable on a custom domain over HTTPS at $0/month hosting.
- At least one project (TesseraApp) is `LIVE` with a working "Open" button; each
  further project flips to `LIVE` as it is deployed.

## 7. Constraints

- **Technical.** Angular 21 + Spring Boot 4.1 / Java 21 / Maven; plain CSS only
  (Nocturne token sheet, no framework); no database yet (in-memory seed data).
- **Content.** Resume copy is used verbatim from the design handoff. The LinkedIn
  URL in the seed is a placeholder, the TesseraApp repo URL is the profile URL until
  the real repo is public, and the last two projects are placeholder entries drawn
  from public GitHub repos (see `InMemoryProjectRepository`).
- **Budget / hosting.** Free hosting tiers only. Decided 2026-09-04 (the owner
  delegated the choice): GitHub Pages for the frontend and Render's free tier for
  the API, no card on file; Cloud Run stays documented as the alternative.
- **Timeline.** None fixed; the baseline is complete and further work is
  incremental (more projects, deployment).
