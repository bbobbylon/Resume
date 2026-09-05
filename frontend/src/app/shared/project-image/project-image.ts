import { Component, computed, input } from '@angular/core';

/**
 * A project screenshot in the Nocturne `.lighten` treatment (handoff → "Assets"):
 * a fixed-ratio box (16:10 for cards/rows, 21:9 for the detail hero) at radius 8.
 * With no screenshot yet, the box stays `--color-surface` with the project's
 * initial letter centred in neutral-600 — the "empty image" rule from the handoff —
 * so layouts hold their shape before captures exist.
 *
 * Screenshots follow the `npm run shots` naming: `shots/<id>-<n>.webp` (1600 px
 * wide) with an `-800` sibling. `srcset` offers both and `sizes` says how wide the
 * slot is, so a 320 px row gets the 800 px file (2× sharp, ~12 KB) and the
 * full-width detail hero the 1600 px one. `priority` marks the one image that is
 * the page's largest visible element, which must not be lazy-loaded.
 */
@Component({
  selector: 'app-project-image',
  template: `
    <div class="frame" [class.wide]="ratio() === '21:9'">
      @if (src(); as src) {
        <img class="lighten" [src]="src" [attr.srcset]="srcset()" [sizes]="sizes()" [alt]="alt()"
             [attr.loading]="priority() ? 'eager' : 'lazy'" [attr.fetchpriority]="priority() ? 'high' : null" decoding="async">
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
  /** The slot's width per breakpoint (the `sizes` attribute); default is a 320 px row or card. */
  readonly sizes = input('(max-width: 880px) 100vw, 320px');
  /** Load eagerly at high priority — for the largest above-the-fold image only. */
  readonly priority = input(false);

  /** Both widths of a `shots/` WebP; other URLs get a plain `src`. */
  protected readonly srcset = computed(() => {
    const src = this.src();
    if (!src || !/^shots\/.+\.webp$/.test(src)) return null;
    return `${src.replace(/\.webp$/, '-800.webp')} 800w, ${src} 1600w`;
  });

  protected initial(): string {
    return (this.name().trim().charAt(0) || '·').toUpperCase();
  }
}
