import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Project } from '../../models/project.model';
import { ProjectSearch } from './project-search';

const caseStudy = { problem: 'p', approach: 'a', outcome: 'o' };

function project(id: string): Project {
  return {
    id, name: id, tagline: 't', description: 'd', longDescription: 'l', url: null,
    repoUrl: 'https://github.com/bbobbylon/x', status: 'LIVE', techStack: ['Angular 21'], imageUrls: [],
    highlights: [], hosting: null, delivery: null, featured: false, caseStudy,
  };
}

async function render(url: string) {
  TestBed.configureTestingModule({
    providers: [provideRouter([{ path: '', component: ProjectSearch }]), provideHttpClient(), provideHttpClientTesting()],
  });
  const harness = await RouterTestingHarness.create(url);
  TestBed.inject(HttpTestingController)
    .match((r) => r.url.endsWith('/api/projects'))
    .forEach((r) => r.flush([project('tesseraapp')]));
  harness.detectChanges();
  return { el: harness.routeNativeElement as HTMLElement, router: TestBed.inject(Router) };
}

describe('ProjectSearch', () => {
  it('renders an empty box with no ?q=', async () => {
    const { el } = await render('/');
    const input = el.querySelector<HTMLInputElement>('input[type="search"]');
    expect(input?.value).toBe('');
  });

  it('preloads the box from ?q= on a deep link', async () => {
    const { el } = await render('/?q=tessera');
    const input = el.querySelector<HTMLInputElement>('input[type="search"]');
    expect(input?.value).toBe('tessera');
  });

  it('typing calls ProjectFilter.search with the input value', async () => {
    vi.useFakeTimers();
    const { el, router } = await render('/');
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const input = el.querySelector<HTMLInputElement>('input[type="search"]')!;

    input.value = 'angular';
    input.dispatchEvent(new Event('input'));
    vi.advanceTimersByTime(200);

    expect(navigateSpy).toHaveBeenCalledWith(['/'], {
      queryParams: { q: 'angular' },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
    vi.useRealTimers();
  });
});
