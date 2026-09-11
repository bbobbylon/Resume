import { afterNextRender, computed, inject, Injectable, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Project } from '../models/project.model';
import { ProjectService } from './project.service';

/** How long {@link ProjectFilter.search} waits after the last keystroke before touching the URL. */
const SEARCH_DEBOUNCE_MS = 200;

/** One filterable technology: what its chip says and how many projects use it. */
export interface TechFacet {
  /** Display label — the family without its version, e.g. `Angular` for `Angular 21`. */
  label: string;
  /** Match key — {@link label} lowercased. */
  key: string;
  /** How many projects use this family (each project counts once). */
  count: number;
}

/** A family needs this many projects to earn a chip of its own. */
const MIN_PROJECTS = 2;

/**
 * A tech-stack entry with its trailing version dropped: `Angular 21` → `Angular`,
 * `Spring Boot 4.1` → `Spring Boot`, `GitHub Actions` → `GitHub Actions`. Only a
 * *trailing* version token goes, so `React Router` stays its own family instead of
 * folding into `React 19`.
 */
export function familyLabel(tech: string): string {
  return tech.replace(/\s+v?\d+(\.\d+)*$/, '').trim();
}

/** {@link familyLabel} lowercased — the key two spellings of one technology share. */
export function techFamily(tech: string): string {
  return familyLabel(tech).toLowerCase();
}

/**
 * The landing page's "filter by tech" state, shared by all three layouts so the
 * chips (`app-tech-filter`) and the project list they filter can live in different
 * components without passing inputs through each layout.
 *
 * The filter is a `?tech=` query param — `/?tech=Angular` is a shareable link to
 * "the Angular projects", and it merges with the existing `?layout=` param instead
 * of replacing it. Matching is by *family*, so `?tech=Angular` also matches a
 * project that lists `Angular 21`; cards still print their own exact spelling.
 *
 * An unrecognised `?tech=` shows everything rather than an empty page — the same
 * forgiving rule `Landing` applies to an unknown `?layout=`, and it means no layout
 * ever has to render a "nothing matched" state.
 *
 * A second, independent axis — `?q=` free-text search over name, tagline and stack
 * — merges with `?tech=` the same way: both narrow the same {@link projects} list,
 * a project must satisfy whichever of the two are set, and {@link search} (called
 * from the search box's `(input)`, not a link) writes `?q=` the way a chip's
 * `routerLink` writes `?tech=`.
 *
 * The param is only honoured **after hydration** (`live`): `/` is prerendered at
 * build time with no query string, so filtering during the first render would hand
 * the browser markup that disagrees with the HTML it is adopting. Same reason
 * `LiveStatus` and `GithubActivity` wait for `afterNextRender`.
 */
@Injectable({ providedIn: 'root' })
export class ProjectFilter {
  /**
   * The router's root route, which is where query params live. Injected here rather
   * than passed in from `Landing`, so the chips and each layout's list both read the
   * same `?tech=` without threading it through three templates.
   */
  private readonly route = inject(ActivatedRoute);
  /** Used by {@link search} to write `?q=` — a chip can use a plain `routerLink`, a live-typed search box cannot. */
  private readonly router = inject(Router);
  /** The unfiltered catalogue; everything below is derived from it. */
  private readonly all = inject(ProjectService).projects;

  /** False until the browser has adopted the prerendered HTML; always false on the server. */
  private readonly live = signal(false);

  /**
   * The raw `?tech=` value as a signal, seeded from the route snapshot so the first
   * render already has it. Raw on purpose — {@link selected} decides whether it names
   * anything real.
   */
  private readonly param = toSignal(
    this.route.queryParamMap.pipe(map((q) => q.get('tech'))),
    { initialValue: this.route.snapshot.queryParamMap.get('tech') },
  );

  /** The raw `?q=` value as a signal, seeded the same way as {@link param}. */
  private readonly queryParam = toSignal(
    this.route.queryParamMap.pipe(map((q) => q.get('q'))),
    { initialValue: this.route.snapshot.queryParamMap.get('q') },
  );

