> **Location note (2026-09-04):** this is the original design handoff, moved from the repo root (`README1.md`).
> The design references it mentions now live in `docs/design/` (the `.dc.html` mocks, `support.js`, `image-slot.js`, `_ds/`).
> Open the mocks straight from that folder in a browser. The app-side implementation is described in [UI-DESIGN.md](UI-DESIGN.md).

# Handoff: WebsiteHub redesign (Nocturne)

## Overview
WebsiteHub is a personal portfolio hub: a resume-style profile plus a list of projects, each linking **out** to its own live deployment and GitHub repo. This package restyles the existing Angular 21 + Spring Boot 4.1 app (`websitehub/`) onto the Nocturne design system and adds two pages: an in-app resume and a project detail page.

Three landing-page directions are included. **All three are to be kept as selectable options** — the user has not picked one yet. Implement them as three interchangeable layouts of the same data (see "Landing variants" below).

## About the design files
The `.dc.html` files are **design references built in HTML** — they show intended look and behavior. Do not ship them. Recreate them inside `websitehub/frontend` (Angular 21, standalone components, signals, plain CSS — no CSS framework, per the repo README) using the app's existing component/service structure. Open the `.dc.html` files directly in a browser to view them (they load `support.js`, `image-slot.js` and `_ds/.../styles.css` from this folder).

`Current Site.dc.html` is a faithful copy of what the Angular app renders **today** — the "before". Everything else is the "after".

## Fidelity
**High-fidelity.** Colors, type, spacing and copy are final. Match them; every value comes from `_ds/nocturne-.../styles.css` (the Nocturne token sheet). Copy that file into `frontend/src/` and replace the current `styles.css` palette with it — it carries `:root` tokens plus the component classes (`.nav`, `.btn`, `.tag`, `.card`, `.table`, `.lighten`) the designs use. Read `_ds/.../readme.md` for the system's rules (outlined buttons, fading rules, `.lighten` on every image, no pure black/white, headings never bolder than 500).

## Content (real — use verbatim)
Profile:
- Name: Robert Oliver, Jr · brand mark in nav: `bobbylon`
- Title: Software Engineer · Identity & Access Management
- Employer: Deloitte Global / DTTL
- Location: Kaua‘i, Hawai‘i, USA · Phone 808-482-4518 · robeoliver@deloitte.com
- Links: linkedin.com/in/robert · github.com/bbobbylon
- Summary: "Full-stack engineer building a global zero-trust CIAM platform (Angular + Spring Boot) that secures a multibillion-dollar enterprise. Depth in secure authentication, OAuth2/OIDC, MFA, and REST APIs. B.C.S. Software Engineering, cum laude, and M.S. Computer Science (Software Engineering)."

Projects (the rest of the ~10 are still to be supplied by the owner):
1. **TesseraApp** — featured, status Live — https://tesseraapp.dev — repo: github.com/bbobbylon (exact repo URL TBD). Stack: Angular 21, Spring Boot 4, Java 21, Spring Security, MySQL, JWT, Docker, Azure CI/CD. Hosting: AWS ECS Fargate, CloudFront, Aiven MySQL.
2. **Luv2Shop** — status WIP — no live URL yet — repo TBD. Stack: Angular 21, Spring Boot 4, Java 21, MySQL, Stripe, Okta OIDC, Docker.
3. **WebsiteHub** — status Live (this app) — Stack: Angular 21, Spring Boot 4.1, Java 21, Render.

Full resume text (experience bullets, education, achievements, skills) is in `Resume.dc.html` — copy it verbatim.

## Backend changes (Spring Boot)
Extend the `Project` record and `InMemoryProjectRepository`:
- `repoUrl: String` (GitHub link, separate from `url` = live site; `url` may be null for WIP projects)
- `status: enum { LIVE, WIP, ARCHIVED }`
- `longDescription: String` and `highlights: List<Highlight{title, body}>` for the detail page (3 numbered highlights)
- `hosting: String`, `delivery: String` (detail page meta)
- `imageUrls: List<String>` (hero + up to 2 more screenshots); existing `imageUrl` can become the first entry
- `featured` already exists — keep.

