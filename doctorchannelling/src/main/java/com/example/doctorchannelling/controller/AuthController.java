package com.example.doctorchannelling.controller;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.doctorchannelling.model.User;
import com.example.doctorchannelling.model.RefreshToken;
import com.example.doctorchannelling.service.AuthService;
import com.example.doctorchannelling.service.RefreshTokenService;
import com.example.doctorchannelling.util.JwtUtil;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;
    
    public AuthController(AuthService authService, JwtUtil jwtUtil, RefreshTokenService refreshTokenService) {
        this.authService = authService;
        this.jwtUtil = jwtUtil;
        this.refreshTokenService = refreshTokenService;
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
            try {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                Map<String, Object> map = mapper.readValue(response, Map.class);
                String token = (String) map.get("token");
                String refreshToken = (String) map.get("refreshToken");
                
                org.springframework.http.ResponseCookie jwtCookie = org.springframework.http.ResponseCookie.from("token", token)
                    .httpOnly(true)
                    .secure(false)
                    .path("/")
                    .maxAge(24 * 60 * 60)
                    .build();
                    
                org.springframework.http.ResponseCookie refreshCookie = org.springframework.http.ResponseCookie.from("refreshToken", refreshToken)
                    .httpOnly(true)
                    .secure(false)
                    .path("/")
                    .maxAge(7 * 24 * 60 * 60)
                    .build();
                
                map.remove("token");
                map.remove("refreshToken");
                
                return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.SET_COOKIE, jwtCookie.toString())
                    .header(org.springframework.http.HttpHeaders.SET_COOKIE, refreshCookie.toString())
                    .body(mapper.writeValueAsString(map));
            } catch (Exception e) {
                return ResponseEntity.internalServerError().body("Error parsing login response");
            }
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

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@org.springframework.web.bind.annotation.CookieValue(name = "refreshToken", required = false) String requestRefreshToken) {
        if (requestRefreshToken == null) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).body("Refresh token cookie is missing");
        }
        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String token = jwtUtil.generateToken(user.getEmailId(), user.getRole());
                    org.springframework.http.ResponseCookie jwtCookie = org.springframework.http.ResponseCookie.from("token", token)
                        .httpOnly(true)
                        .secure(false)
                        .path("/")
                        .maxAge(24 * 60 * 60)
                        .build();
                    return ResponseEntity.ok()
                        .header(org.springframework.http.HttpHeaders.SET_COOKIE, jwtCookie.toString())
                        .body("{\"message\":\"Token refreshed successfully\"}");
                })
                .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        org.springframework.http.ResponseCookie jwtCookie = org.springframework.http.ResponseCookie.from("token", "")
            .httpOnly(true)
            .secure(false)
            .path("/")
            .maxAge(0)
            .build();
        org.springframework.http.ResponseCookie refreshCookie = org.springframework.http.ResponseCookie.from("refreshToken", "")
            .httpOnly(true)
            .secure(false)
            .path("/")
            .maxAge(0)
            .build();
        return ResponseEntity.ok()
            .header(org.springframework.http.HttpHeaders.SET_COOKIE, jwtCookie.toString())
            .header(org.springframework.http.HttpHeaders.SET_COOKIE, refreshCookie.toString())
            .body("{\"message\":\"Logged out successfully\"}");
    }
}
