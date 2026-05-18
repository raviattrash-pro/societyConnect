package com.societyconnect.backend.dto.response;

public class AdminUserResponse {
    private Long id;
    private String email;
    private String fullName;
    private String role;
    private Boolean isEnabled;

    public AdminUserResponse(Long id, String email, String fullName, String role, Boolean isEnabled) {
        this.id = id; this.email = email; this.fullName = fullName; this.role = role; this.isEnabled = isEnabled;
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getFullName() { return fullName; }
    public String getRole() { return role; }
    public Boolean getIsEnabled() { return isEnabled; }
}
