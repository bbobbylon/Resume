/**
 * A link to an outside social/professional profile. Mirrors the backend's
 * `SocialLink` record field-for-field (see `com.bobbylon.websitehub.model.SocialLink`)
 * so the JSON `GET /api/profile` returns can be assigned directly to this type.
 */
export interface SocialLink {
  /** Which site this points at — `Nav` and `Ledger` match on `'GitHub'` by name, so the spelling matters. */
  platform: string;
  /** Absolute URL of the profile; rendered with `rel="noopener"` and `target="_blank"`. */
  url: string;
}

/** One cell of the Gallery layout's stat band (e.g. value "100%", label "Platform uptime"). */
export interface Stat {
  /** The big number or figure, already formatted for display ("100%", "3+"). */
  value: string;
  /** The caption under it, in sentence case. */
  label: string;
}

/**
 * The profile data every page reads (nav brand, hero, contact, footer). Mirrors the
 * backend's `Profile` record — see `GET /api/profile` in `ProfileController`.
 *
 * Fetched once by {@link ProfileService} and shared as a signal, so all three landing
 * layouts, the resume page, the nav and the footer read the same object.
 */
export interface Profile {
  /** Full display name, used as the hero heading and in every page `<title>`. */
  name: string;
  /** Short lowercase brand mark shown in the nav (e.g. "bobbylon"). */
  brand: string;
  /** Role line, `·`-separated; Dossier splits it on that separator to stack it over two lines. */
  title: string;
  /** Current employer, shown under the title. */
  employer: string;
  /** The hero's second line ("Builds identity that holds."). */
  tagline: string;
  /** The paragraph under the hero, and the meta description fallback. */
  bio: string;
  /** Contact address; rendered as a `mailto:` link. Deliberately a public address, not a work one. */
  email: string;
  /** Contact number, already formatted for display. Public, so it is not the owner's private line. */
  phone: string;
  /** Where the owner is, as one line ("Kaua'i, Hawai'i, USA"). */
  location: string;
  /** Path or URL of the downloadable resume PDF. */
  resumeUrl: string;
  /** Outbound profile links, in the order they should render. */
  socialLinks: SocialLink[];
  /** Figures for Gallery's stat band; the other two layouts ignore them. */
  stats: Stat[];
}
