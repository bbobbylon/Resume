import { LandingLayout } from '../app/models/landing-layout';

/**
 * Production environment config — used by a plain `ng build` (default configuration
 * is "production"), and therefore by the deployed static site.
 *
 * `apiBaseUrl` is the public URL of the backend on Render — the web service named
 * `bobs-resume` (render.yaml), live since 2026-09-04. If the service is ever
 * recreated under another name, set the repo variable `API_BASE_URL` instead of
 * editing this file — the Pages workflow substitutes it before building
 * (docs/DEPLOYMENT.md → configuration).
 *
 * `apiTimeoutMs` bounds the live API request. The deploy-time snapshot renders as
 * soon as it arrives regardless; a live response inside this window replaces it
 * (services/api.ts), so a sleeping Render service never delays the page.
 *
 * `landingLayout` picks which of the three Nocturne landing layouts renders at `/`
 * (see LandingComponent). A `?layout=ledger|gallery|dossier` query param overrides
 * it at runtime so all three stay reviewable on the deployed site.
 */
export const environment = {
  production: true,
  apiBaseUrl: 'https://bobs-resume.onrender.com',
  apiTimeoutMs: 4000,
  /**
   * Where the prerender step (`ng build`, server bundle) reads its data: the backend
   * that run.sh / the Pages workflow start on this machine, never the public API.
   * See services/api.ts.
   */
  prerenderApiBaseUrl: 'http://localhost:8420',
  /**
   * Public origin of the site, used for absolute URLs in social-preview tags
   * (services/page-meta.ts). A placeholder, like the one in index.html: the Pages
   * workflow stamps the real origin into the built HTML and JS at deploy time.
   */
  siteUrl: 'https://bobbylon.dev',
  landingLayout: 'ledger' as LandingLayout,
};
