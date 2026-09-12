// Minimal static file server for exercising a finished `ng build` with headless
// Chrome (see resume-pdf.mjs) without the Angular dev server or the backend —
// every route is already static HTML by the time `ng build` finishes.
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join } from 'node:path';

const TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
  '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain',
  '.webmanifest': 'application/manifest+json',
};

/**
 * Serves `dir` on an ephemeral localhost port under `basePath` (e.g. "/Resume/"),
 * the way GitHub Pages does — so a build made with `--base-href` resolves its
 * absolute asset URLs the same way in this throwaway server as it would in
 * production. Extension-less routes fall back to `<path>/index.html`, matching
 * how Angular's static prerendering lays out each route as a directory.
 *
 * A path with no file behind it gets the same SPA fallback Pages gives it: the
 * body of `404.html` with a 404 status. In a local `ng build` that file does not
 * exist yet — deploy-pages.yml creates it by copying `index.csr.html` — so the
 * shell is used directly when it does not, which is the same bytes the deployed
 * site would answer with. Without this, anything checking the built output
 * against a not-found path silently audits *Chrome's* error page instead.
 */
export function serveStatic(dir, basePath = '/') {
  const prefix = basePath.replace(/\/+$/, '');
  const server = createServer((req, res) => {
    let path = decodeURIComponent(req.url.split('?')[0]);
    if (prefix && !path.startsWith(prefix)) {
      res.writeHead(404).end();
      return;
    }
    path = path.slice(prefix.length) || '/';
    let file = join(dir, path);
    if (!existsSync(file) || statSync(file).isDirectory()) file = join(file, 'index.html');
    if (!existsSync(file)) {
      const fallback = [join(dir, '404.html'), join(dir, 'index.csr.html')].find((f) => existsSync(f));
      if (!fallback) {
        res.writeHead(404).end();
        return;
      }
      res.writeHead(404, { 'Content-Type': 'text/html' });
      createReadStream(fallback).pipe(res);
      return;
    }
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
    createReadStream(file).pipe(res);
  });
  return new Promise((resolvePromise) => {
    server.listen(0, '127.0.0.1', () => resolvePromise({ port: server.address().port, close: () => server.close() }));
  });
}
