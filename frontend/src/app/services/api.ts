import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, Observable, catchError, merge, share, takeUntil, timeout } from 'rxjs';
import { environment } from '../../environments/environment';

/** The backend's read-only resources; each has a same-named snapshot file. */
export type ApiResource = 'profile' | 'projects' | 'resume';

/**
 * The one place the frontend talks to the backend.
 *
 * `get('projects')` requests two things at once: the live endpoint
 * `${apiBaseUrl}/api/projects`, and `data/projects.json` — a snapshot of that same
 * endpoint that the Pages workflow captures from the backend at build time
 * (`frontend/scripts/snapshot.mjs`). Whichever answers first is emitted; if the
 * snapshot came first, the live response replaces it when it arrives. Both carry
 * the same commit's seed data, so the swap never changes what is on screen.
 *
 * That is what makes a free-tier API viable: Render puts an idle service to sleep
 * and takes about a minute to wake it, and without the snapshot every first
 * visitor would stare at skeletons for that long. With it, the page fills from the
 * same-origin file in a few hundred milliseconds, and the live API still gets its
 * request (which wakes it). The snapshot path is relative so it resolves under the
 * deployed `<base href>`.
 *
 * Failures are quiet: a live error or timeout (`environment.apiTimeoutMs`) leaves
 * the snapshot standing; a missing snapshot (locally, unless `npm run snapshot` was
 * run) leaves the live response; if both fail the stream completes without a value,
 * so `toSignal` consumers stay `undefined` and the pages keep their skeletons.
 */
@Injectable({ providedIn: 'root' })
export class Api {
  private readonly http = inject(HttpClient);

  get<T>(resource: ApiResource): Observable<T> {
    const liveUrl = `${environment.apiBaseUrl}/api/${resource}`;
    const live$ = this.http.get<T>(liveUrl).pipe(
      timeout(environment.apiTimeoutMs),
      catchError(() => {
        console.warn(`[api] ${liveUrl} unavailable — showing the deploy-time snapshot`);
        return EMPTY;
      }),
      share(),
    );
    const snapshot$ = this.http.get<T>(`data/${resource}.json`).pipe(catchError(() => EMPTY));
    // The snapshot only counts if it beats the live response; live always wins after that.
    return merge(snapshot$.pipe(takeUntil(live$)), live$);
  }
}
