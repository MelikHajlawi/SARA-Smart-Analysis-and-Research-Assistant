package com.example.sara.service;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.example.sara.model.User;
import com.example.sara.service.RefreshTokenService;

@Service
public class LogoutService {

    private final RefreshTokenService refreshTokenService;
    private final RedisTemplate<String, ?> authRedisTemplate;
    private final RedisTemplate<String, ?> apiTokenRedisTemplate;

    public LogoutService(
            RefreshTokenService refreshTokenService,
            // this bean is your EncryptedPasswordEntry template
            @Qualifier("redisTemplate") RedisTemplate<String, ?> authRedisTemplate,
            // this bean is your ApiTokenEntry template
            @Qualifier("apiTokenRedisTemplate") RedisTemplate<String, ?> apiTokenRedisTemplate) {
        this.refreshTokenService = refreshTokenService;
        this.authRedisTemplate = authRedisTemplate;
        this.apiTokenRedisTemplate = apiTokenRedisTemplate;
    }

    public void logout(User user) {
        Long userId = user.getId();
        String email = user.getEmail();

        // 1) delete refresh token in DB
        refreshTokenService.deleteByUserId(userId);

        // 2) delete redis entries
        String authKey  = "user:" + email + ":auth";
        String tokenKey = "user:" + email + ":token";
        authRedisTemplate.delete(authKey);
        apiTokenRedisTemplate.delete(tokenKey);

        // 3) clear Spring Security context
        SecurityContextHolder.clearContext();
    }
}

