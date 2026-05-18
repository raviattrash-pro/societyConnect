package com.societyconnect.backend.dto.response;

public class FavoriteResponse {
    private Long id;
    private Long providerId;
    private String providerName;
    private String categoryName;
    private Double averageRating;

    public FavoriteResponse() {}
    public FavoriteResponse(Long id, Long providerId, String providerName, String categoryName, Double averageRating) {
        this.id = id; this.providerId = providerId; this.providerName = providerName;
        this.categoryName = categoryName; this.averageRating = averageRating;
    }

    public Long getId() { return id; }
    public Long getProviderId() { return providerId; }
    public String getProviderName() { return providerName; }
    public String getCategoryName() { return categoryName; }
    public Double getAverageRating() { return averageRating; }
}
