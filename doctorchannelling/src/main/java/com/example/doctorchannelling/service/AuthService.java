package com.example.doctorchannelling.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.doctorchannelling.model.User;
import com.example.doctorchannelling.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final com.example.doctorchannelling.util.JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;

    public AuthService(UserRepository userRepository, EmailService emailService, com.example.doctorchannelling.util.JwtUtil jwtUtil, PasswordEncoder passwordEncoder, RefreshTokenService refreshTokenService) {
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.refreshTokenService = refreshTokenService;
    }

    @Transactional
    public String registerUser(User user) {
        if (user.getEmailId() == null || user.getEmailId().isBlank()) {
            return "Email is required!";
        }
        if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
            return "Password is required!";
        }
        if (user.getRole() == null || user.getRole().isBlank()) {
            return "Role is required!";
        }

        Optional<User> existingUser = userRepository.findByEmailId(user.getEmailId());
        if (existingUser.isPresent()) {
            return "Email already exists!";
        }

        String otp = emailService.generateOTP();
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        user.setVerified(false);
        user.setOtpCodeHash(passwordEncoder.encode(otp));
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
        user.setActive(true);
        user.setFailedLoginAttempts(0);

        userRepository.save(user);
        emailService.sendOTPEmail(user.getEmailId(), otp);

        return "User registered successfully! For testing, your OTP is: " + otp;
    }

    public boolean verifyOTP(String emailId, String inputOtp) {
        Optional<User> userOpt = userRepository.findByEmailId(emailId);

        if (userOpt.isPresent()) {
            User user = userOpt.get();

            if (user.getOtpCodeHash() != null 
                    && passwordEncoder.matches(inputOtp, user.getOtpCodeHash())
                    && user.getOtpExpiry() != null
                    && user.getOtpExpiry().isAfter(LocalDateTime.now())) {
                user.setVerified(true);
                user.setOtpCodeHash(null);
                user.setOtpExpiry(null);
                userRepository.save(user);
                return true;
            }
        }

        return false;
    }

    public String loginUser(String emailId, String password) {
        if (emailId == null || emailId.isBlank()) {
            return "Email is required!";
        }
        if (password == null || password.isBlank()) {
            return "Password is required!";
        }

        Optional<User> userOpt = userRepository.findByEmailId(emailId);
        if (userOpt.isEmpty()) {
            return "Email not found! Please register first.";
        }

        User user = userOpt.get();
        if (!user.isActive()) {
            return "Account is suspended or inactive. Please contact admin.";
        }
        
        if (user.getAccountLockedUntil() != null && user.getAccountLockedUntil().isAfter(LocalDateTime.now())) {
            return "Account is locked due to multiple failed login attempts. Please try again later.";
        }

        if (!user.isVerified()) {
            return "Account not verified! Please verify using the OTP sent to your email.";
        }

        if (passwordEncoder.matches(password, user.getPasswordHash())) {
            user.setFailedLoginAttempts(0);
            user.setAccountLockedUntil(null);
            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);

            String token = jwtUtil.generateToken(user.getEmailId(), user.getRole());
            com.example.doctorchannelling.model.RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getUserId());
            return "{\"token\": \"" + token + "\", \"refreshToken\": \"" + refreshToken.getToken() + "\", \"userId\": " + user.getUserId() + ", \"role\": \"" + user.getRole() + "\"}";
        } else {
            int attempts = (user.getFailedLoginAttempts() == null) ? 0 : user.getFailedLoginAttempts().intValue();
            attempts++;
            user.setFailedLoginAttempts(attempts);
            if (attempts >= 5) {
                user.setAccountLockedUntil(LocalDateTime.now().plusMinutes(15));
            }
            userRepository.save(user);
        }

        return "Invalid password. Please try again.";
    }

    public String resendOTP(String emailId) {
        if (emailId == null || emailId.isBlank()) {
            return "Email is required!";
        }

        Optional<User> userOpt = userRepository.findByEmailId(emailId);
        if (userOpt.isEmpty()) {
            return "Email not found!";
        }

        User user = userOpt.get();
        if (user.isVerified()) {
            return "Account is already verified. No need to resend OTP.";
        }

        String newOtp = emailService.generateOTP();
        user.setOtpCodeHash(passwordEncoder.encode(newOtp));
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));

        userRepository.save(user);
        emailService.sendOTPEmail(user.getEmailId(), newOtp);

        return "A new OTP has been sent to your email.";
    }

    public String forgotPassword(String emailId) {
        if (emailId == null || emailId.isBlank()) {
            return "Email is required!";
        }

        Optional<User> userOpt = userRepository.findByEmailId(emailId);
        if (userOpt.isEmpty()) {
            return "Email not found!";
        }

        User user = userOpt.get();
        if (!user.isActive()) {
            return "Account is suspended or inactive. Please contact admin.";
        }

        String otp = emailService.generateOTP();
        user.setOtpCodeHash(passwordEncoder.encode(otp));
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));

        userRepository.save(user);
        emailService.sendPasswordResetEmail(user.getEmailId(), otp);

        return "A password reset OTP has been sent to your email.";
    }

    public String resetPassword(String emailId, String otp, String newPassword) {
        if (emailId == null || emailId.isBlank()) {
            return "Email is required!";
        }
        if (otp == null || otp.isBlank()) {
            return "OTP is required!";
        }
        if (newPassword == null || newPassword.isBlank()) {
            return "New password is required!";
        }

        Optional<User> userOpt = userRepository.findByEmailId(emailId);
        if (userOpt.isEmpty()) {
            return "Email not found!";
        }

        User user = userOpt.get();

        if (user.getOtpCodeHash() != null 
                && passwordEncoder.matches(otp, user.getOtpCodeHash())
                && user.getOtpExpiry() != null
                && user.getOtpExpiry().isAfter(LocalDateTime.now())) {
            
            user.setPasswordHash(passwordEncoder.encode(newPassword));
            user.setOtpCodeHash(null);
            user.setOtpExpiry(null);
            
            // Optionally, unlock the account if it was locked
            user.setFailedLoginAttempts(0);
            user.setAccountLockedUntil(null);
            
            userRepository.save(user);
            return "Password reset successfully! You can now log in.";
        }

        return "Invalid or expired OTP. Please try again.";
    }
}
