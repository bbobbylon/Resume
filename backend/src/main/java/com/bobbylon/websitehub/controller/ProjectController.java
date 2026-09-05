package com.bobbylon.websitehub.controller;

import com.bobbylon.websitehub.model.Project;
import com.bobbylon.websitehub.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Exposes the project-card data behind {@code /api/projects}.
 *
 * <p>The frontend reads {@link #getAllProjects} once and looks individual projects
 * up in that list (one request, one snapshot fallback — see the frontend's
 * {@code Api} service). {@link #getProjectById} stays for direct API consumers and
 * as the canonical per-project resource; it is essentially free to keep.
 */
@RestController
@Tag(name = "Projects", description = "The project catalogue shown on the landing page")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    /** @return every project card, in display order. */
    @Operation(summary = "All projects, in display order")
    @GetMapping("/api/projects")
    public List<Project> getAllProjects() {
        return projectService.getAllProjects();
    }

    /**
     * @param id a project's short identifier (see {@link Project#id()})
     * @return 200 with the project if found, otherwise 404
     */
    @Operation(summary = "One project by its slug id")
    @ApiResponse(responseCode = "200", description = "The project")
    @ApiResponse(responseCode = "404", description = "No project with that id", content = @io.swagger.v3.oas.annotations.media.Content)
    @GetMapping("/api/projects/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable String id) {
        return projectService.getProjectById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