Add a `Resume` record + `GET /api/resume` (or extend `Profile`): summary, `experience[] {role, employer, location, period, bullets[]}`, `projects[] {name, subtitle, stack[], bullets[], url?}`, `education[] {degree, school, year, note?}`, `achievements[] {name, org, period}`, `skills[]`, `pdfUrl`, `phone`, `location`.

`GET /api/projects/{id}` already exists — the detail page uses it.

## Frontend changes (Angular)
Routes (`app.routes.ts` is currently empty):
- `/` → landing (HeaderComponent + one of three landing layouts + FooterComponent)
- `/resume` → ResumeComponent
- `/projects/:id` → ProjectDetailComponent

Rename/restyle existing components: `header` → Nocturne `.nav`; `hero`/`about`/`projects` become the landing layouts; `footer` stays. Add `ResumeComponent`, `ProjectDetailComponent`, and a `ProjectStatusTagComponent` (Live → `.tag.tag-outline`, WIP → `.tag.tag-neutral`, Archived → `.tag.tag-neutral` at 60% opacity, Featured → `.tag.tag-accent`).

### Landing variants (keep all three)
Expose as an environment/config value `landingLayout: 'ledger' | 'gallery' | 'dossier'` (or a route query param during evaluation). Same data, three templates:

**1a Ledger** (`Hub Options.dc.html` → `#1a`)
- Single column, 1120 max-width, 56px side padding. Nav: brand, Projects, Resume, Contact, `.btn.btn-primary` "Download PDF".
- Hero: padding 112px top / 84px bottom, max-width 760px. H1 72px / line-height 1.1 / letter-spacing -0.015em / weight 500, margin-left -0.06em; two lines: "Robert Oliver, Jr." then "Builds identity that holds." in `--color-neutral-500`. Summary 17px/28px, max 58ch, 36px below. Buttons row 28px below: primary "View resume", ghost "github.com/bbobbylon".
- Section kicker: 44px×1px accent line + 13px uppercase accent text, letter-spacing 0.06em.
- Project rows: grid `120px | 1fr | 320px`, gaps 28px/48px, padding 42px 0, separated by a 1px rule fading to transparent over 48px each end (`--color-neutral-700`). Column 1: index "01" 15px accent tnum. Column 2: title 24px/28px weight 500 with status tags inline; description 15.5px/28px at text 78% opacity, max 52ch; stack tags `.tag.tag-neutral`; link row (`.btn.btn-primary` "Open <domain>" with Phosphor arrow-up-right 14px, `.btn.btn-secondary` "Source"). Column 3: 16:10 screenshot in `.lighten`, radius 8.
- Contact: two-column grid after a fading `--color-divider` rule; footer 13px at 55% text.

**1b Gallery** (`#1b`)
- Nav as above. Hero grid `5fr | 7fr`, gap 72px, align end, padding 84px 0 56px. H1 52px; title/employer 17px/28px `--color-neutral-400`; summary in right column 15.5px/28px at 78%.
- Featured card: `.card.elev-sm`, grid `7fr | 5fr`, gap 42px, padding 28px; screenshot left in `.lighten`, copy right (tags Featured + Live, h2 28px, description 15px/26px, stack tags, buttons).
- Grid below: 3 columns, gap 20px; `.card.elev-sm` padding 16.8px with 16:10 screenshot, `.card-title` + status tag row, `.card-body`, stack tags, `.card-meta` links. Last cell is a dashed `--color-neutral-800` placeholder showing where further projects land (remove once ≥3 projects; the grid is `repeat(3, 1fr)` and wraps).
- Resume band: full-bleed, background `radial-gradient(900px 420px at 85% -40%, color-mix(in srgb, var(--color-section-glow) 70%, transparent), transparent 64%), var(--color-section)`, padding 70px 56px; 4 cells space-between: stat 44px/56px weight 500 (`2022 —`, `100%`, `M.S. CS`) over 13px uppercase label at 64% text; 4th cell a `.btn` "Full resume" with text-colored border. This is the ONE saturated surface allowed on the page.
- Footer: space-between, © left, Email/LinkedIn/GitHub right.

