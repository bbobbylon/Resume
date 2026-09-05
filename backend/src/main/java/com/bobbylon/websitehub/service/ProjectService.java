package com.bobbylon.websitehub.service;

import com.bobbylon.websitehub.model.Project;

import java.util.List;
import java.util.Optional;

/**
 * Business-logic boundary between
 * {@link com.bobbylon.websitehub.controller.ProjectController} and
 * {@link com.bobbylon.websitehub.repository.ProjectRepository}. See
 * {@link ProfileService} for why this pass-through layer exists even without any
 * real logic in it yet.
 */
public interface ProjectService {

    /** @return every project to display, in the order they should be shown. */
    List<Project> getAllProjects();

    /**
     * @param id a project's short identifier
     * @return the matching project, or empty if none matches
     */
    Optional<Project> getProjectById(String id);
}
