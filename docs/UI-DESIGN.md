# UI/UX Design — WebsiteHub (Nocturne)

| | |
|---|---|
| **Version** | 0.3.0 |
| **Date** | 2026-09-04 |
| **Source of truth** | `frontend/src/styles.css` (tokens + components) · [design-handoff.md](design-handoff.md) · mocks in `docs/design/*.dc.html` |
| **Related** | [SRS.md](SRS.md) · [ARCHITECTURE.md](ARCHITECTURE.md) |

## 1. Design System — Nocturne

Nocturne is a dark, single-accent system. Rules from its readme that the app follows:
outlined (never filled) buttons, rules that fade to transparent at both ends, every
screenshot inside a `.lighten` wrapper (mix-blend-mode so dark UI captures sink into
the ground), no pure black or white, headings never bolder than 500.

**Colour palette** (CSS custom properties in `styles.css`)

| Token | Value | Use |
|-------|-------|-----|
| `--color-bg` | `#161826` | page ground (under two radial gradients — accent bloom top-right, shadow bottom-left) |
| `--color-surface` | `#232532` | cards, image placeholders |
| `--color-text` | `#e9e9ed` | body text; muted copy at 78 % (`.muted`), labels 64 %, footer 55 % |
| `--color-accent` | `#9184d9` | links, kickers, primary button, `aria-current`, Featured tag |
| `--color-divider` | text @ 16 % | section rules, card outlines |
| Neutral ramp 100–900 | `#f3f5fe … #292b31` | 400/500 secondary text, 600 placeholder initials, 700 row rules, 800 neutral tags |
| Accent ramp 100–900 | `#f5f4ff … #2b2741` | 800/100 = accent tag fill/text; 900 feeds the page bloom |
| `--color-section` / `-glow` | `#262a60` / `#353b80` | the Gallery stat band — the one saturated surface allowed |

**Typography.** Inter, self-hosted: one variable woff2 (weights 100–900,
`font-display: swap`) per unicode-range subset — latin (48 kB) and latin-ext — under
`src/fonts/`, declared with `@font-face` at the top of `styles.css`; no font CDN.
Body 15 px / 1.55. Headings weight 500, line-height 1.1–1.15, letter-spacing −0.015 em,
display sizes optically outdented with `margin-left: −0.06em`. Sizes in use:
72 (Ledger H1), 60 (detail H1), 52 (Gallery H1), 44 (stats), 36 (aside H1),
28, 24, 20 (H2s), 17 / 15.5 / 15 (body), 14 / 13 / 12 / 11 (meta, labels, tags).
Rhythm: 28 px leading with a 14 px half-step. Numerals in indexes/periods use
`.tnum` (tabular).

**Spacing.** Sheet scale `--space-1…8` = 2.8 / 5.6 / 8.4 / 11.2 / 16.8 / 22.4 px.
Page scale: container 1120 px, gutter 56 px, section gap 56 px, hero 112/84 px
(Ledger) or 84/56 px (Gallery), row padding 42 px.

**Radii / elevation.** `--radius-sm/md/lg` 4 / 8 / 14 px. `--shadow-sm` is a 1 px
neutral-800 hairline (`.elev-sm`), `--shadow-md` adds ambient darkness.

**Icons / imagery.** Phosphor `arrow-up-right` (regular) as inline SVG on
`currentColor`, 12–14 px inside buttons (`ArrowUpRight` component). Screenshots at
16:10 (cards, rows) and 21:9 (detail hero), radius 8, `.lighten`. Captures are WebP
in `public/shots/`: `<id>-<n>.webp` (1600×1000) plus `<id>-<n>-800.webp` for the
`srcset`, and `<id>-social.jpg` (1200×630, top crop) as the page's social preview,
all written by `npm run shots` (`scripts/screenshots.mjs`, sharp). `ProjectImage`
emits `srcset`/`sizes`, so a 320 px card slot on a 1× screen downloads the 800 px
file (≈ 12 kB) while heroes and retina screens get the 1600 px one; the first image
on a page is eager with `fetchpriority="high"`, the rest lazy. One capture serves
both ratios because the hero crops it from the top (`object-position: top`). A
project with no captures gets a surface-coloured box with its initial in neutral-600.

## 2. Component Library

From the Nocturne sheet (global classes): `.btn` (+ `.btn-primary` accent outline,
`.btn-secondary` divider outline, `.btn-ghost` text-only, `.btn-block`),
`.tag` (+ `.tag-accent`, `.tag-neutral`, `.tag-outline`), `.card` (+ `.card-kicker`,
`.card-title`, `.card-body`, `.card-meta`), `.elev-sm/md/lg`, `.nav` + `.nav-brand`,
`.table`, `.lighten`, `.hr`.

