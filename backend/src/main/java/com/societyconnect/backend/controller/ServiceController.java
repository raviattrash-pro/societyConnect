package com.societyconnect.backend.controller;

import com.societyconnect.backend.dto.request.ServiceRequest;
import com.societyconnect.backend.dto.response.ApiResponse;
import com.societyconnect.backend.dto.response.ServiceResponse;
import com.societyconnect.backend.service.ServiceManagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    @Autowired private ServiceManagementService serviceManagementService;

    @GetMapping
    public ResponseEntity<List<ServiceResponse>> getAllServices(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) String availability,
            @RequestParam(required = false) String sortBy) {
        return ResponseEntity.ok(serviceManagementService.searchServices(query, categoryId, minPrice, maxPrice, minRating, availability, sortBy));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceResponse> getService(@PathVariable Long id) {
        return ResponseEntity.ok(serviceManagementService.getServiceById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ServiceResponse> createService(Authentication auth, @RequestBody ServiceRequest request) {
        return new ResponseEntity<>(serviceManagementService.createService(auth.getName(), request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ServiceResponse> updateService(Authentication auth, @PathVariable Long id, @RequestBody ServiceRequest request) {
        return ResponseEntity.ok(serviceManagementService.updateService(auth.getName(), id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ApiResponse> deleteService(Authentication auth, @PathVariable Long id) {
        serviceManagementService.deleteService(auth.getName(), id);
        return ResponseEntity.ok(new ApiResponse(true, "Service deleted successfully"));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<List<ServiceResponse>> getMyServices(Authentication auth) {
        return ResponseEntity.ok(serviceManagementService.getMyServices(auth.getName()));
    }
}
