package com.ulms.membership.dto;

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
public class AdminMembershipPlanResponse {
    private Short planId;
    private String name;
    private BigDecimal price;
    private Integer durationDays;
    private Short depositDiscountPct;
    private BigDecimal maxDepositAmount;
    private BigDecimal freeDepositPriceLimit;
    private String description;
    private Boolean isActive;
    private Long activeUserCount;
    private BigDecimal totalRevenue;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