App primitives added in `styles.css`: `.container`, `.kicker` (44 × 1 px accent
mark + 13 px uppercase label), `.rule` / `.rule-row` (fading divider / neutral-700),
`.muted`, `.muted-64`, `.muted-55`, `.tnum`, `.tag-row`, `.skeleton`, `.sr-only`.

Angular components (`frontend/src/app/shared/`):

| Component | Selector | Purpose |
|-----------|----------|---------|
| `Nav` | `app-nav` | brand → `/`, Projects → `/#projects` (current on `/` and `/projects/*`), Resume (`routerLinkActive`), Contact (mailto), primary "Download PDF". Links hide < 480 px. |
| `Footer` | `app-footer` | © left, Email / LinkedIn / GitHub right; `compact` input for the one-line Ledger footer. |
| `StatusTag` | `app-status-tag` | Live → `.tag-outline`, WIP → `.tag-neutral`, Archived → `.tag-neutral` @ 0.6, `featured` → accent "Featured". |
| `ProjectImage` | `app-project-image` | 16:10 / 21:9 `.lighten` frame with placeholder initial; `srcset`/`sizes` derived from the file name, `priority` input for the page's LCP image. |
| `LiveStatus` | `app-live-status` | 8 px dot + 13 px label — "Checking…" (pulsing), "Up now" (success), "Not reachable right now" (warning) — from a browser-side `no-cors` probe of the project URL after hydration. |
| `ArrowUpRight` | `app-arrow-up-right` | Phosphor icon, `size` input. |
| `DomainPipe` | `| domain` | `https://tesseraapp.dev/` → `tesseraapp.dev`; `domain:true` keeps the path. |

## 3. Layout Patterns

**Routes.** `/` (landing), `/resume`, `/projects/:id`, `**` (not found). All are
prerendered at build time and hydrated. Anchor scrolling and scroll restoration are
enabled so `/#projects` and Back behave; route changes cross-fade for 160 ms through
the View Transitions API where the browser supports it (skipped under reduced motion).

**Landing variants** (`?layout=` or `environment.landingLayout`, default `ledger`):

- **1a Ledger** — single 1120 px column. 72 px two-line H1 (name / tagline in
  neutral-500), 17/28 summary ≤ 58ch, primary "View resume" + ghost GitHub link.
  Project rows: grid `120px | 1fr | 320px`, gaps 28/48, padding 42 px, fading
  neutral-700 rules; index in accent tnum, 24 px title with tags inline, 15.5/28
  description ≤ 52ch, stack chips, "Open <domain> ↗" / "Source" / "Details".
  Two-column contact block, one-line footer.
- **1b Gallery** — hero `5fr | 7fr` (52 px H1, title/employer in neutral-400,
  summary right). Featured project as `.card.elev-sm` grid `7fr | 5fr`, then a
  3-column card grid (dashed "Next project" slots keep the grid square until ≥ 3
  non-featured projects), then the full-bleed stat band on `--color-section` with
  44 px stats over 13 px uppercase labels and a text-outlined "Full resume" button.
- **1c Dossier** — shell `360px | 1fr`. Sticky aside (brand, 36 px H1, three-line
  title block, 14/24 summary, in-page nav with 24 px rule markers, block "Download
  resume PDF", contact links) beside a `.table` of projects (#, Project + blurb ≤ 34ch,
  Stack, Status, right-aligned links) and an Experience grid `140px | 1fr` fed by
  `/api/resume`.

**Resume page.** Grid `280px | 1fr`, gap 72, padding 70/84. Sticky aside (36 px H1,
13 px uppercase accent title, contact lines, skill chips, PDF button). Main: 17/28
summary, Experience grid `130px | 1fr`, Projects list with ghost domain link and a
13 px stack line, Education + Achievements side by side.

**Project detail.** "← All projects", header `7fr | 5fr` (tags incl. the route as a
neutral tag, 60 px H1, 17/28 lede ≤ 52ch; actions + `auto | 1fr` meta grid for Live
at — domain link plus the live-status dot — / Hosting / Delivery), 21:9 hero, body `1fr | 320px` (numbered highlights with a
48 px accent index column, two 16:10 screenshots; stack chips and a "Next project"
card), space-between footer.

**Not found.** Nav, a `.missing` block (kicker "404", H1 "Page not found", the
requested path in `<code>`, primary button home + ghost button to the resume),
Footer. It is the `**` route; on GitHub Pages the client shell `index.csr.html` is
the `404.html` the host serves for unknown deep links, so the app boots and routes
them here.

