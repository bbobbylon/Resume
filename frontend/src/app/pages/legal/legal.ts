/**
 * Shared bits of the two legal pages, `TermsPage` (`/terms`) and `PrivacyPage`
 * (`/privacy`). They are siblings on purpose: one stylesheet (legal.css), one
 * "last updated" date, and one place to change when either policy changes.
 *
 * Both pages are plain prose — no data, no services beyond {@link PageMeta} — so
 * they prerender to finished HTML like the rest of the site (app.routes.server.ts)
 * and are reachable from every page's footer.
 */

/**
 * The date shown at the top of both pages. Kept as one constant so the two can
 * never disagree about when the policies last changed — bump it whenever the text
 * of either page changes materially, and note the change in docs/BACKLOG.md.
 */
export const LEGAL_UPDATED = '7 September 2026';
