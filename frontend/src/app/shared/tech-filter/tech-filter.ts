import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProjectFilter } from '../../services/project-filter';

/**
 * The landing page's "filter by tech" chip row, rendered inside each layout's
 * Projects section (all three have one) so the control sits with the list it
 * filters rather than floating above the hero like `LayoutSwitcher`.
 *
 * Every chip is a real link that sets `?tech=` — filtering is shareable, works
 * with Back, and merges with `?layout=` instead of dropping it. `ProjectFilter`
 * holds the state and does the matching; this component only renders it.
 *
 * The links carry `fragment="projects"` so a click lands back on the Projects
 * section: a query-param change is still a router navigation, and the router's
 * `scrollPositionRestoration` would otherwise jump the visitor to the top of the
 * page every time they picked a chip.
 *
 * Nothing renders until the catalogue has at least one shared technology, so an
 * empty or one-project API never leaves a stray "All" chip behind.
 */
@Component({
  selector: 'app-tech-filter',
  imports: [RouterLink],
  template: `
    @if (filter.chips().length) {
      <nav class="tech-filter" aria-label="Filter projects by technology">
        <a
          class="chip"
          routerLink="/"
          [queryParams]="{ tech: null }"
          queryParamsHandling="merge"
          fragment="projects"
          [attr.aria-current]="filter.selected() ? null : 'true'"
        >All <span class="count">{{ filter.total() }}</span></a>
        @for (facet of filter.chips(); track facet.key) {
          <a
            class="chip"
            routerLink="/"
            [queryParams]="{ tech: facet.label }"
            queryParamsHandling="merge"
            fragment="projects"
            [attr.aria-current]="filter.selected()?.key === facet.key ? 'true' : null"
          >{{ facet.label }} <span class="count">{{ facet.count }}</span></a>
        }
      </nav>
      @if (filter.selected(); as facet) {
        <p class="filter-summary" role="status">
          Showing {{ filter.projects()?.length ?? 0 }} of {{ filter.total() }} projects built with {{ facet.label }}.
        </p>
      }
    }
  `,
  styles: `
    :host { display: block; margin: -14px 0 26px; }
    .tech-filter { display: flex; flex-wrap: wrap; gap: 8px; }
    .chip {
      display: inline-flex; align-items: center; gap: 7px;
      font-size: 12px; padding: 5px 11px; border-radius: var(--radius-md);
      border: 1px solid var(--color-divider); color: var(--color-text);
      text-decoration: none; transition: background 0.15s ease, border-color 0.15s ease;
    }
    .chip:hover { background: color-mix(in srgb, var(--color-text) 7%, transparent); }
    .chip[aria-current] {
      border-color: var(--color-accent); color: var(--color-accent);
      box-shadow: inset 0 0 0 1px var(--color-accent);
    }
    .count { font-size: 11px; opacity: 0.6; font-variant-numeric: tabular-nums; }
    .filter-summary { margin: 12px 0 0; font-size: 13px; color: var(--color-neutral-400); }
    @media (prefers-reduced-motion: reduce) { .chip { transition: none; } }
  `,
})
export class TechFilter {
  /** All of this component's state; the template reads its signals directly. */
  protected readonly filter = inject(ProjectFilter);
}
