import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { isLandingLayout, LandingLayout } from '../../models/landing-layout';
import { Ledger } from './ledger/ledger';
import { Gallery } from './gallery/gallery';
import { Dossier } from './dossier/dossier';
import { LayoutSwitcher } from '../../shared/layout-switcher/layout-switcher';
import { PageMeta, SITE_DESCRIPTION, SITE_TITLE } from '../../services/page-meta';

/**
 * The `/` route. Picks one of the three Nocturne landing layouts and renders it
 * with `@switch` (handoff → "Landing variants"):
 *
 * 1. `?layout=ledger|gallery|dossier` in the URL wins;
 * 2. otherwise `environment.landingLayout` (the committed default).
 *
 * `LayoutSwitcher` renders above the chosen layout with a real link to each of
 * the other two, so all three stay reachable to a visitor, not just reviewable
 * via a hand-typed query param.
 *
 * All three layouts read the same `ProfileService` / `ProjectService` signals;
 * only the template and styles differ.
 */
@Component({
  selector: 'app-landing',
  imports: [Ledger, Gallery, Dossier, LayoutSwitcher],
  template: `
    <app-layout-switcher [current]="layout()" />
    @switch (layout()) {
      @case ('gallery') { <app-gallery /> }
      @case ('dossier') { <app-dossier /> }
      @default { <app-ledger /> }
    }
  `,
})
export class Landing {
  private readonly route = inject(ActivatedRoute);

  constructor() {
    inject(PageMeta).apply({ title: SITE_TITLE, description: SITE_DESCRIPTION, path: '/' });
  }

  private readonly queryLayout = toSignal(
    this.route.queryParamMap.pipe(map((q) => q.get('layout'))),
    { initialValue: this.route.snapshot.queryParamMap.get('layout') },
  );

  /** The layout to render right now. */
  readonly layout = computed<LandingLayout>(() => {
    const fromQuery = this.queryLayout();
    return isLandingLayout(fromQuery) ? fromQuery : environment.landingLayout;
  });
}
