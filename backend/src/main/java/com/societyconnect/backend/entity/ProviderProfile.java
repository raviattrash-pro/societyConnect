package com.societyconnect.backend.entity;

import com.societyconnect.backend.entity.enums.Availability;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "provider_profiles")
public class ProviderProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(name = "full_name", length = 100, nullable = false)
    private String fullName;

    @Column(length = 15, nullable = false)
    private String phone;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(name = "base_price", precision = 10, scale = 2)
    private BigDecimal basePrice;

    @Column(name = "is_verified")
    private Boolean isVerified = false;

    @Column(name = "id_verified")
    private Boolean idVerified = false;

    @Column(name = "police_verified")
    private Boolean policeVerified = false;

    @Column(name = "rwa_approved")
    private Boolean rwaApproved = false;

    @Lob
    @Column(name = "id_proof_url", columnDefinition = "LONGTEXT")
    private String idProofUrl;

    @Lob
    @Column(name = "address_proof_url", columnDefinition = "LONGTEXT")
    private String addressProofUrl;

    @Column(name = "kyc_status", length = 30)
    private String kycStatus = "NOT_SUBMITTED";

    @Column(name = "emergency_enabled")
    private Boolean emergencyEnabled = false;

    @Column(name = "protection_eligible")
    private Boolean protectionEligible = true;

    @Column(name = "premium_tier", length = 20)
    private String premiumTier = "FREE";

    @Column(name = "response_time_minutes")
    private Integer responseTimeMinutes = 45;

    @Column(name = "reliability_score")
    private Integer reliabilityScore = 60;

    @Column(name = "monthly_earnings", precision = 12, scale = 2)
    private BigDecimal monthlyEarnings = BigDecimal.ZERO;

    @Column(name = "auto_reply", columnDefinition = "TEXT")
    private String autoReply;

    @Column(name = "service_packages", columnDefinition = "TEXT")
    private String servicePackages;

    @Column(name = "portfolio_urls", columnDefinition = "TEXT")
    private String portfolioUrls;

    @Column(name = "available_slots", columnDefinition = "TEXT")
    private String availableSlots;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Enumerated(EnumType.STRING)
    @Column(length = 15)
    private Availability availability = Availability.AVAILABLE;

    private Double latitude;
    private Double longitude;

    @Column(name = "is_green")
    private Boolean isGreen = false;

    @Column(name = "eco_practices", columnDefinition = "TEXT")
    private String ecoPractices;

    public ProviderProfile() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public Integer getExperienceYears() { return experienceYears; }
    public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }
    public BigDecimal getBasePrice() { return basePrice; }
    public void setBasePrice(BigDecimal basePrice) { this.basePrice = basePrice; }
    public Boolean getIsVerified() { return isVerified; }
    public void setIsVerified(Boolean isVerified) { this.isVerified = isVerified; }
    public Boolean getIdVerified() { return idVerified; }
    public void setIdVerified(Boolean idVerified) { this.idVerified = idVerified; }
    public Boolean getPoliceVerified() { return policeVerified; }
    public void setPoliceVerified(Boolean policeVerified) { this.policeVerified = policeVerified; }
    public Boolean getRwaApproved() { return rwaApproved; }
    public void setRwaApproved(Boolean rwaApproved) { this.rwaApproved = rwaApproved; }
    public String getIdProofUrl() { return idProofUrl; }
    public void setIdProofUrl(String idProofUrl) { this.idProofUrl = idProofUrl; }
    public String getAddressProofUrl() { return addressProofUrl; }
    public void setAddressProofUrl(String addressProofUrl) { this.addressProofUrl = addressProofUrl; }
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
    public Integer getReliabilityScore() { return reliabilityScore; }
    public void setReliabilityScore(Integer reliabilityScore) { this.reliabilityScore = reliabilityScore; }
    public BigDecimal getMonthlyEarnings() { return monthlyEarnings; }
    public void setMonthlyEarnings(BigDecimal monthlyEarnings) { this.monthlyEarnings = monthlyEarnings; }
    public String getAutoReply() { return autoReply; }
    public void setAutoReply(String autoReply) { this.autoReply = autoReply; }
    public String getServicePackages() { return servicePackages; }
    public void setServicePackages(String servicePackages) { this.servicePackages = servicePackages; }
    public String getPortfolioUrls() { return portfolioUrls; }
    public void setPortfolioUrls(String portfolioUrls) { this.portfolioUrls = portfolioUrls; }
    public String getAvailableSlots() { return availableSlots; }
    public void setAvailableSlots(String availableSlots) { this.availableSlots = availableSlots; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public Availability getAvailability() { return availability; }
    public void setAvailability(Availability availability) { this.availability = availability; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Boolean getIsGreen() { return isGreen; }
    public void setIsGreen(Boolean isGreen) { this.isGreen = isGreen; }
    public String getEcoPractices() { return ecoPractices; }
    public void setEcoPractices(String ecoPractices) { this.ecoPractices = ecoPractices; }
}
