package com.ulms.membership.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "Membership_Plans")
@Getter
@Setter
public class MembershipPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "plan_id")
    private Short planId;

    @Column(name = "name", nullable = false, unique = true, length = 50)
    private String name;

    @Column(name = "price", nullable = false, precision = 12, scale = 2)
    private BigDecimal price = BigDecimal.ZERO;

    @Column(name = "duration_days", nullable = false)
    private Integer durationDays = 30;

    @Column(name = "deposit_discount_pct", nullable = false)
    private Short depositDiscountPct = 0;

    @Column(name = "max_deposit_amount", precision = 12, scale = 2)
    private BigDecimal maxDepositAmount;

    @Column(name = "free_deposit_price_limit", precision = 12, scale = 2)
    private BigDecimal freeDepositPriceLimit;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
