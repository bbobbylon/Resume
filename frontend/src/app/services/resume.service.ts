import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Api } from './api';
import { Resume } from '../models/resume.model';

/**
 * Exposes the in-app resume (`GET /api/resume`, via {@link Api} so it has the
 * snapshot fallback) as a signal. Same shape and rationale as {@link ProfileService}.
 */
@Injectable({ providedIn: 'root' })
export class ResumeService {
  private readonly api = inject(Api);

  /** The resume, or `undefined` until the request resolves. */
  readonly resume = toSignal(this.api.get<Resume>('resume'));
}
