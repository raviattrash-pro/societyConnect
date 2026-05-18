package com.societyconnect.backend.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class JobResponse {
    private Long id;
    private String residentName;
    private String societyName;
    private String categoryName;
    private String description;
    private BigDecimal expectedPrice;
    private String status;
    private String acceptedByProviderName;
    private LocalDateTime createdAt;

    public JobResponse() {}

    public JobResponse(Long id, String residentName, String societyName, String categoryName, 
                       String description, BigDecimal expectedPrice, String status, 
                       String acceptedByProviderName, LocalDateTime createdAt) {
        this.id = id; this.residentName = residentName; this.societyName = societyName;
        this.categoryName = categoryName; this.description = description; 
        this.expectedPrice = expectedPrice; this.status = status; 
        this.acceptedByProviderName = acceptedByProviderName; this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public String getResidentName() { return residentName; }
    public String getSocietyName() { return societyName; }
    public String getCategoryName() { return categoryName; }
    public String getDescription() { return description; }
    public BigDecimal getExpectedPrice() { return expectedPrice; }
    public String getStatus() { return status; }
    public String getAcceptedByProviderName() { return acceptedByProviderName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
