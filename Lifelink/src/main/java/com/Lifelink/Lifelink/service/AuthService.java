package com.Lifelink.Lifelink.service;

import com.Lifelink.Lifelink.dto.*;
import com.Lifelink.Lifelink.model.PasswordResetOtp;
import com.Lifelink.Lifelink.model.User;
import com.Lifelink.Lifelink.repository.PasswordResetOtpRepository;
import com.Lifelink.Lifelink.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetOtpRepository otpRepository;

    @Autowired
    private EmailService emailService;

    private static final SecureRandom random = new SecureRandom();

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            return AuthResponse.builder()
                    .success(false)
                    .message("User with this email already exists.")
                    .build();
        }

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .password(req.getPassword()) // Plain text for simplicity
                .phone(req.getPhone())
                .role(req.getRole() != null ? req.getRole().toUpperCase() : "DONOR")
                .bloodGroup(req.getBloodGroup())
                .address(req.getAddress())
                .licenseNumber(req.getLicenseNumber())
                .hospitalName(req.getHospitalName())
                .build();

        User saved = userRepository.save(user);
        String mockJwt = "LL-JWT-" + UUID.randomUUID().toString();

        return AuthResponse.builder()
                .success(true)
                .message("Registration successful!")
                .token(mockJwt)
                .user(saved)
                .build();
    }

    public AuthResponse login(LoginRequest req) {
        Optional<User> opt = userRepository.findByEmail(req.getEmail());
        if (opt.isEmpty()) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Invalid email or user not found.")
                    .build();
        }

        User user = opt.get();
        if (!user.getPassword().equals(req.getPassword())) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Incorrect password.")
                    .build();
        }

        if (req.getRole() != null && !user.getRole().equalsIgnoreCase(req.getRole())) {
            return AuthResponse.builder()
                    .success(false)
                    .message("User role mismatch. Registered as: " + user.getRole())
                    .build();
        }

        String mockJwt = "LL-JWT-" + UUID.randomUUID().toString();
        return AuthResponse.builder()
                .success(true)
                .message("Login successful!")
                .token(mockJwt)
                .user(user)
                .build();
    }

    public AuthResponse sendOtp(SendOtpRequest req) {
        Optional<User> opt = userRepository.findByEmail(req.getEmail());
        if (opt.isEmpty()) {
            return AuthResponse.builder()
                    .success(false)
                    .message("No registered user found with email: " + req.getEmail())
                    .build();
        }

        User user = opt.get();

        if (req.getRole() != null && !user.getRole().equalsIgnoreCase(req.getRole())) {
            return AuthResponse.builder()
                    .success(false)
                    .message("User is registered as " + user.getRole() + ", not " + req.getRole())
                    .build();
        }

        // Generate 6-digit OTP
        String otpCode = String.format("%06d", random.nextInt(1000000));

        PasswordResetOtp otpToken = PasswordResetOtp.builder()
                .email(user.getEmail())
                .otpCode(otpCode)
                .expiryTime(LocalDateTime.now().plusMinutes(10))
                .used(false)
                .role(user.getRole())
                .build();

        otpRepository.save(otpToken);

        // Send OTP email
        emailService.sendOtpEmail(user.getEmail(), otpCode, user.getName(), user.getRole());

        return AuthResponse.builder()
                .success(true)
                .message("Verification OTP sent to " + req.getEmail() + "! (Valid for 10 mins)")
                .build();
    }

    public AuthResponse verifyOtp(VerifyOtpRequest req) {
        Optional<PasswordResetOtp> opt = otpRepository.findTopByEmailAndOtpCodeAndUsedFalseOrderByExpiryTimeDesc(req.getEmail(), req.getOtp());
        if (opt.isEmpty()) {
            return AuthResponse.builder()
                    .success(false)
                    .message("Invalid OTP code provided.")
                    .build();
        }

        PasswordResetOtp otpToken = opt.get();
        if (otpToken.getExpiryTime().isBefore(LocalDateTime.now())) {
            return AuthResponse.builder()
                    .success(false)
                    .message("OTP code has expired. Please request a new one.")
                    .build();
        }

        return AuthResponse.builder()
                .success(true)
                .message("OTP verified successfully!")
                .build();
    }

    public AuthResponse resetPassword(ForgotPasswordRequest req) {
        Optional<User> opt = userRepository.findByEmail(req.getEmail());
        if (opt.isEmpty()) {
            return AuthResponse.builder()
                    .success(false)
                    .message("No registered user found with email: " + req.getEmail())
                    .build();
        }

        User user = opt.get();

        if (req.getRole() != null && !user.getRole().equalsIgnoreCase(req.getRole())) {
            return AuthResponse.builder()
                    .success(false)
                    .message("User role mismatch. Registered as: " + user.getRole())
                    .build();
        }

        // Verify OTP if provided
        if (req.getOtp() != null && !req.getOtp().trim().isEmpty()) {
            Optional<PasswordResetOtp> otpOpt = otpRepository.findTopByEmailAndOtpCodeAndUsedFalseOrderByExpiryTimeDesc(req.getEmail(), req.getOtp());
            if (otpOpt.isEmpty()) {
                return AuthResponse.builder()
                        .success(false)
                        .message("Invalid OTP code.")
                        .build();
            }

            PasswordResetOtp otpToken = otpOpt.get();
            if (otpToken.getExpiryTime().isBefore(LocalDateTime.now())) {
                return AuthResponse.builder()
                        .success(false)
                        .message("OTP code has expired. Please request a new OTP.")
                        .build();
            }

            otpToken.setUsed(true);
            otpRepository.save(otpToken);
        }

        user.setPassword(req.getNewPassword());
        userRepository.save(user);

        return AuthResponse.builder()
                .success(true)
                .message("Password updated successfully! You can now login with your new password.")
                .user(user)
                .build();
    }
}
