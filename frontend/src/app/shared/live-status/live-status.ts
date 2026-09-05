import { afterNextRender, Component, DestroyRef, ElementRef, inject, input, signal } from '@angular/core';

export type Reachability = 'checking' | 'up' | 'down';

/**
 * A dot that says whether a project's live URL answers *right now*, checked from
 * the visitor's browser rather than by the backend — so it works while the API is
 * asleep and never goes stale in the prerendered HTML.
 *
 * The check is a `no-cors` fetch: the response is opaque (we cannot read the
 * status), but the promise resolves whenever the host answered at all and rejects
 * on DNS failure, refused connection, TLS error or the 6 s timeout — which is what
 * "reachable" means here. Runs after the first render only in the browser, so the
 * server-rendered and hydrated markup both show "Checking…" and never mismatch.
 *
 * The probe itself is gated behind an `IntersectionObserver`: it only fires once
 * the dot scrolls into view (and then only once), so a page listing many projects
 * — e.g. the landing cards — doesn't fire one request per project on every visit,
 * only for the ones a visitor actually scrolls to. Environments without
 * `IntersectionObserver` (jsdom in tests) probe immediately instead.
 */
@Component({
  selector: 'app-live-status',
  template: `
    <span class="status" [class.compact]="compact()" [attr.data-state]="state()" role="status" [attr.aria-label]="'Live site ' + label()" [attr.title]="compact() ? label() : null">
      <span class="dot" aria-hidden="true"></span>@if (!compact()) { {{ label() }} }
    </span>
  `,
  styles: `
    :host { display: inline-flex; }
    .status { display: inline-flex; align-items: center; gap: 7px; font-size: 13px; color: var(--color-neutral-400); white-space: nowrap; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-neutral-600); flex: none; }
    [data-state='checking'] .dot { animation: pulse 1.2s ease-in-out infinite; }
    [data-state='up'] .dot { background: var(--color-success, #4ade80); box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-success, #4ade80) 25%, transparent); }
    [data-state='down'] .dot { background: var(--color-warning, #f59e0b); }
    @keyframes pulse { 50% { opacity: 0.35; } }
    @media (prefers-reduced-motion: reduce) { .dot { animation: none; } }
  `,
})
export class LiveStatus {
  /** The URL to probe; nothing is checked while it is empty. */
  readonly url = input.required<string>();
  /** Probe timeout in milliseconds. */
  readonly timeoutMs = input(6000);
  /** Dot only, no "Checking…"/"Up now" text — for tight spaces like a landing card. */
  readonly compact = input(false);

  protected readonly state = signal<Reachability>('checking');
  protected readonly label = () =>
    ({ checking: 'Checking…', up: 'Up now', down: 'Not reachable right now' })[this.state()];

  constructor() {
    const controller = new AbortController();
    const destroyRef = inject(DestroyRef);
    const host = inject(ElementRef).nativeElement as Element;
    destroyRef.onDestroy(() => controller.abort());

    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') {
        void this.probe(controller.signal);
        return;
      }
      const observer = new IntersectionObserver(
        (entries) => {
          if (!entries.some((e) => e.isIntersecting)) return;
          observer.disconnect();
          void this.probe(controller.signal);
        },
        { rootMargin: '200px' },
      );
      observer.observe(host);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  private async probe(signal: AbortSignal): Promise<void> {
    const url = this.url();
    if (!url) return;
    const timer = setTimeout(() => this.state.set('down'), this.timeoutMs());
    try {
      await fetch(url, { mode: 'no-cors', cache: 'no-store', signal });
      this.state.set('up');
    } catch {
      if (!signal.aborted) this.state.set('down');
    } finally {
      clearTimeout(timer);
    }
  }
}
