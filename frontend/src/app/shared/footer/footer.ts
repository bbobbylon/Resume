import { Component, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ProfileService } from '../../services/profile.service';

/**
 * Site footer, in the shape the owner asked for: the copyright line, a one-line
 * privacy note, links to the two legal pages, and contact set apart underneath.
 *
 * Two variants:
 * - default (Gallery / project detail / resume / the legal pages themselves) — all
 *   three blocks;
 * - `compact` (Ledger) — the © line and the legal links only, at 13px/55% text. The
 *   Ledger layout already lists the contact links in its own two-column Contact
 *   section, so repeating them here would be noise; the legal links stay, because
 *   Terms and Privacy must be reachable from every page.
 *
 * The Dossier layout renders no `app-footer` at all — its own sticky-aside grid ends
 * in an inline `.foot` line, which carries the same two links (dossier.html).
 *
 * Links to `/terms` and `/privacy` are `routerLink`s to prerendered pages
 * ({@link TermsPage}, {@link PrivacyPage}), so they cost no extra request. Each
 * carries `aria-current="page"` while you are on it — on those two pages the footer
 * is the only navigation that points at where you already are.
 */
@Component({
  selector: 'app-footer',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  /** Supplies the name in the © line and the email + social links in the contact row. */
  protected readonly profile = inject(ProfileService).profile;
  /** One-row variant for Ledger, whose own Contact section already lists these links. */
  readonly compact = input(false);
  /** Copyright year, read once at construction — a page is never open across a New Year that matters. */
  protected readonly year = new Date().getFullYear();
}
