import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Project } from '../../models/project.model';
import { TechFilter } from './tech-filter';

const caseStudy = { problem: 'p', approach: 'a', outcome: 'o' };

function project(id: string, techStack: string[]): Project {
  return {
    id, name: id, tagline: 't', description: 'd', longDescription: 'l', url: null,
    repoUrl: 'https://github.com/bbobbylon/x', status: 'LIVE', techStack, imageUrls: [],
    highlights: [], hosting: null, delivery: null, featured: false, caseStudy,
  };
}

const projects = [
  project('tesseraapp', ['Angular 21', 'Spring Boot 4']),
  project('websitehub', ['Angular 21', 'Docker']),
  project('dev-hub', ['React 19']),
];

/** Renders the chips at a real URL, so the hrefs below are the ones a click would follow. */
async function render(url: string, catalogue = projects) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([{ path: '', component: TechFilter }]),
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  });
  const harness = await RouterTestingHarness.create(url);
  TestBed.inject(HttpTestingController)
    .match((r) => r.url.endsWith('/api/projects'))
    .forEach((r) => r.flush(catalogue));
  harness.detectChanges();
  return harness.routeNativeElement as HTMLElement;
}

function chips(el: HTMLElement) {
  return [...el.querySelectorAll<HTMLAnchorElement>('a.chip')];
}

describe('TechFilter', () => {
  it('renders an All chip plus one per shared technology, with counts', async () => {
    const el = await render('/');
    expect(chips(el).map((a) => a.textContent?.replace(/\s+/g, ' ').trim())).toEqual(['All 3', 'Angular 2']);
  });

  it('marks All as current and shows no summary when nothing is filtered', async () => {
    const el = await render('/');
    expect(chips(el)[0].getAttribute('aria-current')).toBe('true');
    expect(el.querySelector('.filter-summary')).toBeNull();
  });

  it('marks the selected chip and summarises how many projects matched', async () => {
    const el = await render('/?tech=Angular');
    const current = el.querySelector('a.chip[aria-current]');
    expect(current?.textContent).toContain('Angular');
    expect(el.querySelector('.filter-summary')?.textContent?.replace(/\s+/g, ' ').trim())
      .toBe('Showing 2 of 3 projects built with Angular.');
  });

  it('links each chip to its own ?tech= and back to the projects section', async () => {
    const el = await render('/');
    const angular = chips(el)[1];
    expect(angular.getAttribute('href')).toBe('/?tech=Angular#projects');
  });

  it('keeps the ?layout= param when switching technology, and drops ?tech= on All', async () => {
    const el = await render('/?layout=gallery&tech=Angular');
    const [all, angular] = chips(el);
    expect(angular.getAttribute('href')).toContain('layout=gallery');
    expect(all.getAttribute('href')).toContain('layout=gallery');
    expect(all.getAttribute('href')).not.toContain('tech=');
  });

  it('renders nothing when no technology is shared by two projects', async () => {
    const el = await render('/', [project('solo', ['Rust'])]);
    expect(el.querySelector('.tech-filter')).toBeNull();
  });
});
