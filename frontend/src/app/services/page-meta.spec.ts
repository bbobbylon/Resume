import { TestBed } from '@angular/core/testing';
import { PageMeta } from './page-meta';
import { environment } from '../../environments/environment';

describe('PageMeta', () => {
  const content = (selector: string) => document.querySelector<HTMLMetaElement>(`meta[${selector}]`)?.content;

  it('sets the title, description and social tags for a page', () => {
    TestBed.inject(PageMeta).apply({ title: 'TesseraApp — R', description: 'Zero-trust CIAM.', path: '/projects/tesseraapp/' });
    expect(document.title).toBe('TesseraApp — R');
    expect(content('name="description"')).toBe('Zero-trust CIAM.');
    expect(content('property="og:title"')).toBe('TesseraApp — R');
    expect(content('property="og:url"')).toBe(`${environment.siteUrl}/projects/tesseraapp/`);
    expect(content('property="og:image"')).toBe(`${environment.siteUrl}/og.png`);
    expect(content('name="twitter:description"')).toBe('Zero-trust CIAM.');
  });

  it('uses a page-specific image when given, and updates rather than duplicates tags', () => {
    const meta = TestBed.inject(PageMeta);
    meta.apply({ title: 'A', description: 'a', path: '/' });
    meta.apply({ title: 'B', description: 'b', path: '/resume/', image: { url: 'shots/x-social.jpg', width: 1200, height: 630, alt: 'X' } });
    expect(document.querySelectorAll('meta[property="og:image"]').length).toBe(1);
    expect(content('property="og:image"')).toBe(`${environment.siteUrl}/shots/x-social.jpg`);
    expect(content('property="og:image:alt"')).toBe('X');
    expect(content('property="og:url"')).toBe(`${environment.siteUrl}/resume/`);
  });

  it('writes one JSON-LD block, and replaces it rather than stacking blocks', () => {
    const meta = TestBed.inject(PageMeta);
    meta.apply({ title: 'A', description: 'a', path: '/projects/a/', jsonLd: { '@type': 'SoftwareSourceCode', name: 'A' } });
    meta.apply({ title: 'B', description: 'b', path: '/projects/b/', jsonLd: { '@type': 'SoftwareSourceCode', name: 'B' } });
    const blocks = document.querySelectorAll('script[type="application/ld+json"]');
    expect(blocks.length).toBe(1);
    expect(JSON.parse(blocks[0].textContent ?? '{}').name).toBe('B');
  });

  it('removes a JSON-LD block when the next page sets none', () => {
    const meta = TestBed.inject(PageMeta);
    meta.apply({ title: 'A', description: 'a', path: '/projects/a/', jsonLd: { '@type': 'SoftwareSourceCode', name: 'A' } });
    meta.apply({ title: 'Home', description: 'h', path: '/' });
    expect(document.querySelector('script[type="application/ld+json"]')).toBeNull();
  });

  it('writes one canonical link per page, and moves it rather than stacking links', () => {
    const meta = TestBed.inject(PageMeta);
    meta.apply({ title: 'A', description: 'a', path: '/' });
    expect(document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href).toBe(`${environment.siteUrl}/`);
    meta.apply({ title: 'B', description: 'b', path: '/resume/' });
    const links = document.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]');
    expect(links.length).toBe(1);
    expect(links[0].href).toBe(`${environment.siteUrl}/resume/`);
  });

  it('canonicalises to the clean route, so the filtered landing page does not compete with /', () => {
    // The layout switcher and the stack chips put ?layout=, ?tech= and ?q= links in
    // the prerendered HTML. `Landing` applies `path: '/'` once, whatever the query
    // string says, and that is what stops a crawler indexing a dozen near-copies.
    TestBed.inject(PageMeta).apply({ title: 'Home', description: 'h', path: '/' });
    expect(document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href).toBe(`${environment.siteUrl}/`);
  });

  it('builds absolute URLs on the site origin, with or without a leading slash', () => {
    const meta = TestBed.inject(PageMeta);
    expect(meta.absolute('/projects/x/')).toBe(`${environment.siteUrl}/projects/x/`);
    expect(meta.absolute('shots/x-1.webp')).toBe(`${environment.siteUrl}/shots/x-1.webp`);
  });
});
