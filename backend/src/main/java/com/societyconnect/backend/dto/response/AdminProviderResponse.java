package com.societyconnect.backend.dto.response;

public class AdminProviderResponse {
    private Long id;
    private String fullName;
    private String email;
    private String categoryName;
    private String phone;

    public AdminProviderResponse(Long id, String fullName, String email, String categoryName, String phone) {
        this.id = id; this.fullName = fullName; this.email = email; this.categoryName = categoryName; this.phone = phone;
    }

    public Long getId() { return id; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public String getCategoryName() { return categoryName; }
    public String getPhone() { return phone; }
}
