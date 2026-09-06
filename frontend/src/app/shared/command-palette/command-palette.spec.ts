import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CommandPalette } from './command-palette';
import { CommandPaletteService } from '../../services/command-palette';
import { Project } from '../../models/project.model';

const tessera: Project = {
  id: 'tesseraapp', name: 'TesseraApp', tagline: 'Zero-trust CIAM', description: 'd', longDescription: 'long',
  url: 'https://tesseraapp.dev', repoUrl: 'https://github.com/bbobbylon', status: 'LIVE',
  techStack: ['Angular 21'], imageUrls: [], highlights: [], hosting: null, delivery: null, featured: true,
  caseStudy: { problem: 'P1', approach: 'A1', outcome: 'O1' },
};

describe('CommandPalette', () => {
  function setup() {
    TestBed.configureTestingModule({
      imports: [CommandPalette],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    const fixture = TestBed.createComponent(CommandPalette);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne((r) => r.url.endsWith('/api/projects')).flush([tessera]);
    http.match(() => true).forEach((r) => { if (!r.cancelled) r.flush({}); }); // a live flush cancels its snapshot twin
    return { fixture, http, palette: TestBed.inject(CommandPaletteService), router: TestBed.inject(Router) };
  }

  afterEach(() => {
    document.body.style.overflow = '';
  });

  function keydown(init: KeyboardEventInit) {
    document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init }));
  }

  it('opens on Ctrl+K and lists pages, the theme action and every project', async () => {
    const { fixture } = setup();
    keydown({ key: 'k', ctrlKey: true });
    fixture.detectChanges();
    await fixture.whenStable();

    const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    const labels = [...fixture.nativeElement.querySelectorAll('.cp-label')].map((el: HTMLElement) => el.textContent);
    expect(labels).toEqual(['Home', 'Resume', 'TesseraApp', 'Toggle theme']);
  });

  it('is closed by default and Ctrl+K toggles it shut again', async () => {
    const { fixture } = setup();
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();

    keydown({ key: 'k', ctrlKey: true });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).not.toBeNull();

    keydown({ key: 'k', ctrlKey: true });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
  });

  it('filters the list as the search input changes', async () => {
    const { fixture, palette } = setup();
    palette.show();
    fixture.detectChanges();
    await fixture.whenStable();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('.cp-input');
    input.value = 'tessera';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const labels = [...fixture.nativeElement.querySelectorAll('.cp-label')].map((el: HTMLElement) => el.textContent);
    expect(labels).toEqual(['TesseraApp']);
  });

  it('ArrowDown moves the highlight and Enter runs the highlighted item', async () => {
    const { fixture, palette, router } = setup();
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    palette.show();
    fixture.detectChanges();
    await fixture.whenStable();

    keydown({ key: 'ArrowDown' }); // Home (0) -> Resume (1)
    keydown({ key: 'Enter' });
    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith(['/resume']);
    expect(palette.open()).toBe(false);
  });

  it('Escape closes the palette', async () => {
    const { fixture, palette } = setup();
    palette.show();
    fixture.detectChanges();
    await fixture.whenStable();

    keydown({ key: 'Escape' });
    fixture.detectChanges();
    expect(palette.open()).toBe(false);
  });

  it('clicking an option navigates and closes the palette', async () => {
    const { fixture, palette, router } = setup();
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    palette.show();
    fixture.detectChanges();
    await fixture.whenStable();

    const options: HTMLElement[] = fixture.nativeElement.querySelectorAll('.cp-option');
    options[2].click(); // TesseraApp
    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith(['/projects', 'tesseraapp']);
    expect(palette.open()).toBe(false);
  });

  it('clicking the backdrop closes the palette', async () => {
    const { fixture, palette } = setup();
    palette.show();
    fixture.detectChanges();
    await fixture.whenStable();

    const backdrop: HTMLElement = fixture.nativeElement.querySelector('.cp-backdrop');
    backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(palette.open()).toBe(false);
  });
});
