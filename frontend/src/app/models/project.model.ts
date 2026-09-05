/**
 * A project's lifecycle state. Mirrors the backend's `ProjectStatus` enum, which
 * Jackson serializes by name — so these string literals must stay in sync with
 * `com.bobbylon.websitehub.model.ProjectStatus`.
 */
export type ProjectStatus = 'LIVE' | 'WIP' | 'ARCHIVED';

/** One numbered "What it does" entry on the project detail page. */
export interface Highlight {
  title: string;
  body: string;
}

/**
 * One project. Mirrors the backend's `Project` record — see `GET /api/projects`
 * and `GET /api/projects/{id}` in `ProjectController`.
 *
 * - `url` is the live deployment and is `null` for projects that aren't hosted yet
 *   (status WIP); `repoUrl` is the GitHub link and is always present.
 * - `imageUrls` is `[hero, ...more]`; it's empty until screenshots are captured,
 *   in which case the UI renders a placeholder box with the project's initial.
 * - `hosting` / `delivery` are the detail page's meta lines and may be `null`.
 */
export interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  longDescription: string;
  url: string | null;
  repoUrl: string;
  status: ProjectStatus;
  techStack: string[];
  imageUrls: string[];
  highlights: Highlight[];
  hosting: string | null;
  delivery: string | null;
  featured: boolean;
}
