package com.societyconnect.backend.controller;

import com.societyconnect.backend.dto.response.ApiResponse;
import com.societyconnect.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired private AuthService authService;

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse> changePassword(Authentication auth, @RequestBody Map<String, String> body) {
        authService.changePassword(auth.getName(), body.get("oldPassword"), body.get("newPassword"));
        return ResponseEntity.ok(new ApiResponse(true, "Password changed successfully"));
    }
}
