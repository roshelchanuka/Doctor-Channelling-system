package com.example.doctorchannelling.util;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    // The secret key must be at least 32 characters long. In a real application, this should be stored securely.
    @Value("${jwt.secret}")
    private String secretKey;
    
    private final long JWT_EXPIRATION_MS = 86400000; // 24 hours (in milliseconds)

    private SecretKey getSigningKey() {
        byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    //1. Generating a JWT token when the user logs in
    public String generateToken(String emailId, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);

        return Jwts.builder()
                .claims(claims)
                .subject(emailId)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION_MS))
                .signWith(getSigningKey())
                .compact();
    }

    // 2. Getting the expiration time in milliseconds for AuthService
    public long getExpirationTimeMs() {
        return JWT_EXPIRATION_MS;
    }

    // Newly added METHODS (for JwtFilter)
   

    //3. Getting the Username (Email ID) from within the token
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }
    

    // 4. Getting the Expiration date from within the token
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }


    //5. The common method used to read any data (Claim) contained within the token
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }
    

    // 6. Getting all claims from within the token
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }


    // 7. Check if the token has expired
    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }


    // 8. Validate the token (Check if it's valid) (Used in JwtFilter)
    public Boolean validateToken(String token, String emailId) {
        final String username = extractUsername(token);
        return (username.equals(emailId) && !isTokenExpired(token));
    }
}