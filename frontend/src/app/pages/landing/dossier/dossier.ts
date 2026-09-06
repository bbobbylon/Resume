import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProfileService } from '../../../services/profile.service';
import { ProjectService } from '../../../services/project.service';
import { ResumeService } from '../../../services/resume.service';
import { StatusTag } from '../../../shared/status-tag/status-tag';
import { ArrowUpRight } from '../../../shared/icons/arrow-up-right';
import { DomainPipe } from '../../../shared/pipes/domain.pipe';
import { ThemeToggle } from '../../../shared/theme-toggle/theme-toggle';
import { LiveStatus } from '../../../shared/live-status/live-status';
import { GithubActivity } from '../../../shared/github-activity/github-activity';

/**
 * Landing layout 1c "Dossier" (handoff → Landing variants → 1c): a `360px | 1fr`
 * shell. The sticky aside carries identity, an in-page nav and the contact links
 * (so there is no top `.nav` here); the main column lists projects as a Nocturne
 * `.table` and experience/education as a `140px | 1fr` grid. Experience comes from
 * `GET /api/resume`, the same source the `/resume` page uses.
 */
@Component({
  selector: 'app-dossier',
  imports: [RouterLink, StatusTag, ArrowUpRight, DomainPipe, ThemeToggle, LiveStatus, GithubActivity],
  templateUrl: './dossier.html',
  styleUrl: './dossier.css',
})
export class Dossier {
  protected readonly profile = inject(ProfileService).profile;
  protected readonly projects = inject(ProjectService).projects;
  protected readonly resume = inject(ResumeService).resume;
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

  protected index(i: number): string {
    return String(i + 1).padStart(2, '0');
  }
}
