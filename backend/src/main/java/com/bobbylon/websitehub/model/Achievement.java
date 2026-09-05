package com.bobbylon.websitehub.model;

/**
 * One award/honor on the resume.
 *
 * @param name   what was awarded
 * @param org    who awarded it
 * @param period when, as text, e.g. {@code "2018–2020"}
 */
public record Achievement(String name, String org, String period) {
}
