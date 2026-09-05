import { Component, inject, input } from '@angular/core';
import { ProfileService } from '../../services/profile.service';

/**
 * Site footer. Two variants from the handoff:
 * - default (Gallery / detail / resume): `space-between` — © on the left, Email /
 *   LinkedIn / GitHub on the right;
 * - `compact` (Ledger): the one-line 13px © at 55% text, no link row (the Ledger
 *   layout already lists the contact links in its own two-column Contact section).
 */
@Component({
  selector: 'app-footer',
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  protected readonly profile = inject(ProfileService).profile;
  readonly compact = input(false);
  protected readonly year = new Date().getFullYear();
}
