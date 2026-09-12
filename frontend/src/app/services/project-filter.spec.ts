import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { Project } from '../models/project.model';
import { familyLabel, ProjectFilter, techFamily } from './project-filter';

const caseStudy = { problem: 'p', approach: 'a', outcome: 'o' };

function project(id: string, techStack: string[]): Project {
  return {
    id, name: id, tagline: 't', description: 'd', longDescription: 'l', url: null,
    repoUrl: 'https://github.com/bbobbylon/x', status: 'LIVE', techStack, imageUrls: [],
    highlights: [], hosting: null, delivery: null, featured: false, caseStudy,
  };
}

/** Two spellings of Angular, two of Spring Boot, and a one-off — the real catalogue's shape. */
const projects = [
  project('tesseraapp', ['Angular 21', 'Spring Boot 4', 'Docker']),
  project('websitehub', ['Angular 21', 'Spring Boot 4.1', 'Docker']),
  project('dev-hub', ['React 19', 'React Router', 'Playwright']),
  project('dev-learning-hub', ['Angular', 'Spring Boot']),
];

/**
 * Builds the service with `?tech=` and/or `?q=` already set. `live` stays false
 * until a render pass runs, so the returned `render()` is what "the browser has
 * hydrated" means here — call it to let the filter engage.
 */
function setup(tech: string | null, catalogue: Project[] = projects, q: string | null = null) {
  const params: Record<string, string> = {};
  if (tech) params['tech'] = tech;
  if (q) params['q'] = q;
  const paramMap = convertToParamMap(params);
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: ActivatedRoute, useValue: { queryParamMap: of(paramMap), snapshot: { queryParamMap: paramMap } } },
    ],
  });
  const filter = TestBed.inject(ProjectFilter);
  TestBed.inject(HttpTestingController)
    .match((r) => r.url.endsWith('/api/projects'))
    .forEach((r) => r.flush(catalogue));
  return { filter, render: () => TestBed.inject(ApplicationRef).tick() };
}

describe('techFamily', () => {
  it('drops a trailing version so two spellings share one family', () => {
    expect(techFamily('Angular 21')).toBe('angular');
    expect(techFamily('Angular')).toBe('angular');
    expect(techFamily('Spring Boot 4.1')).toBe('spring boot');
  });

  it('keeps a trailing word that is not a version', () => {
    expect(techFamily('React Router')).toBe('react router');
    expect(techFamily('React 19')).toBe('react');
  });

  it('labels a family with its own casing', () => {
    expect(familyLabel('GitHub Actions')).toBe('GitHub Actions');
    expect(familyLabel('Spring Boot 4')).toBe('Spring Boot');
  });
});

