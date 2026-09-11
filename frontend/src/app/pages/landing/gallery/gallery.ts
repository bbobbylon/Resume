import { Component, computed, inject } from '@angular/core';
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
 * Landing layout 1b "Gallery" (handoff → Landing variants → 1b): a `5fr | 7fr`
 * hero, the featured project as a wide `.card.elev-sm` (screenshot left, copy
 * right), the remaining projects in a three-column card grid, then the full-bleed
 * stat band on `--color-section` — the one saturated surface the design allows —
 * and a space-between footer.
 */
@Component({
  selector: 'app-gallery',
  imports: [RouterLink, Nav, Footer, StatusTag, ProjectImage, ArrowUpRight, DomainPipe, LiveStatus, GithubActivity, TechFilter, ProjectSearch],
  templateUrl: './gallery.html',
  styleUrl: './gallery.css',
})
export class Gallery {
  /** Identity and the `stats` this layout renders as its full-bleed stat band. */
  protected readonly profile = inject(ProfileService).profile;
  /**
   * Held as the service (not just its list) because {@link emptySlots} and
   * {@link noResults} also need to know whether a filter is active.
   */
  private readonly filter = inject(ProjectFilter);
  /** The filtered catalogue; `featured` and `rest` are both derived from it. */
  private readonly projects = this.filter.projects;

  /**
   * True once the catalogue has loaded and an active tech/search filter leaves
   * nothing to show — distinct from `undefined` (still loading), which the
   * featured card and grid already render skeletons for.
   */
  protected readonly noResults = computed(() => this.filter.active() && this.projects()?.length === 0);

  /** The featured project (first flagged one, else the first in the list). */
  protected readonly featured = computed(() => {
    const list = this.projects();
    return list ? (list.find((p) => p.featured) ?? list[0]) : undefined;
  });

  /** Everything except the featured project, for the card grid. */
  protected readonly rest = computed(() => {
    const list = this.projects();
    const lead = this.featured();
    return list ? list.filter((p) => p !== lead) : undefined;
  });

  /**
   * Dashed "next project" placeholder cells that keep the 3-column grid square
   * until there are at least three non-featured projects (handoff: remove once ≥3).
   */
  protected readonly emptySlots = computed(() => {
    // Under an active tech or search filter a short list is the filter's doing, not an empty portfolio.
    if (this.filter.active()) return [];
    const n = this.rest()?.length ?? 0;
    return n >= 3 ? [] : Array.from({ length: 3 - n }, (_, i) => i);
  });
}
