import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProfileService } from '../../../services/profile.service';
import { ProjectFilter } from '../../../services/project-filter';
import { Nav } from '../../../shared/nav/nav';
import { Footer } from '../../../shared/footer/footer';
import { StatusTag } from '../../../shared/status-tag/status-tag';
import { ProjectImage } from '../../../shared/project-image/project-image';
import { ArrowUpRight } from '../../../shared/icons/arrow-up-right';
import { DomainPipe } from '../../../shared/pipes/domain.pipe';
import { LiveStatus } from '../../../shared/live-status/live-status';
import { GithubActivity } from '../../../shared/github-activity/github-activity';
import { TechFilter } from '../../../shared/tech-filter/tech-filter';
import { ProjectSearch } from '../../../shared/project-search/project-search';

/**
 * Landing layout 1a "Ledger" (handoff → Landing variants → 1a): a single 1120px
 * column — nav, a 72px two-line hero, then every project as a numbered row
 * (`120px | 1fr | 320px`: index, copy, 16:10 screenshot) separated by fading
 * neutral-700 rules, a two-column contact block and a one-line footer.
 */
@Component({
  selector: 'app-ledger',
  imports: [RouterLink, Nav, Footer, StatusTag, ProjectImage, ArrowUpRight, DomainPipe, LiveStatus, GithubActivity, TechFilter, ProjectSearch],
  templateUrl: './ledger.html',
  styleUrl: './ledger.css',
})
export class Ledger {
  /** Identity, contact and bio for the hero and the two-column contact block. */
  protected readonly profile = inject(ProfileService).profile;
  /** Backs {@link projects} and tells the `@empty` block whether zero rows means "no data yet" or "no match". */
  protected readonly filter = inject(ProjectFilter);
  /**
   * The rows to render — from {@link ProjectFilter}, not {@link ProjectService}, so
   * the `?tech=`/`?q=` controls above the list actually narrow it. `undefined` while loading.
   */
  protected readonly projects = this.filter.projects;
  /** Skeleton rows while the project list loads. */
  protected readonly placeholders = [0, 1, 2];

  /**
   * Zero-pads a row's index for the left column: 0 → "01". Purely presentational —
   * the numbering is the list's order, which comes from the backend's seed order.
   *
   * @param i zero-based row index from the template's `$index`
   */
  protected index(i: number): string {
    return String(i + 1).padStart(2, '0');
  }
}
