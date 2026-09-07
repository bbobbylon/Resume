/**
 * A project's lifecycle state. Mirrors the backend's `ProjectStatus` enum, which
 * Jackson serializes by name — so these string literals must stay in sync with
 * `com.bobbylon.websitehub.model.ProjectStatus`.
 */
export type ProjectStatus = 'LIVE' | 'WIP' | 'ARCHIVED';

/** One numbered "What it does" entry on the project detail page. */
export interface Highlight {
  /** The short heading, rendered next to its 01/02/03 index. */
  title: string;
  /** Two or three sentences of detail under the heading. */
  body: string;
}

/** The problem/approach/outcome narrative on the project detail page. */
export interface CaseStudy {
  /** What needed solving — the constraint the project was built against. */
  problem: string;
  /** How it was solved, in terms of the actual design decisions. */
  approach: string;
  /** Where it ended up: shipped, live, measured. */
  outcome: string;
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
 *
 * Read by all three landing layouts, the `/projects/:id` detail page, the command
 * palette's page list and `ProjectFilter` (which derives the `?tech=` chips from
 * `techStack`).
 */
export interface Project {
  /** URL-safe slug; the `:id` in `/projects/:id` and the key screenshots are named after. */
  id: string;
  /** Display name. */
  name: string;
  /** One line for cards and list rows. */
  tagline: string;
  /** A sentence or two for the detail page's lede. */
  description: string;
  /** The full paragraph at the top of the detail page. */
  longDescription: string;
  /** Live deployment URL, or `null` when the project is not hosted yet (status `WIP`). */
  url: string | null;
  /** GitHub URL; always present, even for a private repo (the link may 404 for visitors). */
  repoUrl: string;
  /** Lifecycle state, driving the status tag and whether an "Open" button renders. */
  status: ProjectStatus;
  /**
   * Technologies, as displayed. Spellings carry versions ("Angular 21") on purpose —
   * `ProjectFilter` strips a trailing version when matching, so the chips group
   * "Angular 21" and "Angular" together while the cards still print the exact string.
   */
  techStack: string[];
  /**
   * Screenshots, hero first, as root-relative paths like `shots/<id>-1.webp` (no
   * leading slash, so they resolve under a `<base href>` sub-path). Empty renders a
   * placeholder box instead.
   */
  imageUrls: string[];
  /** The numbered "What it does" entries; the detail page expects roughly three. */
  highlights: Highlight[];
  /** Where it runs ("AWS ECS Fargate · CloudFront · Aiven MySQL"), or `null` if not deployed. */
  hosting: string | null;
  /** How it ships ("Multi-stage Docker · GitHub Actions"), or `null` if there is no pipeline. */
  delivery: string | null;
  /** Whether this is the lead project: Gallery gives it the wide card, Ledger a "Featured" tag. */
  featured: boolean;
  /** The problem/approach/outcome section above the highlights. */
  caseStudy: CaseStudy;
}
