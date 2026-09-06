package com.bobbylon.websitehub.repository;

import com.bobbylon.websitehub.model.Profile;
import com.bobbylon.websitehub.model.SocialLink;
import com.bobbylon.websitehub.model.Stat;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Hard-coded {@link ProfileRepository} — the site owner's identity block.
 *
 * <p>The content here is the real profile copy from the design handoff
 * ({@code docs/UI-DESIGN.md}). LinkedIn is omitted until a real vanity URL is
 * available (a placeholder slug shipped briefly and was removed rather than link out
 * to a fake profile). {@code resumeUrl} points at a PDF expected at the site root
 * ({@code frontend/public/resume.pdf}).
 */
@Repository
public class InMemoryProfileRepository implements ProfileRepository {

    private final Profile profile = new Profile(
            "Robert Oliver, Jr.",
            "bobbylon",
            "Software Engineer · Identity & Access Management",
            "Deloitte Global / DTTL",
            "Builds identity that holds.",
            "Full-stack engineer building a global zero-trust CIAM platform (Angular + Spring Boot) "
                    + "that secures a multibillion-dollar enterprise. Depth in secure authentication, "
                    + "OAuth2/OIDC, MFA, and REST APIs. B.C.S. Software Engineering, cum laude, and "
                    + "M.S. Computer Science (Software Engineering).",
            "bobbylon127@gmail.com",
            "808-111-1234",
            "Kaua‘i, Hawai‘i, USA",
            "resume.pdf",
            List.of(
                    new SocialLink("GitHub", "https://github.com/bbobbylon")
            ),
            List.of(
                    new Stat("2022 —", "Deloitte DTTL, Full Stack"),
                    new Stat("100%", "Platform uptime through releases"),
                    new Stat("M.S. CS", "Lewis University · GPA 3.94")
            )
    );

    @Override
    public Profile getProfile() {
        return profile;
    }
}
