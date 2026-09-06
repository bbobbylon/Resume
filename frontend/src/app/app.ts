import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommandPalette } from './shared/command-palette/command-palette';

/**
 * Root component. A `RouterOutlet` plus the one piece of shared shell every page
 * needs regardless of layout: `CommandPalette`, the Ctrl+K / Cmd+K overlay. Each
 * routed page (landing, resume, project detail) otherwise composes its own nav and
 * footer, because the three landing layouts style those differently (the Dossier
 * layout, for instance, has no top nav at all — its brand and links live in the
 * sticky aside).
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommandPalette],
  template: '<router-outlet /><app-command-palette />',
})
export class App {}
