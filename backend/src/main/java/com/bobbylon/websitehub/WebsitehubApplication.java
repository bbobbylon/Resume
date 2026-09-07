package com.bobbylon.websitehub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the WebsiteHub REST API.
 *
 * <p>This is the backend half of the hub described in the project's architecture
 * doc: it serves {@code /api/profile} and {@code /api/projects} to a separately
 * deployed Angular frontend. It does not serve any HTML itself — Render hosts the
 * built Angular app as its own independent static site, and the two talk to each
 * other over HTTP using the CORS rules in {@link com.bobbylon.websitehub.config.WebConfig}.
 */
@SpringBootApplication
public class WebsitehubApplication {

    /**
     * Boots the Spring context and starts the embedded server.
     *
     * <p>There is deliberately no custom startup code here: everything this app
     * needs is either auto-configured or declared in {@code application.yml} and the
     * {@code config/} package. Deployment differences (the listen port on Render, the
     * allowed CORS origin) arrive as environment variables, not as arguments.
     *
     * @param args command-line arguments, merged into Spring's {@code Environment};
     *             the Docker image passes none
     */
    public static void main(String[] args) {
        SpringApplication.run(WebsitehubApplication.class, args);
    }
}
