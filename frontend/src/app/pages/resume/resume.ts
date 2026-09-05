import { Component, inject } from '@angular/core';
import { ProfileService } from '../../services/profile.service';
import { ResumeService } from '../../services/resume.service';
import { Nav } from '../../shared/nav/nav';
import { Footer } from '../../shared/footer/footer';
import { DomainPipe } from '../../shared/pipes/domain.pipe';
import { PageMeta } from '../../services/page-meta';

/**
 * The `/resume` route (handoff → "Resume page"): a `280px | 1fr` grid. The sticky
 * aside carries name, title, contact lines, skill chips and the PDF button; the
 * main column renders the summary, experience, projects, and education +
 * achievements side by side. Content comes verbatim from `GET /api/resume`, with
 * name/contact from `GET /api/profile`.
 */
@Component({
  selector: 'app-resume-page',
  imports: [Nav, Footer, DomainPipe],
  templateUrl: './resume.html',
  styleUrl: './resume.css',
})
export class ResumePage {
  protected readonly profile = inject(ProfileService).profile;
  protected readonly resume = inject(ResumeService).resume;

  constructor() {
    inject(PageMeta).apply({
      title: 'Resume — Robert Oliver, Jr.',
      description: 'Resume of Robert Oliver, Jr., software engineer in identity & access management: experience, skills, projects and education. Also available as a PDF.',
      path: '/resume/',
    });
  }

  /** "808-482-4518" → "tel:8084824518". */
  protected tel(phone: string): string {
    return 'tel:' + phone.replace(/[^\d+]/g, '');
  }
}
