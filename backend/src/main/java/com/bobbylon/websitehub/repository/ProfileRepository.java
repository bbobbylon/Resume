package com.bobbylon.websitehub.repository;

import com.bobbylon.websitehub.model.Profile;

/**
 * Data-access boundary for the single {@link Profile} the hub displays.
 *
 * <p>This is an interface — not a concrete class — specifically so that
 * {@link com.bobbylon.websitehub.service.ProfileService} never has to know or care
 * whether the data underneath it is hard-coded in memory (as it is today, via
 * {@link InMemoryProfileRepository}) or coming from a real database later. Adding a
 * JPA-backed implementation down the line means writing one new class here and
 * changing zero lines in the service or controller layers above it.
 */
public interface ProfileRepository {

    /**
     * @return the profile to display. Never {@code null} — this app always has
     *         exactly one profile (Bobby's own), even if its fields are placeholders.
     */
    Profile getProfile();
}
