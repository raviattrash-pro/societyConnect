package com.societyconnect.backend.dto.response;

import java.time.LocalDateTime;

public class ReviewResponse {
    private Long id;
    private Long bookingId;
    private Integer rating;
    private String comment;
    private String reviewerName;
    private LocalDateTime createdAt;

    public ReviewResponse() {}
    public ReviewResponse(Long id, Long bookingId, Integer rating, String comment, String reviewerName, LocalDateTime createdAt) {
        this.id = id; this.bookingId = bookingId; this.rating = rating; this.comment = comment;
        this.reviewerName = reviewerName; this.createdAt = createdAt;
    }
    public Long getId() { return id; }
    public Long getBookingId() { return bookingId; }
    public Integer getRating() { return rating; }
    public String getComment() { return comment; }
    public String getReviewerName() { return reviewerName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
