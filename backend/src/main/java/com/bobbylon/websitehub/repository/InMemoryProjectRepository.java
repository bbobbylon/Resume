package com.bobbylon.websitehub.repository;

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
                    "https://github.com/bbobbylon",
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
                    true
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
                    false
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
                    false
            ),
            // ── Placeholder entries (owner to refine) ───────────────────────────────
            // Pulled from the public GitHub profile so the layouts render with a realistic
            // number of rows/cards. Copy is a first draft; statuses are honest (nothing
            // below is deployed yet).
            new Project(
                    "fullstack-starter",
                    "Angular + Spring Boot Full Stack",
                    "Reference full-stack starter: JWT auth, roles and permissions, Spring Data JDBC.",
                    "Reference full-stack application: Angular frontend over a Spring Boot API with "
                            + "stateless JWT authentication, role/permission-based authorization and "
                            + "hand-written Spring JDBC repositories on MySQL.",
                    "A reference full-stack application used as the template for later projects. "
                            + "Angular frontend over a Spring Boot REST API with stateless JWT "
                            + "authentication, role- and permission-based authorization, custom 401/403 "
                            + "handling, and Spring JDBC (not JPA) repositories backed by an idempotent "
                            + "MySQL schema.",
                    null,
                    "https://github.com/bbobbylon/angularSpringBootFullStack",
                    ProjectStatus.WIP,
                    List.of("Angular", "Spring Boot", "Java 21", "Spring Security", "JWT", "Spring JDBC", "MySQL"),
                    List.of(),
                    List.of(
                            new Highlight("Permission-based security",
                                    "Authorities such as READ:USER and UPDATE:CUSTOMER are split off the "
                                            + "user's role and enforced per request through a stateless "
                                            + "JWT filter chain."),
                            new Highlight("Plain JDBC, deliberately",
                                    "Each aggregate is a query-constants class, a row mapper and a "
                                            + "NamedParameterJdbcTemplate repository — no ORM magic, no "
                                            + "migrations framework."),
                            new Highlight("Template for the rest",
                                    "The package layout and security shape here are reused by TesseraApp "
                                            + "and Luv2Shop.")
                    ),
                    null,
                    "Maven · Docker",
                    false
            ),
            new Project(
                    "dev-hub",
                    "Dev Hub",
                    "Static learn-to-code site: HTML, CSS and JavaScript lessons.",
                    "A static learn-to-code site with HTML, CSS and JavaScript lessons — a good "
                            + "first candidate for GitHub Pages.",
                    "A static learn-to-code site with HTML, CSS and JavaScript lessons. No backend, "
                            + "so it can be published straight to GitHub Pages for free and linked here "
                            + "as a live site.",
                    null,
                    "https://github.com/bbobbylon/dev-hub",
                    ProjectStatus.WIP,
                    List.of("HTML", "CSS", "JavaScript"),
                    List.of(),
                    List.of(
                            new Highlight("Zero-infrastructure hosting",
                                    "Pure static assets, so GitHub Pages (or Cloudflare Pages) serves it "
                                            + "for free with a custom subdomain."),
                            new Highlight("Lesson pages",
                                    "Self-contained HTML lessons that run without a build step."),
                            new Highlight("Next step",
                                    "Enable Pages on the repo and set this entry's url to go Live.")
                    ),
                    null,
                    "GitHub Pages",
                    false
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
                    false
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
                    false
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
