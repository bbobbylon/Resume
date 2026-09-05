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

    public static void main(String[] args) {
        SpringApplication.run(WebsitehubApplication.class, args);
    }
}
