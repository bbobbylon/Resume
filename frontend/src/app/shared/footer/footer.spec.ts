import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Footer } from './footer';

describe('Footer', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('renders the copyright line and the social links', async () => {
    const fixture = TestBed.createComponent(Footer);
    await fixture.whenStable();
    TestBed.inject(HttpTestingController)
      .expectOne((r) => r.url.endsWith('/api/profile'))
      .flush({
        name: 'Robert Oliver, Jr.', brand: 'b', title: 't', employer: 'e', tagline: 'x', bio: 'b',
        email: 'me@example.com', phone: '', location: '', resumeUrl: 'resume.pdf',
        socialLinks: [{ platform: 'GitHub', url: 'https://github.com/bbobbylon' }], stats: [],
      });
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain(`© ${new Date().getFullYear()} Robert Oliver, Jr.`);
    const external = el.querySelector('a[target="_blank"]') as HTMLAnchorElement;
    expect(external.getAttribute('rel')).toBe('noopener');
    expect(external.textContent?.trim()).toBe('GitHub');
  });

  it('omits the link row in compact mode', async () => {
    const fixture = TestBed.createComponent(Footer);
    fixture.componentRef.setInput('compact', true);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.links')).toBeNull();
  });
});
