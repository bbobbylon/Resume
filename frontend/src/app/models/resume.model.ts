/**
 * Types for `GET /api/resume`. Each interface mirrors the matching Java record in
 * `com.bobbylon.websitehub.model.Resume` field-for-field.
 */
export interface Experience {
  role: string;
  employer: string;
  location: string;
  period: string;
  bullets: string[];
}

export interface ResumeProject {
  name: string;
  subtitle: string;
  bullets: string[];
  url: string | null;
}

export interface Education {
  degree: string;
  school: string;
  year: string;
  note: string | null;
}

export interface Achievement {
  name: string;
  org: string;
  period: string;
}

export interface SkillGroup {
  category: string;
  skills: string[];
}

/** The full in-app resume rendered at `/resume`. */
export interface Resume {
  summary: string;
  skills: SkillGroup[];
  experience: Experience[];
  projects: ResumeProject[];
  education: Education[];
  achievements: Achievement[];
  pdfUrl: string;
}
