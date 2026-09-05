import { Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme';

/**
 * The sun/moon button that flips {@link ThemeService}. Both icons are always in
 * the DOM and CSS keyed on `html[data-theme]` shows the one for the *other* theme
 * (the sun in the dark theme, the moon in the light one). Rendering both keeps the
 * markup identical on the server and in the browser, so hydration never sees a
 * mismatch even when the pre-paint script picked light before Angular booted.
 */
@Component({
  selector: 'app-theme-toggle',
  template: `
    <button type="button" class="theme-btn" aria-label="Switch between dark and light theme" title="Switch theme" (click)="theme.toggle()">
      <svg class="sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.5v2.6M12 18.9v2.6M2.5 12h2.6M18.9 12h2.6M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" />
      </svg>
      <svg class="moon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round" aria-hidden="true">
        <path d="M20.5 14.2A8.6 8.6 0 0 1 9.8 3.5a8.6 8.6 0 1 0 10.7 10.7z" />
      </svg>
    </button>
  `,
  styles: `
    :host { display: inline-flex; }
    .theme-btn {
      display: inline-grid; place-items: center; width: 34px; height: 34px; padding: 0;
      border: 1px solid var(--color-divider); border-radius: var(--radius-sm);
      background: transparent; color: var(--color-neutral-400); cursor: pointer;
    }
    .theme-btn:hover { color: var(--color-accent); border-color: var(--color-accent); }
    .moon { display: none; }
    :host-context(html[data-theme='light']) .sun { display: none; }
    :host-context(html[data-theme='light']) .moon { display: block; }
  `,
})
export class ThemeToggle {
  protected readonly theme = inject(ThemeService);
}
