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
  landingLayout: 'ledger' as LandingLayout,
};
