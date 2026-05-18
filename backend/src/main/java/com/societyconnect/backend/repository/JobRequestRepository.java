package com.societyconnect.backend.repository;

import com.societyconnect.backend.entity.JobRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobRequestRepository extends JpaRepository<JobRequest, Long> {
    List<JobRequest> findByResidentIdOrderByCreatedAtDesc(Long residentId);
    List<JobRequest> findByCategoryIdAndStatusOrderByCreatedAtDesc(Integer categoryId, String status);
    List<JobRequest> findByAcceptedByIdOrderByCreatedAtDesc(Long providerId);
}
