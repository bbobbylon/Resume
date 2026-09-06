package com.bobbylon.websitehub.controller;

import com.bobbylon.websitehub.model.CaseStudy;
import com.bobbylon.websitehub.model.Highlight;
import com.bobbylon.websitehub.model.Project;
import com.bobbylon.websitehub.model.ProjectStatus;
import com.bobbylon.websitehub.service.ProjectService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Slice test for {@link ProjectController}. See {@link ProfileControllerTest} for the
 * Spring Boot 4 test-annotation notes.
 */
@WebMvcTest(ProjectController.class)
class ProjectControllerTest {

    private static final Project DEMO = new Project(
            "demo", "Demo Project", "Tagline.", "A test project.", "A longer description.",
            "https://example.com", "https://github.com/example/demo", ProjectStatus.LIVE,
            List.of("Java"), List.of(), List.of(new Highlight("Does a thing", "Really well.")),
            "Somewhere", "Somehow", true,
            new CaseStudy("A problem.", "An approach.", "An outcome.")
    );

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProjectService projectService;

    @Test
    void getAllProjects_returnsProjectsFromService() throws Exception {
        given(projectService.getAllProjects()).willReturn(List.of(DEMO));

        mockMvc.perform(get("/api/projects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("demo"))
                .andExpect(jsonPath("$[0].name").value("Demo Project"))
                .andExpect(jsonPath("$[0].status").value("LIVE"))
                .andExpect(jsonPath("$[0].repoUrl").value("https://github.com/example/demo"));
    }

    @Test
    void getProjectById_returnsProjectWhenFound() throws Exception {
        given(projectService.getProjectById("demo")).willReturn(Optional.of(DEMO));

        mockMvc.perform(get("/api/projects/demo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("demo"))
                .andExpect(jsonPath("$.highlights[0].title").value("Does a thing"))
                .andExpect(jsonPath("$.hosting").value("Somewhere"))
                .andExpect(jsonPath("$.caseStudy.problem").value("A problem."));
    }

    @Test
    void getProjectById_returns404WhenMissing() throws Exception {
        given(projectService.getProjectById("missing")).willReturn(Optional.empty());

        mockMvc.perform(get("/api/projects/missing"))
                .andExpect(status().isNotFound());
    }
}
