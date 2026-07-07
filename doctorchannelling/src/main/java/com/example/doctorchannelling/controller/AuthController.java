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

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
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
}
 