package com.societyconnect.backend.entity;

import com.societyconnect.backend.entity.enums.GrievanceStatus;
import com.societyconnect.backend.entity.enums.GrievanceType;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "grievances")
public class Grievance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GrievanceType type;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private GrievanceStatus status = GrievanceStatus.OPEN;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public Grievance() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public GrievanceType getType() { return type; }
    public void setType(GrievanceType type) { this.type = type; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public GrievanceStatus getStatus() { return status; }
    public void setStatus(GrievanceStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
