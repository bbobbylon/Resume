import { afterNextRender, computed, inject, Injectable, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Project } from '../models/project.model';
import { ProjectService } from './project.service';

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
   * The chips to render: the popular families, plus the selected one when a deep
   * link picked a technology too rare to have earned a chip — the active filter
   * always has a visible, clickable home.
   */
  readonly chips = computed<TechFacet[]>(() => {
    const facets = this.facets();
    const active = this.selected();
    return active && !facets.includes(active) ? [...facets, active] : facets;
  });

  /** The projects to render, filtered; `undefined` until the catalogue loads. */
  readonly projects = computed<Project[] | undefined>(() => {
    const list = this.all();
    const active = this.selected();
    if (!list || !active) return list;
    return list.filter((p) => p.techStack.some((t) => techFamily(t) === active.key));
  });

  /** How many projects exist in total, filtered or not — the "of 6" in "3 of 6". */
  readonly total = computed(() => this.all()?.length ?? 0);
}
