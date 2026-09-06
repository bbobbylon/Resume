package com.bobbylon.websitehub.repository;

import com.bobbylon.websitehub.model.CaseStudy;
import com.bobbylon.websitehub.model.Highlight;
import com.bobbylon.websitehub.model.Project;
import com.bobbylon.websitehub.model.ProjectStatus;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Hard-coded {@link ProjectRepository} used until a real database is introduced.
 *
 * <p>Display order is the list order below; the frontend shows featured projects
 * first within that. To add a project, add one {@link Project} here — the landing
 * layouts and the {@code /projects/:id} page pick it up with no other change.
 *
 * <p>{@code imageUrls} point at screenshots in {@code frontend/public/shots/} as
 * {@code "shots/<id>-<n>.webp"} — relative to the site root, no leading slash, so they
 * resolve under a {@code <base href>} sub-path too. {@code frontend/scripts/screenshots.mjs}
 * ({@code npm run shots}) captures them from each project's live URL; the first is the
 * hero (16:10, cropped to 21:9 on the detail page), the next two are the extra shots.
 * An empty list renders a placeholder box with the project's initial.
 */
@Repository
public class InMemoryProjectRepository implements ProjectRepository {

    private final List<Project> projects = List.of(
            new Project(
                    "tesseraapp",
                    "TesseraApp",
                    "Zero-trust CIAM: revocable JWT sessions, TOTP MFA, OAuth2/OIDC federation.",
                    "Zero-trust CIAM platform: revocable JWT sessions, in-house TOTP MFA, OAuth2/OIDC "
                            + "federation with Google, GitHub and Microsoft, org-scoped RBAC.",
                    "Full-stack CIAM platform on a hybrid zero-trust model: stateless HMAC-SHA512 JWTs "
                            + "backed by a revocable refresh-session store, in-house RFC-6238 TOTP MFA, and "
                            + "OAuth2/OIDC federation across Google, GitHub and Microsoft over org-scoped RBAC.",
                    "https://tesseraapp.dev",
                    "https://github.com/bbobbylon/angularSpringBootFullStack",
                    ProjectStatus.LIVE,
                    List.of("Angular 21", "Spring Boot 4", "Java 21", "Spring Security", "MySQL", "JWT",
                            "Docker", "Azure CI/CD"),
                    List.of("shots/tesseraapp-1.webp", "shots/tesseraapp-2.webp", "shots/tesseraapp-3.webp"),
                    List.of(
                            new Highlight("Hybrid zero-trust sessions",
                                    "Stateless HMAC-SHA512 JWTs backed by a stateful refresh-session store, "
                                            + "enabling instant revocation, \"log out everywhere,\" and "
                                            + "refresh-token rotation with family-wide reuse detection."),
                            new Highlight("In-house MFA and federation",
                                    "RFC-6238 TOTP with authenticator QR enrollment and hashed recovery codes; "
                                            + "OAuth2/OIDC federation across Google, GitHub and Microsoft over "
                                            + "org-scoped, permission-based RBAC."),
                            new Highlight("Hardened by default",
                                    "BCrypt-12 hashing, brute-force lockout, enumeration-safe login and "
                                            + "device/IP audit logging, shipped through multi-stage Docker and "
                                            + "Azure CI/CD.")
                    ),
                    "AWS ECS Fargate · CloudFront · Aiven MySQL",
                    "Multi-stage Docker · Azure CI/CD",
                    true,
                    new CaseStudy(
                            "TesseraApp needed sessions that were both fast to verify and instantly "
                                    + "revocable, MFA that didn't depend on a third party, and federated login "
                                    + "that stayed safe under org-scoped access control.",
                            "Stateless HMAC-SHA512 JWTs are backed by a stateful refresh-session store for "
                                    + "instant revocation and family-wide reuse detection; in-house RFC-6238 "
                                    + "TOTP MFA and OAuth2/OIDC federation across Google, GitHub and Microsoft "
                                    + "sit behind permission-based RBAC, hardened with BCrypt-12 hashing, "
                                    + "brute-force lockout and enumeration-safe login.",
                            "Live in production, shipped through multi-stage Docker and Azure CI/CD with "
                                    + "device/IP audit logging across every session."
                    )
            ),
            new Project(
                    "luv2shop",
                    "Luv2Shop",
                    "E-commerce store with Stripe checkout and Okta OIDC order history.",
                    "E-commerce store with Stripe checkout and Okta OIDC-protected order history.",
                    "Full-stack e-commerce store: product catalog, keyword search, category filters and "
                            + "server-side pagination, with a reactive Stripe checkout and Okta OIDC-protected "
                            + "order history behind a Spring Security resource server.",
                    null,
                    "https://github.com/bbobbylon/AngularECommerceAppv2",
                    ProjectStatus.WIP,
                    List.of("Angular 21", "Spring Boot 4", "Java 21", "MySQL", "Stripe", "Okta OIDC", "Docker"),
                    List.of(),
                    List.of(
                            new Highlight("Catalog, search and pagination",
                                    "Product catalog with keyword search, category filters and server-side "
                                            + "pagination, served by a Spring Boot 4 REST API over MySQL."),
                            new Highlight("Reactive Stripe checkout",
                                    "A reactive checkout form that creates Stripe payment intents and "
                                            + "persists the resulting order."),
                            new Highlight("Okta OIDC order history",
                                    "Order history protected by Okta OIDC, with Spring Security acting as "
                                            + "an OAuth2 resource server.")
                    ),
                    null,
                    "Docker",
                    false,
                    new CaseStudy(
                            "Luv2Shop needed a catalog that stayed fast to search and page through at "
                                    + "scale, a checkout that handled real payments safely, and an order "
                                    + "history only its owner could see.",
                            "A Spring Boot 4 REST API serves keyword search, category filters and "
                                    + "server-side pagination over MySQL; a reactive checkout form creates "
                                    + "Stripe payment intents and persists the resulting order; order history "
                                    + "sits behind Okta OIDC with Spring Security acting as an OAuth2 resource "
                                    + "server.",
                            "Packaged for Docker; still in progress toward its first live deploy."
                    )
            ),
            new Project(
                    "websitehub",
                    "WebsiteHub",
                    "This site: Angular 21 over a Spring Boot 4.1 REST API.",
                    "This site: Angular 21 over a Spring Boot 4.1 API, deployed as a static site plus a "
                            + "Docker web service.",
                    "This site. Angular 21 frontend over a Spring Boot 4.1 REST API, deployed as a static "
                            + "site plus a Docker web service. Each card links out to its project's own "
                            + "deployment.",
                    null,
                    "https://github.com/bbobbylon/Resume",
                    ProjectStatus.WIP,
                    List.of("Angular 21", "Spring Boot 4.1", "Java 21", "Docker", "GitHub Actions"),
                    List.of("shots/websitehub-1.webp", "shots/websitehub-2.webp", "shots/websitehub-3.webp"),
                    List.of(
                            new Highlight("Links out, never embeds",
                                    "The hub only knows a project's name, description and URLs; every "
                                            + "project stays independently built and deployed."),
                            new Highlight("Controller → Service → Repository",
                                    "In-memory repositories behind interfaces, so a real database is a "
                                            + "one-class swap with no change to the layers above."),
                            new Highlight("Three landing layouts, one dataset",
                                    "Ledger, Gallery and Dossier render the same /api data; switch between "
                                            + "them with ?layout=ledger|gallery|dossier.")
                    ),
                    null,
                    "GitHub Actions CI",
                    false,
                    new CaseStudy(
                            "A portfolio hub needed to showcase several independently-hosted projects "
                                    + "without becoming a monolith that embeds their code, while staying easy "
                                    + "to extend as a real database replaces the in-memory data.",
                            "Angular 21 renders three interchangeable landing layouts (Ledger, Gallery, "
                                    + "Dossier) off one dataset from a Spring Boot 4.1 REST API, structured as "
                                    + "Controller → Service → Repository with in-memory repositories behind "
                                    + "interfaces, so a real database is a one-class swap with no change to "
                                    + "the layers above.",
                            "Deployed as a static site plus a Docker web service; each project card links "
                                    + "out to that project's own deployment rather than embedding it."
                    )
            ),
            new Project(
                    "dev-hub",
                    "Dev Hub",
                    "24 interactive learning pages with real, persisted progress.",
                    "A learn-to-code app of 24 interactive page archetypes — lessons, quizzes, "
                            + "flashcards, visualizers and labs — with progress and spaced repetition "
                            + "that persist between visits.",
                    "A learn-to-code app built from a Claude Design handoff: 24 interactive page "
                            + "archetypes across Learn, Practice, Reference and Meta — a CLI lesson, "
                            + "Git branching and rebase visualizers, Big-O charts, an algorithm "
                            + "visualizer, quiz mode, flashcards, a terminal-simulator mission, a regex "
                            + "lab and more. Every progress figure the designs faked is now real: quiz "
                            + "scores, SM-2 flashcard scheduling, milestones, streaks and time-on-page "
                            + "live in a dependency-free localStorage store. Ported to React 19 and "
                            + "TypeScript on Vite, routes split into lazy chunks, and checked by "
                            + "Playwright-driven route, responsive, interaction and accessibility audits.",
                    "https://bbobbylon.github.io/dev-hub/",
                    "https://github.com/bbobbylon/dev-hub",
                    ProjectStatus.LIVE,
                    List.of("React 19", "TypeScript", "Vite", "React Router", "Playwright"),
                    List.of("shots/dev-hub-1.webp", "shots/dev-hub-2.webp", "shots/dev-hub-3.webp"),
                    List.of(
                            new Highlight("24 page archetypes",
                                    "Lessons, deep-dives, storyboards, quizzes, flashcards, visualizers, "
                                            + "labs and a progress dashboard, all on one design system and "
                                            + "filterable from a single gallery."),
                            new Highlight("Progress that is actually real",
                                    "Quiz scores, SM-2 spaced-repetition scheduling, milestones, streaks "
                                            + "and per-day activity persist in a small localStorage store — "
                                            + "no server, no account."),
                            new Highlight("Audited, not just built",
                                    "Playwright scripts drive every route to verify interactions, "
                                            + "responsive layouts and WCAG contrast, names and keyboard "
                                            + "focus; routes load as lazy chunks behind an error boundary.")
                    ),
                    "GitHub Pages",
                    null,
                    false,
                    new CaseStudy(
                            "A set of HTML/CSS design prototypes for a learning app had to become a "
                                    + "real, shippable product — with progress, streaks and review "
                                    + "schedules that were hardcoded in the mockups made true.",
                            "Recreated the 24 prototype pages in React 19 and TypeScript on Vite, "
                                    + "backed them with a dependency-free localStorage progress store "
                                    + "(quiz history, SM-2 flashcard scheduling, milestones, time-on-page "
                                    + "streaks), split each page into a lazy route chunk behind an error "
                                    + "boundary, and wrote Playwright audits for routes, responsiveness, "
                                    + "interactions and accessibility.",
                            "Live on GitHub Pages as a client-rendered app with no backend to run "
                                    + "or pay for."
                    )
            ),
            new Project(
                    "angular-concepts",
                    "Angular Concepts",
                    "Angular curriculum, zero to expert",
                    "A hands-on Angular 21 curriculum — 100 concepts, 200+ exercises and interview prep "
                            + "from zero to expert.",
                    "A complete, hands-on Angular 21 curriculum built with standalone components and "
                            + "signals: 100 concepts and 100 live lessons across five difficulty tracks, "
                            + "200+ practice exercises, 253 interview questions and project walkthroughs — "
                            + "built while learning the framework and still live as a static site.",
                    "https://bbobbylon.github.io/AngularDevelopment/",
                    "https://github.com/bbobbylon/AngularDevelopment",
                    ProjectStatus.LIVE,
                    List.of("Angular 21", "TypeScript"),
                    List.of("shots/angular-concepts-1.webp"),
                    List.of(
                            new Highlight("Zero to expert",
                                    "100 concepts and 100 live lessons across five difficulty tracks, from "
                                            + "Foundations and TypeScript through Expert Angular."),
                            new Highlight("Practice, not just reading",
                                    "200+ practice exercises, 253 interview questions with flashcard mode, "
                                            + "and timeboxed coding-task simulations."),
                            new Highlight("Angular 21, standalone, signals",
                                    "Built with the current Angular standalone-component and signals APIs, "
                                            + "shipped as a static site on GitHub Pages.")
                    ),
                    "GitHub Pages",
                    null,
                    false,
                    new CaseStudy(
                            "Learning a framework thoroughly needed more than reading docs — a path from "
                                    + "zero through advanced patterns, plus enough practice and interview "
                                    + "prep to make the concepts stick.",
                            "100 concepts and 100 live lessons span five difficulty tracks from "
                                    + "Foundations and TypeScript through Expert Angular, backed by 200+ "
                                    + "practice exercises, 253 interview questions with flashcard mode, and "
                                    + "timeboxed coding-task simulations — all built with Angular 21's "
                                    + "current standalone-component and signals APIs.",
                            "Live as a static site on GitHub Pages, built while learning the framework "
                                    + "itself."
                    )
            ),
            new Project(
                    "dev-learning-hub",
                    "Dev Learning Hub",
                    "515 visualizers, 34 learning tracks",
                    "Interactive visualizers for Java, Spring Boot, Angular, TypeScript, Python and more, "
                            + "with per-account progress tracking and streaks.",
                    "An interactive learning hub of 515 visualizers across 34 tracks — Java and OOP, "
                            + "Spring Boot, Angular, TypeScript, Python, data structures and algorithms and "
                            + "more — organized by difficulty from beginner to expert. Progress, streaks "
                            + "and completion save per account or anonymously, with an admin dashboard for "
                            + "usage stats.",
                    "https://bbobbylon.github.io/OOPFundamentals/app.html",
                    "https://github.com/bbobbylon/OOPFundamentals",
                    ProjectStatus.LIVE,
                    List.of("Java", "Spring Boot", "Angular", "TypeScript", "Python"),
                    List.of("shots/dev-learning-hub-1.webp"),
                    List.of(
                            new Highlight("515 visualizers, 34 tracks",
                                    "Java and OOP, Spring Boot, Angular, TypeScript, Python, data "
                                            + "structures and algorithms and more, each broken into "
                                            + "beginner-to-expert topics."),
                            new Highlight("Accounts optional",
                                    "Sign in to sync progress across devices, or browse and learn "
                                            + "anonymously with local-only saving."),
                            new Highlight("An admin view",
                                    "A stats dashboard reports total users and completion across the "
                                            + "whole learning hub.")
                    ),
                    "GitHub Pages",
                    null,
                    false,
                    new CaseStudy(
                            "A broad set of computer-science and full-stack topics needed one place to "
                                    + "learn them interactively, organized by difficulty, without forcing an "
                                    + "account just to start.",
                            "515 interactive visualizers span 34 tracks — Java and OOP, Spring Boot, "
                                    + "Angular, TypeScript, Python, data structures and algorithms and more — "
                                    + "from beginner to expert; progress, streaks and completion save per "
                                    + "account or anonymously with local-only saving.",
                            "Live on GitHub Pages, with an admin dashboard reporting total users and "
                                    + "completion across the whole hub."
                    )
            )
    );

    @Override
    public List<Project> findAll() {
        return projects;
    }

    @Override
    public Optional<Project> findById(String id) {
        return projects.stream()
                .filter(project -> project.id().equals(id))
                .findFirst();
    }
}
