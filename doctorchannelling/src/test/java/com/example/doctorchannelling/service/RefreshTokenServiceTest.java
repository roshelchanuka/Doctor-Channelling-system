package com.example.doctorchannelling.service;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.doctorchannelling.model.RefreshToken;
import com.example.doctorchannelling.model.User;
import com.example.doctorchannelling.repository.RefreshTokenRepository;
import com.example.doctorchannelling.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private UserRepository userRepository;

    private RefreshTokenService refreshTokenService;

    @BeforeEach
    void setUp() {
        refreshTokenService = new RefreshTokenService(refreshTokenRepository, userRepository);
    }

    @Test
    void createRefreshTokenShouldUpdateExistingRefreshTokenInsteadOfCreatingDuplicateRow() {
        Integer userId = 13;
        User user = new User();
        user.setUserId(userId);

        RefreshToken existing = new RefreshToken();
        existing.setId(1);
        existing.setUser(user);
        existing.setToken("old-token");
        existing.setExpiryDate(Instant.now().minusSeconds(100));

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(refreshTokenRepository.findByUser(user)).thenReturn(Optional.of(existing));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RefreshToken result = refreshTokenService.createRefreshToken(userId);

        assertNotNull(result);
        assertSame(existing, result);
        assertNotEquals("old-token", existing.getToken());
        verify(refreshTokenRepository, never()).deleteByUser(any(User.class));
    }
}
