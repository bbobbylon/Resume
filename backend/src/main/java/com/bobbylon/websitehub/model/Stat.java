package com.bobbylon.websitehub.model;

/**
 * One cell of the Gallery layout's full-bleed "resume band": a large value over a
 * small uppercase label, e.g. {@code "M.S. CS"} / {@code "Lewis University · GPA 3.94"}.
 * See {@link Profile#stats()}.
 *
 * @param value the large figure or phrase
 * @param label the caption under it
 */
public record Stat(String value, String label) {
}
