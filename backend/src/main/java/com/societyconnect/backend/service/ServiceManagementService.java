package com.societyconnect.backend.service;

import com.societyconnect.backend.dto.request.ServiceRequest;
import com.societyconnect.backend.dto.response.ServiceResponse;
import com.societyconnect.backend.entity.ProviderProfile;
import com.societyconnect.backend.entity.ServiceEntity;
import com.societyconnect.backend.entity.User;
import com.societyconnect.backend.exception.BadRequestException;
import com.societyconnect.backend.exception.ResourceNotFoundException;
import com.societyconnect.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class ServiceManagementService {

    @Autowired private ServiceRepository serviceRepository;
    @Autowired private ProviderProfileRepository providerProfileRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ReviewRepository reviewRepository;

    public ServiceResponse createService(String email, ServiceRequest request) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        ProviderProfile provider = providerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BadRequestException("Please complete your provider profile first"));
        ServiceEntity service = new ServiceEntity();
        service.setProvider(provider);
        service.setServiceName(request.getServiceName());
        service.setDescription(request.getDescription());
        service.setPrice(request.getPrice());
        serviceRepository.save(service);
        return mapToResponse(service);
    }

    public List<ServiceResponse> getMyServices(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        ProviderProfile provider = providerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Provider profile not found"));
        return serviceRepository.findByProviderId(provider.getId()).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<ServiceResponse> searchServices(String query, Integer categoryId,
                                                 BigDecimal minPrice, BigDecimal maxPrice,
                                                 Double minRating, String availability,
                                                 String sortBy) {
        List<ServiceEntity> services;
        if (categoryId != null) services = serviceRepository.findByCategoryId(categoryId);
        else if (query != null && !query.isBlank()) services = serviceRepository.searchServices(query);
        else services = serviceRepository.findAllEnabled();

        Stream<ServiceResponse> stream = services.stream().map(this::mapToResponse);

        // Filter by price range
        if (minPrice != null) stream = stream.filter(s -> s.getPrice() != null && s.getPrice().compareTo(minPrice) >= 0);
        if (maxPrice != null) stream = stream.filter(s -> s.getPrice() != null && s.getPrice().compareTo(maxPrice) <= 0);

        // Filter by minimum rating
        if (minRating != null) stream = stream.filter(s -> s.getAverageRating() != null && s.getAverageRating() >= minRating);

        // Filter by availability
        if (availability != null && !availability.isBlank()) {
            stream = stream.filter(s -> availability.equalsIgnoreCase(s.getAvailability()));
        }

        // Sorting
        if ("price_asc".equals(sortBy)) {
            stream = stream.sorted(Comparator.comparing(s -> s.getPrice() != null ? s.getPrice() : BigDecimal.ZERO));
        } else if ("price_desc".equals(sortBy)) {
            stream = stream.sorted(Comparator.comparing((ServiceResponse s) -> s.getPrice() != null ? s.getPrice() : BigDecimal.ZERO).reversed());
        } else if ("rating".equals(sortBy)) {
            stream = stream.sorted(Comparator.comparing((ServiceResponse s) -> s.getAverageRating() != null ? s.getAverageRating() : 0.0).reversed());
        } else if ("trust".equals(sortBy)) {
            stream = stream.sorted(Comparator.comparing((ServiceResponse s) -> s.getTrustScore() != null ? s.getTrustScore() : 0).reversed());
        }

        return stream.collect(Collectors.toList());
    }

    public ServiceResponse getServiceById(Long id) {
        return mapToResponse(serviceRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Service not found")));
    }

    public ServiceResponse updateService(String email, Long serviceId, ServiceRequest request) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        ProviderProfile provider = providerProfileRepository.findByUserId(user.getId()).orElseThrow(() -> new ResourceNotFoundException("Provider not found"));
        ServiceEntity service = serviceRepository.findById(serviceId).orElseThrow(() -> new ResourceNotFoundException("Service not found"));
        if (!service.getProvider().getId().equals(provider.getId())) throw new BadRequestException("You can only edit your own services");
        service.setServiceName(request.getServiceName());
        service.setDescription(request.getDescription());
        service.setPrice(request.getPrice());
        serviceRepository.save(service);
        return mapToResponse(service);
    }

    public void deleteService(String email, Long serviceId) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        ProviderProfile provider = providerProfileRepository.findByUserId(user.getId()).orElseThrow(() -> new ResourceNotFoundException("Provider not found"));
        ServiceEntity service = serviceRepository.findById(serviceId).orElseThrow(() -> new ResourceNotFoundException("Service not found"));
        if (!service.getProvider().getId().equals(provider.getId())) throw new BadRequestException("You can only delete your own services");
        serviceRepository.delete(service);
    }

    private ServiceResponse mapToResponse(ServiceEntity service) {
        ProviderProfile provider = service.getProvider();
        Double avgRating = reviewRepository.getAverageRatingByProviderId(provider.getId());
        List<com.societyconnect.backend.entity.Review> reviews = reviewRepository.findByProviderId(provider.getId());
        boolean isSuperProvider = avgRating != null && avgRating >= 4.5 && reviews.size() >= 3;
        int trustScore = calculateTrustScore(provider, avgRating, reviews.size());
        
        return new ServiceResponse(
                service.getId(), service.getServiceName(), service.getDescription(), service.getPrice(),
                provider.getId(), provider.getFullName(),
                provider.getCategory() != null ? provider.getCategory().getName() : null,
                avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : null,
                provider.getAvailability() != null ? provider.getAvailability().name() : null,
                provider.getIsVerified(),
                isSuperProvider,
                trustScore,
                provider.getEmergencyEnabled(),
                provider.getProtectionEligible(),
                provider.getPremiumTier(),
                provider.getResponseTimeMinutes()
        );
    }

    private int calculateTrustScore(ProviderProfile provider, Double avgRating, int reviewCount) {
        int score = 35;
        if (Boolean.TRUE.equals(provider.getIsVerified())) score += 15;
        if (Boolean.TRUE.equals(provider.getIdVerified())) score += 10;
        if (Boolean.TRUE.equals(provider.getPoliceVerified())) score += 10;
        if (avgRating != null) score += (int) Math.round(avgRating * 5);
        score += Math.min(reviewCount * 2, 15);
        if (provider.getResponseTimeMinutes() != null && provider.getResponseTimeMinutes() <= 30) score += 5;
        if ("PRO".equalsIgnoreCase(provider.getPremiumTier()) || "ELITE".equalsIgnoreCase(provider.getPremiumTier())) score += 3;
        return Math.min(score, 100);
    }
}
