import { PrerenderFallback, RenderMode, ServerRoute } from '@angular/ssr';
import { environment } from '../environments/environment';
import { Project } from './models/project.model';

/**
 * Which routes `ng build` prerenders: `/`, `/resume` and one page per project id.
 * The ids come from the backend running on localhost during the build (run.sh and
 * the Pages workflow start it; see `environment.prerenderApiBaseUrl`). Without it the
 * build still succeeds — no detail pages are written and they render in the browser
 * instead, as the not-found page always does. Everything else (`**`) is
 * client-rendered from `index.csr.html`, the file the Pages deploy also serves as
 * 404.html so deep links boot the app.
 */
export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'resume', renderMode: RenderMode.Prerender },
  {
    path: 'projects/:id',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Client,
    async getPrerenderParams() {
      const url = `${environment.prerenderApiBaseUrl}/api/projects`;
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const projects = (await response.json()) as Project[];
        return projects.map((project) => ({ id: project.id }));
      } catch (error) {
        console.warn(`[prerender] ${url} unavailable (${error}) — project pages will render in the browser`);
        return [];
      }
    },
  },
  { path: '**', renderMode: RenderMode.Client },
];
