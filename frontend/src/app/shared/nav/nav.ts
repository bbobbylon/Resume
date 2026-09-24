import { Component, ElementRef, HostListener, computed, inject, signal, viewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { ProfileService } from '../../services/profile.service';
import { ThemeToggle } from '../theme-toggle/theme-toggle';
import { CommandPaletteTrigger } from '../command-palette-trigger/command-palette-trigger';
import { MenuIcon } from '../icons/menu';

/**
 * The Nocturne `.nav` shared by the Ledger, Gallery and Folio landings, the resume
 * page and the project detail page: brand mark (→ `/`), Projects (→ `/#projects`),
 * Resume, Contact (mailto), the theme toggle and a primary "Download PDF" button.
 * (Dossier is the one layout that renders none of this — its own sticky aside
 * carries an always-visible `.side-nav` instead.)
 *
 * `aria-current="page"` is what the token sheet styles as the accent "current"
 * state, so it is set by hand: Resume via `routerLinkActive`, and Projects
 * whenever the router is on `/` or under `/projects/` — a plain `routerLinkActive`
 * on a fragment link wouldn't cover the detail pages.
 *
 * Below 480px `.nav-link` is hidden by `nav.css` (see `docs/UI-DESIGN.md`'s
 * breakpoint table) so the bar itself never wraps or crowds — but that took
 * Projects, Resume and Contact with it, leaving only the brand, the command
 * palette's icon-only trigger (labelled "Search (Ctrl+K)", a shortcut that does
 * not exist on a touchscreen) and Download PDF. {@link menuOpen} and the
 * `.menu-btn`/`.mobile-menu` markup in `nav.html` are what put those three links
 * back within reach on a phone: a small disclosure button, visible only at that
 * same breakpoint, that reveals them in a dropdown instead of a second nav bar.
 * It follows the WAI-ARIA "disclosure" pattern (a plain `aria-expanded` button
 * plus the region it controls) rather than a `menu`/`menuitem` widget, because
 * these are ordinary page links, not an application menu.
 */
@Component({
  selector: 'app-nav',
  imports: [RouterLink, RouterLinkActive, ThemeToggle, CommandPaletteTrigger, MenuIcon],
  templateUrl: './nav.html',
  styleUrl: './nav.css',
})
export class Nav {
  /** Watched for navigation end events, which is how the "Projects" link knows it is current. */
  private readonly router = inject(Router);
  /** Supplies the brand mark, the mailto address and the resume PDF link. */
  protected readonly profile = inject(ProfileService).profile;

  /**
   * The current URL as a signal. `routerLinkActive` cannot express "current on `/`
   * *and* on `/projects/*`", so this drives {@link projectsCurrent} instead. Seeded
   * with `router.url` so the first render (and the prerender) is already correct
   * rather than waiting for a navigation event that may never come.
   */
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

  /** Whether the phone-width menu dropdown is open. Only the `.menu-btn` (≤480px) ever sets this true. */
  protected readonly menuOpen = signal(false);
  /** The button that opens/closes the menu, so closing it (via Escape) can hand focus back. */
  private readonly menuButton = viewChild<ElementRef<HTMLButtonElement>>('menuButton');
  /** Wraps the button and the revealed panel, so a click outside both can be told apart from a click on either. */
  private readonly menuRoot = viewChild<ElementRef<HTMLElement>>('menuRoot');

  /** Flips {@link menuOpen}. The only thing that calls this is the button itself. */
  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  /** Closes the menu (a no-op if it is already closed) and returns focus to the button that opened it. */
  protected closeMenu(): void {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    this.menuButton()?.nativeElement.focus();
  }

  @HostListener('document:keydown', ['$event'])
  /**
   * Escape closes the menu, the same `document:keydown` + manual key check
   * {@link CommandPalette} uses rather than a combined `document:keydown.escape`
   * host-listener string, which is not a pattern already proven to work anywhere
   * else in this codebase.
   *
   * @param e the keydown; only acts on Escape, and only while the menu is open
   */
  protected onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape' && this.menuOpen()) this.closeMenu();
  }

  @HostListener('document:click', ['$event'])
  /**
   * Closes the menu on a click outside both the button and the panel. Runs on every
   * click, including the one that opened it — but that click's target is the button
   * itself, which `menuRoot` contains, so it does not immediately re-close what it
   * just opened.
   *
   * @param e the click; only its `target` is used, to test containment in {@link menuRoot}
   */
  protected onDocumentClick(e: MouseEvent): void {
    if (!this.menuOpen()) return;
    const root = this.menuRoot()?.nativeElement;
    if (root && !root.contains(e.target as Node)) this.menuOpen.set(false);
  }
}
