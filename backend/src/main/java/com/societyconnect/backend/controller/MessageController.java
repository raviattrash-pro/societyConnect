package com.societyconnect.backend.controller;

import com.societyconnect.backend.dto.request.MessageRequest;
import com.societyconnect.backend.dto.response.MessageResponse;
import com.societyconnect.backend.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired private MessageService messageService;

    @PostMapping
    public ResponseEntity<MessageResponse> sendMessage(Authentication auth, @RequestBody MessageRequest request) {
        return new ResponseEntity<>(messageService.sendMessage(auth.getName(), request), HttpStatus.CREATED);
    }

    @GetMapping("/conversation/{userId}")
    public ResponseEntity<List<MessageResponse>> getConversation(Authentication auth, @PathVariable Long userId) {
        return ResponseEntity.ok(messageService.getConversation(auth.getName(), userId));
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<MessageResponse>> getMyConversations(Authentication auth) {
        return ResponseEntity.ok(messageService.getMyConversations(auth.getName()));
    }

    @GetMapping("/unread")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication auth) {
        return ResponseEntity.ok(Map.of("count", messageService.getUnreadCount(auth.getName())));
    }
}
