package com.societyconnect.backend.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "job_requests")
public class JobRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resident_id", nullable = false)
    private ResidentProfile resident;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false, length = 1000)
    private String description;

    @Column(precision = 10, scale = 2)
    private BigDecimal expectedPrice;

    @Column(nullable = false)
    private String status = "OPEN"; // OPEN, ACCEPTED, COMPLETED, CANCELLED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "accepted_by_provider_id")
    private ProviderProfile acceptedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public JobRequest() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ResidentProfile getResident() { return resident; }
    public void setResident(ResidentProfile resident) { this.resident = resident; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getExpectedPrice() { return expectedPrice; }
    public void setExpectedPrice(BigDecimal expectedPrice) { this.expectedPrice = expectedPrice; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public ProviderProfile getAcceptedBy() { return acceptedBy; }
    public void setAcceptedBy(ProviderProfile acceptedBy) { this.acceptedBy = acceptedBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
