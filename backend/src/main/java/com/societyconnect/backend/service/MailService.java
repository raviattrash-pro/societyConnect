package com.societyconnect.backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendEmail(String to, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        message.setFrom("societyconnect.noreply@gmail.com");
        mailSender.send(message);
    }

    public void sendPasswordResetToken(String to, String token) {
        String subject = "SocietyConnect - Password Reset Request";
        String body = "Hello,\n\n" +
                "You requested a password reset for your SocietyConnect account.\n" +
                "Please use the following token to reset your password:\n\n" +
                token + "\n\n" +
                "This token will expire in 1 hour.\n" +
                "If you did not request this, please ignore this email.\n\n" +
                "Regards,\n" +
                "SocietyConnect Team";
        sendEmail(to, subject, body);
    }
}
