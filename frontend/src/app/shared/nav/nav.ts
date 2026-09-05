import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { ProfileService } from '../../services/profile.service';
import { ThemeToggle } from '../theme-toggle/theme-toggle';

/**
 * The Nocturne `.nav` shared by the Ledger and Gallery landings, the resume page and
 * the project detail page: brand mark (→ `/`), Projects (→ `/#projects`), Resume,
 * Contact (mailto), the theme toggle and a primary "Download PDF" button.
 *
 * `aria-current="page"` is what the token sheet styles as the accent "current"
 * state, so it is set by hand: Resume via `routerLinkActive`, and Projects
 * whenever the router is on `/` or under `/projects/` — a plain `routerLinkActive`
 * on a fragment link wouldn't cover the detail pages.
 */
@Component({
  selector: 'app-nav',
  imports: [RouterLink, RouterLinkActive, ThemeToggle],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class Nav {
  private readonly router = inject(Router);
  protected readonly profile = inject(ProfileService).profile;

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  /** True on the landing page (any layout/fragment) and on every project detail page. */
  protected readonly projectsCurrent = computed(() => {
    const path = this.url().split(/[?#]/)[0];
    return path === '/' || path === '' || path.startsWith('/projects/');
  });
}
