package com.societyconnect.backend.dto.response;

import java.time.LocalDateTime;

public class MessageResponse {
    private Long id;
    private Long senderId;
    private String senderEmail;
    private Long receiverId;
    private String receiverEmail;
    private String content;
    private Boolean isRead;
    private LocalDateTime createdAt;

    public MessageResponse() {}
    public MessageResponse(Long id, Long senderId, String senderEmail, Long receiverId, String receiverEmail,
                           String content, Boolean isRead, LocalDateTime createdAt) {
        this.id = id; this.senderId = senderId; this.senderEmail = senderEmail;
        this.receiverId = receiverId; this.receiverEmail = receiverEmail;
        this.content = content; this.isRead = isRead; this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public Long getSenderId() { return senderId; }
    public String getSenderEmail() { return senderEmail; }
    public Long getReceiverId() { return receiverId; }
    public String getReceiverEmail() { return receiverEmail; }
    public String getContent() { return content; }
    public Boolean getIsRead() { return isRead; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
