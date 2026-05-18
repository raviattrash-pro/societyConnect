package com.societyconnect.backend.dto.response;

import java.time.LocalDateTime;

public class UserAdminResponse {
    private Long id;
    private String email;
    private String role;
    private Boolean isEnabled;
    private LocalDateTime createdAt;
    private String profileName;

    public UserAdminResponse() {}
    public UserAdminResponse(Long id, String email, String role, Boolean isEnabled,
                             LocalDateTime createdAt, String profileName) {
        this.id = id; this.email = email; this.role = role; this.isEnabled = isEnabled;
        this.createdAt = createdAt; this.profileName = profileName;
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public Boolean getIsEnabled() { return isEnabled; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getProfileName() { return profileName; }
}
