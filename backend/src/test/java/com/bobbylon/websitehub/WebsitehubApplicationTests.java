package com.bobbylon.websitehub;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Smoke tests over the full Spring application context: every bean constructs and
 * every {@code @Value} placeholder resolves (most real-world configuration mistakes
 * make {@link #contextLoads} fail), and the generated OpenAPI description covers the
 * API routes — which exercises springdoc's scan of the controllers and records.
 */
@SpringBootTest
@AutoConfigureMockMvc
class WebsitehubApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void contextLoads() {
    }

    @Test
    void openApiDescription_listsTheApiRoutes() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.info.title").value("WebsiteHub API"))
                .andExpect(jsonPath("$.paths['/api/projects'].get").exists())
                .andExpect(jsonPath("$.paths['/api/projects/{id}'].get.responses['404']").exists())
                .andExpect(jsonPath("$.paths['/api/profile'].get").exists())
                .andExpect(jsonPath("$.paths['/api/resume'].get").exists())
                .andExpect(jsonPath("$.paths['/actuator/health']").doesNotExist());
    }
}
