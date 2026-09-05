package com.bobbylon.websitehub.model;

/**
 * One numbered "What it does" entry on a project's detail page
 * ({@code /projects/:id}). A project carries three of these — see
 * {@link Project#highlights()}.
 *
 * @param title short heading, e.g. {@code "Hybrid zero-trust sessions"}
 * @param body  one or two sentences expanding on the title
 */
public record Highlight(String title, String body) {
}
