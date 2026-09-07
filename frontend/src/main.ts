import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

/**
 * Browser entry point. Boots the root {@link App} component with the providers in
 * app.config.ts — which include hydration, so this picks up the prerendered HTML
 * GitHub Pages served rather than re-rendering it (see docs/ARCHITECTURE.md ->
 * "Rendering"). The server-side twin is main.server.ts.
 */
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
