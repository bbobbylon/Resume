import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NotFound } from './not-found';
import { PageMeta } from '../../services/page-meta';

describe('NotFound', () => {
  it('explains the miss and links back to the hub', async () => {
    TestBed.configureTestingModule({
      imports: [NotFound],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    const fixture = TestBed.createComponent(NotFound);
    fixture.detectChanges();
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('h1')?.textContent).toBe('Page not found');
    expect(el.querySelector('.missing code')?.textContent).toBe('/');
    expect(el.querySelector('.actions a.btn-primary')?.getAttribute('href')).toBe('/');
  });

  it('describes itself instead of inheriting the previous page’s tags', async () => {
    // A client-side navigation into a bad URL leaves the last page's title,
    // description and canonical in the head unless this route overwrites them.
    TestBed.configureTestingModule({
      imports: [NotFound],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    TestBed.inject(PageMeta).apply({ title: 'TesseraApp — R', description: 'Zero-trust CIAM.', path: '/projects/tesseraapp/' });
    const fixture = TestBed.createComponent(NotFound);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(document.title).toBe('Page not found — Robert Oliver, Jr.');
    expect(document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content).not.toContain('Zero-trust');
    expect(document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href).not.toContain('/projects/tesseraapp/');
  });
});
