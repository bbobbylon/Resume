import { LandingLayout } from '../app/models/landing-layout';

/**
 * Production environment config — used by a plain `ng build` (default configuration
 * is "production"), and therefore by the deployed static site.
 *
 * `apiBaseUrl` is the URL Render gives the backend service named in render.yaml
 * (`websitehub-backend`). If Render has to add a suffix because the name is taken,
 * set the repo variable `API_BASE_URL` instead of editing this file — the Pages
 * workflow substitutes it before building (docs/DEPLOYMENT.md → configuration).
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
  apiBaseUrl: 'https://websitehub-backend.onrender.com',
  apiTimeoutMs: 4000,
  landingLayout: 'ledger' as LandingLayout,
};
