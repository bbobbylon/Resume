import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { isLandingLayout, LandingLayout } from '../../models/landing-layout';
import { Ledger } from './ledger/ledger';
import { Gallery } from './gallery/gallery';
import { Dossier } from './dossier/dossier';

/**
 * The `/` route. Picks one of the three Nocturne landing layouts and renders it
 * with `@switch` (handoff → "Landing variants"):
 *
 * 1. `?layout=ledger|gallery|dossier` in the URL wins — so every layout stays
 *    reviewable on the deployed site without a rebuild;
 * 2. otherwise `environment.landingLayout` (the committed default).
 *
 * All three layouts read the same `ProfileService` / `ProjectService` signals;
 * only the template and styles differ.
 */
@Component({
  selector: 'app-landing',
  imports: [Ledger, Gallery, Dossier],
  template: `
    @switch (layout()) {
      @case ('gallery') { <app-gallery /> }
      @case ('dossier') { <app-dossier /> }
      @default { <app-ledger /> }
    }
  `,
})
export class Landing {
  private readonly route = inject(ActivatedRoute);

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
