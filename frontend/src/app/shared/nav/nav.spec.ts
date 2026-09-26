import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Nav } from './nav';
import { CommandPaletteService } from '../../services/command-palette';

describe('Nav', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Nav],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  /** Creates the fixture and flushes the one HTTP call every test needs before it can render links. */
  async function setup() {
    const fixture = TestBed.createComponent(Nav);
    await fixture.whenStable();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne((r) => r.url.endsWith('/api/profile')).flush({
      name: 'Robert Oliver, Jr.', brand: 'bobbylon', title: 't', employer: 'e', tagline: 'x', bio: 'b',
      email: 'me@example.com', phone: '', location: '', resumeUrl: 'resume.pdf', socialLinks: [], stats: [],
    });
    await fixture.whenStable();
    return { fixture, http };
  }

  it('marks Projects current on the landing page and renders the profile links', async () => {
    const { fixture, http } = await setup();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.nav-brand')?.textContent?.trim()).toBe('bobbylon');
    const projects = el.querySelector('a[fragment], a.nav-link') as HTMLAnchorElement;
    expect(projects.getAttribute('aria-current')).toBe('page');
    expect(el.querySelector('a[href^="mailto:"]')?.getAttribute('href')).toBe('mailto:me@example.com');
    expect(el.querySelector('a.btn-primary')?.getAttribute('href')).toBe('resume.pdf');
    http.verify({ ignoreCancelled: true });
  });

  it('opens the phone-width menu on click, reveals Projects/Resume/Contact, and closes on Escape', async () => {
    const { fixture, http } = await setup();
    const el: HTMLElement = fixture.nativeElement;
    const button = el.querySelector('.menu-btn') as HTMLButtonElement;

    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(el.querySelector('.mobile-menu')).toBeNull();

    button.click();
    fixture.detectChanges();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    const panel = el.querySelector('.mobile-menu') as HTMLElement;
    expect(panel).not.toBeNull();
    const links = [...panel.querySelectorAll('a')].map((a) => a.textContent?.trim());
    expect(links).toEqual(['Projects', 'Resume', 'Contact']);
    expect(panel.querySelector('a[href^="mailto:"]')?.getAttribute('href')).toBe('mailto:me@example.com');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(el.querySelector('.mobile-menu')).toBeNull();
    expect(document.activeElement).toBe(button);

    http.verify({ ignoreCancelled: true });
  });

  // Below 480px nav.css hides the palette trigger (all five bar controls overflowed a
  // 320-360px viewport), so this row is the only way to reach search on a phone. jsdom
  // does no layout and never applies that media query, so what is testable here is the
  // behaviour: the row opens the same shared overlay the hidden button would have.
  it('opens the command palette from the menu instead of the hidden trigger button', async () => {
    const { fixture, http } = await setup();
    const el: HTMLElement = fixture.nativeElement;
    const palette = TestBed.inject(CommandPaletteService);
    expect(palette.open()).toBe(false);

    (el.querySelector('.menu-btn') as HTMLButtonElement).click();
    fixture.detectChanges();
    const search = el.querySelector('.mobile-menu-action') as HTMLButtonElement;
    expect(search.textContent?.trim()).toBe('Search projects');

    search.click();
    fixture.detectChanges();
    expect(palette.open()).toBe(true);
    // The menu closes behind the overlay rather than staying open underneath it, and
    // focus is back on the button the palette will return the visitor to on dismiss.
    expect(el.querySelector('.mobile-menu')).toBeNull();
    expect(document.activeElement).toBe(el.querySelector('.menu-btn'));

    palette.hide();
    http.verify({ ignoreCancelled: true });
  });

  it('closes the phone-width menu on an outside click, and on picking one of its links', async () => {
    const { fixture, http } = await setup();
    const el: HTMLElement = fixture.nativeElement;
    const button = el.querySelector('.menu-btn') as HTMLButtonElement;

    button.click();
    fixture.detectChanges();
    document.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    fixture.detectChanges();
    expect(el.querySelector('.mobile-menu')).toBeNull();

    button.click();
    fixture.detectChanges();
    (el.querySelector('.mobile-menu-link') as HTMLAnchorElement).click();
    fixture.detectChanges();
    expect(el.querySelector('.mobile-menu')).toBeNull();

    http.verify({ ignoreCancelled: true });
  });
});
