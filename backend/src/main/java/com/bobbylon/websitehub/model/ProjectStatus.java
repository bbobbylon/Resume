package com.bobbylon.websitehub.model;

/**
 * Lifecycle state of a {@link Project}, rendered on every project card/row/table as
 * a status tag (see the frontend's {@code StatusTag} component).
 *
 * <ul>
 *   <li>{@link #LIVE} — deployed and reachable at {@link Project#url()}.</li>
 *   <li>{@link #WIP} — being built; {@link Project#url()} is usually {@code null}
 *       and only {@link Project#repoUrl()} is shown.</li>
 *   <li>{@link #ARCHIVED} — kept for the record but no longer maintained.</li>
 * </ul>
 */
public enum ProjectStatus {
    LIVE,
    WIP,
    ARCHIVED
}
