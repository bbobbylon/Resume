/**
 * Types for `GET /api/resume`. Each interface mirrors the matching Java record in
 * `com.bobbylon.websitehub.model.Resume` field-for-field.
 *
 * Two things render from these types: the `/resume` page (`ResumePage`) and, through
 * that page's print stylesheet, the committed `resume.pdf` that `scripts/resume-pdf.mjs`
 * regenerates. Dossier also reads `experience` and `education` for its right-hand
 * column, so a change here shows up on the landing page too.
 */
export interface Experience {
  /** Job title, `·`-separated when one post covered two roles. */
  role: string;
  /** Company name. */
  employer: string;
  /** City and state/country. */
  location: string;
  /** Human-readable span ("2022 — Present"); free text, never parsed. */
  period: string;
  /** What was done, one bullet per achievement, most significant first. */
  bullets: string[];
}

/** One project on the resume — a condensed cousin of the richer `Project` behind `/projects/:id`. */
export interface ResumeProject {
  /** Project name, usually with a short descriptor after an em dash. */
  name: string;
  /** The stack line under the name, `·`-separated. */
  subtitle: string;
  /** What was built, one bullet each. */
  bullets: string[];
  /** Live URL, or `null` for a project that is not deployed. */
  url: string | null;
}

/** One degree or credential. */
export interface Education {
  /** Degree earned, e.g. "M.S. Computer Science (Software Engineering)". */
  degree: string;
  /** Institution name. */
  school: string;
  /** Completion year as text; Dossier joins several with `·` rather than sorting them. */
  year: string;
  /** Honours or a note ("cum laude"), or `null` when there is nothing to add. */
  note: string | null;
}

/** An award, certification or similar credit. */
export interface Achievement {
  /** What it is. */
  name: string;
  /** Who awarded it. */
  org: string;
  /** When, as text. */
  period: string;
}

/**
 * Skills under one heading. Grouping is deliberate — the resume shows categories
 * rather than proficiency levels, since a self-assigned "expert" is an unverifiable
 * claim about the resume's owner.
 */
export interface SkillGroup {
  /** The heading ("Identity & Security"). */
  category: string;
  /** The skills under it, in display order. */
  skills: string[];
}

/** The full in-app resume rendered at `/resume`. */
export interface Resume {
  /** The opening paragraph. */
  summary: string;
  /** Skills, grouped into labelled categories; rendered as a tag row per group. */
  skills: SkillGroup[];
  /** Work history, most recent first. */
  experience: Experience[];
  /** Selected projects, most significant first. */
  projects: ResumeProject[];
  /** Degrees, most recent first. */
  education: Education[];
  /** Awards and credentials. */
  achievements: Achievement[];
  /** Path to the downloadable PDF; the same file `profile.resumeUrl` points at. */
  pdfUrl: string;
}
