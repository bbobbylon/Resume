package com.bobbylon.websitehub.model;

import java.util.List;

/**
 * The identity block shown on every page of the hub: the nav brand, the landing
 * hero, the contact links in the footer, and the sidebar of the resume page.
 *
 * <p>There is only ever one {@code Profile} — it's the site owner's own — so unlike
 * {@link Project} it has no "id" field. The full CV content (experience, education,
 * skills…) lives in {@link Resume}, served separately at {@code /api/resume}, so the
 * landing page doesn't have to download the whole resume just to render a hero.
 *
 * @param name        full display name, e.g. {@code "Robert Oliver, Jr."}
 * @param brand       short lowercase mark used in the nav, e.g. {@code "bobbylon"}
 * @param title       professional headline, e.g. {@code "Software Engineer · Identity & Access Management"}
 * @param employer    current employer, shown under the title
 * @param tagline     the hero's second line, e.g. {@code "Builds identity that holds."}
 * @param bio         a few sentences of summary
 * @param email       contact email address
 * @param phone       contact phone number
 * @param location    city/region line
 * @param resumeUrl   link to the downloadable resume PDF (relative to the site root, or absolute)
 * @param socialLinks outbound links to GitHub/LinkedIn/etc., rendered in the given order
 * @param stats       the Gallery layout's resume-band figures, in display order
 */
public record Profile(
        String name,
        String brand,
        String title,
        String employer,
        String tagline,
        String bio,
        String email,
        String phone,
        String location,
        String resumeUrl,
        List<SocialLink> socialLinks,
        List<Stat> stats
) {
}
