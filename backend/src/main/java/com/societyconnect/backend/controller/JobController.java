package com.societyconnect.backend.controller;

import com.societyconnect.backend.dto.request.JobRequestDto;
import com.societyconnect.backend.dto.response.JobResponse;
import com.societyconnect.backend.service.JobService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobController {

    @Autowired private JobService jobService;

    @PostMapping
    @PreAuthorize("hasAnyRole('RESIDENT', 'ADMIN')")
    public ResponseEntity<JobResponse> createJob(Authentication auth, @Valid @RequestBody JobRequestDto request) {
        return ResponseEntity.ok(jobService.createJob(auth.getName(), request));
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('RESIDENT', 'ADMIN')")
    public ResponseEntity<List<JobResponse>> getMyPostedJobs(Authentication auth) {
        return ResponseEntity.ok(jobService.getMyPostedJobs(auth.getName()));
    }

    @GetMapping("/leads")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<List<JobResponse>> getAvailableJobs(Authentication auth) {
        return ResponseEntity.ok(jobService.getAvailableJobsForProvider(auth.getName()));
    }

    @PatchMapping("/{id}/accept")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<JobResponse> acceptJob(Authentication auth, @PathVariable Long id) {
        return ResponseEntity.ok(jobService.acceptJob(auth.getName(), id));
    }
}
