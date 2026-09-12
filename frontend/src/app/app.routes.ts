import { Routes } from '@angular/router';
import { Landing } from './pages/landing/landing';
import { ResumePage } from './pages/resume/resume';
import { ProjectDetail } from './pages/project-detail/project-detail';
import { NotFound } from './pages/not-found/not-found';
import { TermsPage } from './pages/legal/terms';
import { PrivacyPage } from './pages/legal/privacy';

/**
 * The hub's routes (see docs/design-handoff.md → "Frontend changes"):
 *
 * - `/`              — landing page; one of three Nocturne layouts chosen by
 *                       `environment.landingLayout` or a `?layout=` query param.
 * - `/resume`        — the in-app resume.
 * - `/projects/:id`  — one project's detail page (`:id` is the backend's slug id).
 * - `/terms`, `/privacy` — the two legal pages every footer links to.
 * - anything else    — a not-found page. GitHub Pages serves `404.html` (not
 *                       index.html) for a path it has no file for; the Pages
 *                       workflow copies the client-render shell there, so the app
 *                       boots and the router lands on this route — with a real 404
 *                       status, which is the right answer for a page that is
 *                       genuinely missing.
 *
 * Components are imported eagerly, and the reason is prerendering rather than size:
 * every route here is built to static HTML (app.routes.server.ts), so its first
 * paint is finished markup, not a bundle download — but *hydration* still needs the
 * component, and a `loadComponent` chunk would make a page that has already painted
 * wait on a second round-trip before it became interactive. The size argument points
 * the same way: all six route components — the three landing layouts included — are
 * ~66 kB of a ~400 kB bundle that is otherwise the Angular runtime (~295 kB), so
 * there is not much to defer anyway.
 */
export const routes: Routes = [
  { path: '', component: Landing, title: 'Robert Oliver, Jr. — Software Engineer' },
  { path: 'resume', component: ResumePage, title: 'Resume — Robert Oliver, Jr.' },
  { path: 'projects/:id', component: ProjectDetail },
  { path: 'terms', component: TermsPage, title: 'Terms of Use — Robert Oliver, Jr.' },
  { path: 'privacy', component: PrivacyPage, title: 'Privacy Policy — Robert Oliver, Jr.' },
  { path: '**', component: NotFound, title: 'Page not found — Robert Oliver, Jr.' },
];
