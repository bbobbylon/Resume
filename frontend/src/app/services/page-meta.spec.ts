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
});
