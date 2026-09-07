import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { PageMeta } from '../../services/page-meta';
import { Nav } from '../../shared/nav/nav';
import { Footer } from '../../shared/footer/footer';
import { LEGAL_UPDATED } from './legal';

/**
 * The `/privacy` route, linked from every footer. Describes what the site actually
 * does: no cookies, no analytics, one `localStorage` key for the theme, and the four
 * hosts a visitor's browser talks to.
 *
 * Those four claims are only true as long as the code says so, which is why they name
 * the responsible files: the theme key is {@link ThemeService}, the API host is
 * `environment.apiBaseUrl`, the GitHub call is {@link GithubActivity}, and the
 * per-project ping is {@link LiveStatus}. Adding any other outbound request means
 * updating this page in the same commit.
 */
@Component({
  selector: 'app-privacy',
  imports: [RouterLink, Nav, Footer],
  templateUrl: './privacy.html',
  styleUrl: './legal.css',
})
export class PrivacyPage {
  /** Shown at the top of the page; shared with the Terms page so the two agree. */
  protected readonly updated = LEGAL_UPDATED;
  /** The profile, for the one thing these pages need from it: where to write. */
  private readonly profile = inject(ProfileService).profile;
  /** The public contact address, from `GET /api/profile` — never hardcoded here. */
  protected readonly email = computed(() => this.profile()?.email ?? '');

  constructor() {
    inject(PageMeta).apply({
      title: 'Privacy Policy — Robert Oliver, Jr.',
      description:
        'What this site does and does not collect: no accounts, no cookies, no analytics — one theme preference kept in your own browser.',
      path: '/privacy/',
    });
  }
}
