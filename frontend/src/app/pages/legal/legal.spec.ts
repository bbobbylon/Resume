import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { Title } from '@angular/platform-browser';
import { PrivacyPage } from './privacy';
import { TermsPage } from './terms';
import { LEGAL_UPDATED } from './legal';

/** The profile the footer and the "write to me" lines read. */
const PROFILE = {
  name: 'Robert Oliver, Jr.', brand: 'b', title: 't', employer: 'e', tagline: 'x', bio: 'b',
  email: 'me@example.com', phone: '', location: '', resumeUrl: 'resume.pdf',
  socialLinks: [{ platform: 'GitHub', url: 'https://github.com/bbobbylon' }], stats: [],
};

describe('legal pages', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'terms', component: TermsPage },
          { path: 'privacy', component: PrivacyPage },
        ]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  /** Navigates to a legal route and answers the profile request the shell makes. */
  async function visit(path: string) {
    const harness = await RouterTestingHarness.create(path);
    TestBed.inject(HttpTestingController)
      .expectOne((r) => r.url.endsWith('/api/profile'))
      .flush(PROFILE);
    harness.detectChanges();
    return harness.routeNativeElement as HTMLElement;
  }

  it('shows the terms, dated, with the contact address from the API', async () => {
    const el = await visit('/terms');
    expect(el.querySelector('h1')?.textContent?.trim()).toBe('Terms of Use');
    expect(el.querySelector('.updated')?.textContent).toContain(LEGAL_UPDATED);
    expect(el.querySelector('a[href="mailto:me@example.com"]')).not.toBeNull();
    expect(TestBed.inject(Title).getTitle()).toBe('Terms of Use — Robert Oliver, Jr.');
  });

  it('states the privacy stance and names every host the browser talks to', async () => {
    const el = await visit('/privacy');
    const text = el.textContent ?? '';
    expect(el.querySelector('h1')?.textContent?.trim()).toBe('Privacy Policy');
    expect(text).toContain('no cookies');
    for (const host of ['GitHub Pages', 'api.github.com', 'Render']) expect(text).toContain(host);
    expect(text).toContain('localStorage');
    expect(TestBed.inject(Title).getTitle()).toBe('Privacy Policy — Robert Oliver, Jr.');
  });

  it('the footer marks the legal page you are already on', async () => {
    const el = await visit('/privacy');
    const current = el.ownerDocument.querySelectorAll('nav[aria-label="Legal"] a[aria-current="page"]');
    expect([...current].map((a) => a.textContent?.trim())).toEqual(['Privacy Policy']);
  });

  // One RouterTestingHarness per test, so the two directions are two tests.
  it('the terms page links on to the privacy policy', async () => {
    expect((await visit('/terms')).querySelector('a[href="/privacy"]')).not.toBeNull();
  });

  it('the privacy page links back to the terms', async () => {
    expect((await visit('/privacy')).querySelector('a[href="/terms"]')).not.toBeNull();
  });
});
