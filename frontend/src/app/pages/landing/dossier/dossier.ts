import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProfileService } from '../../../services/profile.service';
import { ProjectFilter } from '../../../services/project-filter';
import { ResumeService } from '../../../services/resume.service';
import { StatusTag } from '../../../shared/status-tag/status-tag';
import { ArrowUpRight } from '../../../shared/icons/arrow-up-right';
import { DomainPipe } from '../../../shared/pipes/domain.pipe';
import { ThemeToggle } from '../../../shared/theme-toggle/theme-toggle';
import { LiveStatus } from '../../../shared/live-status/live-status';
import { GithubActivity } from '../../../shared/github-activity/github-activity';
import { CommandPaletteTrigger } from '../../../shared/command-palette-trigger/command-palette-trigger';
import { TechFilter } from '../../../shared/tech-filter/tech-filter';

/**
 * Landing layout 1c "Dossier" (handoff → Landing variants → 1c): a `360px | 1fr`
 * shell. The sticky aside carries identity, an in-page nav and the contact links
 * (so there is no top `.nav` here); the main column lists projects as a Nocturne
 * `.table` and experience/education as a `140px | 1fr` grid. Experience comes from
 * `GET /api/resume`, the same source the `/resume` page uses.
 */
@Component({
  selector: 'app-dossier',
  imports: [RouterLink, StatusTag, ArrowUpRight, DomainPipe, ThemeToggle, LiveStatus, GithubActivity, CommandPaletteTrigger, TechFilter],
  templateUrl: './dossier.html',
  styleUrl: './dossier.css',
})
export class Dossier {
  /** Identity and contact for the sticky aside (this layout has no top `Nav`). */
  protected readonly profile = inject(ProfileService).profile;
  /** The filtered catalogue, rendered as the main column's `.table` rows. */
  protected readonly projects = inject(ProjectFilter).projects;
  /**
   * Experience and education for the lower half of the main column — the same
   * `GET /api/resume` payload the `/resume` page uses, so the two never disagree.
   */
  protected readonly resume = inject(ResumeService).resume;
  /** Current year for this layout's own inline copyright line (it renders no `app-footer`). */
  protected readonly year = new Date().getFullYear();

  /** "Software Engineer · Identity & Access Management" → two lines for the aside. */
  protected readonly titleLines = computed(() => this.profile()?.title.split(' · ') ?? []);

  /** Education condensed to one row: "2026 · 2020" / "M.S. … · B.C.S. …" / school. */
  protected readonly education = computed(() => {
    const items = this.resume()?.education ?? [];
    if (!items.length) return undefined;
    return {
      period: items.map((e) => e.year).join(' · '),
      degrees: items.map((e) => e.degree).join(' · '),
      school: [...new Set(items.map((e) => e.school))].join(' · '),
    };
  });

  /**
   * Zero-pads a table row's index: 0 → "01". Same numbering the Ledger layout uses.
   *
   * @param i zero-based row index from the template's `$index`
   */
  protected index(i: number): string {
    return String(i + 1).padStart(2, '0');
  }
}
