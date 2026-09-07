import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { PageMeta } from '../../services/page-meta';
import { Nav } from '../../shared/nav/nav';
import { Footer } from '../../shared/footer/footer';
import { LEGAL_UPDATED } from './legal';

/**
 * The `/terms` route, linked from every footer. Says what the site is (a personal
 * portfolio, not a service), that its content is provided as-is, who owns the text
 * and the code, that linked deployments have their own terms, and asks that the free
 * public API not be hammered.
 *
 * Sibling of {@link PrivacyPage}: same shell, same stylesheet (legal.css) and the same
 * `LEGAL_UPDATED` date.
 */
@Component({
  selector: 'app-terms',
  imports: [RouterLink, Nav, Footer],
  templateUrl: './terms.html',
  styleUrl: './legal.css',
})
export class TermsPage {
  /** Shown at the top of the page; shared with the Privacy page so the two agree. */
  protected readonly updated = LEGAL_UPDATED;
  /** The profile, for the one thing these pages need from it: where to write. */
  private readonly profile = inject(ProfileService).profile;
  /** The public contact address, from `GET /api/profile` — never hardcoded here. */
  protected readonly email = computed(() => this.profile()?.email ?? '');

  constructor() {
    inject(PageMeta).apply({
      title: 'Terms of Use — Robert Oliver, Jr.',
      description:
        'The terms this personal portfolio is published under: content provided as-is, links lead elsewhere, and the public API is free to call but not to abuse.',
      path: '/terms/',
    });
  }
}
