import { Component, input } from '@angular/core';

/**
 * A project screenshot in the Nocturne `.lighten` treatment (handoff → "Assets"):
 * a fixed-ratio box (16:10 for cards/rows, 21:9 for the detail hero) at radius 8.
 * With no screenshot yet, the box stays `--color-surface` with the project's
 * initial letter centred in neutral-600 — the "empty image" rule from the handoff —
 * so layouts hold their shape before captures exist.
 */
@Component({
  selector: 'app-project-image',
  template: `
    <div class="frame" [class.wide]="ratio() === '21:9'">
      @if (src()) {
        <img class="lighten" [src]="src()" [alt]="alt()" loading="lazy" decoding="async">
      } @else {
        <div class="placeholder" role="img" [attr.aria-label]="alt()">
          <span aria-hidden="true">{{ initial() }}</span>
        </div>
      }
    </div>
  `,
  styles: `
    :host { display: block; }
    .frame {
      aspect-ratio: 16 / 10; width: 100%; overflow: hidden;
      border-radius: var(--radius-md); background: var(--color-surface);
      box-shadow: var(--shadow-sm);
    }
    .frame.wide { aspect-ratio: 21 / 9; }
    img { width: 100%; height: 100%; object-fit: cover; object-position: top; }
    .placeholder {
      width: 100%; height: 100%; display: grid; place-items: center;
      color: var(--color-neutral-600); font-family: var(--font-heading);
      font-weight: var(--font-heading-weight); font-size: clamp(28px, 10cqw, 64px);
      letter-spacing: -0.02em; user-select: none;
    }
    .frame { container-type: inline-size; }
  `,
})
export class ProjectImage {
  /** Screenshot URL, or `null`/`''` to render the placeholder. */
  readonly src = input<string | null | undefined>(null);
  readonly alt = input('');
  /** Project name — only its first letter is shown when there's no screenshot. */
  readonly name = input('');
  readonly ratio = input<'16:10' | '21:9'>('16:10');

  protected initial(): string {
    return (this.name().trim().charAt(0) || '·').toUpperCase();
  }
}
