package com.societyconnect.backend.dto.response;

import java.math.BigDecimal;
import java.util.List;

public class AdminDashboardResponse {
    private Long totalUsers;
    private Long totalProviders;
    private Long totalBookings;
    private BigDecimal totalRevenue;
    
    private List<MetricDto> mostUsedServices;
    private List<MetricDto> leastUsedServices;
    private List<MetricDto> highDemandServices;
    private List<ProviderDetailResponse> topProviders;

    private Long totalResidents;
    private Long pendingBookings;
    private Long completedBookings;
    private Long totalServices;
    private Long totalReviews;
    private Long unverifiedProviders;

    public AdminDashboardResponse() {}

    public Long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(Long totalUsers) { this.totalUsers = totalUsers; }
    public Long getTotalProviders() { return totalProviders; }
    public void setTotalProviders(Long totalProviders) { this.totalProviders = totalProviders; }
    public Long getTotalBookings() { return totalBookings; }
    public void setTotalBookings(Long totalBookings) { this.totalBookings = totalBookings; }
    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
    public List<MetricDto> getMostUsedServices() { return mostUsedServices; }
    public void setMostUsedServices(List<MetricDto> mostUsedServices) { this.mostUsedServices = mostUsedServices; }
    public List<MetricDto> getLeastUsedServices() { return leastUsedServices; }
    public void setLeastUsedServices(List<MetricDto> leastUsedServices) { this.leastUsedServices = leastUsedServices; }
    public List<MetricDto> getHighDemandServices() { return highDemandServices; }
    public void setHighDemandServices(List<MetricDto> highDemandServices) { this.highDemandServices = highDemandServices; }
    public List<ProviderDetailResponse> getTopProviders() { return topProviders; }
    public void setTopProviders(List<ProviderDetailResponse> topProviders) { this.topProviders = topProviders; }
    
    public Long getTotalResidents() { return totalResidents; }
    public void setTotalResidents(Long totalResidents) { this.totalResidents = totalResidents; }
    public Long getPendingBookings() { return pendingBookings; }
    public void setPendingBookings(Long pendingBookings) { this.pendingBookings = pendingBookings; }
    public Long getCompletedBookings() { return completedBookings; }
    public void setCompletedBookings(Long completedBookings) { this.completedBookings = completedBookings; }
    public Long getTotalServices() { return totalServices; }
    public void setTotalServices(Long totalServices) { this.totalServices = totalServices; }
    public Long getTotalReviews() { return totalReviews; }
    public void setTotalReviews(Long totalReviews) { this.totalReviews = totalReviews; }
    public Long getUnverifiedProviders() { return unverifiedProviders; }
    public void setUnverifiedProviders(Long unverifiedProviders) { this.unverifiedProviders = unverifiedProviders; }
}
