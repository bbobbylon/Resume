import { LandingLayout } from '../app/models/landing-layout';

/**
 * Development environment config. `angular.json`'s "development" build
 * configuration file-replaces environment.ts with this file, so `ng serve` (which
 * defaults to that configuration) talks to a locally-running backend with zero
 * extra setup — just run the backend on its default local port 8420 alongside it.
 */
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8420',
  /** Upper bound for the live API request; the snapshot renders regardless (see services/api.ts). */
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
