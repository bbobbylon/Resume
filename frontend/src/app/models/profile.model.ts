/**
 * A link to an outside social/professional profile. Mirrors the backend's
 * `SocialLink` record field-for-field (see `com.bobbylon.websitehub.model.SocialLink`)
 * so the JSON `GET /api/profile` returns can be assigned directly to this type.
 */
export interface SocialLink {
  platform: string;
  url: string;
}

/** One cell of the Gallery layout's stat band (e.g. value "100%", label "Platform uptime"). */
export interface Stat {
  value: string;
  label: string;
}

/**
 * The profile data every page reads (nav brand, hero, contact, footer). Mirrors the
 * backend's `Profile` record — see `GET /api/profile` in `ProfileController`.
 */
export interface Profile {
  name: string;
  /** Short lowercase brand mark shown in the nav (e.g. "bobbylon"). */
  brand: string;
  title: string;
  employer: string;
  /** The hero's second line ("Builds identity that holds."). */
  tagline: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
  /** Path or URL of the downloadable resume PDF. */
  resumeUrl: string;
  socialLinks: SocialLink[];
  stats: Stat[];
}
