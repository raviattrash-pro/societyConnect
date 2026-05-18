package com.societyconnect.backend.controller;

import com.societyconnect.backend.entity.ProviderProfile;
import com.societyconnect.backend.entity.enums.BookingStatus;
import com.societyconnect.backend.exception.ResourceNotFoundException;
import com.societyconnect.backend.repository.BookingRepository;
import com.societyconnect.backend.repository.ProviderProfileRepository;
import com.societyconnect.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired private ProviderProfileRepository providerProfileRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private BookingRepository bookingRepository;

    @GetMapping("/provider/earnings")
    public ResponseEntity<?> getProviderEarnings(Principal principal) {
        com.societyconnect.backend.entity.User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        ProviderProfile provider = providerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEarnings", provider.getMonthlyEarnings());
        
        // Mocking growth data for demonstration
        stats.put("growthPercent", 12.5);
        
        var bookings = bookingRepository.findByServiceProviderIdOrderByCreatedAtDesc(provider.getId());
        
        var topServices = bookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                .collect(Collectors.groupingBy(b -> b.getService().getServiceName(), Collectors.counting()));
        
        stats.put("topServices", topServices);
        
        return ResponseEntity.ok(stats);
    }
}
