import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Nav } from '../../shared/nav/nav';
import { Footer } from '../../shared/footer/footer';

/**
 * The `**` route. On GitHub Pages every unknown path serves a copy of index.html,
 * so the app boots here for typos and stale links. Showing what happened (and the
 * way back) beats the old silent redirect home, and gives search engines a real
 * not-found page. Same block as the project detail page's "missing" state.
 */
@Component({
  selector: 'app-not-found',
  imports: [RouterLink, Nav, Footer],
  template: `
    <app-nav />
    <main class="container">
      <section class="missing">
        <p class="kicker">404</p>
        <h1>Page not found</h1>
        <p class="muted">There's nothing at <code>{{ path }}</code>. It may have moved, or the link was mistyped.</p>
        <div class="actions">
          <a class="btn btn-primary" routerLink="/">Back to the hub</a>
          <a class="btn btn-ghost" routerLink="/resume">View resume</a>
        </div>
      </section>
    </main>
    <app-footer />
  `,
  styles: `
    .missing { padding: 84px 0 112px; max-width: 52ch; }
    .missing h1 { font-size: 36px; margin: 0 0 14px; }
    .missing code { font-family: ui-monospace, monospace; color: var(--color-neutral-400); }
    .actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 24px; }
  `,
})
export class NotFound {
  /** The path the visitor asked for, relative to the app's base href. */
  protected readonly path = inject(Location).path() || '/';
}
