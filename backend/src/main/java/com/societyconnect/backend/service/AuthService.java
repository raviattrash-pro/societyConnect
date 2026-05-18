package com.societyconnect.backend.service;

import com.societyconnect.backend.dto.request.LoginRequest;
import com.societyconnect.backend.dto.request.RegisterRequest;
import com.societyconnect.backend.dto.response.AuthResponse;
import com.societyconnect.backend.entity.Role;
import com.societyconnect.backend.entity.User;
import com.societyconnect.backend.entity.enums.RoleName;
import com.societyconnect.backend.exception.BadRequestException;
import com.societyconnect.backend.repository.RoleRepository;
import com.societyconnect.backend.repository.UserRepository;
import com.societyconnect.backend.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired private UserRepository userRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private JwtTokenProvider tokenProvider;
    @Autowired private MailService mailService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }
        RoleName roleName = RoleName.valueOf(request.getRole());
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new BadRequestException("Invalid role: " + request.getRole()));

        User user = new User(request.getEmail(), passwordEncoder.encode(request.getPassword()), role);
        userRepository.save(user);

        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        String token = tokenProvider.generateToken(auth);

        return new AuthResponse(token, role.getName().name(), user.getId(), user.getEmail());
    }

    public AuthResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        String token = tokenProvider.generateToken(auth);
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));
        return new AuthResponse(token, user.getRole().getName().name(), user.getId(), user.getEmail());
    }

    public String forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
        String token = java.util.UUID.randomUUID().toString();
        user.setResetToken(token);
        user.setResetTokenExpiry(java.time.LocalDateTime.now().plusHours(1));
        userRepository.save(user);
        
        mailService.sendPasswordResetToken(user.getEmail(), token);
        
        return "A password reset token has been sent to your registered email address.";
    }

    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired token"));
        if (user.getResetTokenExpiry().isBefore(java.time.LocalDateTime.now())) {
            throw new BadRequestException("Token has expired");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
    }

    @Autowired private com.societyconnect.backend.repository.GrievanceRepository grievanceRepository;

    public void raiseGrievance(String email, String description) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found with this email"));
        
        com.societyconnect.backend.entity.Grievance grievance = new com.societyconnect.backend.entity.Grievance();
        grievance.setUser(user);
        grievance.setDescription(description);
        grievance.setType(com.societyconnect.backend.entity.enums.GrievanceType.RESET_PASSWORD);
        grievanceRepository.save(grievance);
    }

    public void changePassword(String email, String oldPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
        
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BadRequestException("Incorrect old password");
        }
        
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setMustChangePassword(false);
        userRepository.save(user);
    }
}
