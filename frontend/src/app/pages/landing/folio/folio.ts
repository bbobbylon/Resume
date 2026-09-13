import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProfileService } from '../../../services/profile.service';
import { ResumeService } from '../../../services/resume.service';
import { ProjectFilter } from '../../../services/project-filter';
import { Nav } from '../../../shared/nav/nav';
import { Footer } from '../../../shared/footer/footer';
import { DomainPipe } from '../../../shared/pipes/domain.pipe';

/**
 * Landing layout "Folio", added 2026-09-13 (the owner's ask — a landing option
 * that "focus[es] more on the resume format and not so much on the projects").
 * Reuses the `/resume` page's `280px | 1fr` sticky-aside shell (`ResumePage`) —
 * summary, full experience, education and achievements in the main column,
 * identity/contact/skills in the aside — read from the same `GET /api/resume`
 * payload, so the two pages never disagree. The one deliberate difference: where
 * `/resume` lists `Resume.projects` (a hand-picked, bulleted subset written for
 * print), Folio reads the live portfolio catalogue via `ProjectFilter` and
 * renders it as a single row of linked chips, so a `?tech=`/`?q=` filter set on
 * another layout still narrows what shows here — just without a card grid to
 * narrow it in.
 */
@Component({
  selector: 'app-folio',
  imports: [RouterLink, Nav, Footer, DomainPipe],
  templateUrl: './folio.html',
  styleUrl: './folio.css',
})
export class Folio {
  /** Name, title and contact details for the aside. */
  protected readonly profile = inject(ProfileService).profile;
  /** Summary, experience, skills, education and achievements for the main column. */
  protected readonly resume = inject(ResumeService).resume;
  /** Backs {@link projects} and tells the chip row's `@empty` state whether zero means "no data yet" or "no match". */
  protected readonly filter = inject(ProjectFilter);
  /** The filtered catalogue, rendered as the foot-of-page chip row. */
  protected readonly projects = this.filter.projects;

  /** "808-482-4518" → "tel:8084824518". Same conversion `ResumePage` uses. */
  protected tel(phone: string): string {
    return 'tel:' + phone.replace(/[^\d+]/g, '');
  }
}
