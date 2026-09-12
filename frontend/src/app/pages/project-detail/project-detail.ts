import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
import { LiveStatus } from '../../shared/live-status/live-status';
import { PageMeta } from '../../services/page-meta';

/** What the detail route is showing: still loading, a project, or nothing found. */
type DetailState = { kind: 'loading' } | { kind: 'found'; project: Project } | { kind: 'missing'; id: string };

/**
 * The `/projects/:id` route (handoff → "Project detail page"). Re-fetches whenever
 * the `:id` param changes (`switchMap`), so the "Next project" teaser can link to
 * another detail page without the component being recreated. The project comes
 * from the shared list in {@link ProjectService}; an unknown id errors and lands
 * in the `missing` state, which renders a not-found block instead of a blank page.
 * The "Live at" row carries a {@link LiveStatus} dot that probes the project's URL
 * from the visitor's browser, so the page says whether the deployment answers now.
 */
@Component({
  selector: 'app-project-detail',
  imports: [RouterLink, Nav, Footer, StatusTag, ProjectImage, ArrowUpRight, DomainPipe, LiveStatus],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.css',
})
export class ProjectDetail {
  /** Source of the `:id` path param that selects which project this page shows. */
  private readonly route = inject(ActivatedRoute);
  /** Looks the id up in the one already-fetched catalogue rather than making a second request. */
  private readonly projectService = inject(ProjectService);
  /** Sets this page's title/description/Open Graph tags once the project (or its absence) is known. */
  private readonly pageMeta = inject(PageMeta);

  /**
   * The page in one signal: loading, found, or missing. Modelled as a tagged union
   * rather than a nullable project so the template can tell "still loading" from
   * "no such project" — they need different markup, not just a different message.
   *
   * `switchMap` re-runs the lookup when the `:id` param changes (the "Next project"
   * teaser navigates between detail pages without leaving this component), and the
   * `tap`s are where the page's meta tags get applied for each outcome.
   */
  protected readonly state = toSignal(
    this.route.paramMap.pipe(
      map((params) => params.get('id') ?? ''),
      switchMap((id) =>
        this.projectService.getById(id).pipe(
          map((project): DetailState => ({ kind: 'found', project })),
          tap((s) => s.kind === 'found' && this.describe(s.project)),
          catchError(() => of<DetailState>({ kind: 'missing', id })),
          tap((s) => s.kind === 'missing' && this.pageMeta.apply({ title: 'Project not found — Robert Oliver, Jr.', description: `There is no project "${id}".`, path: `/projects/${id}/` })),
        ),
      ),
    ),
    { initialValue: { kind: 'loading' } as DetailState },
  );

  /** The project itself when found, else `undefined` — a convenience over {@link state}. */
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

  /**
   * Title + social tags for a found project; its social image follows the shots
   * naming convention.
   *
   * The description is the project's `description` alone. It used to be the tagline
   * and the description joined, which read as a stutter — the two say the same thing
   * in different words ("Zero-trust CIAM: revocable JWT sessions, TOTP MFA…" followed
   * by "Zero-trust CIAM platform: revocable JWT sessions, in-house TOTP MFA…") — and
   * the join ran to 218 characters, well past the ~160 a search result renders, so
   * the repeat was most of what anyone actually saw. `description` alone fits, reads
   * once, and matches what {@link structuredData} below already used.
   */
  private describe(project: Project): void {
    this.pageMeta.apply({
      title: `${project.name} — Robert Oliver, Jr.`,
      description: project.description,
      path: `/projects/${project.id}/`,
      image: project.imageUrls.length
        ? { url: `shots/${project.id}-social.jpg`, width: 1200, height: 630, alt: `${project.name} screenshot` }
        : undefined,
      jsonLd: this.structuredData(project),
    });
  }

  /**
   * What this page is, in schema.org terms, for the crawlers that read the
   * prerendered HTML: the project as `SoftwareSourceCode` (the type that actually
   * has `codeRepository` and `programmingLanguage` — every project here is a public
   * repository first and a deployment second), plus the breadcrumb trail that says
   * where the page sits, which is the part search engines render under the result.
   *
   * Everything comes from the same `Project` the page renders, so the description a
   * crawler gets and the description a visitor reads cannot drift apart.
   *
   * @param project the resolved project
   */
  private structuredData(project: Project): Record<string, unknown> {
    const url = this.pageMeta.absolute(`/projects/${project.id}/`);
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'SoftwareSourceCode',
          name: project.name,
          headline: project.tagline,
          description: project.description,
          url,
          codeRepository: project.repoUrl,
          programmingLanguage: project.techStack,
          author: { '@type': 'Person', name: 'Robert Oliver, Jr.' },
          // A live deployment is a product built from this source, not another URL for it.
          ...(project.url
            ? {
                targetProduct: {
                  '@type': 'SoftwareApplication',
                  name: project.name,
                  url: project.url,
                  applicationCategory: 'WebApplication',
                  operatingSystem: 'Any (web browser)',
                },
              }
            : {}),
          ...(project.imageUrls.length ? { image: this.pageMeta.absolute(project.imageUrls[0]) } : {}),
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Projects', item: this.pageMeta.absolute('/') },
            { '@type': 'ListItem', position: 2, name: project.name, item: url },
          ],
        },
      ],
    };
  }

  /**
   * Zero-pads a highlight's index: 0 → "01". The same numbering the Ledger and
   * Dossier layouts use, so a project reads consistently from card to detail page.
   *
   * @param i zero-based index from the template's `$index`
   */
  protected index(i: number): string {
    return String(i + 1).padStart(2, '0');
  }
}
