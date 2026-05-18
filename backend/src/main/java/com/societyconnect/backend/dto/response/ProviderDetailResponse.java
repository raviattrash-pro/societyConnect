package com.societyconnect.backend.dto.response;

import java.math.BigDecimal;
import java.util.List;

public class ProviderDetailResponse {
    private Long profileId;
    private String fullName;
    private String phone;
    private String categoryName;
    private Integer experienceYears;
    private BigDecimal basePrice;
    private String bio;
    private String availability;
    private Boolean isVerified;
    private Boolean isSuperProvider;
    private Boolean idVerified;
    private Boolean policeVerified;
    private Boolean rwaApproved;
    private String kycStatus;
    private Boolean emergencyEnabled;
    private Boolean protectionEligible;
    private String premiumTier;
    private Integer responseTimeMinutes;
    private Integer trustScore;
    private Integer reliabilityScore;
    private Long completedJobs;
    private Long repeatBookings;
    private String servicePackages;
    private String portfolioUrls;
    private String availableSlots;
    private Double averageRating;
    private Long totalReviews;
    private List<ServiceResponse> services;
    private List<ReviewResponse> reviews;
    private Boolean isGreen;
    private String ecoPractices;

    public ProviderDetailResponse() {}

    public Long getProfileId() { return profileId; }
    public void setProfileId(Long profileId) { this.profileId = profileId; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public Integer getExperienceYears() { return experienceYears; }
    public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }
    public BigDecimal getBasePrice() { return basePrice; }
    public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getAvailability() { return availability; }
    public void setAvailability(String availability) { this.availability = availability; }
    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }
    public Boolean getIsSuperProvider() { return isSuperProvider; }
    public void setIsSuperProvider(Boolean isSuperProvider) { this.isSuperProvider = isSuperProvider; }
    public Boolean getIdVerified() { return idVerified; }
    public void setIdVerified(Boolean idVerified) { this.idVerified = idVerified; }
    public Boolean getPoliceVerified() { return policeVerified; }
    public void setPoliceVerified(Boolean policeVerified) { this.policeVerified = policeVerified; }
    public Boolean getRwaApproved() { return rwaApproved; }
    public void setRwaApproved(Boolean rwaApproved) { this.rwaApproved = rwaApproved; }
    public String getKycStatus() { return kycStatus; }
    public void setKycStatus(String kycStatus) { this.kycStatus = kycStatus; }
    public Boolean getEmergencyEnabled() { return emergencyEnabled; }
    public void setEmergencyEnabled(Boolean emergencyEnabled) { this.emergencyEnabled = emergencyEnabled; }
    public Boolean getProtectionEligible() { return protectionEligible; }
    public void setProtectionEligible(Boolean protectionEligible) { this.protectionEligible = protectionEligible; }
    public String getPremiumTier() { return premiumTier; }
    public void setPremiumTier(String premiumTier) { this.premiumTier = premiumTier; }
    public Integer getResponseTimeMinutes() { return responseTimeMinutes; }
    public void setResponseTimeMinutes(Integer responseTimeMinutes) { this.responseTimeMinutes = responseTimeMinutes; }
    public Integer getTrustScore() { return trustScore; }
    public void setTrustScore(Integer trustScore) { this.trustScore = trustScore; }
    public Integer getReliabilityScore() { return reliabilityScore; }
    public void setReliabilityScore(Integer reliabilityScore) { this.reliabilityScore = reliabilityScore; }
    public Long getCompletedJobs() { return completedJobs; }
    public void setCompletedJobs(Long completedJobs) { this.completedJobs = completedJobs; }
    public Long getRepeatBookings() { return repeatBookings; }
    public void setRepeatBookings(Long repeatBookings) { this.repeatBookings = repeatBookings; }
    public String getServicePackages() { return servicePackages; }
    public void setServicePackages(String servicePackages) { this.servicePackages = servicePackages; }
    public String getPortfolioUrls() { return portfolioUrls; }
    public void setPortfolioUrls(String portfolioUrls) { this.portfolioUrls = portfolioUrls; }
    public String getAvailableSlots() { return availableSlots; }
    public void setAvailableSlots(String availableSlots) { this.availableSlots = availableSlots; }
    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
    public Long getTotalReviews() { return totalReviews; }
    public void setTotalReviews(Long totalReviews) { this.totalReviews = totalReviews; }
    public List<ServiceResponse> getServices() { return services; }
    public void setServices(List<ServiceResponse> services) { this.services = services; }
    public List<ReviewResponse> getReviews() { return reviews; }
    public void setReviews(List<ReviewResponse> reviews) { this.reviews = reviews; }
    public Boolean getIsGreen() { return isGreen; }
    public void setIsGreen(Boolean isGreen) { this.isGreen = isGreen; }
    public String getEcoPractices() { return ecoPractices; }
    public void setEcoPractices(String ecoPractices) { this.ecoPractices = ecoPractices; }
}
