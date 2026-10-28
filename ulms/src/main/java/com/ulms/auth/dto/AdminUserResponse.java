package com.ulms.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUserResponse {
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private String avatarUrl;
    private Byte roleId;
    private String roleName;
    private Byte status;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
}
