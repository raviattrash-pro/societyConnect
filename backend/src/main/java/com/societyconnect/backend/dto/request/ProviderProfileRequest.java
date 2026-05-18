package com.societyconnect.backend.dto.request;

import java.math.BigDecimal;

public class ProviderProfileRequest {
    private String fullName;
    private String phone;
    private Integer categoryId;
    private Integer experienceYears;
    private BigDecimal basePrice;
    private String bio;
    private String availability;
    private String idProofUrl;
    private String addressProofUrl;
    private String servicePackages;
    private String portfolioUrls;
    private String availableSlots;
    private String autoReply;

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public Integer getCategoryId() { return categoryId; }
    public void setCategoryId(Integer categoryId) { this.categoryId = categoryId; }
    public Integer getExperienceYears() { return experienceYears; }
    public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }
    public BigDecimal getBasePrice() { return basePrice; }
    public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getAvailability() { return availability; }
    public void setAvailability(String availability) { this.availability = availability; }
    public String getIdProofUrl() { return idProofUrl; }
    public void setIdProofUrl(String idProofUrl) { this.idProofUrl = idProofUrl; }
    public String getAddressProofUrl() { return addressProofUrl; }
    public void setAddressProofUrl(String addressProofUrl) { this.addressProofUrl = addressProofUrl; }
    public String getServicePackages() { return servicePackages; }
    public void setServicePackages(String servicePackages) { this.servicePackages = servicePackages; }
    public String getPortfolioUrls() { return portfolioUrls; }
    public void setPortfolioUrls(String portfolioUrls) { this.portfolioUrls = portfolioUrls; }
    public String getAvailableSlots() { return availableSlots; }
    public void setAvailableSlots(String availableSlots) { this.availableSlots = availableSlots; }
    public String getAutoReply() { return autoReply; }
    public void setAutoReply(String autoReply) { this.autoReply = autoReply; }
}
