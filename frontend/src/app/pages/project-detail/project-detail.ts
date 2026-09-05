import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { Project } from '../../models/project.model';
import { ProjectService } from '../../services/project.service';
import { Nav } from '../../shared/nav/nav';
import { Footer } from '../../shared/footer/footer';
import { StatusTag } from '../../shared/status-tag/status-tag';
import { ProjectImage } from '../../shared/project-image/project-image';
import { ArrowUpRight } from '../../shared/icons/arrow-up-right';
import { DomainPipe } from '../../shared/pipes/domain.pipe';

/** What the detail route is showing: still loading, a project, or nothing found. */
type DetailState = { kind: 'loading' } | { kind: 'found'; project: Project } | { kind: 'missing'; id: string };

/**
 * The `/projects/:id` route (handoff → "Project detail page"). Re-fetches whenever
 * the `:id` param changes (`switchMap`), so the "Next project" teaser can link to
 * another detail page without the component being recreated. The project comes
 * from the shared list in {@link ProjectService}; an unknown id errors and lands
 * in the `missing` state, which renders a not-found block instead of a blank page.
 */
@Component({
  selector: 'app-project-detail',
  imports: [RouterLink, Nav, Footer, StatusTag, ProjectImage, ArrowUpRight, DomainPipe],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.css',
})
export class ProjectDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly projectService = inject(ProjectService);
  private readonly title = inject(Title);

  protected readonly state = toSignal(
    this.route.paramMap.pipe(
      map((params) => params.get('id') ?? ''),
      switchMap((id) =>
        this.projectService.getById(id).pipe(
          map((project): DetailState => ({ kind: 'found', project })),
          tap((s) => s.kind === 'found' && this.title.setTitle(`${s.project.name} — Robert Oliver, Jr.`)),
          catchError(() => of<DetailState>({ kind: 'missing', id })),
        ),
      ),
    ),
    { initialValue: { kind: 'loading' } as DetailState },
  );

  protected readonly project = computed(() => {
    const s = this.state();
    return s.kind === 'found' ? s.project : undefined;
  });

  /** The project after this one in list order (wrapping), for the aside teaser. */
  protected readonly next = computed(() => {
    const list = this.projectService.projects();
    const current = this.project();
    if (!list || !current || list.length < 2) return undefined;
    const i = list.findIndex((p) => p.id === current.id);
    return list[(i + 1) % list.length];
  });

  protected index(i: number): string {
    return String(i + 1).padStart(2, '0');
  }
}
