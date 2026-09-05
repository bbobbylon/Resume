package com.bobbylon.websitehub.model;

import java.util.List;

/**
 * The full CV rendered at {@code /resume}, served by {@code GET /api/resume}.
 *
 * <p>Kept separate from {@link Profile} so the landing page (which only needs the
 * identity block) doesn't pay to download every experience bullet. The resume page
 * requests both: {@code Profile} for the sidebar's name/title/contact lines and this
 * record for the main column.
 *
 * @param summary      the opening paragraph
 * @param skills       technical skills, rendered as tags in the sidebar
 * @param experience   jobs, most recent first
 * @param projects     project write-ups, in display order
 * @param education    degrees, most recent first
 * @param achievements awards and honors
 * @param pdfUrl       link to the downloadable PDF version
 */
public record Resume(
        String summary,
        List<String> skills,
        List<Experience> experience,
        List<ResumeProject> projects,
        List<Education> education,
        List<Achievement> achievements,
        String pdfUrl
) {
}
