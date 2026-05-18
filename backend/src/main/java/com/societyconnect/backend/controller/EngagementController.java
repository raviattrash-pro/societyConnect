package com.societyconnect.backend.controller;

import com.societyconnect.backend.dto.response.ActivityResponse;
import com.societyconnect.backend.dto.response.ApiResponse;
import com.societyconnect.backend.dto.response.FavoriteResponse;
import com.societyconnect.backend.service.EngagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class EngagementController {

    @Autowired private EngagementService engagementService;

    @PostMapping("/favorites/{providerId}")
    @PreAuthorize("hasAnyRole('RESIDENT', 'ADMIN')")
    public ResponseEntity<ApiResponse> toggleFavorite(Authentication auth, @PathVariable Long providerId) {
        engagementService.toggleFavorite(auth.getName(), providerId);
        return ResponseEntity.ok(new ApiResponse(true, "Favorite toggled"));
    }

    @GetMapping("/favorites")
    @PreAuthorize("hasAnyRole('RESIDENT', 'ADMIN')")
    public ResponseEntity<List<FavoriteResponse>> getMyFavorites(Authentication auth) {
        return ResponseEntity.ok(engagementService.getMyFavorites(auth.getName()));
    }

    @GetMapping("/favorites/{providerId}/check")
    public ResponseEntity<Boolean> checkFavorite(Authentication auth, @PathVariable Long providerId) {
        if (auth == null) return ResponseEntity.ok(false);
        return ResponseEntity.ok(engagementService.isFavorite(auth.getName(), providerId));
    }

    @GetMapping("/activity")
    public ResponseEntity<List<ActivityResponse>> getRecentActivity() {
        return ResponseEntity.ok(engagementService.getRecentActivity());
    }

    @GetMapping("/trending")
    public ResponseEntity<List<com.societyconnect.backend.dto.response.ProviderDetailResponse>> getTrendingProviders() {
        return ResponseEntity.ok(engagementService.getTrendingProviders());
    }

    @GetMapping("/emergency-providers")
    public ResponseEntity<List<com.societyconnect.backend.dto.response.ProviderDetailResponse>> getEmergencyProviders() {
        return ResponseEntity.ok(engagementService.getEmergencyProviders());
    }

    @GetMapping("/marketplace-intelligence")
    public ResponseEntity<Map<String, Object>> getMarketplaceIntelligence() {
        return ResponseEntity.ok(engagementService.getMarketplaceIntelligence());
    }
}
