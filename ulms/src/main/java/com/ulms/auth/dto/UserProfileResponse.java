package com.ulms.auth.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.cglib.core.Local;

import java.time.LocalDateTime;

@Getter
@Setter
public class UserProfileResponse {
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private String avatarUrl;
    private String address;
    private Boolean isBlacklisted;
    private String blacklistReason;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
}
