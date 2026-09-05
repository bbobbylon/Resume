package com.bobbylon.websitehub.controller;

import com.bobbylon.websitehub.model.Profile;
import com.bobbylon.websitehub.model.SocialLink;
import com.bobbylon.websitehub.model.Stat;
import com.bobbylon.websitehub.service.ProfileService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Slice test for {@link ProfileController}: boots only the web layer (no real
 * repository) and stubs out {@link ProfileService}.
 *
 * <p>Two Spring Boot 4 specifics: {@code @WebMvcTest} now lives in
 * {@code org.springframework.boot.webmvc.test.autoconfigure} (provided by the
 * {@code spring-boot-starter-webmvc-test} dependency), and {@code @MockitoBean}
 * replaces the retired {@code @MockBean}.
 */
@WebMvcTest(ProfileController.class)
class ProfileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProfileService profileService;

    @Test
    void getProfile_returnsProfileFromService() throws Exception {
        Profile profile = new Profile(
                "Ada Lovelace", "ada", "Test Engineer", "Analytical Engines Ltd", "Computes.",
                "Bio.", "ada@example.com", "555-0100", "London", "resume.pdf",
                List.of(new SocialLink("GitHub", "https://github.com/ada")),
                List.of(new Stat("1843", "First program"))
        );
        given(profileService.getProfile()).willReturn(profile);

        mockMvc.perform(get("/api/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Ada Lovelace"))
                .andExpect(jsonPath("$.brand").value("ada"))
                .andExpect(jsonPath("$.socialLinks[0].platform").value("GitHub"))
                .andExpect(jsonPath("$.stats[0].value").value("1843"));
    }
}
