import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Api } from './api';
import { Profile } from '../models/profile.model';

/**
 * Exposes the hub's profile data as a signal any component can read with
 * `profileService.profile()`. The request (and its snapshot fallback) lives in
 * {@link Api}.
 *
 * <p>Why `toSignal` instead of Angular's newer `resource()`/`httpResource()` APIs:
 * those are still experimental as of Angular 21, and this service has exactly one
 * thing to fetch with no reactive parameters to re-trigger it (no search box, no
 * pagination). `toSignal` has been stable since Angular 16 and does the one thing
 * needed here. Uses `inject()` so the field can be initialised inline.
 */
@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly api = inject(Api);

  /** The current profile, or `undefined` until the request resolves. */
  readonly profile = toSignal(this.api.get<Profile>('profile'));
}
