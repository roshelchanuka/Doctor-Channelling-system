package com.example.doctorchannelling.controller;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.doctorchannelling.model.User;
import com.example.doctorchannelling.service.AuthService;
import com.example.doctorchannelling.repository.TokenBlacklistRepository;
import com.example.doctorchannelling.model.TokenBlacklist;
import com.example.doctorchannelling.util.JwtUtil;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.Date;
import java.time.ZoneId;
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final TokenBlacklistRepository tokenBlacklistRepository;
    private final JwtUtil jwtUtil;
    
    public AuthController(AuthService authService, TokenBlacklistRepository tokenBlacklistRepository, JwtUtil jwtUtil) {
        this.authService = authService;
        this.tokenBlacklistRepository = tokenBlacklistRepository;
        this.jwtUtil = jwtUtil;
    }
    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody User user) {
        String result = authService.registerUser(user);
        if (result.contains("successfully")) {
            return ResponseEntity.ok(result);
        }
        return ResponseEntity.badRequest().body(result);
    }
    @PostMapping("/verify")
    public ResponseEntity<String> verifyOTP(@RequestBody Map<String, String> request) {
        String emailId = request.get("emailId");
        String otpCode = request.get("otpCode");
        boolean isVerified = authService.verifyOTP(emailId, otpCode);
        if (isVerified) {
            return ResponseEntity.ok("Account verified successfully! You can now log in.");
        }
        return ResponseEntity.badRequest().body("Invalid or expired OTP. Please try again.");
    }
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody Map<String, String> request) {
        String emailId = request.get("emailId");
        String password = request.get("password");
        String response = authService.loginUser(emailId, password);
        if (response.contains("token")) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }
    @PostMapping("/resend-otp")
    public ResponseEntity<String> resendOTP(@RequestBody Map<String, String> request) {
        String emailId = request.get("emailId");
        String response = authService.resendOTP(emailId);
        if (response.contains("sent to your email")) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody Map<String, String> request) {
        String emailId = request.get("emailId");
        String response = authService.forgotPassword(emailId);
        if (response.contains("sent to your email")) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody Map<String, String> request) {
        String emailId = request.get("emailId");
        String otpCode = request.get("otpCode");
        String newPassword = request.get("newPassword");
        String response = authService.resetPassword(emailId, otpCode, newPassword);
        if (response.contains("successfully")) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.badRequest().body(response);
    }
    
    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletRequest request) {
        String authorizationHeader = request.getHeader("Authorization");
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String jwt = authorizationHeader.substring(7);
            try {
                Date expiration = jwtUtil.extractExpiration(jwt);
                LocalDateTime expiryDate = LocalDateTime.ofInstant(expiration.toInstant(), ZoneId.systemDefault());
                TokenBlacklist blacklistedToken = new TokenBlacklist(jwt, expiryDate);
                tokenBlacklistRepository.save(blacklistedToken);
                return ResponseEntity.ok("Logged out successfully");
            } catch (Exception e) {
                return ResponseEntity.badRequest().body("Invalid token");
            }
        }
        return ResponseEntity.badRequest().body("No token provided");
    }
}
