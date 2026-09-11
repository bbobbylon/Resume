import { Component, inject } from '@angular/core';
import { ProjectFilter } from '../../services/project-filter';
import { SearchIcon } from '../icons/search';

/**
 * The landing page's free-text project search, rendered next to `app-tech-filter`
 * in each layout's Projects section (all three have one, same as the chip row).
 *
 * Unlike a tech chip this can't be a plain `routerLink` — it's live-typed — so the
 * input writes to `ProjectFilter.search()` on every `(input)` event and that method
 * owns the debounce and the `?q=` navigation. `ProjectFilter` also owns the matching
 * against the catalogue; this component only renders the box.
 *
 * The `[value]` binding reads `filter.queryText()` rather than a local field, so the
 * box also follows the URL when it changes from outside a keystroke — a browser
 * Back/Forward through search history, or a deep link like `/?q=angular`.
 */
@Component({
  selector: 'app-project-search',
  imports: [SearchIcon],
  template: `
    <label class="search">
      <app-search-icon [size]="14" />
      <span class="sr-only">Search projects</span>
      <input
        type="search"
        placeholder="Search projects…"
        autocomplete="off"
        spellcheck="false"
        [value]="filter.queryText()"
        (input)="filter.search($any($event.target).value)"
      />
    </label>
  `,
  styles: `
    :host { display: block; margin: -6px 0 14px; }
    .search {
      display: flex; align-items: center; gap: 8px;
      max-width: 320px; padding: 7px 12px; border-radius: var(--radius-md);
      border: 1px solid var(--color-divider); color: var(--color-neutral-400);
      transition: border-color 0.15s ease;
    }
    .search:focus-within { border-color: var(--color-accent); color: var(--color-text); }
    input {
      flex: 1; min-width: 0; border: none; background: transparent; color: inherit;
      font: inherit; font-size: 13px; outline: none;
    }
    input::placeholder { color: inherit; }
    /* Safari/Chrome's built-in "clear" affordance on type=search, recoloured to match. */
    input::-webkit-search-cancel-button { filter: opacity(0.6); }
    @media (prefers-reduced-motion: reduce) { .search { transition: none; } }
  `,
})
export class ProjectSearch {
  /** All of this component's state; the template reads and writes through it directly. */
  protected readonly filter = inject(ProjectFilter);
}
