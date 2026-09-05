package com.bobbylon.websitehub.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.filter.ShallowEtagHeaderFilter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.mvc.WebContentInterceptor;

import java.time.Duration;
import java.util.Arrays;

/**
 * Configures CORS so the frontend — deployed as its own static site on its own
 * domain — is allowed to call this API's {@code /api/**} routes from the browser.
 * Without this, the browser's same-origin policy would silently block every request
 * the Angular app makes.
 *
 * <p>The allowed origins are read from the {@code ALLOWED_ORIGIN} environment variable
 * rather than hard-coded, because the frontend's real URL isn't known until it has
 * been deployed — see {@code docs/DEPLOYMENT.md}. The value may be a single origin or
 * a comma-separated list (e.g. the host's default {@code *.pages.dev} / {@code *.onrender.com}
 * URL <em>and</em> the custom domain), so both keep working during a domain cut-over.
 * Locally it defaults to the Angular dev server's URL so {@code ng serve} works
 * against this API with zero configuration.
 *
 * <p>Only {@code GET} (plus the {@code OPTIONS} preflight) is allowed: this API is
 * read-only, so there is no reason to advertise mutating methods to browsers.
 *
 * <p>The same class owns the HTTP caching policy for {@code /api/**}: every response
 * carries a weak {@code ETag} and {@code Cache-Control: public, max-age=300}. The
 * data only changes on deploy, so repeat visitors within five minutes reuse their
 * cached copy outright, and after that a matching {@code If-None-Match} costs a 304
 * with no body instead of the JSON again — bandwidth that matters on a metered free
 * host and on phones. (Gzip is separate: {@code server.compression} in application.yml.)
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final String[] allowedOrigins;

    public WebConfig(@Value("${app.allowed-origin:http://localhost:4222}") String allowedOrigins) {
        this.allowedOrigins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toArray(String[]::new);
    }

    /**
     * Adds the {@code ETag} (an MD5 of the body) and answers a matching
     * {@code If-None-Match} with 304. The tag is <em>weak</em> ({@code W/"…"}) on
     * purpose: Tomcat refuses to gzip a response that carries a strong ETag (the
     * compressed bytes would be a different representation), so a strong tag here
     * would silently switch compression off for every API response.
     */
    @Bean
    public ShallowEtagHeaderFilter etagFilter() {
        var filter = new ShallowEtagHeaderFilter();
        filter.setWriteWeakETag(true);
        return filter;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        var cache = new WebContentInterceptor();
        cache.addCacheMapping(CacheControl.maxAge(Duration.ofMinutes(5)).cachePublic(), "/api/**");
        registry.addInterceptor(cache).addPathPatterns("/api/**");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "OPTIONS");
    }
}
