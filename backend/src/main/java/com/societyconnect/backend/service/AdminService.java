package com.societyconnect.backend.service;

import com.societyconnect.backend.dto.response.AdminDashboardResponse;
import com.societyconnect.backend.dto.response.AdminProviderResponse;
import com.societyconnect.backend.dto.response.AdminUserResponse;
import com.societyconnect.backend.dto.response.MetricDto;
import com.societyconnect.backend.entity.*;
import com.societyconnect.backend.entity.enums.RoleName;
import com.societyconnect.backend.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired private UserRepository userRepository;
    @Autowired private ProviderProfileRepository providerProfileRepository;
    @Autowired private ResidentProfileRepository residentProfileRepository;
    @Autowired private BookingRepository bookingRepository;
    @Autowired private JobRequestRepository jobRequestRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private EngagementService engagementService;
    @Autowired private ReviewRepository reviewRepository;
    @Autowired private SettingRepository settingRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private ServiceRepository serviceRepository;

    @org.springframework.transaction.annotation.Transactional
    public void syncDefaultProviders() {
        List<Category> categories = categoryRepository.findAll();
        Role providerRole = roleRepository.findByName(com.societyconnect.backend.entity.enums.RoleName.ROLE_PROVIDER)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        for (Category cat : categories) {
            String email = cat.getName() + "_default person";
            User user = userRepository.findByEmail(email).orElse(null);
            
            if (user == null) {
                user = new User(email, passwordEncoder.encode("123456"), providerRole);
                user.setIsEnabled(true);
                userRepository.save(user);
            }

            com.societyconnect.backend.entity.ProviderProfile profile = providerProfileRepository.findByUserId(user.getId()).orElse(null);
            if (profile == null) {
                profile = new com.societyconnect.backend.entity.ProviderProfile();
                profile.setUser(user);
                profile.setFullName(cat.getName() + " Default");
                profile.setPhone("0000000000");
                profile.setCategory(cat);
                profile.setIsVerified(true);
                profile.setIdVerified(true);
                profile.setEmergencyEnabled(true);
                profile.setProtectionEligible(true);
                profile.setPremiumTier("ELITE");
                profile.setResponseTimeMinutes(25);
                profile.setAvailability(com.societyconnect.backend.entity.enums.Availability.AVAILABLE);
                profile.setBio("I am the default automated provider for " + cat.getName() + " services.");
                providerProfileRepository.save(profile);
            }

            if (serviceRepository.findByProviderId(profile.getId()).isEmpty()) {
                com.societyconnect.backend.entity.ServiceEntity service = new com.societyconnect.backend.entity.ServiceEntity();
                service.setProvider(profile);
                service.setServiceName(cat.getName() + " Service");
                service.setDescription("Default professional " + cat.getName() + " services for your community.");
                service.setPrice(BigDecimal.valueOf(100)); // Standard base price
                serviceRepository.save(service);
            }
        }
    }

    @org.springframework.transaction.annotation.Transactional
    public void toggleDefaultProviders(boolean enable) {
        List<com.societyconnect.backend.entity.ProviderProfile> defaults = providerProfileRepository.findAll().stream()
                .filter(p -> p.getUser().getEmail().endsWith("_default person"))
                .collect(Collectors.toList());
        
        for (com.societyconnect.backend.entity.ProviderProfile p : defaults) {
            p.getUser().setIsEnabled(enable);
            userRepository.save(p.getUser());
        }
        updateSetting("enable_default_providers", String.valueOf(enable));
    }

    public String getSetting(String key) {
        return settingRepository.findById(key).map(s -> s.getValue()).orElse(null);
    }

    @org.springframework.transaction.annotation.Transactional
    public void updateSetting(String key, String value) {
        Setting setting = settingRepository.findById(key).orElse(new Setting(key, value));
        setting.setValue(value);
        settingRepository.save(setting);
    }

    public AdminDashboardResponse getDashboardStats() {
        AdminDashboardResponse res = new AdminDashboardResponse();
        
        List<Booking> allBookings = bookingRepository.findAll();
        List<JobRequest> allJobs = jobRequestRepository.findAll();
        List<Category> allCategories = categoryRepository.findAll();

        res.setTotalUsers(userRepository.count());
        res.setTotalProviders(providerProfileRepository.count());
        res.setTotalBookings((long) allBookings.size());

        BigDecimal revenue = allBookings.stream()
                .filter(b -> b.getTotalPrice() != null && "COMPLETED".equals(b.getStatus().name()))
                .map(Booking::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        res.setTotalRevenue(revenue);

        // Legacy fields for existing dashboard compatibility
        res.setTotalResidents(userRepository.findAll().stream().filter(u -> u.getRole().getName().name().equals("ROLE_RESIDENT")).count());
        res.setPendingBookings(allBookings.stream().filter(b -> "PENDING".equals(b.getStatus().name())).count());
        res.setCompletedBookings(allBookings.stream().filter(b -> "COMPLETED".equals(b.getStatus().name())).count());
        res.setTotalServices(categoryRepository.count());
        res.setTotalReviews(reviewRepository.count());
        res.setUnverifiedProviders(providerProfileRepository.findAll().stream().filter(p -> p.getIsVerified() == null || !p.getIsVerified()).count());

        // Service Utilization
        Map<String, Long> categoryBookingCount = allCategories.stream()
                .collect(Collectors.toMap(
                        Category::getName,
                        cat -> allBookings.stream()
                                .filter(b -> b.getService() != null && 
                                           b.getService().getProvider() != null && 
                                           b.getService().getProvider().getCategory() != null &&
                                           b.getService().getProvider().getCategory().getId().equals(cat.getId()))
                                .count()
                ));

        List<MetricDto> mostUsed = categoryBookingCount.entrySet().stream()
                .map(e -> new MetricDto(e.getKey(), e.getValue()))
                .sorted(Comparator.comparing(MetricDto::getValue).reversed())
                .limit(5)
                .collect(Collectors.toList());
        res.setMostUsedServices(mostUsed);

        List<MetricDto> leastUsed = categoryBookingCount.entrySet().stream()
                .map(e -> new MetricDto(e.getKey(), e.getValue()))
                .sorted(Comparator.comparing(MetricDto::getValue))
                .limit(5)
                .collect(Collectors.toList());
        res.setLeastUsedServices(leastUsed);

        // High Demand (Job Requests)
        Map<String, Long> categoryJobCount = allCategories.stream()
                .collect(Collectors.toMap(
                        Category::getName,
                        cat -> allJobs.stream()
                                .filter(j -> j.getCategory() != null && j.getCategory().getId().equals(cat.getId()))
                                .count()
                ));

        List<MetricDto> highDemand = categoryJobCount.entrySet().stream()
                .map(e -> new MetricDto(e.getKey(), e.getValue()))
                .sorted(Comparator.comparing(MetricDto::getValue).reversed())
                .limit(5)
                .collect(Collectors.toList());
        res.setHighDemandServices(highDemand);

        // Top Providers using existing engagement logic
        res.setTopProviders(engagementService.getTrendingProviders());

        return res;
    }

    public List<AdminUserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(u -> {
            String name = u.getEmail();
            if (u.getRole().getName().name().equals("ROLE_RESIDENT")) {
                name = residentProfileRepository.findByUserId(u.getId()).map(p -> p.getFullName()).orElse(u.getEmail());
            } else if (u.getRole().getName().name().equals("ROLE_PROVIDER")) {
                name = providerProfileRepository.findByUserId(u.getId()).map(p -> p.getFullName()).orElse(u.getEmail());
            }
            return new AdminUserResponse(u.getId(), u.getEmail(), name, u.getRole().getName().name(), u.getIsEnabled());
        }).collect(Collectors.toList());
    }

    public void toggleUserStatus(Long userId) {
        com.societyconnect.backend.entity.User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsEnabled(!user.getIsEnabled());
        userRepository.save(user);
    }

    public List<AdminProviderResponse> getUnverifiedProviders() {
        return providerProfileRepository.findAll().stream()
                .filter(p -> p.getIsVerified() == null || !p.getIsVerified())
                .map(p -> new AdminProviderResponse(p.getId(), p.getFullName(), p.getUser().getEmail(), 
                        p.getCategory() != null ? p.getCategory().getName() : "Unassigned", p.getPhone()))
                .collect(Collectors.toList());
    }

    public void verifyProvider(Long providerId) {
        com.societyconnect.backend.entity.ProviderProfile provider = providerProfileRepository.findById(providerId)
                .orElseThrow(() -> new RuntimeException("Provider not found"));
        provider.setIsVerified(true);
        provider.setIdVerified(true);
        provider.setKycStatus("VERIFIED");
        provider.setRwaApproved(true);
        provider.setProtectionEligible(true);
        provider.setEmergencyEnabled(provider.getResponseTimeMinutes() != null && provider.getResponseTimeMinutes() <= 30);
        providerProfileRepository.save(provider);
    }

    public List<com.societyconnect.backend.dto.response.JobResponse> getAllJobLeads() {
        return jobRequestRepository.findAll().stream()
                .sorted(Comparator.comparing(JobRequest::getCreatedAt).reversed())
                .map(j -> new com.societyconnect.backend.dto.response.JobResponse(
                        j.getId(),
                        j.getResident() != null ? j.getResident().getFullName() : "Unknown",
                        j.getResident() != null ? j.getResident().getSocietyName() : "N/A",
                        j.getCategory() != null ? j.getCategory().getName() : "Unknown",
                        j.getDescription(),
                        j.getExpectedPrice(),
                        j.getStatus(),
                        j.getAcceptedBy() != null ? j.getAcceptedBy().getFullName() : null,
                        j.getCreatedAt()
                )).collect(Collectors.toList());
    }

    @Autowired private GrievanceRepository grievanceRepository;

    public List<?> getAllGrievances() {
        return grievanceRepository.findAllByOrderByCreatedAtDesc().stream().map(g -> Map.of(
            "id", g.getId(),
            "userEmail", g.getUser().getEmail(),
            "type", g.getType(),
            "description", g.getDescription(),
            "status", g.getStatus(),
            "createdAt", g.getCreatedAt()
        )).collect(Collectors.toList());
    }

    @org.springframework.transaction.annotation.Transactional
    public void resolveGrievance(Long grievanceId) {
        com.societyconnect.backend.entity.Grievance grievance = grievanceRepository.findById(grievanceId)
                .orElseThrow(() -> new RuntimeException("Grievance not found"));
        
        if (grievance.getType() == com.societyconnect.backend.entity.enums.GrievanceType.RESET_PASSWORD) {
            com.societyconnect.backend.entity.User user = grievance.getUser();
            user.setPassword(passwordEncoder.encode("123456"));
            user.setMustChangePassword(true);
            userRepository.save(user);
        }
        
        grievance.setStatus(com.societyconnect.backend.entity.enums.GrievanceStatus.RESOLVED);
        grievanceRepository.save(grievance);
    }
}