**1c Dossier** (`#1c`)
- Two-column shell: `360px | 1fr`. Left aside sticky (padding 56px 42px 56px 56px, right border `--color-divider`): brand, H1 36px, title block 15px/24px neutral-400, summary 14px/24px at 78%, in-page nav (24px rule marker + label; active = accent), then at bottom `.btn.btn-primary.btn-block` "Download resume PDF" and contact links 13px/22px.
- Main (padding 56px 56px 42px 48px, sections 56px apart): Projects as `.table` — columns #, Project (name 16px/500 + 13px neutral-500 blurb, max 34ch), Stack (12px/20px neutral-400), Status tag, Links right-aligned (`.btn.btn-primary` 13px "Open ↗" + `.btn.btn-ghost` "Source"). Cells vertical-align top, 14px top padding. Experience: grid `140px | 1fr`, 14px/24px, period in neutral-500 tnum.

### Resume page (`Resume.dc.html`)
- Same nav, "Resume" gets `aria-current="page"`. Container 1120 max, padding 70px 56px 84px, grid `280px | 1fr`, gap 72px.
- Left aside sticky at top 70px: H1 36px, 13px uppercase accent title, contact list 13px/22px neutral-400, "Technical skills" label 11px uppercase neutral-500 over `.tag.tag-neutral` chips, `.btn.btn-primary` "Download PDF".
- Main: summary 17px/28px max 58ch; sections 56px apart with kicker; Experience grid `130px | 1fr` gap 28px, h2 20px/26px weight 500, employer line neutral-500, bullets 15px/26px at 78% opacity max 60ch, 6px gap; Projects list same type with a `.btn.btn-ghost` domain link; Education + Achievements side by side (two-column grid, gap 42px), each entry name 500 weight with year right-aligned in neutral-500 tnum.
- "Download PDF" links to `profile.resumeUrl` (Both: rendered page and PDF).

### Project detail page (`Project Detail.dc.html`)
- Back link "← All projects" 13px neutral-500. Header grid `7fr | 5fr`, gap 72px, align end, padding 42px 0 56px: tags row (Featured, Live, `/projects/<id>` as neutral tag), H1 60px, lede 17px/28px max 52ch at 78%. Right: buttons row (primary "Open <domain> ↗", secondary "Source on GitHub") + meta grid `auto | 1fr` (Live at / Hosting / Delivery; labels neutral-500, values text).
- Hero screenshot 21:9 in `.lighten`, radius 8.
- Body grid `1fr | 320px`, gap 72px, padding-top 70px. Left: "What it does" kicker + 3 numbered highlights (index 48px column, accent tnum; h2 20px/28px 500; body 15.5px/28px at 78%), then two 16:10 screenshots in a 2-col grid gap 20. Right aside: Stack chips; `.card.elev-sm` "Next project" teaser (`.card-kicker`, `.card-title`, `.card-body`, `.card-meta` with status tag + "View →").
- Footer space-between as in 1b.

## Interactions & behavior
- All external links `target="_blank" rel="noopener"`.
- Hover/active/focus come from `styles.css` (`.btn`, `.nav a`, `.table tbody tr:hover`); do not restyle. Keyboard focus = 2px accent `:focus-visible` ring (already in the sheet).
- Nav: current route gets `aria-current="page"` (renders accent).
- Loading: components already use signals via `toSignal`; render section skeletons at the same heights rather than "Loading…" text. Empty project image → keep the 16:10 box as `--color-surface` with the project's initial letter centered in neutral-600.
- Responsive: below 880px collapse project rows/grids to one column; below 720px the Dossier aside stacks above main and loses `position: sticky`; the stat band goes to 2 columns; the resume/detail two-column grids stack. Nav links hide below 480px (brand + Download PDF remain).
- Status tag component: Live → `.tag-outline`, WIP → `.tag-neutral`, Archived → `.tag-neutral` + opacity .6, Featured → `.tag-accent` (shown before the status tag).

