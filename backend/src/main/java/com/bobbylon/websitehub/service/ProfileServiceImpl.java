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

    private final ProfileRepository profileRepository;

    public ProfileServiceImpl(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    @Override
    public Profile getProfile() {
        return profileRepository.getProfile();
    }
}