  /** Pending {@link search} write, so a fast typist only touches the URL once they pause. */
  private searchTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    afterNextRender(() => this.live.set(true));
  }

  /** Every technology family in the catalogue, most-used first. */
  private readonly allFacets = computed<TechFacet[]>(() => {
    const byKey = new Map<string, TechFacet>();
    for (const project of this.all() ?? []) {
      // A project that lists two spellings of one family still counts once.
      const families = new Map<string, string>();
      for (const tech of project.techStack) {
        const label = familyLabel(tech);
        if (label) families.set(label.toLowerCase(), label);
      }
      for (const [key, label] of families) {
        const facet = byKey.get(key);
        if (facet) facet.count++;
        else byKey.set(key, { key, label, count: 1 });
      }
    }
    return [...byKey.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  });

  /** The families worth offering as chips — one-off technologies would just be a link to one project. */
  private readonly facets = computed(() => this.allFacets().filter((f) => f.count >= MIN_PROJECTS));

  /** The active facet, or `undefined` when every project is shown. */
  readonly selected = computed<TechFacet | undefined>(() => {
    if (!this.live()) return undefined;
    const wanted = this.param();
    return wanted ? this.allFacets().find((f) => f.key === techFamily(wanted)) : undefined;
  });

  /**
   * The raw `?q=` text, exactly as typed (for redisplaying it in the search box —
   * including after a browser Back restores an earlier search) — `''` before
   * hydration or when the param is absent.
   */
  readonly queryText = computed(() => (this.live() ? (this.queryParam() ?? '') : ''));

  /** {@link queryText} trimmed and lowercased for matching, or `undefined` when there is nothing to match. */
  private readonly query = computed<string | undefined>(() => this.queryText().trim().toLowerCase() || undefined);

  /** True once a tech chip, a search term, or both narrow the catalogue. */
  readonly active = computed(() => !!this.selected() || !!this.query());

  /**
   * The chips to render: the popular families, plus the selected one when a deep
   * link picked a technology too rare to have earned a chip — the active filter
   * always has a visible, clickable home.
   */
  readonly chips = computed<TechFacet[]>(() => {
    const facets = this.facets();
    const active = this.selected();
    return active && !facets.includes(active) ? [...facets, active] : facets;
  });

  /**
   * The projects to render: everything left after applying both axes — a project
   * must match the selected tech family (if any) *and* contain the search text (if
   * any) in its name, tagline or stack. `undefined` until the catalogue loads.
   */
  readonly projects = computed<Project[] | undefined>(() => {
    const list = this.all();
    if (!list) return list;
    const tech = this.selected();
    const q = this.query();
    if (!tech && !q) return list;
    return list.filter((p) => {
      if (tech && !p.techStack.some((t) => techFamily(t) === tech.key)) return false;
      return !q || this.matchesQuery(p, q);
    });
  });

  /** Whether `q` (already trimmed/lowercased) appears in a project's name, tagline or stack. */
  private matchesQuery(project: Project, q: string): boolean {
    return (
      project.name.toLowerCase().includes(q) ||
      project.tagline.toLowerCase().includes(q) ||
      project.techStack.some((t) => t.toLowerCase().includes(q))
    );
  }

  /** How many projects exist in total, filtered or not — the "of 6" in "3 of 6". */
  readonly total = computed(() => this.all()?.length ?? 0);

  /**
   * Writes `?q=` from the search box as the visitor types, debounced so a fast
   * typist produces one navigation per pause rather than one per keystroke. Landing
   * is the only route `ProjectFilter` is used from, so the navigation targets it
   * directly the way a tech chip's `routerLink="/"` does.
   *
   * @param value the search box's current text; an empty/whitespace value clears `?q=`
   */
  search(value: string): void {
    clearTimeout(this.searchTimer);
    const q = value.trim() || null;
    this.searchTimer = setTimeout(() => {
      void this.router.navigate(['/'], { queryParams: { q }, queryParamsHandling: 'merge', replaceUrl: true });
    }, SEARCH_DEBOUNCE_MS);
  }
}
