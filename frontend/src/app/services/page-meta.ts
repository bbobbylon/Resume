import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '../../environments/environment';

/** Site-wide defaults, identical to the tags index.html ships with. */
export const SITE_TITLE = 'Robert Oliver, Jr. — Software Engineer';
/** The fallback meta description, used by the landing page and anything that sets none. */
export const SITE_DESCRIPTION =
  'Projects, live demos and resume of Robert Oliver, Jr., a software engineer working in identity & access management.';

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

  /**
   * Writes this page's title and social tags, replacing whatever the previous route
   * left behind. Called from each routed component's constructor (and again from
   * `ProjectDetail` once the project resolves), so both the prerendered HTML and a
   * client-side navigation end up with matching tags.
   *
   * @param input the page's title, description, route path and optional preview image
   */
  apply({ title, description, path, image }: PageMetaInput): void {
    const origin = environment.siteUrl.replace(/\/$/, '');
    const img = image ?? { url: 'og.png', width: 1200, height: 630, alt: 'WebsiteHub landing page' };
    const imageUrl = `${origin}/${img.url.replace(/^\//, '')}`;
    this.title.setTitle(title);
    const tags: Array<[attr: 'name' | 'property', key: string, content: string]> = [
      ['name', 'description', description],
      ['property', 'og:title', title],
      ['property', 'og:description', description],
      ['property', 'og:url', origin + path],
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
  }
}
