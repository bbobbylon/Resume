import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Footer } from './footer';

describe('Footer', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  /** Renders the footer with a profile response, since the © line and contact row read it. */
  async function render(compact = false) {
    const fixture = TestBed.createComponent(Footer);
    if (compact) fixture.componentRef.setInput('compact', true);
    await fixture.whenStable();
    TestBed.inject(HttpTestingController)
      .expectOne((r) => r.url.endsWith('/api/profile'))
      .flush({
        name: 'Robert Oliver, Jr.', brand: 'b', title: 't', employer: 'e', tagline: 'x', bio: 'b',
        email: 'me@example.com', phone: '', location: '', resumeUrl: 'resume.pdf',
        socialLinks: [{ platform: 'GitHub', url: 'https://github.com/bbobbylon' }], stats: [],
      });
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders the copyright line and the social links', async () => {
    const el = await render();
    expect(el.textContent).toContain(`© ${new Date().getFullYear()} Robert Oliver, Jr.`);
    const external = el.querySelector('a[target="_blank"]') as HTMLAnchorElement;
    expect(external.getAttribute('rel')).toBe('noopener');
    expect(external.textContent?.trim()).toBe('GitHub');
  });

  it('sets the contact row apart under its own heading', async () => {
    const el = await render();
    const contact = el.querySelector('.contact') as HTMLElement;
    expect(contact.querySelector('.contact-title')?.textContent?.trim()).toBe('Contact');
    expect(contact.querySelector('a[href="mailto:me@example.com"]')).not.toBeNull();
  });

  it('links to both legal pages and summarises the privacy stance in one line', async () => {
    const el = await render();
    const legal = [...el.querySelectorAll('nav[aria-label="Legal"] a')] as HTMLAnchorElement[];
    expect(legal.map((a) => a.textContent?.trim())).toEqual(['Terms of Use', 'Privacy Policy']);
    expect(legal.map((a) => a.getAttribute('href'))).toEqual(['/terms', '/privacy']);
    expect(el.querySelector('.privacy-note')?.textContent).toContain('No accounts, no cookies, no analytics');
  });

  it('keeps the legal links but drops the contact row and the note in compact mode', async () => {
    const el = await render(true);
    expect(el.querySelector('.contact')).toBeNull();
    expect(el.querySelector('.privacy-note')).toBeNull();
    expect(el.querySelectorAll('nav[aria-label="Legal"] a').length).toBe(2);
  });
});
