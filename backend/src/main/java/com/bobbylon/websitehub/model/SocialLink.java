package com.bobbylon.websitehub.model;

/**
 * A single outbound link to a social or professional profile (e.g. GitHub, LinkedIn).
 *
 * <p>This is a Java {@code record} rather than an ordinary class with getters and
 * setters because it's pure, immutable data with no behavior attached to it — records
 * generate the constructor, accessors, {@code equals}/{@code hashCode}, and
 * {@code toString} for us automatically. That keeps this file to two lines and makes
 * accidental mutation impossible, which lines up with the "immutability" convention
 * from Bobby's team standards for Java code.
 *
 * @param platform display name of the platform, e.g. {@code "GitHub"}
 * @param url      fully-qualified URL to the profile
 */
public record SocialLink(String platform, String url) {
}
