package com.societyconnect.backend.controller;

import com.societyconnect.backend.dto.request.ReviewRequest;
import com.societyconnect.backend.dto.response.ReviewResponse;
import com.societyconnect.backend.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired private ReviewService reviewService;

    @PostMapping
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<ReviewResponse> addReview(@Valid @RequestBody ReviewRequest request) {
        return new ResponseEntity<>(reviewService.addReview(request), HttpStatus.CREATED);
    }

    @GetMapping("/provider/{providerId}")
    public ResponseEntity<List<ReviewResponse>> getProviderReviews(@PathVariable Long providerId) {
        return ResponseEntity.ok(reviewService.getProviderReviews(providerId));
    }
}
