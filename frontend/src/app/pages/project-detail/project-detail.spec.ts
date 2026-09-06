import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { ProjectDetail } from './project-detail';
import { Project } from '../../models/project.model';

const tessera: Project = {
  id: 'tesseraapp', name: 'TesseraApp', tagline: 'Zero-trust CIAM', description: 'd', longDescription: 'long',
  url: 'https://tesseraapp.dev', repoUrl: 'https://github.com/bbobbylon', status: 'LIVE',
  techStack: ['Angular 21'], imageUrls: [], highlights: [{ title: 'H1', body: 'B1' }],
  hosting: 'AWS', delivery: 'Docker', featured: true,
  caseStudy: { problem: 'P1', approach: 'A1', outcome: 'O1' },
};

describe('ProjectDetail', () => {
  // LiveStatus probes p.url after render; keep the test off the network.
  beforeEach(() => vi.stubGlobal('fetch', vi.fn(async () => new Response())));
  afterEach(() => vi.unstubAllGlobals());

  function setup(id: string) {
    const paramMap = convertToParamMap({ id });
    TestBed.configureTestingModule({
      imports: [ProjectDetail],
      providers: [
        provideRouter([]), provideHttpClient(), provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { paramMap: of(paramMap), snapshot: { paramMap } } },
      ],
    });
    const fixture = TestBed.createComponent(ProjectDetail);
    fixture.detectChanges();
    return { fixture, http: TestBed.inject(HttpTestingController) };
  }

  it('renders the project once the project list resolves', async () => {
    const { fixture, http } = setup('tesseraapp');
    http.expectOne((r) => r.url.endsWith('/api/projects')).flush([tessera]);
    http.match(() => true).forEach((r) => { if (!r.cancelled) r.flush({}); }); // a live flush cancels its snapshot twin
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('h1')?.textContent).toBe('TesseraApp');
    expect(el.querySelector('.head a.btn-primary')?.getAttribute('href')).toBe('https://tesseraapp.dev');
    expect(el.textContent).toContain('H1');
    expect(el.textContent).toContain('P1');
  });

  it('shows the not-found state for an id that is not in the list', async () => {
    const { fixture, http } = setup('nope');
    http.expectOne((r) => r.url.endsWith('/api/projects')).flush([tessera]);
    http.match(() => true).forEach((r) => { if (!r.cancelled) r.flush({}); }); // a live flush cancels its snapshot twin
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Project not found');
  });
});
