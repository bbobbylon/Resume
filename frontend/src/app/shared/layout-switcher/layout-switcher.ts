import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LandingLayout } from '../../models/landing-layout';

/**
 * Thin strip above the chosen landing layout with a real link to each of the
 * three interchangeable variants (docs/UI-DESIGN.md → "Landing variants"), so a
 * visitor can reach Gallery/Dossier without knowing the `?layout=` query param —
 * that param still exists underneath and is what these links set.
 *
 * `queryParamsHandling="merge"` matters as much as the param itself: a layout
 * switch changes *how* the projects are shown, never *which*, so `?tech=` and `?q=`
 * have to survive it. Without the merge Angular replaces the whole query string,
 * and the href would read `/?layout=gallery` even while the visitor was looking at
 * a filtered, searched list — which also means a copied link would lose them.
 * `TechFilter`'s chips merge for the same reason.
 */
@Component({
  selector: 'app-layout-switcher',
  imports: [RouterLink],
  template: `
    <nav class="seg layout-switch" aria-label="Landing layout">
      @for (l of layouts; track l.id) {
        <a
          class="seg-opt"
          routerLink="/"
          [queryParams]="{ layout: l.id }"
          queryParamsHandling="merge"
          [attr.aria-current]="current() === l.id ? 'page' : null"
          >{{ l.label }}</a
        >
      }
    </nav>
  `,
  styles: `
    :host { display: flex; justify-content: center; padding: var(--space-3) 0; }
    .seg-opt[aria-current='page'] { color: var(--color-accent); box-shadow: inset 0 0 0 1px var(--color-accent); cursor: default; }
    .seg-opt:not([aria-current='page']):hover { background: color-mix(in srgb, var(--color-text) 7%, transparent); }
  `,
})
export class LayoutSwitcher {
  /** Which layout is showing, so its own link renders as `aria-current="page"` rather than a live link. */
  readonly current = input.required<LandingLayout>();

  /** The three variants, in the order the design lists them. */
  protected readonly layouts: { id: LandingLayout; label: string }[] = [
    { id: 'ledger', label: 'Ledger' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'dossier', label: 'Dossier' },
  ];
}
