package com.ulms.membership.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminMembershipPlanRequest {
    private String name;
    private BigDecimal price;
    private Integer durationDays;
    private Short depositDiscountPct;
    private BigDecimal maxDepositAmount;
    private BigDecimal freeDepositPriceLimit;
    private String description;
    private Boolean isActive;
}
