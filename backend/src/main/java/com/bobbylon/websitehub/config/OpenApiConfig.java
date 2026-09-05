package com.bobbylon.websitehub.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * The top-level metadata of the generated OpenAPI description. springdoc derives
 * the paths, parameters and schemas from the controllers and records; this bean
 * only supplies what cannot be inferred — title, blurb, version, where to find the
 * author. The description is served at {@code /v3/api-docs} and browsable at
 * {@code /docs} (see {@code springdoc.*} in application.yml).
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI websiteHubOpenApi() {
        return new OpenAPI().info(new Info()
                .title("WebsiteHub API")
                .version("0.1.0")
                .description("Read-only API behind Robert Oliver, Jr.'s portfolio hub: profile, "
                        + "project catalogue and resume. Responses are cacheable (ETag, "
                        + "Cache-Control) and CORS-restricted to the hub's own origin.")
                .contact(new Contact().name("Robert Oliver, Jr.").url("https://github.com/bbobbylon"))
                .license(new License().name("Source on GitHub").url("https://github.com/bbobbylon/Resume")));
    }
}
