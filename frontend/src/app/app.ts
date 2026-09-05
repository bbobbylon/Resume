import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Root component. Nothing but a `RouterOutlet`: each routed page (landing, resume,
 * project detail) composes its own nav and footer, because the three landing
 * layouts style those differently (the Dossier layout, for instance, has no top
 * nav at all — its brand and links live in the sticky aside).
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class App {}
