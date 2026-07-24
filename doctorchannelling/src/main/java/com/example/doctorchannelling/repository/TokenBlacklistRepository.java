package com.example.doctorchannelling.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.doctorchannelling.model.TokenBlacklist;

import jakarta.transaction.Transactional;
import java.time.LocalDateTime;

@Repository
public interface TokenBlacklistRepository extends JpaRepository<TokenBlacklist, String> {
    
    @Modifying
    @Transactional
    @Query("DELETE FROM TokenBlacklist t WHERE t.expiryDate < :now")
    void deleteAllExpiredSince(LocalDateTime now);
}
