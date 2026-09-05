/**
 * The three interchangeable landing-page layouts from the Nocturne design handoff
 * (docs/design-handoff.md → "Landing variants"). All three render the same
 * profile + project data; only the template differs.
 *
 * - `ledger`  — 1a: single column of numbered project rows.
 * - `gallery` — 1b: featured card, 3-column card grid, stat band.
 * - `dossier` — 1c: sticky 360px aside beside a projects table + experience.
 */
export type LandingLayout = 'ledger' | 'gallery' | 'dossier';

/** Every valid layout, in the order the handoff lists them. */
export const LANDING_LAYOUTS: readonly LandingLayout[] = ['ledger', 'gallery', 'dossier'];

/** Type guard for values that arrive as plain strings (e.g. a `?layout=` query param). */
export function isLandingLayout(value: unknown): value is LandingLayout {
  return typeof value === 'string' && (LANDING_LAYOUTS as readonly string[]).includes(value);
}
