import { Component, input } from '@angular/core';

/**
 * A plain three-bar "menu" glyph for {@link Nav}'s phone-width menu button.
 *
 * Hand-drawn as stroked lines (same `viewBox="0 0 24 24"`, `stroke-width="1.75"`
 * convention as {@link ThemeToggle}'s sun/moon), rather than pulled from Phosphor
 * like {@link SearchIcon} — this file's author could not verify an exact upstream
 * path against Phosphor's real source before shipping it, and a wrong provenance
 * claim in a doc comment is worse than an unattributed shape that just says what
 * it is. Visually it drops into any button the same way either style would.
 */
@Component({
  selector: 'app-menu-icon',
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
      aria-hidden="true"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  `,
  styles: ':host { display: inline-flex; line-height: 0; }',
})
export class MenuIcon {
  /** Icon box size in CSS pixels. */
  readonly size = input(14);
}
