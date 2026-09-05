package com.bobbylon.websitehub.model;

import java.util.List;

/**
 * One job in the resume's "Experience" section.
 *
 * @param role     job title(s)
 * @param employer company/organization
 * @param location city, state
 * @param period   human-readable date range, e.g. {@code "2022 — Present"}
 * @param bullets  accomplishment bullet points, in display order
 */
public record Experience(
        String role,
        String employer,
        String location,
        String period,
        List<String> bullets
) {
}
