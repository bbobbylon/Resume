import { inject, Injectable, makeStateKey, PLATFORM_ID, TransferState } from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { catchError, EMPTY, merge, Observable, of, share, takeUntil, tap, timeout } from 'rxjs';
import { environment } from '../../environments/environment';

/** The three read-only resources the backend serves under `/api/`. */
export type ApiResource = 'profile' | 'projects' | 'resume';

/**
 * The one door to the backend. Each data service calls `get(resource)` once and turns
 * the observable into a signal; this class decides where the data comes from.
 *
 * **At build time (server bundle).** `ng build` prerenders every route against the
 * backend that run.sh / the Pages workflow started on localhost
 * (`environment.prerenderApiBaseUrl`). The response is rendered into the HTML and also
 * written to `TransferState`, which Angular serialises into the page.
 *
 * **In the browser.** Two sources race and whichever answers first is shown:
 * - the data the page arrived with — `TransferState` on a prerendered page, otherwise
 *   the deploy-time snapshot `data/<resource>.json` (`npm run snapshot`);
 * - the live API, bounded by `apiTimeoutMs`. A live answer replaces the older data; a
 *   failure only logs a warning because the page is already full. That is what makes
 *   Render's free tier (asleep after 15 idle minutes, ~1 min to wake) invisible.
 */
@Injectable({ providedIn: 'root' })
export class Api {
  private readonly http = inject(HttpClient);
  private readonly transfer = inject(TransferState);
  private readonly onServer = isPlatformServer(inject(PLATFORM_ID));

  get<T>(resource: ApiResource): Observable<T> {
    const key = makeStateKey<T | null>(`api:${resource}`);

    if (this.onServer) {
      const url = `${environment.prerenderApiBaseUrl}/api/${resource}`;
      return this.http.get<T>(url).pipe(
        tap((data) => this.transfer.set(key, data)),
        catchError(() => {
          console.warn(`[api] ${url} unavailable at build time — prerendering this page with skeletons`);
          return EMPTY;
        }),
      );
    }

    const liveUrl = `${environment.apiBaseUrl}/api/${resource}`;
    const live$ = this.http.get<T>(liveUrl).pipe(
      timeout(environment.apiTimeoutMs),
      catchError(() => {
        console.warn(`[api] ${liveUrl} unavailable — showing the build-time data`);
        return EMPTY;
      }),
      share(),
    );
    const prerendered = this.transfer.get(key, null);
    const first$ = prerendered !== null
      ? of(prerendered)
      : this.http.get<T>(`data/${resource}.json`).pipe(catchError(() => EMPTY));
    // live$ is subscribed first: the prerendered value emits synchronously, and if it
    // were the only subscriber of the shared live$ at that moment, completing would
    // cancel the live request and merge would start a second one.
    return merge(live$, first$.pipe(takeUntil(live$)));
  }
}
