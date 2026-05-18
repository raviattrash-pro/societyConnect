package com.societyconnect.backend.controller;

import com.societyconnect.backend.dto.response.ProviderDetailResponse;
import com.societyconnect.backend.dto.response.ReviewResponse;
import com.societyconnect.backend.dto.response.ServiceResponse;
import com.societyconnect.backend.entity.ProviderProfile;
import com.societyconnect.backend.entity.Review;
import com.societyconnect.backend.entity.ServiceEntity;
import com.societyconnect.backend.exception.ResourceNotFoundException;
import com.societyconnect.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/providers")
public class ProviderController {

    @Autowired private ProviderProfileRepository providerProfileRepository;
    @Autowired private ServiceRepository serviceRepository;
    @Autowired private ReviewRepository reviewRepository;
    @Autowired private BookingRepository bookingRepository;

    @GetMapping("/{id}")
    public ResponseEntity<ProviderDetailResponse> getProviderDetail(@PathVariable Long id) {
        ProviderProfile provider = providerProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));

        List<ServiceEntity> services = serviceRepository.findByProviderId(id);
        List<Review> reviews = reviewRepository.findByProviderId(id);
        Double avgRating = reviewRepository.getAverageRatingByProviderId(id);

        ProviderDetailResponse response = new ProviderDetailResponse();
        response.setProfileId(provider.getId());
        response.setFullName(provider.getFullName());
        response.setPhone(provider.getPhone());
        response.setCategoryName(provider.getCategory() != null ? provider.getCategory().getName() : null);
        response.setExperienceYears(provider.getExperienceYears());
        response.setBasePrice(provider.getBasePrice());
        response.setBio(provider.getBio());
        response.setAvailability(provider.getAvailability() != null ? provider.getAvailability().name() : null);
        response.setIsVerified(provider.getIsVerified());
        response.setIdVerified(provider.getIdVerified());
        response.setPoliceVerified(provider.getPoliceVerified());
        response.setRwaApproved(provider.getRwaApproved());
        response.setKycStatus(provider.getKycStatus());
        response.setEmergencyEnabled(provider.getEmergencyEnabled());
        response.setProtectionEligible(provider.getProtectionEligible());
        response.setPremiumTier(provider.getPremiumTier());
        response.setResponseTimeMinutes(provider.getResponseTimeMinutes());
        response.setAverageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : null);
        response.setTotalReviews((long) reviews.size());
        
        boolean isSuperProvider = avgRating != null && avgRating >= 4.5 && reviews.size() >= 3;
        response.setIsSuperProvider(isSuperProvider);
        long completedJobs = bookingRepository.findByServiceProviderIdOrderByCreatedAtDesc(id).stream()
                .filter(b -> b.getStatus() == com.societyconnect.backend.entity.enums.BookingStatus.COMPLETED)
                .count();
        long repeatBookings = Math.max(0, completedJobs - reviews.size());
        response.setCompletedJobs(completedJobs);
        response.setRepeatBookings(repeatBookings);
        response.setTrustScore(calculateTrustScore(provider, avgRating, reviews.size(), completedJobs));
        response.setReliabilityScore(provider.getReliabilityScore());
        response.setServicePackages(provider.getServicePackages());
        response.setPortfolioUrls(provider.getPortfolioUrls());
        response.setAvailableSlots(provider.getAvailableSlots());
        response.setIsGreen(provider.getIsGreen());
        response.setEcoPractices(provider.getEcoPractices());

        response.setServices(services.stream().map(s -> new ServiceResponse(
                s.getId(), s.getServiceName(), s.getDescription(), s.getPrice(),
                provider.getId(), provider.getFullName(),
                provider.getCategory() != null ? provider.getCategory().getName() : null,
                avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : null,
                provider.getAvailability() != null ? provider.getAvailability().name() : null,
                provider.getIsVerified(),
                isSuperProvider,
                response.getTrustScore(),
                provider.getEmergencyEnabled(),
                provider.getProtectionEligible(),
                provider.getPremiumTier(),
                provider.getResponseTimeMinutes()
        )).collect(Collectors.toList()));

        response.setReviews(reviews.stream().map(r -> new ReviewResponse(
                r.getId(), r.getBooking().getId(), r.getRating(), r.getComment(),
                r.getBooking().getResident().getFullName(), r.getCreatedAt()
        )).collect(Collectors.toList()));

        return ResponseEntity.ok(response);
    }

    private int calculateTrustScore(ProviderProfile provider, Double avgRating, int reviewCount, long completedJobs) {
        int score = 35;
        if (Boolean.TRUE.equals(provider.getIsVerified())) score += 15;
        if (Boolean.TRUE.equals(provider.getIdVerified())) score += 10;
        if (Boolean.TRUE.equals(provider.getPoliceVerified())) score += 10;
        if (avgRating != null) score += (int) Math.round(avgRating * 5);
        score += Math.min(reviewCount * 2, 15);
        score += Math.min((int) completedJobs, 10);
        if (provider.getResponseTimeMinutes() != null && provider.getResponseTimeMinutes() <= 30) score += 5;
        if ("ELITE".equalsIgnoreCase(provider.getPremiumTier())) score += 5;
        return Math.min(score, 100);
    }
    @Autowired private UserRepository userRepository;

    @PatchMapping("/location")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<?> updateLocation(java.security.Principal principal, @RequestBody java.util.Map<String, Double> location) {
        com.societyconnect.backend.entity.User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        ProviderProfile provider = providerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));
        
        provider.setLatitude(location.get("lat"));
        provider.setLongitude(location.get("lng"));
        providerProfileRepository.save(provider);
        
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/business-settings")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ProviderDetailResponse> updateBusinessSettings(java.security.Principal principal, @RequestBody java.util.Map<String, Object> settings) {
        com.societyconnect.backend.entity.User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        ProviderProfile provider = providerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));

        if (settings.containsKey("premiumTier")) provider.setPremiumTier(String.valueOf(settings.get("premiumTier")).toUpperCase());
        if (settings.containsKey("emergencyEnabled")) provider.setEmergencyEnabled(Boolean.valueOf(String.valueOf(settings.get("emergencyEnabled"))));
        if (settings.containsKey("protectionEligible")) provider.setProtectionEligible(Boolean.valueOf(String.valueOf(settings.get("protectionEligible"))));
        if (settings.containsKey("responseTimeMinutes")) provider.setResponseTimeMinutes(Integer.valueOf(String.valueOf(settings.get("responseTimeMinutes"))));
        if (settings.containsKey("availableSlots")) provider.setAvailableSlots(String.valueOf(settings.get("availableSlots")));
        if (settings.containsKey("servicePackages")) provider.setServicePackages(String.valueOf(settings.get("servicePackages")));
        if (settings.containsKey("portfolioUrls")) provider.setPortfolioUrls(String.valueOf(settings.get("portfolioUrls")));
        if (settings.containsKey("autoReply")) provider.setAutoReply(String.valueOf(settings.get("autoReply")));
        if (settings.containsKey("isGreen")) provider.setIsGreen(Boolean.valueOf(String.valueOf(settings.get("isGreen"))));
        if (settings.containsKey("ecoPractices")) provider.setEcoPractices(String.valueOf(settings.get("ecoPractices")));
        providerProfileRepository.save(provider);
        return getProviderDetail(provider.getId());
    }
}
