package com.bobbylon.websitehub.service;

import com.bobbylon.websitehub.model.Resume;
import com.bobbylon.websitehub.repository.ResumeRepository;
import org.springframework.stereotype.Service;

/** Default {@link ResumeService}, delegating straight to the repository for now. */
@Service
public class ResumeServiceImpl implements ResumeService {

    /** The seed resume ({@link com.bobbylon.websitehub.repository.InMemoryResumeRepository}) behind this service. */
    private final ResumeRepository resumeRepository;

    /**
     * @param resumeRepository the repository Spring injects; see
     *                         {@link ProfileServiceImpl} for why injection is by constructor
     */
    public ResumeServiceImpl(ResumeRepository resumeRepository) {
        this.resumeRepository = resumeRepository;
    }

    @Override
    /**
     * {@inheritDoc}
     *
     * <p>Pass-through for now. The whole resume is one object on purpose — the
     * {@code /resume} page and the PDF both render every section, so splitting it
     * into per-section endpoints would only add round-trips.
     */
    public Resume getResume() {
        return resumeRepository.getResume();
    }
}
