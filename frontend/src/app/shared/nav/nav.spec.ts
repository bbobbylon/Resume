import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Nav } from './nav';

describe('Nav', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Nav],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('marks Projects current on the landing page and renders the profile links', async () => {
    const fixture = TestBed.createComponent(Nav);
    await fixture.whenStable();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne((r) => r.url.endsWith('/api/profile')).flush({
      name: 'Robert Oliver, Jr.', brand: 'bobbylon', title: 't', employer: 'e', tagline: 'x', bio: 'b',
      email: 'me@example.com', phone: '', location: '', resumeUrl: 'resume.pdf', socialLinks: [], stats: [],
    });
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.nav-brand')?.textContent?.trim()).toBe('bobbylon');
    const projects = el.querySelector('a[fragment], a.nav-link') as HTMLAnchorElement;
    expect(projects.getAttribute('aria-current')).toBe('page');
    expect(el.querySelector('a[href^="mailto:"]')?.getAttribute('href')).toBe('mailto:me@example.com');
    expect(el.querySelector('a.btn-primary')?.getAttribute('href')).toBe('resume.pdf');
    http.verify({ ignoreCancelled: true });
  });
});
