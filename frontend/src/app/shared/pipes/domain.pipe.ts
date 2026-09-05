import { Pipe, PipeTransform } from '@angular/core';

/**
 * Turns a URL into the short label the designs print on "Open" buttons:
 * `https://tesseraapp.dev/` → `tesseraapp.dev`, `https://github.com/bbobbylon/x` →
 * `github.com/bbobbylon/x` (path kept only when `withPath` is true). Falls back
 * to the raw string if it isn't a parseable URL.
 */
@Pipe({ name: 'domain' })
export class DomainPipe implements PipeTransform {
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
