import { Component, input } from '@angular/core';

/**
 * Phosphor "arrow-up-right" (regular weight) as inline SVG on `currentColor`, so it
 * takes the color of the button or link it sits in. Used at 12–14px inside the
 * "Open <domain>" buttons; decorative, hence `aria-hidden`.
 */
@Component({
  selector: 'app-arrow-up-right',
  template: `
    <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
      <path d="M200,64V168a8,8,0,0,1-16,0V83.31L69.66,197.66a8,8,0,0,1-11.32-11.32L172.69,72H88a8,8,0,0,1,0-16H192A8,8,0,0,1,200,64Z"/>
    </svg>
  `,
  styles: ':host { display: inline-flex; line-height: 0; }',
})
export class ArrowUpRight {
  /** Icon box size in CSS pixels. */
  readonly size = input(14);
}
