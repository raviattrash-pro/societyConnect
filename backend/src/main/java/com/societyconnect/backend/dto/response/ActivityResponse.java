package com.societyconnect.backend.dto.response;

import java.time.LocalDateTime;

public class ActivityResponse {
    private Long id;
    private String message;
    private String icon;
    private LocalDateTime timestamp;

    public ActivityResponse() {}
    public ActivityResponse(Long id, String message, String icon, LocalDateTime timestamp) {
        this.id = id; this.message = message; this.icon = icon; this.timestamp = timestamp;
    }

    public Long getId() { return id; }
    public String getMessage() { return message; }
    public String getIcon() { return icon; }
    public LocalDateTime getTimestamp() { return timestamp; }
}
