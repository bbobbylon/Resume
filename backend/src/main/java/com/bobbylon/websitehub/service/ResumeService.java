package com.bobbylon.websitehub.service;

import com.bobbylon.websitehub.model.Resume;

/**
 * Business-logic boundary between
 * {@link com.bobbylon.websitehub.controller.ResumeController} and
 * {@link com.bobbylon.websitehub.repository.ResumeRepository}. See
 * {@link ProfileService} for why this pass-through layer exists even without any
 * real logic in it yet.
 */
public interface ResumeService {

    /** @return the resume to display at {@code /resume}. */
    Resume getResume();
}
