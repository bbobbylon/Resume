package com.bobbylon.websitehub.repository;

import com.bobbylon.websitehub.model.Resume;

/**
 * Data-access boundary for the single {@link Resume} the hub displays.
 *
 * <p>An interface for the same reason as {@link ProfileRepository}: the service layer
 * only ever sees this contract, so the hard-coded {@link InMemoryResumeRepository}
 * can be swapped for a database- or CMS-backed one without touching
 * {@link com.bobbylon.websitehub.service.ResumeService} or its controller.
 */
public interface ResumeRepository {

    /** @return the resume to display. Never {@code null}. */
    Resume getResume();
}
