package com.societyconnect.backend.service;

import com.societyconnect.backend.dto.request.JobRequestDto;
import com.societyconnect.backend.dto.response.JobResponse;
import com.societyconnect.backend.entity.Category;
import com.societyconnect.backend.entity.JobRequest;
import com.societyconnect.backend.entity.ProviderProfile;
import com.societyconnect.backend.entity.ResidentProfile;
import com.societyconnect.backend.entity.User;
import com.societyconnect.backend.exception.BadRequestException;
import com.societyconnect.backend.exception.ResourceNotFoundException;
import com.societyconnect.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobService {

    @Autowired private JobRequestRepository jobRequestRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ResidentProfileRepository residentProfileRepository;
    @Autowired private ProviderProfileRepository providerProfileRepository;
    @Autowired private CategoryRepository categoryRepository;

    public JobResponse createJob(String email, JobRequestDto dto) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        ResidentProfile resident = residentProfileRepository.findByUserId(user.getId())
                .orElse(null);
        
        if (resident == null) {
            throw new BadRequestException("You need to complete your Resident Profile before posting a job lead.");
        }
        
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        JobRequest job = new JobRequest();
        job.setResident(resident);
        job.setCategory(category);
        job.setDescription(dto.getDescription());
        job.setExpectedPrice(dto.getExpectedPrice());
        job.setStatus("OPEN");
        jobRequestRepository.save(job);

        return mapToResponse(job);
    }

    public List<JobResponse> getMyPostedJobs(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        ResidentProfile resident = residentProfileRepository.findByUserId(user.getId()).orElseThrow();
        return jobRequestRepository.findByResidentIdOrderByCreatedAtDesc(resident.getId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<JobResponse> getAvailableJobsForProvider(String email) {
        User user = userRepository.findByEmail(email).orElseThrow();
        ProviderProfile provider = providerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BadRequestException("Provider profile required"));
        
        if (provider.getCategory() == null) return List.of();
        
        return jobRequestRepository.findByCategoryIdAndStatusOrderByCreatedAtDesc(provider.getCategory().getId(), "OPEN")
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public JobResponse acceptJob(String email, Long jobId) {
        User user = userRepository.findByEmail(email).orElseThrow();
        ProviderProfile provider = providerProfileRepository.findByUserId(user.getId()).orElseThrow();
        
        JobRequest job = jobRequestRepository.findById(jobId).orElseThrow(() -> new ResourceNotFoundException("Job not found"));
        if (!"OPEN".equals(job.getStatus())) {
            throw new BadRequestException("Job is no longer open");
        }
        if (!job.getCategory().getId().equals(provider.getCategory().getId())) {
            throw new BadRequestException("You can only accept jobs in your category");
        }

        job.setStatus("ACCEPTED");
        job.setAcceptedBy(provider);
        jobRequestRepository.save(job);
        return mapToResponse(job);
    }

    private JobResponse mapToResponse(JobRequest job) {
        return new JobResponse(
                job.getId(),
                job.getResident() != null ? job.getResident().getFullName() : "Unknown",
                job.getResident() != null ? job.getResident().getSocietyName() : "N/A",
                job.getCategory() != null ? job.getCategory().getName() : "Unknown",
                job.getDescription(),
                job.getExpectedPrice(),
                job.getStatus(),
                job.getAcceptedBy() != null ? job.getAcceptedBy().getFullName() : null,
                job.getCreatedAt()
        );
    }
}
