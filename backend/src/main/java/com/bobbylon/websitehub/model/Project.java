package com.bobbylon.websitehub.model;

import java.util.List;

/**
 * One project shown on the hub: a card/row on the landing page and a full page at
 * {@code /projects/:id}.
 *
 * <p>Per the hub's "links out" architecture (see {@code docs/ARCHITECTURE.md}), a
 * {@code Project} never contains the other project's actual code or UI — just enough
 * metadata to render it and links to where that project actually lives (its own
 * separately-hosted app and its GitHub repo).
 *
 * <p>Three lengths of copy exist because the three landing layouts and the detail
 * page each have a different amount of room: {@code tagline} fits a table cell,
 * {@code description} fits a card, {@code longDescription} is a full paragraph.
 *
 * @param id              short URL-safe identifier, e.g. {@code "tesseraapp"}; used in the
 *                        {@code /projects/:id} route
 * @param name            display name of the project
 * @param tagline         one line, for the Dossier layout's table (about 34 characters wide)
 * @param description     one or two sentences, for the Gallery layout's cards
 * @param longDescription a full paragraph, for the Ledger layout's rows and the detail page's lede
 * @param url             where the live project runs; {@code null} when it isn't deployed yet
 * @param repoUrl         the project's GitHub repository
 * @param status          lifecycle state, rendered as a status tag
 * @param techStack       notable technologies, shown as tags
 * @param imageUrls       screenshots — the first is the hero, up to two more follow it; empty
 *                        means the UI renders a placeholder box with the project's initial
 * @param highlights      the three numbered "What it does" entries on the detail page
 * @param hosting         where it runs, e.g. {@code "AWS ECS Fargate · CloudFront"}; {@code null} if not deployed
 * @param delivery        how it ships, e.g. {@code "Multi-stage Docker · GitHub Actions"}; {@code null} if unknown
 * @param featured        whether this project is highlighted (shown first, with a "Featured" tag)
 * @param caseStudy       the problem/approach/outcome narrative on the detail page
 */
public record Project(
        String id,
        String name,
        String tagline,
        String description,
        String longDescription,
        String url,
        String repoUrl,
        ProjectStatus status,
        List<String> techStack,
        List<String> imageUrls,
        List<Highlight> highlights,
        String hosting,
        String delivery,
        boolean featured,
        CaseStudy caseStudy
) {
}
