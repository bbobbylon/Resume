import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

/**
 * Providers for the server bundle: the browser config plus server rendering with the
 * per-route render modes in app.routes.server.ts. There is no server in production —
 * `outputMode: "static"` means `ng build` renders each route to a file under dist/ and
 * GitHub Pages hosts the files (docs/ARCHITECTURE.md → "Rendering").
 */
const serverConfig: ApplicationConfig = {
  /** Server rendering, told which routes to prerender and which to leave to the browser. */
  providers: [provideServerRendering(withRoutes(serverRoutes))],
};

/**
 * What `main.server.ts` bootstraps with: the browser providers plus the server ones.
 * Merging (rather than redeclaring) is what guarantees the prerendered HTML is
 * produced by the same routes, HTTP client and hydration setup the browser will use.
 */
export const config = mergeApplicationConfig(appConfig, serverConfig);
