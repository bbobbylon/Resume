import { Component, input } from '@angular/core';

/**
 * Phosphor "magnifying-glass" (regular weight) as inline SVG on `currentColor`.
 * Used by the command palette's trigger button and its own search field.
 */
@Component({
  selector: 'app-search-icon',
  template: `
    <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
      <path d="M229.66,218.34,179.6,168.28a88.11,88.11,0,1,0-11.32,11.32l50.06,50.06a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"/>
    </svg>
  `,
  styles: ':host { display: inline-flex; line-height: 0; }',
})
export class SearchIcon {
  /** Icon box size in CSS pixels. */
  readonly size = input(14);
}
