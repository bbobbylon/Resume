import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

/**
 * App-wide providers, assembled once here and passed into `bootstrapApplication` in
 * main.ts.
 *
 * - `provideHttpClient()` — the data services all call the backend over `HttpClient`.
 * - `withInMemoryScrolling` — `anchorScrolling` makes the nav's "Projects" link
 *   (`/#projects`) scroll to the section on the landing page, and
 *   `scrollPositionRestoration` returns you to where you were when you press Back
 *   from a project detail page instead of dumping you at the top.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
    ),
    provideHttpClient(),
  ],
};
