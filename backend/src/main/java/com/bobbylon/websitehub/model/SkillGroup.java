package com.bobbylon.websitehub.model;

import java.util.List;

/**
 * One labeled cluster of related technical skills on the resume page's sidebar
 * (e.g. "Identity &amp; Security"). Grouping the flat skill list by theme makes the
 * sidebar scannable instead of one long run of tags — see {@link Resume#skills()}.
 *
 * @param category short group heading, e.g. {@code "Languages & Frameworks"}
 * @param skills   the skills in this group, rendered as tags in category order
 */
public record SkillGroup(String category, List<String> skills) {
}
