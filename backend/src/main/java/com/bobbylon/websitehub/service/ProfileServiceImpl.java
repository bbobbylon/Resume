package com.bobbylon.websitehub.service;

import com.bobbylon.websitehub.model.Profile;
import com.bobbylon.websitehub.repository.ProfileRepository;
import org.springframework.stereotype.Service;

/**
 * Default {@link ProfileService}. Uses constructor injection (rather than field
 * injection with {@code @Autowired}) per Bobby's team conventions — it makes the
 * dependency explicit and lets this class be constructed directly in a plain unit
 * test without needing a Spring context at all.
 */
@Service
public class ProfileServiceImpl implements ProfileService {

    /**
     * Where profile data actually comes from. Today that is
     * {@link com.bobbylon.websitehub.repository.InMemoryProfileRepository}; because this
     * field is typed to the interface, swapping in a database-backed implementation
     * later touches no code in this class.
     */
    private final ProfileRepository profileRepository;

    /**
     * @param profileRepository the repository Spring injects; constructor injection
     *                          (not {@code @Autowired} on the field) keeps the
     *                          dependency explicit and lets a unit test build this
     *                          class with a stub and no Spring context
     */
    public ProfileServiceImpl(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    @Override
    /**
     * {@inheritDoc}
     *
     * <p>A straight delegation today. The layer still earns its place: it is where
     * caching, composition of several sources, or filtering of non-public fields
     * would go, so {@link com.bobbylon.websitehub.controller.ProfileController} never
     * has to learn about repositories.
     */
    public Profile getProfile() {
        return profileRepository.getProfile();
    }
}
