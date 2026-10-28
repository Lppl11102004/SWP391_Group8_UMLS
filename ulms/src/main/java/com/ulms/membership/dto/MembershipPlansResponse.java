package com.ulms.membership.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class MembershipPlansResponse {
    private Short planId;
    private String name;
    private BigDecimal price;
    private Integer durationDays;
    private Short depositDiscountPct;
    private BigDecimal maxDepositAmount;
    private BigDecimal freeDepositPriceLimit;
    private String description;
}
