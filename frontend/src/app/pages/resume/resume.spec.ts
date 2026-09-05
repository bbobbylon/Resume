import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ResumePage } from './resume';

describe('ResumePage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumePage],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('renders experience, projects, education and achievements from /api/resume', async () => {
    const fixture = TestBed.createComponent(ResumePage);
    fixture.detectChanges();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne((r) => r.url.endsWith('/api/resume')).flush({
      summary: 'Summary text', skills: ['Java', 'Angular'],
      experience: [{ role: 'Engineer', employer: 'Deloitte', location: 'Dallas, TX', period: '2022 — Present', bullets: ['Did things'] }],
      projects: [{ name: 'TesseraApp', subtitle: 'CIAM', bullets: ['b'], url: 'https://tesseraapp.dev' }],
      education: [{ degree: 'M.S. CS', school: 'Lewis University', year: '2026', note: 'GPA 3.94' }],
      achievements: [{ name: 'Scholarship', org: 'Lewis', period: '2018–2020' }],
      pdfUrl: 'resume.pdf',
    });
    http.match((r) => r.url.endsWith('/api/profile')).forEach((r) => r.flush({
      name: 'Robert Oliver, Jr.', brand: 'bobbylon', title: 'Software Engineer · IAM', employer: 'Deloitte', tagline: 't', bio: 'b',
      email: 'me@example.com', phone: '808-482-4518', location: 'Kauai', resumeUrl: 'resume.pdf', socialLinks: [], stats: [],
    }));
    await fixture.whenStable();
    const text: string = fixture.nativeElement.textContent;
    for (const s of ['Summary text', 'Engineer', 'Did things', 'TesseraApp', 'CIAM', 'M.S. CS', 'GPA 3.94', 'Scholarship', 'Java']) {
      expect(text).toContain(s);
    }
    expect(fixture.nativeElement.querySelector('a[href="tel:8084824518"]')).not.toBeNull();
    http.verify({ ignoreCancelled: true });
  });
});