**Responsive breakpoints.**

| Width | Behaviour |
|-------|-----------|
| ≤ 880 px | project rows/grids collapse to one column; heroes stack; resume and detail grids stack; container gutter 28 px; stat band 2 columns |
| ≤ 720 px | Dossier aside stacks above main and loses `position: sticky`; Stack column hidden |
| ≤ 480 px | nav links hidden (brand + Download PDF remain); Dossier timeline single column; gutter 20 px; stat band 1 column |

**Print (`@media print`).** Tokens flip to a light palette, nav/footer hide, the
resume page becomes a single column with a header block; `@page` Letter with 14 mm
margins. This is what `npm run resume:pdf` captures.

## 4. User Flows

1. **Recruiter → live project.** Land on `/` → scan rows/cards → "Open tesseraapp.dev ↗"
   (new tab) or "Details" → `/projects/tesseraapp` → highlights, stack, "Source on GitHub".
2. **Recruiter → resume.** Nav "Resume" → `/resume` → read; "Download PDF" → `resume.pdf`.
3. **Owner → choose layout.** Append `?layout=gallery` / `dossier` → compare → set
   `environment.landingLayout` → redeploy.
4. **Owner → add a project.** Add a `Project` to `InMemoryProjectRepository` (status
   WIP, `url` null) → tests enforce id uniqueness / 3 highlights / one featured →
   when deployed, set `url` and status `LIVE`.

## 5. Accessibility

- Target WCAG 2.1 AA. Text on ground: `#e9e9ed` on `#161826` ≈ 14:1; muted 78 % ≈ 9:1;
  neutral-500 on ground ≈ 5.5:1; accent `#9184d9` on ground ≈ 5.6:1. Footer text at
  55 % is decorative-level (≈ 5:1 still passes for 13 px).
- Landmarks: `nav[aria-label]`, `main`, `aside`, `footer`; sections labelled by
  their kicker via `aria-labelledby`.
- Keyboard: every action is a real `<a>`/`<button>`; `:focus-visible` shows a 2 px
  accent ring (from the sheet). Duplicate image links are `tabindex="-1"` +
  `aria-hidden` so tab order isn't doubled.
- Motion: the skeleton shimmer, the live-status pulse and the route cross-fade are
  all disabled under `prefers-reduced-motion`.
- Live status is a `role="status"` element with an `aria-label` ("Live site Up now"),
  so the dot's colour is never the only signal.
- Images: real screenshots get descriptive `alt`; placeholders expose the project
  name via `role="img"` + `aria-label`.

## 6. Styling Conventions

- Plain CSS, one file per component (`styleUrl`) or inline `styles` for tiny ones.
  No preprocessor, no utility framework, no `::ng-deep`.
- Only consume tokens; never hard-code a colour in component CSS (the print palette
  works because of this).
- Class names are short, kebab-case, scoped by Angular's emulated encapsulation
  (`.row`, `.copy`, `.shot`, `.band`, …). Global classes come only from `styles.css`.
- Per-component style budget: 12 kB warn / 20 kB error (`angular.json`); the
  largest today is the Dossier at ~4 kB.
- Skeleton classes are prefixed `sk-` and live next to the component they mimic.
  Hero skeletons must reproduce the loaded hero's height so nothing shifts when data
  lands: each bar is `height: 1lh` (px/em fallback) with vertical padding and
  `background-clip: content-box`, and the bar count mirrors the seed profile at the
  Lighthouse viewports — Ledger 3 heading + 4 summary lines (7 on phones), Gallery
  2 name lines above 880 px, 3 role lines, 5 summary lines (7 on phones), plus a
  `.sk-btn` row. Measured pixel-equal at 1350 px and 412 px on 2026-09-04 (CLS 0.01).

## 7. Mockups & References

- `docs/design/Hub Options.dc.html` — 1a/1b/1c side by side (open directly in a browser).
- `docs/design/Resume.dc.html`, `Project Detail.dc.html`, `Current Site.dc.html` (the "before").
- `docs/design/_ds/nocturne-…/styles.css` + `readme.md` — the token sheet and its rules.
- Implementation screenshots (2026-09-04) were reviewed at 1280 px and 390 px for
  all five pages; no visual regressions against the mocks. Real captures for
  TesseraApp and WebsiteHub were then wired in and checked in the `.lighten`
  treatment at 16:10 (rows, cards, extra shots) and 21:9 (detail hero).
- `public/og.png` (1200×630) is the landing hero, used for social previews of `/` and
  `/resume`; each project page previews with its own `shots/<id>-social.jpg`.
