package com.societyconnect.backend.dto.response;

import java.math.BigDecimal;

public class ServiceResponse {
    private Long id;
    private String serviceName;
    private String description;
    private BigDecimal price;
    private Long providerId;
    private String providerName;
    private String categoryName;
    private Double averageRating;
    private String availability;
    private Boolean isVerified;
    private Boolean isSuperProvider;
    private Integer trustScore;
    private Boolean emergencyEnabled;
    private Boolean protectionEligible;
    private String premiumTier;
    private Integer responseTimeMinutes;

    public ServiceResponse() {}
    public ServiceResponse(Long id, String serviceName, String description, BigDecimal price,
                           Long providerId, String providerName, String categoryName, Double averageRating,
                           String availability, Boolean isVerified, Boolean isSuperProvider) {
        this.id = id; this.serviceName = serviceName; this.description = description; this.price = price;
        this.providerId = providerId; this.providerName = providerName; this.categoryName = categoryName;
        this.averageRating = averageRating; this.availability = availability; this.isVerified = isVerified;
        this.isSuperProvider = isSuperProvider;
    }

    public ServiceResponse(Long id, String serviceName, String description, BigDecimal price,
                           Long providerId, String providerName, String categoryName, Double averageRating,
                           String availability, Boolean isVerified, Boolean isSuperProvider,
                           Integer trustScore, Boolean emergencyEnabled, Boolean protectionEligible,
                           String premiumTier, Integer responseTimeMinutes) {
        this(id, serviceName, description, price, providerId, providerName, categoryName, averageRating,
                availability, isVerified, isSuperProvider);
        this.trustScore = trustScore;
        this.emergencyEnabled = emergencyEnabled;
        this.protectionEligible = protectionEligible;
        this.premiumTier = premiumTier;
        this.responseTimeMinutes = responseTimeMinutes;
    }

    public Long getId() { return id; }
    public String getServiceName() { return serviceName; }
    public String getDescription() { return description; }
    public BigDecimal getPrice() { return price; }
    public Long getProviderId() { return providerId; }
    public String getProviderName() { return providerName; }
    public String getCategoryName() { return categoryName; }
    public Double getAverageRating() { return averageRating; }
    public String getAvailability() { return availability; }
    public Boolean getIsVerified() { return isVerified; }
    public Boolean getIsSuperProvider() { return isSuperProvider; }
    public Integer getTrustScore() { return trustScore; }
    public Boolean getEmergencyEnabled() { return emergencyEnabled; }
    public Boolean getProtectionEligible() { return protectionEligible; }
    public String getPremiumTier() { return premiumTier; }
    public Integer getResponseTimeMinutes() { return responseTimeMinutes; }
}
