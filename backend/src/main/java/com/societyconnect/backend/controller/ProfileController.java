package com.societyconnect.backend.controller;

import com.societyconnect.backend.dto.request.ProviderProfileRequest;
import com.societyconnect.backend.dto.request.ResidentProfileRequest;
import com.societyconnect.backend.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    @Autowired private ProfileService profileService;

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMyProfile(Authentication auth) {
        return ResponseEntity.ok(profileService.getProfile(auth.getName()));
    }

    @PutMapping("/resident")
    public ResponseEntity<Map<String, Object>> updateResidentProfile(Authentication auth, @RequestBody ResidentProfileRequest request) {
        return ResponseEntity.ok(profileService.updateResidentProfile(auth.getName(), request));
    }

    @PutMapping("/provider")
    public ResponseEntity<Map<String, Object>> updateProviderProfile(Authentication auth, @RequestBody ProviderProfileRequest request) {
        return ResponseEntity.ok(profileService.updateProviderProfile(auth.getName(), request));
    }
}
