import { DOCUMENT, Injectable, PLATFORM_ID, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'dark' | 'light';

/** `localStorage` key holding an explicit choice; absent means "follow the OS". */
export const THEME_STORAGE_KEY = 'theme';

/** `<meta name="theme-color">` per theme — the browser chrome tint on mobile. */
const THEME_COLOR: Record<Theme, string> = { dark: '#161826', light: '#f4f5fa' };

/**
 * The dark/light switch over the Nocturne token sheet. The theme is a `data-theme`
 * attribute on `<html>`; `styles.css` redefines the colour tokens under
 * `:root[data-theme="light"]`, so every component follows without knowing.
 *
 * Order of truth: the inline script in index.html applies the saved choice (or the
 * OS preference) *before first paint*, so a prerendered page never flashes the
 * wrong theme; this service then adopts whatever that script set, keeps the
 * attribute and the `theme-color` meta in sync when the user toggles, and saves an
 * explicit choice. Only a toggle is saved — an OS preference is re-read on every
 * visit so it keeps following the system. On the server the theme is always dark
 * and nothing is touched: the prerendered HTML is theme-neutral.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  /** The active theme. */
  readonly theme = signal<Theme>(this.initial());

  constructor() {
    effect(() => {
      if (!this.browser) return;
      const theme = this.theme();
      this.doc.documentElement.setAttribute('data-theme', theme);
      this.doc.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
    });
  }

  /** Flip the theme and remember the choice. */
  toggle(): void {
    const next: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage can be unavailable (private mode, blocked site data): the toggle still works for this visit.
    }
  }

  private initial(): Theme {
    if (!this.browser) return 'dark';
    const applied = this.doc.documentElement.getAttribute('data-theme');
    if (applied === 'light' || applied === 'dark') return applied;
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // fall through to the OS preference
    }
    return globalThis.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
}
