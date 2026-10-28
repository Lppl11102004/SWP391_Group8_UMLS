package com.ulms.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUserDetailResponse {
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private String avatarUrl;
    private String address;
    private Byte roleId;
    private String roleName;
    private Byte status;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;

    // Membership info
    private Short membershipPlanId;
    private String membershipPlanName;
    private LocalDateTime membershipStartDate;
    private LocalDateTime membershipEndDate;
    private Boolean isMembershipActive;

    // Activity stats
    private Integer activeBorrowCount;
    private BigDecimal unpaidFineAmount;
    private Boolean isBlacklisted;
    private String blacklistReason;
}
