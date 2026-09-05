package com.bobbylon.websitehub.service;

import com.bobbylon.websitehub.model.Profile;

/**
 * Business-logic boundary between
 * {@link com.bobbylon.websitehub.controller.ProfileController} and
 * {@link com.bobbylon.websitehub.repository.ProfileRepository}.
 *
 * <p>Today this just passes the repository's data straight through — there's no
 * business logic yet. The layer still exists (rather than having the controller call
 * the repository directly) so that when logic does show up later — caching, merging
 * data from multiple sources, computed fields — it has an obvious home that doesn't
 * require changing the controller.
 */
public interface ProfileService {

    /** @return the profile to display on the hub. */
    Profile getProfile();
}
