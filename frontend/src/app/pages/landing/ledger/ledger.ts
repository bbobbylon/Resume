import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProfileService } from '../../../services/profile.service';
import { ProjectService } from '../../../services/project.service';
import { Nav } from '../../../shared/nav/nav';
import { Footer } from '../../../shared/footer/footer';
import { StatusTag } from '../../../shared/status-tag/status-tag';
import { ProjectImage } from '../../../shared/project-image/project-image';
import { ArrowUpRight } from '../../../shared/icons/arrow-up-right';
import { DomainPipe } from '../../../shared/pipes/domain.pipe';

/**
 * Landing layout 1a "Ledger" (handoff → Landing variants → 1a): a single 1120px
 * column — nav, a 72px two-line hero, then every project as a numbered row
 * (`120px | 1fr | 320px`: index, copy, 16:10 screenshot) separated by fading
 * neutral-700 rules, a two-column contact block and a one-line footer.
 */
@Component({
  selector: 'app-ledger',
  imports: [RouterLink, Nav, Footer, StatusTag, ProjectImage, ArrowUpRight, DomainPipe],
  templateUrl: './ledger.html',
  styleUrl: './ledger.css',
})
export class Ledger {
  protected readonly profile = inject(ProfileService).profile;
  protected readonly projects = inject(ProjectService).projects;
  /** Skeleton rows while the project list loads. */
  protected readonly placeholders = [0, 1, 2];

  protected index(i: number): string {
    return String(i + 1).padStart(2, '0');
  }
}
