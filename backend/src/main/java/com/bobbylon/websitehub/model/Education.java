package com.bobbylon.websitehub.model;

/**
 * One degree on the resume.
 *
 * @param degree e.g. {@code "M.S. Computer Science (Software Engineering)"}
 * @param school institution
 * @param year   graduation year, as text so ranges/expected dates also fit
 * @param note   optional extra line such as a GPA; {@code null} if none
 */
public record Education(String degree, String school, String year, String note) {
}
