package com.societyconnect.backend.service;

import com.societyconnect.backend.dto.request.MessageRequest;
import com.societyconnect.backend.dto.response.MessageResponse;
import com.societyconnect.backend.entity.Message;
import com.societyconnect.backend.entity.User;
import com.societyconnect.backend.exception.ResourceNotFoundException;
import com.societyconnect.backend.repository.MessageRepository;
import com.societyconnect.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageService {

    @Autowired private MessageRepository messageRepository;
    @Autowired private UserRepository userRepository;

    public MessageResponse sendMessage(String senderEmail, MessageRequest request) {
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Sender not found"));
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new ResourceNotFoundException("Receiver not found"));

        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(request.getContent());
        messageRepository.save(message);
        return mapToResponse(message);
    }

    public List<MessageResponse> getConversation(String email, Long otherUserId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        List<Message> messages = messageRepository.findConversation(user.getId(), otherUserId);

        // Mark received messages as read
        messages.stream()
                .filter(m -> m.getReceiver().getId().equals(user.getId()) && !m.getIsRead())
                .forEach(m -> { m.setIsRead(true); messageRepository.save(m); });

        return messages.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<MessageResponse> getMyConversations(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return messageRepository.findLatestConversations(user.getId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public Long getUnreadCount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return messageRepository.countUnread(user.getId());
    }

    private MessageResponse mapToResponse(Message m) {
        return new MessageResponse(m.getId(), m.getSender().getId(), m.getSender().getEmail(),
                m.getReceiver().getId(), m.getReceiver().getEmail(),
                m.getContent(), m.getIsRead(), m.getCreatedAt());
    }
}
