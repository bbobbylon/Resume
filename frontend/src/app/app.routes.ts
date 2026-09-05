import { Routes } from '@angular/router';
import { Landing } from './pages/landing/landing';
import { ResumePage } from './pages/resume/resume';
import { ProjectDetail } from './pages/project-detail/project-detail';
import { NotFound } from './pages/not-found/not-found';

/**
 * The hub's three routes (see docs/design-handoff.md → "Frontend changes"):
 *
 * - `/`              — landing page; one of three Nocturne layouts chosen by
 *                       `environment.landingLayout` or a `?layout=` query param.
 * - `/resume`        — the in-app resume.
 * - `/projects/:id`  — one project's detail page (`:id` is the backend's slug id).
 * - anything else    — a not-found page (GitHub Pages serves index.html for unknown
 *                       paths, so the app boots and lands here).
 *
 * Components are imported eagerly: the whole app is a few hundred kB and three
 * routes, so lazy `loadComponent` chunks would cost more round-trips than they save.
 */
export const routes: Routes = [
  { path: '', component: Landing, title: 'Robert Oliver, Jr. — Software Engineer' },
  { path: 'resume', component: ResumePage, title: 'Resume — Robert Oliver, Jr.' },
  { path: 'projects/:id', component: ProjectDetail },
  { path: '**', component: NotFound, title: 'Page not found — Robert Oliver, Jr.' },
];
