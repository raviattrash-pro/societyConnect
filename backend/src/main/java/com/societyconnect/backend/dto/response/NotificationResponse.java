package com.societyconnect.backend.dto.response;

import java.time.LocalDateTime;

public class NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private String type;
    private Boolean isRead;
    private LocalDateTime createdAt;

    public NotificationResponse() {}
    public NotificationResponse(Long id, String title, String message, String type, Boolean isRead, LocalDateTime createdAt) {
        this.id = id; this.title = title; this.message = message;
        this.type = type; this.isRead = isRead; this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getMessage() { return message; }
    public String getType() { return type; }
    public Boolean getIsRead() { return isRead; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
