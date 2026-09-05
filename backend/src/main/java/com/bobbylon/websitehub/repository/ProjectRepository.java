package com.bobbylon.websitehub.repository;

import com.bobbylon.websitehub.model.Project;

import java.util.List;
import java.util.Optional;

/**
 * Data-access boundary for the list of project cards the hub displays.
 *
 * <p>Kept as an interface for the same reason as {@link ProfileRepository}: it lets
 * {@link InMemoryProjectRepository} be swapped for a real database-backed
 * implementation later without touching
 * {@link com.bobbylon.websitehub.service.ProjectService} or
 * {@link com.bobbylon.websitehub.controller.ProjectController}.
 */
public interface ProjectRepository {

    /** @return every project to show, in display order. */
    List<Project> findAll();

    /**
     * @param id the project's {@link Project#id()}
     * @return the matching project, or {@link Optional#empty()} if no project has that id
     */
    Optional<Project> findById(String id);
}
