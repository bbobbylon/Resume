package com.bobbylon.websitehub.controller;

import com.bobbylon.websitehub.model.Profile;
import com.bobbylon.websitehub.service.ProfileService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Verifies the HTTP caching policy that {@code WebConfig} applies to {@code /api/**}:
 * a weak {@code ETag} (weak so Tomcat still gzips), {@code Cache-Control: max-age=300,
 * public}, and a 304 for a
 * matching {@code If-None-Match}. Uses the profile endpoint as the representative
 * route; the policy is path-based, so every {@code /api} route behaves the same.
 */
@WebMvcTest(ProfileController.class)
class ApiCachingTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProfileService profileService;

    @Test
    void apiResponses_carryEtagAndCacheControl_andRevalidateWith304() throws Exception {
        given(profileService.getProfile()).willReturn(new Profile(
                "Ada Lovelace", "ada", "Test Engineer", "Analytical Engines Ltd", "Computes.",
                "Bio.", "ada@example.com", "555-0100", "London", "resume.pdf", List.of(), List.of()));

        String etag = mockMvc.perform(get("/api/profile"))
                .andExpect(status().isOk())
                .andExpect(header().string("Cache-Control", "max-age=300, public"))
                .andExpect(header().string("ETag", org.hamcrest.Matchers.startsWith("W/\"")))
                .andReturn().getResponse().getHeader("ETag");

        mockMvc.perform(get("/api/profile").header("If-None-Match", etag))
                .andExpect(status().isNotModified());
    }
}
