package com.societyconnect.backend.dto.response;

public class AuthResponse {
    private String token;
    private String role;
    private Long userId;
    private String email;

    public AuthResponse() {}
    public AuthResponse(String token, String role, Long userId, String email) {
        this.token = token; this.role = role; this.userId = userId; this.email = email;
    }
    public String getToken() { return token; }
    public String getRole() { return role; }
    public Long getUserId() { return userId; }
    public String getEmail() { return email; }
}
