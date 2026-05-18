package com.societyconnect.backend.service;

import com.societyconnect.backend.dto.request.ProviderProfileRequest;
import com.societyconnect.backend.dto.request.ResidentProfileRequest;
import com.societyconnect.backend.entity.*;
import com.societyconnect.backend.entity.enums.Availability;
import com.societyconnect.backend.entity.enums.RoleName;
import com.societyconnect.backend.exception.BadRequestException;
import com.societyconnect.backend.exception.ResourceNotFoundException;
import com.societyconnect.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class ProfileService {

    @Autowired private UserRepository userRepository;
    @Autowired private ResidentProfileRepository residentProfileRepository;
    @Autowired private ProviderProfileRepository providerProfileRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private ReviewRepository reviewRepository;

    public Map<String, Object> getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Map<String, Object> result = new HashMap<>();
        result.put("userId", user.getId());
        result.put("email", user.getEmail());
        result.put("role", user.getRole().getName().name());

        if (user.getRole().getName() == RoleName.ROLE_RESIDENT || user.getRole().getName() == RoleName.ROLE_ADMIN) {
            residentProfileRepository.findByUserId(user.getId()).ifPresent(profile -> {
                result.put("fullName", profile.getFullName());
                result.put("phone", profile.getPhone());
                result.put("societyName", profile.getSocietyName());
                result.put("address", profile.getAddress());
                result.put("profilePic", profile.getProfilePic());
                result.put("flatNumber", profile.getFlatNumber());
                result.put("gateInstructions", profile.getGateInstructions());
                result.put("preferredTimings", profile.getPreferredTimings());
                result.put("loyaltyPoints", profile.getLoyaltyPoints());
                result.put("referralCode", profile.getReferralCode());
                result.put("societyCode", profile.getSocietyCode());
                result.put("profileComplete", true);
            });
        } else if (user.getRole().getName() == RoleName.ROLE_PROVIDER) {
            providerProfileRepository.findByUserId(user.getId()).ifPresent(profile -> {
                result.put("profileId", profile.getId());
                result.put("fullName", profile.getFullName());
                result.put("phone", profile.getPhone());
                result.put("categoryName", profile.getCategory() != null ? profile.getCategory().getName() : null);
                result.put("categoryId", profile.getCategory() != null ? profile.getCategory().getId() : null);
                result.put("experienceYears", profile.getExperienceYears());
                result.put("basePrice", profile.getBasePrice());
                result.put("isVerified", profile.getIsVerified());
                result.put("idVerified", profile.getIdVerified());
                result.put("policeVerified", profile.getPoliceVerified());
                result.put("rwaApproved", profile.getRwaApproved());
                result.put("kycStatus", profile.getKycStatus());
                result.put("idProofUrl", profile.getIdProofUrl());
                result.put("addressProofUrl", profile.getAddressProofUrl());
                result.put("emergencyEnabled", profile.getEmergencyEnabled());
                result.put("protectionEligible", profile.getProtectionEligible());
                result.put("premiumTier", profile.getPremiumTier());
                result.put("responseTimeMinutes", profile.getResponseTimeMinutes());
                result.put("reliabilityScore", profile.getReliabilityScore());
                result.put("monthlyEarnings", profile.getMonthlyEarnings());
                result.put("servicePackages", profile.getServicePackages());
                result.put("portfolioUrls", profile.getPortfolioUrls());
                result.put("availableSlots", profile.getAvailableSlots());
                result.put("autoReply", profile.getAutoReply());
                result.put("bio", profile.getBio());
                result.put("availability", profile.getAvailability().name());
                result.put("averageRating", reviewRepository.getAverageRatingByProviderId(profile.getId()));
                result.put("profileComplete", true);
            });
        }
        if (!result.containsKey("profileComplete")) result.put("profileComplete", false);
        return result;
    }

    public Map<String, Object> updateResidentProfile(String email, ResidentProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getRole().getName() != RoleName.ROLE_RESIDENT && user.getRole().getName() != RoleName.ROLE_ADMIN)
            throw new BadRequestException("Only residents and admins can update resident profiles");

        ResidentProfile profile = residentProfileRepository.findByUserId(user.getId()).orElseGet(() -> {
            ResidentProfile p = new ResidentProfile(); p.setUser(user); return p;
        });
        profile.setFullName(request.getFullName());
        profile.setPhone(request.getPhone());
        profile.setSocietyName(request.getSocietyName());
        profile.setAddress(request.getAddress());
        profile.setFlatNumber(request.getFlatNumber());
        profile.setGateInstructions(request.getGateInstructions());
        profile.setPreferredTimings(request.getPreferredTimings());
        profile.setSocietyCode(request.getSocietyCode());
        if (profile.getReferralCode() == null || profile.getReferralCode().isBlank()) {
            profile.setReferralCode(("SC-" + user.getId() + "-" + profile.getFullName()).replaceAll("[^A-Za-z0-9-]", "").toUpperCase());
        }
        if (request.getProfilePic() != null) profile.setProfilePic(request.getProfilePic());
        residentProfileRepository.save(profile);
        return getProfile(email);
    }

    public Map<String, Object> updateProviderProfile(String email, ProviderProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (user.getRole().getName() != RoleName.ROLE_PROVIDER)
            throw new BadRequestException("Only providers can update provider profiles");

        ProviderProfile profile = providerProfileRepository.findByUserId(user.getId()).orElseGet(() -> {
            ProviderProfile p = new ProviderProfile(); p.setUser(user); return p;
        });
        profile.setFullName(request.getFullName());
        profile.setPhone(request.getPhone());
        profile.setExperienceYears(request.getExperienceYears());
        profile.setBasePrice(request.getBasePrice());
        profile.setBio(request.getBio());
        if (request.getIdProofUrl() != null) profile.setIdProofUrl(request.getIdProofUrl());
        if (request.getAddressProofUrl() != null) profile.setAddressProofUrl(request.getAddressProofUrl());
        if ((request.getIdProofUrl() != null && !request.getIdProofUrl().isBlank()) ||
                (request.getAddressProofUrl() != null && !request.getAddressProofUrl().isBlank())) {
            profile.setKycStatus("SUBMITTED");
        }
        if (request.getServicePackages() != null) profile.setServicePackages(request.getServicePackages());
        if (request.getPortfolioUrls() != null) profile.setPortfolioUrls(request.getPortfolioUrls());
        if (request.getAvailableSlots() != null) profile.setAvailableSlots(request.getAvailableSlots());
        if (request.getAutoReply() != null) profile.setAutoReply(request.getAutoReply());
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            profile.setCategory(category);
        }
        if (request.getAvailability() != null) profile.setAvailability(Availability.valueOf(request.getAvailability()));
        providerProfileRepository.save(profile);
        return getProfile(email);
    }
}
