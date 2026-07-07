package com.example.doctorchannelling.config;

import java.time.LocalDateTime;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.doctorchannelling.model.User;
import com.example.doctorchannelling.repository.UserRepository;

/**
 * DataSeeder - Application startup এ test users automatically insert කරයි.
 * Already exist කරන emails skip කරයි, එබැවින් safe to run multiple times.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUser("admin@docChannel.com",  "Admin@123",   "Admin");
        seedUser("doctor@docChannel.com", "Doctor@123",  "Doctor");
        seedUser("patient@docChannel.com","Patient@123", "Patient");

        System.out.println("\n====================================================");
        System.out.println("  TEST ACCOUNTS (Doctor Channelling System)");
        System.out.println("====================================================");
        System.out.println("  ADMIN   : admin@docChannel.com   / Admin@123");
        System.out.println("  DOCTOR  : doctor@docChannel.com  / Doctor@123");
        System.out.println("  PATIENT : patient@docChannel.com / Patient@123");
        System.out.println("====================================================\n");
    }

    private void seedUser(String email, String rawPassword, String role) {
        if (userRepository.findByEmailId(email).isPresent()) {
            System.out.println("[DataSeeder] Skipped (already exists): " + email);
            return;
        }

        User user = new User();
        user.setEmailId(email);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        user.setVerified(true);       // OTP verification bypass - test user
        user.setActive(true);
        user.setFailedLoginAttempts(0);
        user.setCreatedAt(LocalDateTime.now());

        userRepository.save(user);
        System.out.println("[DataSeeder] Created test user: " + email + " [" + role + "]");
    }
}
