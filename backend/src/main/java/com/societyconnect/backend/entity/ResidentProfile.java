package com.societyconnect.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "resident_profiles")
public class ResidentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @Column(name = "full_name", length = 100, nullable = false)
    private String fullName;

    @Column(length = 15, nullable = false)
    private String phone;

    @Column(name = "society_name", length = 100, nullable = false)
    private String societyName;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "profile_pic")
    private String profilePic;

    @Column(name = "flat_number", length = 50)
    private String flatNumber;

    @Column(name = "gate_instructions", columnDefinition = "TEXT")
    private String gateInstructions;

    @Column(name = "preferred_timings", length = 100)
    private String preferredTimings;

    @Column(name = "referral_code", length = 40)
    private String referralCode;

    @Column(name = "loyalty_points")
    private Integer loyaltyPoints = 0;

    @Column(name = "society_code", length = 40)
    private String societyCode;

    public ResidentProfile() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getSocietyName() { return societyName; }
    public void setSocietyName(String societyName) { this.societyName = societyName; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getProfilePic() { return profilePic; }
    public void setProfilePic(String profilePic) { this.profilePic = profilePic; }
    public String getFlatNumber() { return flatNumber; }
    public void setFlatNumber(String flatNumber) { this.flatNumber = flatNumber; }
    public String getGateInstructions() { return gateInstructions; }
    public void setGateInstructions(String gateInstructions) { this.gateInstructions = gateInstructions; }
    public String getPreferredTimings() { return preferredTimings; }
    public void setPreferredTimings(String preferredTimings) { this.preferredTimings = preferredTimings; }
    public String getReferralCode() { return referralCode; }
    public void setReferralCode(String referralCode) { this.referralCode = referralCode; }
    public Integer getLoyaltyPoints() { return loyaltyPoints; }
    public void setLoyaltyPoints(Integer loyaltyPoints) { this.loyaltyPoints = loyaltyPoints; }
    public String getSocietyCode() { return societyCode; }
    public void setSocietyCode(String societyCode) { this.societyCode = societyCode; }
}
