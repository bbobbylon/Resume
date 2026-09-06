package com.bobbylon.websitehub.model;

/**
 * The problem/approach/outcome narrative on a project's detail page
 * ({@code /projects/:id}), below the numbered {@link Highlight} list — see
 * {@link Project#caseStudy()}. Restates the project's own tagline, description
 * and highlights as a short story instead of a feature list.
 *
 * @param problem  what the project needed to solve, one or two sentences
 * @param approach how it was built, one or two sentences
 * @param outcome  where it stands today, one sentence
 */
public record CaseStudy(String problem, String approach, String outcome) {
}
