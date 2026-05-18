package com.societyconnect.backend.controller;

import com.societyconnect.backend.dto.response.AdminDashboardResponse;
import com.societyconnect.backend.dto.response.AdminProviderResponse;
import com.societyconnect.backend.dto.response.AdminUserResponse;
import com.societyconnect.backend.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired private AdminService adminService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminDashboardResponse> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<java.util.List<AdminUserResponse>> getAdminUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @org.springframework.web.bind.annotation.PatchMapping("/users/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleUserStatus(@org.springframework.web.bind.annotation.PathVariable Long id) {
        adminService.toggleUserStatus(id);
        return ResponseEntity.ok(java.util.Map.of("message", "User status updated"));
    }

    @GetMapping("/providers/unverified")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<java.util.List<AdminProviderResponse>> getUnverifiedProviders() {
        return ResponseEntity.ok(adminService.getUnverifiedProviders());
    }

    @org.springframework.web.bind.annotation.PatchMapping("/providers/{id}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> verifyProvider(@org.springframework.web.bind.annotation.PathVariable Long id) {
        adminService.verifyProvider(id);
        return ResponseEntity.ok(java.util.Map.of("message", "Provider verified successfully"));
    }

    @GetMapping("/settings/{key}")
    public ResponseEntity<?> getSetting(@org.springframework.web.bind.annotation.PathVariable String key) {
        return ResponseEntity.ok(java.util.Map.of("value", adminService.getSetting(key) != null ? adminService.getSetting(key) : ""));
    }

    @org.springframework.web.bind.annotation.PatchMapping("/settings/{key}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateSetting(@org.springframework.web.bind.annotation.PathVariable String key, @org.springframework.web.bind.annotation.RequestBody java.util.Map<String, String> body) {
        adminService.updateSetting(key, body.get("value"));
        return ResponseEntity.ok(java.util.Map.of("message", "Setting updated"));
    }

    @GetMapping("/jobs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<java.util.List<com.societyconnect.backend.dto.response.JobResponse>> getAllJobs() {
        return ResponseEntity.ok(adminService.getAllJobLeads());
    }

    @org.springframework.web.bind.annotation.PostMapping("/sync-defaults")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> syncDefaults() {
        adminService.syncDefaultProviders();
        return ResponseEntity.ok(java.util.Map.of("message", "Default providers synced"));
    }

    @org.springframework.web.bind.annotation.PostMapping("/toggle-defaults")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> toggleDefaults(@org.springframework.web.bind.annotation.RequestBody java.util.Map<String, Boolean> body) {
        adminService.toggleDefaultProviders(body.get("enabled"));
        return ResponseEntity.ok(java.util.Map.of("message", "Default providers " + (body.get("enabled") ? "enabled" : "disabled")));
    }

    @GetMapping("/grievances")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getGrievances() {
        return ResponseEntity.ok(adminService.getAllGrievances());
    }

    @org.springframework.web.bind.annotation.PatchMapping("/grievances/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> resolveGrievance(@org.springframework.web.bind.annotation.PathVariable Long id) {
        adminService.resolveGrievance(id);
        return ResponseEntity.ok(java.util.Map.of("message", "Grievance resolved and password reset"));
    }
}
