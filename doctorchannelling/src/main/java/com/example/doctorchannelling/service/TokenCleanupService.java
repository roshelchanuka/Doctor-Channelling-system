package com.example.doctorchannelling.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.example.doctorchannelling.repository.TokenBlacklistRepository;

import java.time.LocalDateTime;

@Service
public class TokenCleanupService {

    private final TokenBlacklistRepository tokenBlacklistRepository;

    public TokenCleanupService(TokenBlacklistRepository tokenBlacklistRepository) {
        this.tokenBlacklistRepository = tokenBlacklistRepository;
    }

    // Run every hour
    @Scheduled(fixedRate = 3600000)
    public void cleanupExpiredTokens() {
        tokenBlacklistRepository.deleteAllExpiredSince(LocalDateTime.now());
        System.out.println("Cleaned up expired blacklisted tokens at " + LocalDateTime.now());
    }
}
