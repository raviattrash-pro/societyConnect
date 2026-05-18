package com.societyconnect.backend.service;

import com.societyconnect.backend.dto.response.ActivityResponse;
import com.societyconnect.backend.dto.response.FavoriteResponse;
import com.societyconnect.backend.entity.Favorite;
import com.societyconnect.backend.entity.ProviderProfile;
import com.societyconnect.backend.entity.ResidentProfile;
import com.societyconnect.backend.entity.User;
import com.societyconnect.backend.exception.BadRequestException;
import com.societyconnect.backend.exception.ResourceNotFoundException;
import com.societyconnect.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;
import java.util.stream.Collectors;

@Service
public class EngagementService {

    @Autowired private FavoriteRepository favoriteRepository;
    @Autowired private ResidentProfileRepository residentProfileRepository;
    @Autowired private ProviderProfileRepository providerProfileRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ReviewRepository reviewRepository;
    @Autowired private BookingRepository bookingRepository;

    @Transactional
    public void toggleFavorite(String email, Long providerId) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        ResidentProfile resident = residentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BadRequestException("Please complete your Resident Profile to save favorites."));
        ProviderProfile provider = providerProfileRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));

        if (favoriteRepository.existsByResidentIdAndProviderId(resident.getId(), providerId)) {
            favoriteRepository.deleteByResidentIdAndProviderId(resident.getId(), providerId);
        } else {
            favoriteRepository.save(new Favorite(resident, provider));
        }
    }

    public List<FavoriteResponse> getMyFavorites(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        ResidentProfile resident = residentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BadRequestException("Please complete your Resident Profile to view favorites."));

        return favoriteRepository.findByResidentId(resident.getId()).stream().map(fav -> {
            ProviderProfile provider = fav.getProvider();
            Double avgRating = reviewRepository.getAverageRatingByProviderId(provider.getId());
            return new FavoriteResponse(
                    fav.getId(), provider.getId(), provider.getFullName(),
                    provider.getCategory() != null ? provider.getCategory().getName() : null,
                    avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : null
            );
        }).collect(Collectors.toList());
    }

    public boolean isFavorite(String email, Long providerId) {
        if (email == null) return false;
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return false;
        
        com.societyconnect.backend.entity.enums.RoleName role = user.getRole().getName();
        if (role != com.societyconnect.backend.entity.enums.RoleName.ROLE_RESIDENT && 
            role != com.societyconnect.backend.entity.enums.RoleName.ROLE_ADMIN) return false;

        ResidentProfile resident = residentProfileRepository.findByUserId(user.getId()).orElse(null);
        if (resident == null) return false;
        return favoriteRepository.existsByResidentIdAndProviderId(resident.getId(), providerId);
    }

    public List<ActivityResponse> getRecentActivity() {
        // Fetch 3 recent reviews
        List<ActivityResponse> reviewActivities = reviewRepository.findAllByOrderByCreatedAtDesc().stream().limit(3)
                .map(r -> {
                    String name = "A provider";
                    if (r.getBooking() != null && r.getBooking().getService() != null && r.getBooking().getService().getProvider() != null) {
                        name = r.getBooking().getService().getProvider().getFullName();
                    }
                    return new ActivityResponse(
                        r.getId(),
                        name + " just received a " + r.getRating() + "-star review!",
                        "⭐",
                        r.getCreatedAt()
                    );
                }).collect(Collectors.toList());

        // Fetch 3 recent bookings
        List<ActivityResponse> bookingActivities = bookingRepository.findAllByOrderByCreatedAtDesc().stream().limit(3)
                .map(b -> {
                    String serviceName = "a service";
                    if (b.getService() != null) {
                        serviceName = b.getService().getServiceName();
                    }
                    return new ActivityResponse(
                        b.getId(),
                        "Someone just booked " + serviceName,
                        "📅",
                        b.getCreatedAt()
                    );
                }).collect(Collectors.toList());

        // Combine and sort
        reviewActivities.addAll(bookingActivities);
        return reviewActivities.stream()
                .sorted((a, b) -> {
                    if (a.getTimestamp() == null || b.getTimestamp() == null) return 0;
                    return b.getTimestamp().compareTo(a.getTimestamp());
                })
                .limit(5)
                .collect(Collectors.toList());
    }

    public List<com.societyconnect.backend.dto.response.ProviderDetailResponse> getTrendingProviders() {
        // Fetch top 3 providers by average rating
        return providerProfileRepository.findAll().stream()
                .filter(p -> p.getCategory() != null)
                .map(p -> {
                    Double avgRating = reviewRepository.getAverageRatingByProviderId(p.getId());
                    List<com.societyconnect.backend.entity.Review> reviews = reviewRepository.findByProviderId(p.getId());
                    boolean isSuperProvider = avgRating != null && avgRating >= 4.5 && reviews.size() >= 3;
                    
                    com.societyconnect.backend.dto.response.ProviderDetailResponse dto = new com.societyconnect.backend.dto.response.ProviderDetailResponse();
                    dto.setProfileId(p.getId());
                    dto.setFullName(p.getFullName());
                    dto.setCategoryName(p.getCategory().getName());
                    dto.setAverageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : null);
                    dto.setTotalReviews((long) reviews.size());
                    dto.setIsSuperProvider(isSuperProvider);
                    dto.setIsVerified(p.getIsVerified());
                    return dto;
                })
                .filter(p -> p.getAverageRating() != null && p.getAverageRating() >= 4.0)
                .sorted((a, b) -> b.getAverageRating().compareTo(a.getAverageRating()))
                .limit(3)
                .collect(Collectors.toList());
    }

    public List<com.societyconnect.backend.dto.response.ProviderDetailResponse> getEmergencyProviders() {
        return providerProfileRepository.findAll().stream()
                .filter(p -> Boolean.TRUE.equals(p.getEmergencyEnabled()) || (p.getResponseTimeMinutes() != null && p.getResponseTimeMinutes() <= 30))
                .filter(p -> p.getCategory() != null)
                .map(this::mapProviderLite)
                .sorted((a, b) -> Integer.compare(
                        b.getTrustScore() != null ? b.getTrustScore() : 0,
                        a.getTrustScore() != null ? a.getTrustScore() : 0))
                .limit(8)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getMarketplaceIntelligence() {
        Map<String, Object> data = new LinkedHashMap<>();
        long completedBookings = bookingRepository.findAll().stream()
                .filter(b -> b.getStatus() == com.societyconnect.backend.entity.enums.BookingStatus.COMPLETED)
                .count();
        long protectedBookings = bookingRepository.findAll().stream()
                .filter(b -> Boolean.TRUE.equals(b.getProtectedBooking()))
                .count();
        long verifiedProviders = providerProfileRepository.findAll().stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsVerified()))
                .count();
        long emergencyProviders = providerProfileRepository.findAll().stream()
                .filter(p -> Boolean.TRUE.equals(p.getEmergencyEnabled()))
                .count();

        data.put("trustPromise", "Verified society providers, protected bookings, emergency response, and group savings.");
        data.put("completedBookings", completedBookings);
        data.put("protectedBookings", protectedBookings);
        data.put("verifiedProviders", verifiedProviders);
        data.put("emergencyProviders", emergencyProviders);
        data.put("revenueLevers", List.of(
                Map.of("name", "Society Pro", "price", "₹2,999/month", "value", "RWA dashboard, verified vendor directory, complaints, announcements"),
                Map.of("name", "Provider Pro", "price", "₹499/month", "value", "Boosted profile, trust analytics, priority lead alerts"),
                Map.of("name", "Protected Booking", "price", "₹49/booking", "value", "Rework support and dispute assistance"),
                Map.of("name", "Emergency Lead", "price", "₹99/urgent booking", "value", "Priority routing to fast-response providers")
        ));
        data.put("groupDeals", List.of(
                Map.of("title", "Society Pest Shield", "category", "Pest Control", "targetHomes", 10, "saving", "Up to 25%"),
                Map.of("title", "RO Service Camp", "category", "RO / Water Purifier", "targetHomes", 15, "saving", "Up to 30%"),
                Map.of("title", "AC Summer Checkup", "category", "AC Repair", "targetHomes", 20, "saving", "Up to 20%"),
                Map.of("title", "Deep Cleaning Drive", "category", "Maid", "targetHomes", 12, "saving", "Up to 18%")
        ));
        data.put("aiInsights", List.of(
                "Promote categories with high job leads and low provider count.",
                "Offer Pro trials to verified providers with fast response time.",
                "Launch group deals where multiple residents book the same category."
        ));
        return data;
    }

    private com.societyconnect.backend.dto.response.ProviderDetailResponse mapProviderLite(ProviderProfile p) {
        Double avgRating = reviewRepository.getAverageRatingByProviderId(p.getId());
        List<com.societyconnect.backend.entity.Review> reviews = reviewRepository.findByProviderId(p.getId());
        com.societyconnect.backend.dto.response.ProviderDetailResponse dto = new com.societyconnect.backend.dto.response.ProviderDetailResponse();
        dto.setProfileId(p.getId());
        dto.setFullName(p.getFullName());
        dto.setCategoryName(p.getCategory() != null ? p.getCategory().getName() : null);
        dto.setAverageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : null);
        dto.setTotalReviews((long) reviews.size());
        dto.setIsVerified(p.getIsVerified());
        dto.setEmergencyEnabled(p.getEmergencyEnabled());
        dto.setProtectionEligible(p.getProtectionEligible());
        dto.setPremiumTier(p.getPremiumTier());
        dto.setResponseTimeMinutes(p.getResponseTimeMinutes());
        dto.setTrustScore(calculateTrustScore(p, avgRating, reviews.size()));
        dto.setIsSuperProvider(avgRating != null && avgRating >= 4.5 && reviews.size() >= 3);
        return dto;
    }

    private int calculateTrustScore(ProviderProfile provider, Double avgRating, int reviewCount) {
        int score = 35;
        if (Boolean.TRUE.equals(provider.getIsVerified())) score += 15;
        if (Boolean.TRUE.equals(provider.getIdVerified())) score += 10;
        if (Boolean.TRUE.equals(provider.getPoliceVerified())) score += 10;
        if (avgRating != null) score += (int) Math.round(avgRating * 5);
        score += Math.min(reviewCount * 2, 15);
        if (provider.getResponseTimeMinutes() != null && provider.getResponseTimeMinutes() <= 30) score += 5;
        if ("ELITE".equalsIgnoreCase(provider.getPremiumTier())) score += 5;
        return Math.min(score, 100);
    }
}
