import { TestBed } from '@angular/core/testing';
import { ThemeService, THEME_STORAGE_KEY } from './theme';

describe('ThemeService', () => {
  const html = document.documentElement;

  beforeEach(() => {
    localStorage.removeItem(THEME_STORAGE_KEY);
    html.removeAttribute('data-theme');
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    html.removeAttribute('data-theme');
    localStorage.removeItem(THEME_STORAGE_KEY);
  });

  /** A fresh injector, as on a new page load. */
  function fresh(): ThemeService {
    TestBed.resetTestingModule();
    html.removeAttribute('data-theme');
    return TestBed.inject(ThemeService);
  }

  it('adopts what the pre-paint script applied to <html>', () => {
    html.setAttribute('data-theme', 'light');
    expect(TestBed.inject(ThemeService).theme()).toBe('light');
  });

  it('falls back to the saved choice, then the OS preference, then dark', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    expect(fresh().theme()).toBe('light');

    localStorage.removeItem(THEME_STORAGE_KEY);
    expect(fresh().theme()).toBe('dark');

    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    expect(fresh().theme()).toBe('light');
  });

  it('toggle flips the attribute and the theme-color meta, and saves the choice', () => {
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
    try {
      const service = TestBed.inject(ThemeService);
      TestBed.tick();
      expect(html.getAttribute('data-theme')).toBe('dark');
      expect(meta.content).toBe('#161826');

      service.toggle();
      TestBed.tick();
      expect(html.getAttribute('data-theme')).toBe('light');
      expect(meta.content).toBe('#f4f5fa');
      expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    } finally {
      meta.remove();
    }
  });
});
