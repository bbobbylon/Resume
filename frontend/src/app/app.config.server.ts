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
  providers: [provideServerRendering(withRoutes(serverRoutes))],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
