import { DOCUMENT, inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '../../environments/environment';

/** Site-wide defaults, identical to the tags index.html ships with. */
export const SITE_TITLE = 'Robert Oliver, Jr. — Software Engineer';
/** The fallback meta description, used by the landing page and anything that sets none. */
export const SITE_DESCRIPTION =
  'Projects, live demos and resume of Robert Oliver, Jr., a software engineer working in identity & access management.';

/** Id of the one JSON-LD script tag this service owns, so a page replaces rather than stacks. */
const JSONLD_ID = 'page-jsonld';

/** What one page needs to describe itself to crawlers and link unfurlers. */
export interface PageMetaInput {
  /** The full `<title>`, including the site suffix — this service does not add one. */
  title: string;
  /** Meta description and `og:description`; one or two sentences, written for a search result.*/
  description: string;
  /** Route path with a trailing slash for sub-pages (`/`, `/resume/`, `/projects/x/`). */
  path: string;
  /** Social-preview image relative to the site root; defaults to og.png (1200×630). */
  image?: { url: string; width: number; height: number; alt: string };
  /**
   * Schema.org data for this page, written into the head as a single
   * `application/ld+json` script. Pass nothing and any previous page's block is
   * removed rather than left behind — one page, one description of itself.
   */
  jsonLd?: Record<string, unknown>;
}

/**
 * Per-page `<title>`, description and social-preview tags (Open Graph + Twitter).
 * index.html carries the site-wide values; each routed page calls `apply` so the
 * prerendered HTML of every route — what crawlers and link unfurlers read —
 * describes that route, and client-side navigation keeps the tags in step.
 *
 * Open Graph URLs must be absolute. They are built on `environment.siteUrl`, the
 * same placeholder origin index.html uses; the Pages workflow stamps the real
 * origin into the HTML and the JS bundle at deploy time.
 */
@Injectable({ providedIn: 'root' })
export class PageMeta {
  /** Angular's `<title>` writer. */
  private readonly title = inject(Title);
  /** Angular's `<meta>` writer; tags are upserted by name/property, never duplicated. */
  private readonly meta = inject(Meta);
  /** The document whose `<head>` carries the JSON-LD block; injected so this runs during prerendering too. */
  private readonly doc = inject(DOCUMENT);

  /**
   * Writes this page's title and social tags, replacing whatever the previous route
   * left behind. Called from each routed component's constructor (and again from
   * `ProjectDetail` once the project resolves), so both the prerendered HTML and a
   * client-side navigation end up with matching tags.
   *
   * @param input the page's title, description, route path and optional preview image
   */
  apply({ title, description, path, image, jsonLd }: PageMetaInput): void {
    const img = image ?? { url: 'og.png', width: 1200, height: 630, alt: 'WebsiteHub landing page' };
    const imageUrl = this.absolute(img.url);
    const pageUrl = this.absolute(path);
    this.title.setTitle(title);
    const tags: Array<[attr: 'name' | 'property', key: string, content: string]> = [
      ['name', 'description', description],
      ['property', 'og:title', title],
      ['property', 'og:description', description],
      ['property', 'og:url', pageUrl],
      ['property', 'og:image', imageUrl],
      ['property', 'og:image:width', String(img.width)],
      ['property', 'og:image:height', String(img.height)],
      ['property', 'og:image:alt', img.alt],
      ['name', 'twitter:title', title],
      ['name', 'twitter:description', description],
      ['name', 'twitter:image', imageUrl],
    ];
    for (const [attr, key, content] of tags) {
      this.meta.updateTag({ [attr]: key, content }, `${attr}="${key}"`);
    }
    this.setCanonical(pageUrl);
    this.setJsonLd(jsonLd);
  }

  /**
   * Points this page at the one URL it should be indexed under.
   *
   * The landing page is reachable as `/`, `/?layout=gallery`, `/?layout=dossier`,
   * `/?tech=Angular`, `/?q=api` and every combination of those — and those are real
   * `<a href>`s in the prerendered HTML (the layout switcher, the stack chips), so a
   * crawler follows them and finds a dozen near-identical pages competing with each
   * other. The canonical link collapses them back onto `/`. It works because `path`
   * is always the clean route and never the query string.
   *
   * Managed by hand for the same reason as the JSON-LD block: {@link Meta} covers
   * `<meta>` only, and this is a `<link>`.
   *
   * @param url the absolute URL this page should be indexed as
   */
  private setCanonical(url: string): void {
    const existing = this.doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const link = existing ?? this.doc.createElement('link');
    link.setAttribute('rel', 'canonical');
    link.setAttribute('href', url);
    if (!existing) this.doc.head.appendChild(link);
  }

  /**
   * Writes (or clears) the page's single JSON-LD block.
   *
   * There is no Angular service for script tags the way {@link Meta} covers meta
   * tags, so the element is managed by hand and kept unique by id. It is written
   * during prerendering as well as in the browser, which is the point: the finished
   * HTML GitHub Pages serves is what a crawler reads, and it must describe the page
   * a visitor would see, not the previous route's.
   *
   * @param data the schema.org object, or `undefined` to leave no block behind
   */
  private setJsonLd(data: Record<string, unknown> | undefined): void {
    const existing = this.doc.getElementById(JSONLD_ID);
    if (!data) {
      existing?.remove();
      return;
    }
    const script = existing ?? this.doc.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.id = JSONLD_ID;
    script.textContent = JSON.stringify(data);
    if (!existing) this.doc.head.appendChild(script);
  }

  /**
   * Absolute URL for a path or root-relative asset, on the same origin the social
   * tags use — schema.org values have to be absolute, exactly like Open Graph's.
   *
   * @param pathOrAsset `/projects/x/` or `shots/x-1.webp`; a leading slash is optional
   */
  absolute(pathOrAsset: string): string {
    return `${environment.siteUrl.replace(/\/$/, '')}/${pathOrAsset.replace(/^\//, '')}`;
  }
}
