package com.bobbylon.websitehub.repository;

import com.bobbylon.websitehub.model.Project;
import com.bobbylon.websitehub.model.ProjectStatus;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Guards the hand-maintained seed data in {@link InMemoryProjectRepository}: a
 * plain unit test (no Spring context) that catches the mistakes that are easy to
 * make while editing a long literal list — a duplicated id, a "Live" project with
 * no URL to open, or a detail page missing its three highlights.
 */
class InMemoryProjectRepositoryTest {

    private final InMemoryProjectRepository repository = new InMemoryProjectRepository();

    @Test
    void idsAreUniqueAndUrlSafe() {
        List<String> ids = repository.findAll().stream().map(Project::id).toList();

        assertThat(ids).doesNotHaveDuplicates();
        assertThat(ids).allMatch(id -> id.matches("[a-z0-9-]+"), "ids must be lowercase URL slugs");
    }

    @Test
    void liveProjectsHaveAUrlToOpen() {
        assertThat(repository.findAll())
                .filteredOn(project -> project.status() == ProjectStatus.LIVE)
                .allSatisfy(project -> assertThat(project.url()).startsWith("https://"));
    }

    @Test
    void everyProjectHasWhatTheDetailPageNeeds() {
        assertThat(repository.findAll()).allSatisfy(project -> {
            assertThat(project.repoUrl()).as("%s repoUrl", project.id()).startsWith("https://");
            assertThat(project.highlights()).as("%s highlights", project.id()).hasSize(3);
            assertThat(project.techStack()).as("%s techStack", project.id()).isNotEmpty();
            assertThat(project.longDescription()).as("%s longDescription", project.id()).isNotBlank();
        });
    }

    @Test
    void exactlyOneProjectIsFeatured() {
        assertThat(repository.findAll()).filteredOn(Project::featured).hasSize(1);
    }

    @Test
    void findByIdMatchesExactId() {
        assertThat(repository.findById("tesseraapp")).map(Project::name).contains("TesseraApp");
        assertThat(repository.findById("TesseraApp")).isEmpty();
        assertThat(repository.findById("nope")).isEmpty();
    }
}