describe('ProjectFilter', () => {
  it('offers a chip per family used by two or more projects, most-used first', () => {
    const { filter, render } = setup(null);
    render();
    expect(filter.chips().map((f) => `${f.label} ${f.count}`)).toEqual(['Angular 3', 'Spring Boot 3', 'Docker 2']);
    expect(filter.total()).toBe(4);
  });

  it('shows every project when nothing is selected', () => {
    const { filter, render } = setup(null);
    render();
    expect(filter.selected()).toBeUndefined();
    expect(filter.projects()?.length).toBe(4);
  });

  it('filters across both spellings of a family', () => {
    const { filter, render } = setup('Angular');
    render();
    expect(filter.selected()?.label).toBe('Angular');
    expect(filter.projects()?.map((p) => p.id)).toEqual(['tesseraapp', 'websitehub', 'dev-learning-hub']);
  });

  it('matches the query param case-insensitively and by family', () => {
    const { filter, render } = setup('spring boot 4');
    render();
    expect(filter.selected()?.label).toBe('Spring Boot');
    expect(filter.projects()?.length).toBe(3);
  });

  it('shows a rare technology as a chip of its own when deep-linked', () => {
    const { filter, render } = setup('Playwright');
    render();
    expect(filter.projects()?.map((p) => p.id)).toEqual(['dev-hub']);
    expect(filter.chips().at(-1)?.label).toBe('Playwright');
  });

  it('ignores a technology no project uses instead of emptying the page', () => {
    const { filter, render } = setup('COBOL');
    render();
    expect(filter.selected()).toBeUndefined();
    expect(filter.projects()?.length).toBe(4);
  });

  it('does not filter until the prerendered page has been hydrated', () => {
    const { filter, render } = setup('Angular');
    // Before the first render pass the browser is still adopting server HTML that
    // was built without a query string — filtering now would mismatch it.
    expect(filter.selected()).toBeUndefined();
    expect(filter.projects()?.length).toBe(4);
    render();
    expect(filter.projects()?.length).toBe(3);
  });

  it('offers no chips at all when no technology is shared', () => {
    const { filter, render } = setup(null, [project('solo', ['Rust'])]);
    render();
    expect(filter.chips()).toEqual([]);
  });

  it('narrows by ?q= across name, tagline and stack, case-insensitively', () => {
    const { filter, render } = setup(null, projects, 'REACT');
    render();
    expect(filter.projects()?.map((p) => p.id)).toEqual(['dev-hub']);
    expect(filter.active()).toBe(true);
    expect(filter.selected()).toBeUndefined();
  });

  it('combines ?tech= and ?q= — a project must satisfy both', () => {
    const { filter, render } = setup('Angular', projects, 'websitehub');
    render();
    expect(filter.projects()?.map((p) => p.id)).toEqual(['websitehub']);
  });

  it('returns an empty list, not everything, when nothing matches the search text', () => {
    const { filter, render } = setup(null, projects, 'nonexistent-xyz');
    render();
    expect(filter.projects()).toEqual([]);
    expect(filter.active()).toBe(true);
  });

  it('does not search until hydration, matching the tech-filter rule', () => {
    const { filter, render } = setup(null, projects, 'React');
    expect(filter.active()).toBe(false);
    expect(filter.projects()?.length).toBe(4);
    render();
    expect(filter.projects()?.length).toBe(1);
  });

  it('search() debounces and navigates to / with ?q= merged into the existing params', () => {
    vi.useFakeTimers();
    const { filter } = setup(null);
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    filter.search('Ang');
    filter.search('Angu');
    filter.search('Angular');
    expect(navigateSpy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200);
    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith(['/'], {
      queryParams: { q: 'Angular' },
      queryParamsHandling: 'merge',
      // Without the fragment `withInMemoryScrolling` throws the visitor to the top of
      // the page mid-keystroke; the chips carry the same one.
      fragment: 'projects',
      // Starting a search pushes: Back has to lead to the unfiltered list, not off the site.
      replaceUrl: false,
    });
    vi.useRealTimers();
  });

  it('search() replaces rather than pushes while refining a search that is already on the URL', () => {
    vi.useFakeTimers();
    const { filter } = setup(null, projects, 'Ang');
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    filter.search('Angular');
    vi.advanceTimersByTime(200);
    expect(navigateSpy).toHaveBeenCalledWith(['/'], {
      queryParams: { q: 'Angular' },
      queryParamsHandling: 'merge',
      fragment: 'projects',
      // Otherwise one typed word would bury the unfiltered list a dozen entries deep.
      replaceUrl: true,
    });
    vi.useRealTimers();
  });

  it('search() clears ?q= in place when the box is emptied', () => {
    vi.useFakeTimers();
    const { filter } = setup(null, projects, 'jwt');
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    filter.search('   ');
    vi.advanceTimersByTime(200);
    expect(navigateSpy).toHaveBeenCalledWith(['/'], {
      queryParams: { q: null },
      queryParamsHandling: 'merge',
      fragment: 'projects',
      replaceUrl: true,
    });
    vi.useRealTimers();
  });

  it('search() does not navigate at all when an empty box matches an empty URL', () => {
    vi.useFakeTimers();
    const { filter } = setup(null);
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    filter.search('a');
    filter.search('   '); // typed and deleted again inside one debounce window
    vi.advanceTimersByTime(200);
    expect(navigateSpy).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('cancelSearch() drops a write that has not fired yet', () => {
    vi.useFakeTimers();
    const { filter } = setup(null);
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    filter.search('Angular');
    filter.cancelSearch(); // the box went away — e.g. the visitor opened a project
    vi.advanceTimersByTime(200);
    expect(navigateSpy).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
