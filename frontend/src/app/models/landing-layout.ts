/**
 * The four interchangeable landing-page layouts: the three from the Nocturne
 * design handoff (docs/design-handoff.md → "Landing variants") plus `folio`,
 * added 2026-09-13 (the owner's ask — a resume-forward landing, not part of the
 * original handoff). All four render the same profile + project + resume data;
 * only the template differs.
 *
 * - `ledger`  — 1a: single column of numbered project rows.
 * - `gallery` — 1b: featured card, 3-column card grid, stat band.
 * - `dossier` — 1c: sticky 360px aside beside a projects table + experience.
 * - `folio`   — resume-first: the `/resume` page's `280px | 1fr` shell (summary,
 *   full experience, education, achievements), with the project catalogue
 *   condensed to a single linked chip row rather than a full grid.
 */
export type LandingLayout = 'ledger' | 'gallery' | 'dossier' | 'folio';

/** Every valid layout, for membership checks — presentation order lives in `LayoutSwitcher`, not here. */
export const LANDING_LAYOUTS: readonly LandingLayout[] = ['ledger', 'gallery', 'dossier', 'folio'];

/** Type guard for values that arrive as plain strings (e.g. a `?layout=` query param). */
export function isLandingLayout(value: unknown): value is LandingLayout {
  return typeof value === 'string' && (LANDING_LAYOUTS as readonly string[]).includes(value);
}
