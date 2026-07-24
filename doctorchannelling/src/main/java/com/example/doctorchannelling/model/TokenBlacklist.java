package com.example.doctorchannelling.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "TokenBlacklist")
public class TokenBlacklist {

    @Id
    @Column(name = "Token", length = 512, nullable = false)
    private String token;

    @Column(name = "ExpiryDate", nullable = false)
    private LocalDateTime expiryDate;

    public TokenBlacklist() {
    }

    public TokenBlacklist(String token, LocalDateTime expiryDate) {
        this.token = token;
        this.expiryDate = expiryDate;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public LocalDateTime getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDateTime expiryDate) {
        this.expiryDate = expiryDate;
    }
}
