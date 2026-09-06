package com.bobbylon.websitehub.repository;

import com.bobbylon.websitehub.model.Achievement;
import com.bobbylon.websitehub.model.Education;
import com.bobbylon.websitehub.model.Experience;
import com.bobbylon.websitehub.model.Resume;
import com.bobbylon.websitehub.model.ResumeProject;
import com.bobbylon.websitehub.model.SkillGroup;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Hard-coded {@link ResumeRepository}: the full CV copy from the design handoff,
 * verbatim. Edit here when the resume changes; the {@code /resume} page re-renders
 * from this on its next load.
 */
@Repository
public class InMemoryResumeRepository implements ResumeRepository {

    private final Resume resume = new Resume(
            "Full-stack engineer building a global zero-trust CIAM platform (Angular + Spring Boot) "
                    + "that secures a multibillion-dollar enterprise. Depth in secure authentication, "
                    + "OAuth2/OIDC, MFA, and REST APIs. B.C.S. Software Engineering, cum laude, and "
                    + "M.S. Computer Science (Software Engineering).",
            List.of(
                    new SkillGroup("Languages & Frameworks",
                            List.of("Java", "TypeScript", "Angular", "Spring Boot")),
                    new SkillGroup("Identity & Security",
                            List.of("Spring Security", "OAuth2 / OIDC", "SAML", "MFA", "ForgeRock IDM")),
                    new SkillGroup("Data & APIs",
                            List.of("REST APIs", "MySQL")),
                    new SkillGroup("Infrastructure & DevOps",
                            List.of("Docker", "AWS", "Kubernetes", "Azure CI/CD"))
            ),
            List.of(
                    new Experience(
                            "Junior Full Stack Developer · IT Business Operations Analyst",
                            "Deloitte DTTL",
                            "Dallas, TX",
                            "2022 — Present",
                            List.of(
                                    "Engineered and maintained Angular components and Spring Boot microservices "
                                            + "powering authentication, session handling, and token processing for "
                                            + "a global CIAM platform serving millions of users.",
                                    "Partnered with developers to remediate DAST/SAST and Snyk findings ahead of "
                                            + "every production release, hardening the platform against security "
                                            + "vulnerabilities.",
                                    "Coordinated feature rollouts across ForgeRock IDM, Kubernetes/AWS "
                                            + "infrastructure, Azure CI/CD, and security teams, sustaining 100% "
                                            + "platform uptime through release cycles."
                            )
                    ),
                    new Experience(
                            "IT Business Operations Analyst, Intern",
                            "Deloitte Global",
                            "Chicago, IL",
                            "Summer 2021",
                            List.of(
                                    "Drove end-to-end testing of MuleSoft-backed APIs and validated federation "
                                            + "flows with SAML/OAuth partners.",
                                    "Verified authentication and MFA behavior across environments; documented "
                                            + "defects and acceptance criteria."
                            )
                    )
            ),
            List.of(
                    new ResumeProject(
                            "TesseraApp — Full-Stack Identity & Access Management (CIAM) Platform",
                            "Angular 21 · Spring Boot 4 · Java 21 · Spring Security · MySQL · JWT · Docker · Azure CI/CD",
                            List.of(
                                    "Architected a full-stack CIAM platform on a hybrid zero-trust model: stateless "
                                            + "HMAC-SHA512 JWTs backed by a stateful refresh-session store enabling "
                                            + "instant revocation, \"log out everywhere,\" and refresh-token rotation "
                                            + "with family-wide reuse detection.",
                                    "Built in-house RFC-6238 TOTP MFA (authenticator QR enrollment, hashed recovery "
                                            + "codes) and OAuth2/OIDC federation across Google, GitHub, and Microsoft "
                                            + "over org-scoped, permission-based RBAC; hardened with BCrypt-12, "
                                            + "brute-force lockout, enumeration-safe login, and device/IP audit "
                                            + "logging, and shipped via multi-stage Docker + Azure CI/CD."
                            ),
                            "https://tesseraapp.dev"
                    ),
                    new ResumeProject(
                            "Luv2Shop — Full-Stack E-Commerce Platform",
                            "Angular 21 · Spring Boot 4 · Java 21 · MySQL · Stripe · Okta OIDC · Docker",
                            List.of(
                                    "Built a full-stack store (Angular 21 standalone + Spring Boot 4 REST API) with "
                                            + "product catalog, keyword search, category filters, and server-side "
                                            + "pagination.",
                                    "Implemented a reactive checkout with Stripe payment intents and Okta "
                                            + "OIDC-protected order history, secured by Spring Security as an OAuth2 "
                                            + "resource server."
                            ),
                            null
                    )
            ),
            List.of(
                    new Education("M.S. Computer Science (Software Engineering)", "Lewis University", "2026",
                            "GPA 3.94"),
                    new Education("B.C.S. Software Engineering (cum laude)", "Lewis University", "2020", null)
            ),
            List.of(
                    new Achievement("Carey Gillespie Scholarship", "Lewis University", "2018–2020"),
                    new Achievement("MIVA All-Academic", "Mountain-Interscholastic Volleyball Association",
                            "2018–2020")
            ),
            "resume.pdf"
    );

    @Override
    public Resume getResume() {
        return resume;
    }
}
