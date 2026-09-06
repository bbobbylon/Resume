package com.bobbylon.websitehub.controller;

import com.bobbylon.websitehub.model.Achievement;
import com.bobbylon.websitehub.model.Education;
import com.bobbylon.websitehub.model.Experience;
import com.bobbylon.websitehub.model.Resume;
import com.bobbylon.websitehub.model.ResumeProject;
import com.bobbylon.websitehub.model.SkillGroup;
import com.bobbylon.websitehub.service.ResumeService;
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

/** Slice test for {@link ResumeController}. */
@WebMvcTest(ResumeController.class)
class ResumeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ResumeService resumeService;

    @Test
    void getResume_returnsResumeFromService() throws Exception {
        Resume resume = new Resume(
                "Summary.",
                List.of(new SkillGroup("Languages & Frameworks", List.of("Java"))),
                List.of(new Experience("Engineer", "Acme", "Springfield", "2020 — Present", List.of("Built things."))),
                List.of(new ResumeProject("Widget", "Java · Spring", List.of("Made widgets."), null)),
                List.of(new Education("B.S.", "State U", "2019", null)),
                List.of(new Achievement("Dean's List", "State U", "2018")),
                "resume.pdf"
        );
        given(resumeService.getResume()).willReturn(resume);

        mockMvc.perform(get("/api/resume"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.summary").value("Summary."))
                .andExpect(jsonPath("$.skills[0].category").value("Languages & Frameworks"))
                .andExpect(jsonPath("$.skills[0].skills[0]").value("Java"))
                .andExpect(jsonPath("$.experience[0].role").value("Engineer"))
                .andExpect(jsonPath("$.experience[0].bullets[0]").value("Built things."))
                .andExpect(jsonPath("$.education[0].school").value("State U"))
                .andExpect(jsonPath("$.pdfUrl").value("resume.pdf"));
    }
}
