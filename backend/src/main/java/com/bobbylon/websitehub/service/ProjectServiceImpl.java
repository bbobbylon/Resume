package com.bobbylon.websitehub.service;

import com.bobbylon.websitehub.model.Project;
import com.bobbylon.websitehub.repository.ProjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/** Default {@link ProjectService}, delegating straight to the repository for now. */
@Service
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectServiceImpl(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    @Override
    public List<Project> getAllProjects() {
        return projectRepository.findAll();
    }

    @Override
    public Optional<Project> getProjectById(String id) {
        return projectRepository.findById(id);
    }
}
