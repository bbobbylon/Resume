import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProfileService } from '../../../services/profile.service';
import { ProjectService } from '../../../services/project.service';
import { Nav } from '../../../shared/nav/nav';
import { Footer } from '../../../shared/footer/footer';
import { StatusTag } from '../../../shared/status-tag/status-tag';
import { ProjectImage } from '../../../shared/project-image/project-image';
import { ArrowUpRight } from '../../../shared/icons/arrow-up-right';
import { DomainPipe } from '../../../shared/pipes/domain.pipe';
import { LiveStatus } from '../../../shared/live-status/live-status';

/**
 * Landing layout 1b "Gallery" (handoff → Landing variants → 1b): a `5fr | 7fr`
 * hero, the featured project as a wide `.card.elev-sm` (screenshot left, copy
 * right), the remaining projects in a three-column card grid, then the full-bleed
 * stat band on `--color-section` — the one saturated surface the design allows —
 * and a space-between footer.
 */
@Component({
  selector: 'app-gallery',
  imports: [RouterLink, Nav, Footer, StatusTag, ProjectImage, ArrowUpRight, DomainPipe, LiveStatus],
  templateUrl: './gallery.html',
  styleUrl: './gallery.css',
})
export class Gallery {
  protected readonly profile = inject(ProfileService).profile;
  private readonly projects = inject(ProjectService).projects;

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
    const n = this.rest()?.length ?? 0;
    return n >= 3 ? [] : Array.from({ length: 3 - n }, (_, i) => i);
  });
}
