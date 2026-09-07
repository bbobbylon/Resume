import { Pipe, PipeTransform } from '@angular/core';

/**
 * Turns a URL into the short label the designs print on "Open" buttons:
 * `https://tesseraapp.dev/` → `tesseraapp.dev`, `https://github.com/bbobbylon/x` →
 * `github.com/bbobbylon/x` (path kept only when `withPath` is true). Falls back
 * to the raw string if it isn't a parseable URL.
 */
@Pipe({ name: 'domain' })
export class DomainPipe implements PipeTransform {
  /**
   * @param value the URL to shorten; `null`/`undefined`/empty yields `''` so a
   *              template can bind an optional URL without guarding
   * @param withPath keep the path after the host (used for repo links, where the
   *                 path is the interesting part); a trailing slash is dropped
   * @returns the display label, or the input unchanged if it will not parse as a URL
   */
  transform(value: string | null | undefined, withPath = false): string {
    if (!value) return '';
    try {
      const url = new URL(value);
      const host = url.hostname.replace(/^www\./, '');
      const path = withPath ? url.pathname.replace(/\/$/, '') : '';
      return host + path;
    } catch {
      return value;
    }
  }
}
