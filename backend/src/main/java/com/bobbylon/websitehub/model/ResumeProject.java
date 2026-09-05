package com.bobbylon.websitehub.model;

import java.util.List;

/**
 * A project as it appears on the resume page — a heading, a stack line, and
 * bullet points. Distinct from {@link Project} (the hub's card/detail data) because
 * a resume entry is prose about the work, not a link-out card.
 *
 * @param name     heading, e.g. {@code "TesseraApp — Full-Stack Identity & Access Management (CIAM) Platform"}
 * @param subtitle the stack line under the heading
 * @param bullets  accomplishment bullet points
 * @param url      live URL shown as a small ghost link next to the heading; {@code null} if none
 */
public record ResumeProject(
        String name,
        String subtitle,
        List<String> bullets,
        String url
) {
}
