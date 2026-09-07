package com.bobbylon.websitehub.service;

import com.bobbylon.websitehub.model.Project;
import com.bobbylon.websitehub.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/** Default {@link ProjectService}, delegating straight to the repository for now. */
@Service
public class ProjectServiceImpl implements ProjectService {

    /** The project catalogue ({@link com.bobbylon.websitehub.repository.InMemoryProjectRepository} today). */
    private final ProjectRepository projectRepository;

    /**
     * @param projectRepository the repository Spring injects; see
     *                          {@link ProfileServiceImpl} for why injection is by constructor
     */
    public ProjectServiceImpl(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    @Override
    /**
     * {@inheritDoc}
     *
     * <p>Order is the repository's, and it is meaningful: the frontend renders the
     * list as it arrives (Ledger numbers it 01, 02, 03…), so "display order" is a
     * property of the seed data, not something the UI re-sorts.
     */
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    @Override
    /**
     * {@inheritDoc}
     *
     * <p>Returns {@link Optional} rather than throwing, so
     * {@link com.bobbylon.websitehub.controller.ProjectController} can turn a miss into
     * a plain 404 without exception handling. Note the frontend does not call the
     * single-project endpoint at all — it filters the list it already has — so this
     * mostly serves API clients and the OpenAPI docs.
     */
    public Optional<Project> getProjectById(String id) {
        return projectRepository.findById(id);
    }
}
