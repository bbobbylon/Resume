import { TestBed } from '@angular/core/testing';
import { Type } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Ledger } from './ledger/ledger';
import { Gallery } from './gallery/gallery';
import { Dossier } from './dossier/dossier';
import { Project } from '../../models/project.model';

const profile = {
  name: 'Robert Oliver, Jr.', brand: 'bobbylon', title: 'Software Engineer · IAM', employer: 'Deloitte',
  tagline: 'Builds identity that holds.', bio: 'Bio text', email: 'me@example.com', phone: '1', location: 'Kauai',
  resumeUrl: 'resume.pdf', socialLinks: [{ platform: 'GitHub', url: 'https://github.com/bbobbylon' }],
  stats: [{ value: '100%', label: 'Uptime' }],
};
const projects: Project[] = [
  { id: 'tesseraapp', name: 'TesseraApp', tagline: 'CIAM', description: 'd1', longDescription: 'l', url: 'https://tesseraapp.dev',
    repoUrl: 'https://github.com/bbobbylon', status: 'LIVE', techStack: ['Angular 21'], imageUrls: [], highlights: [],
    hosting: null, delivery: null, featured: true },
  { id: 'luv2shop', name: 'Luv2Shop', tagline: 'Shop', description: 'd2', longDescription: 'l', url: null,
    repoUrl: 'https://github.com/bbobbylon/AngularECommerceAppv2', status: 'WIP', techStack: ['Stripe'], imageUrls: [], highlights: [],
    hosting: null, delivery: null, featured: false },
];
const resume = {
  summary: 's', skills: [], projects: [], achievements: [], pdfUrl: 'resume.pdf',
  experience: [{ role: 'Engineer', employer: 'Deloitte', location: 'Dallas', period: '2022 — Present', bullets: ['Lead bullet'] }],
  education: [{ degree: 'M.S. CS', school: 'Lewis University', year: '2026', note: null }],
};

async function render(component: Type<unknown>) {
  await TestBed.configureTestingModule({
    imports: [component],
    providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
  }).compileComponents();
  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();
  const http = TestBed.inject(HttpTestingController);
  http.match((r) => r.url.endsWith('/api/profile')).forEach((r) => r.flush(profile));
  http.match((r) => r.url.endsWith('/api/projects')).forEach((r) => r.flush(projects));
  http.match((r) => r.url.endsWith('/api/resume')).forEach((r) => r.flush(resume));
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('Landing layouts', () => {
  it('Ledger renders numbered rows with Open/Source links', async () => {
    const el = await render(Ledger);
    expect(el.querySelectorAll('article.row').length).toBe(2);
    expect(el.textContent).toContain('01');
    expect(el.querySelector('a[href="https://tesseraapp.dev"]')?.textContent).toContain('Open tesseraapp.dev');
    // WIP project has no live URL → no primary Open button in its row
    const rows = el.querySelectorAll('article.row');
    expect(rows[1].querySelector('a.btn-primary')).toBeNull();
    expect(rows[1].querySelector('a.btn-secondary')?.getAttribute('href')).toContain('AngularECommerceAppv2');
  });

  it('Gallery puts the featured project in the lead card and pads the grid', async () => {
    const el = await render(Gallery);
    expect(el.querySelector('.featured h2')?.textContent?.trim()).toBe('TesseraApp');
    expect(el.querySelectorAll('.grid .card').length).toBe(1);
    expect(el.querySelectorAll('.grid .slot').length).toBe(2);
    expect(el.querySelector('.band')?.textContent).toContain('100%');
  });

  it('Dossier renders the projects table and experience from /api/resume', async () => {
    const el = await render(Dossier);
    expect(el.querySelectorAll('table.table tbody tr').length).toBe(2);
    expect(el.textContent).toContain('Lead bullet');
    expect(el.textContent).toContain('M.S. CS');
    expect(el.querySelector('a.btn-block')?.getAttribute('href')).toBe('resume.pdf');
  });
});
