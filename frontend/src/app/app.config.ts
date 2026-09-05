import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { routes } from './app.routes';

/**
 * App-wide providers, assembled once here and passed into `bootstrapApplication` in
 * main.ts.
 *
 * - `provideHttpClient(withFetch())` — the data services all call the backend over
 *   `HttpClient`; `fetch` is what the prerender step (Node) needs.
 * - `provideClientHydration` — every route is prerendered at build time
 *   (app.config.server.ts), so the browser adopts the HTML it received instead of
 *   re-creating it, and replays clicks that happened before the app booted.
 * - `withInMemoryScrolling` — `anchorScrolling` makes the nav's "Projects" link
 *   (`/#projects`) scroll to the section on the landing page, and
 *   `scrollPositionRestoration` returns you to where you were when you press Back
 *   from a project detail page instead of dumping you at the top.
 * - `withViewTransitions` — a short cross-fade between routes where the browser
 *   supports the View Transitions API (skipped for visitors who prefer reduced
 *   motion, and on the first navigation); a plain swap elsewhere.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
      withViewTransitions({
        skipInitialTransition: true,
        onViewTransitionCreated: ({ transition }) => {
          if (globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches) transition.skipTransition();
        },
      }),
    ),
    provideHttpClient(withFetch()),
    provideClientHydration(withEventReplay()),
  ],
};
