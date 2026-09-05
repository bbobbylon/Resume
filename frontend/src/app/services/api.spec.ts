import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Api } from './api';
import { environment } from '../../environments/environment';

describe('Api', () => {
  let api: Api;
  let http: HttpTestingController;

  function collect<T>(resource: 'profile' | 'projects' | 'resume') {
    const values: T[] = [];
    let completed = false;
    api.get<T>(resource).subscribe({ next: (v) => values.push(v), complete: () => (completed = true) });
    return { values, done: () => completed };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(Api);
    http = TestBed.inject(HttpTestingController);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    http.verify({ ignoreCancelled: true });
    vi.restoreAllMocks();
  });

  it('requests the live API and the snapshot together', () => {
    collect('projects');
    http.expectOne(`${environment.apiBaseUrl}/api/projects`);
    http.expectOne('data/projects.json');
  });

  it('shows the snapshot first, then lets the live response replace it', () => {
    const r = collect<string[]>('projects');
    http.expectOne('data/projects.json').flush(['snapshot']);
    expect(r.values).toEqual([['snapshot']]);
    http.expectOne(`${environment.apiBaseUrl}/api/projects`).flush(['live']);
    expect(r.values).toEqual([['snapshot'], ['live']]);
    expect(r.done()).toBe(true);
  });

  it('ignores a snapshot that arrives after the live response', () => {
    const r = collect<string[]>('profile');
    http.expectOne(`${environment.apiBaseUrl}/api/profile`).flush(['live']);
    const late = http.expectOne('data/profile.json');
    expect(late.cancelled).toBe(true);
    expect(r.values).toEqual([['live']]);
    expect(r.done()).toBe(true);
  });

  it('keeps the snapshot when the live API errors', () => {
    const r = collect<string[]>('projects');
    http.expectOne('data/projects.json').flush(['snapshot']);
    http.expectOne(`${environment.apiBaseUrl}/api/projects`).flush('', { status: 503, statusText: 'Unavailable' });
    expect(r.values).toEqual([['snapshot']]);
    expect(r.done()).toBe(true);
    expect(console.warn).toHaveBeenCalledOnce();
  });

  it('completes without a value when both fail', () => {
    const r = collect('resume');
    http.expectOne('data/resume.json').flush('', { status: 404, statusText: 'Not Found' });
    http.expectOne(`${environment.apiBaseUrl}/api/resume`).flush('', { status: 500, statusText: 'Error' });
    expect(r.values).toEqual([]);
    expect(r.done()).toBe(true);
  });
});
