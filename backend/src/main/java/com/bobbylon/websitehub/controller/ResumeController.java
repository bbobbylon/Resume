package com.bobbylon.websitehub.controller;

import com.bobbylon.websitehub.model.Resume;
import com.bobbylon.websitehub.service.ResumeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Exposes the full CV at {@code GET /api/resume}, consumed by the frontend's
 * {@code /resume} page (and, in condensed form, by the Dossier landing layout's
 * "Experience" section).
 */
@RestController
@Tag(name = "Resume", description = "The in-app resume, section by section")
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    /** @return the resume: summary, skills, experience, projects, education, achievements. */
    @Operation(summary = "Summary, skills, experience, projects, education, achievements and the PDF link")
    @GetMapping("/api/resume")
    public Resume getResume() {
        return resumeService.getResume();
    }
}
