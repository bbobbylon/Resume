import { Component, DOCUMENT, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommandPalette } from './shared/command-palette/command-palette';

/**
 * Root component. A `RouterOutlet` plus the two pieces of shared shell every page
 * needs regardless of layout: the skip link, and `CommandPalette`, the Ctrl+K /
 * Cmd+K overlay. Each routed page (landing, resume, project detail, the legal
 * pages) otherwise composes its own nav and footer, because the three landing
 * layouts style those differently (the Dossier layout, for instance, has no top nav
 * at all — its brand and links live in the sticky aside).
 *
 * The skip link lives here rather than in `Nav` for exactly that reason: Dossier
 * renders no `Nav`, and a bypass link that some layouts lack is worse than none.
 * Every routed page's landmark is `<main id="main" tabindex="-1">`, which is what
 * this link targets.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommandPalette],
  template: `
    <a class="skip-link" href="#main" (click)="skipToContent($event)">Skip to content</a>
    <router-outlet />
    <app-command-palette />
  `,
  styles: `
    /* Off-screen until focused — the first Tab on any page reveals it. */
    .skip-link {
      position: fixed; top: 0; left: 0; z-index: 100;
      transform: translateY(-120%);
      padding: 10px 16px; border-radius: 0 0 8px 0;
      background: var(--color-surface); color: var(--color-accent);
      border: 1px solid var(--color-accent); border-top: 0; border-left: 0;
      font-size: 14px; text-decoration: none;
    }
    .skip-link:focus-visible { transform: translateY(0); }
  `,
})
export class App {
  /** The document the skip link moves focus within; injected so this stays server-safe. */
  private readonly doc = inject(DOCUMENT);

  /**
   * Moves focus (not just the scroll position) to the page's `<main>`.
   *
   * The `href="#main"` alone would scroll there and is what a visitor gets before
   * hydration, but browsers disagree about whether it also *focuses* the target —
   * so the next Tab can land back in the nav, which defeats the point of a bypass
   * link. Focusing by hand is the reliable version; `preventDefault` keeps the URL
   * clean of a `#main` fragment the router would otherwise carry between routes.
   *
   * @param event the click, so the default fragment navigation can be suppressed
   */
  protected skipToContent(event: Event): void {
    const main = this.doc.getElementById('main');
    if (!main) return; // No landmark on this route: let the browser do its default thing.
    event.preventDefault();
    main.focus(); // `focus()` scrolls the element into view on its own; no scrollIntoView needed.
  }
}
