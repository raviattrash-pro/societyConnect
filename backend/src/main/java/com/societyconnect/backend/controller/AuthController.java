package com.societyconnect.backend.controller;

import com.societyconnect.backend.dto.request.LoginRequest;
import com.societyconnect.backend.dto.request.RegisterRequest;
import com.societyconnect.backend.dto.response.AuthResponse;
import com.societyconnect.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return new ResponseEntity<>(authService.register(request), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<com.societyconnect.backend.dto.response.ApiResponse> forgotPassword(@RequestBody java.util.Map<String, String> body) {
        String message = authService.forgotPassword(body.get("email"));
        return ResponseEntity.ok(new com.societyconnect.backend.dto.response.ApiResponse(true, message));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<com.societyconnect.backend.dto.response.ApiResponse> resetPassword(@RequestBody java.util.Map<String, String> body) {
        authService.resetPassword(body.get("token"), body.get("newPassword"));
        return ResponseEntity.ok(new com.societyconnect.backend.dto.response.ApiResponse(true, "Password reset successfully"));
    }

    @PostMapping("/grievance")
    public ResponseEntity<com.societyconnect.backend.dto.response.ApiResponse> raiseGrievance(@RequestBody java.util.Map<String, String> body) {
        authService.raiseGrievance(body.get("email"), body.get("description"));
        return ResponseEntity.ok(new com.societyconnect.backend.dto.response.ApiResponse(true, "Grievance raised successfully"));
    }
}
