package com.bobbylon.websitehub.controller;

import com.bobbylon.websitehub.model.Profile;
import com.bobbylon.websitehub.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Exposes the hub's "about me" data at {@code GET /api/profile}.
 *
 * <p>There's exactly one profile and no request body or parameters, so this is the
 * simplest possible REST shape: one method, one route, no path variables.
 */
@RestController
@Tag(name = "Profile", description = "Who the hub belongs to")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    /** @return the profile shown in the hero/about sections of the frontend. */
    @Operation(summary = "The owner's profile: name, title, contact, social links, stats")
    @GetMapping("/api/profile")
    public Profile getProfile() {
        return profileService.getProfile();
    }
}
