package com.bobbylon.websitehub.service;

import com.bobbylon.websitehub.model.Resume;
import com.bobbylon.websitehub.repository.ResumeRepository;
import org.springframework.stereotype.Service;

/** Default {@link ResumeService}, delegating straight to the repository for now. */
@Service
public class ResumeServiceImpl implements ResumeService {

    private final ResumeRepository resumeRepository;

    public ResumeServiceImpl(ResumeRepository resumeRepository) {
        this.resumeRepository = resumeRepository;
    }

    @Override
    public Resume getResume() {
        return resumeRepository.getResume();
    }
}