## State
- `ProfileService` (exists) → profile signal. Add `ResumeService` → `GET /api/resume`.
- `ProjectService` (exists) → list; add `getById(id)` → `GET /api/projects/{id}` for the detail route.
- Landing layout selection: `environment.landingLayout` read by a `LandingComponent` that switches templates with `@switch`.

## Design tokens (from `_ds/.../styles.css`)
- Ground `--color-bg` #161826 · surface `--color-surface` #232532 · text `--color-text` #e9e9ed · accent `--color-accent` #9184d9 · divider `--color-divider` = text at 16%.
- Neutral ramp 100–900: #f3f5fe #e4e7f5 #cfd3e5 #b2b6ca #9397ab #75798c #595d6c #3f424d #292b31. Accent ramp 100–900: #f5f4ff #e7e5fe #d2cefd #b5abfc #968ae0 #796cbf #5d5294 #423a6a #2b2741.
- Section ground (stat band only) `--color-section` #262a60, glow #353b80.
- Page background (all Nocturne pages): `radial-gradient(1000px 600px at 82% -140px, color-mix(in srgb, var(--color-accent-900) 75%, transparent), transparent 60%), radial-gradient(900px 700px at -10% 100%, color-mix(in srgb, black 30%, transparent), transparent 55%), var(--color-bg)`.
- Type: Inter (Google Fonts, weights 400/500/600/700, loaded by the sheet). Headings weight 500, never bolder. Body 15px/1.55. Display sizes used: 72, 60, 52, 44, 36, 28, 24, 20, 17, 15.5, 15, 14, 13, 12, 11. Text rhythm 28px leading, 14px half-step.
- Spacing scale `--space-1..8`: 2.8, 5.6, 8.4, 11.2, 16.8, 22.4px. Page gutter 56px, container 1120px, section gaps 56px.
- Radii `--radius-sm/md/lg`: 4 / 8 / 14px. Shadows `--shadow-sm` `0 0 0 1px #3f424d`, `--shadow-md` `0 0 0 1px #595d6c, 0 6px 18px rgba(0,0,0,.55)`.
- Rules: 1px, `linear-gradient(to right, transparent, <ink> 48px calc(100% - 48px), transparent)`; ink is `--color-divider` for section separators, `--color-neutral-700` between content rows. Kicker mark: solid 44px×1px accent.
- Muted text: `color-mix(in srgb, var(--color-text) 78%, transparent)` for body copy, 64%/55% for labels/footer, neutral-500/400 for secondary lines.

## Assets
- Icons: Phosphor (https://phosphoricons.com), inline SVG on `currentColor`. Used: `arrow-up-right` (regular) at 12–14px inside buttons.
- Screenshots: none supplied yet. The designs use drop-in placeholders (`<image-slot>`); in the app these are `<img>` in a `.lighten` wrapper at 16:10 (cards/rows) and 21:9 (detail hero). Prefer captures on the app's dark theme so the lighten blend sinks the background.
- Resume PDF: `profile.resumeUrl` (currently a placeholder in `InMemoryProfileRepository`).

## Files in this package
- `Hub Options.dc.html` — landing variants 1a Ledger, 1b Gallery, 1c Dossier (side by side; the outer grey chrome and badges are review scaffolding, not part of the design).
- `Resume.dc.html` — /resume.
- `Project Detail.dc.html` — /projects/:id (TesseraApp).
- `Current Site.dc.html` — the app as it renders today, for comparison.
- `_ds/nocturne-.../styles.css` — the token sheet and component classes to adopt. `_ds/.../readme.md` — the system's rules.
- `support.js`, `image-slot.js`, `_ds_bundle.js` — runtime for viewing the `.dc.html` files only; not for the app.

## Suggested Claude Code prompt
"Read design_handoff_websitehub/README.md. Restyle websitehub/frontend onto the Nocturne tokens in _ds/styles.css, add /resume and /projects/:id routes, implement the three landing layouts behind environment.landingLayout, and extend the Spring Boot Project/Profile models as described. Keep the existing Controller → Service → Repository layering and the existing tests passing; add tests for the new endpoints."
