import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { config } from './app/app.config.server';

/**
 * Entry point of the server bundle. Nothing serves it at runtime: `ng build` runs it
 * once per route to prerender the HTML (angular.json → `outputMode: "static"`).
 */
const bootstrap = (context: BootstrapContext) => bootstrapApplication(App, config, context);

export default bootstrap;
