import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, map, shareReplay } from 'rxjs';
import { Api } from './api';
import { Project } from '../models/project.model';

/**
 * The project catalogue. One request (through {@link Api}, so it has the snapshot
 * fallback) is shared by every landing layout, the detail page and its "Next
 * project" teaser: `projects` is the list as a signal, `getById` looks a project up
 * in that same list. The backend also serves `GET /api/projects/{id}`; the frontend
 * deliberately does not use it, so a sleeping API costs one fallback, not two.
 */
@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly api = inject(Api);

  /** Fetched once, replayed to every subscriber for the life of the app. */
  private readonly projects$ = this.api
    .get<Project[]>('projects')
    .pipe(shareReplay({ bufferSize: 1, refCount: false }));

  /** All projects in display order, or `undefined` until the request resolves. */
  readonly projects = toSignal(this.projects$);

  /** The project with this id; errors for unknown ids (the detail page shows not-found). */
  getById(id: string): Observable<Project> {
    return this.projects$.pipe(
      map((list) => {
        const project = list.find((p) => p.id === id);
        if (!project) throw new Error(`No project with id "${id}"`);
        return project;
      }),
    );
  }
}
