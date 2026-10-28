package com.ulms.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardResponse {
    // User KPIs
    private Long totalUsers;
    private Long newUsersThisMonth;
    private Long activeLibrarians;
    private Long activeMembers;
    private Integer blacklistedUsers;

    // Book & Borrow KPIs
    private Long totalBooks;
    private Long totalBookCopies;
    private Integer activeBorrows;
    private Integer overdueCount;
    private Integer pendingReservations;

    // Revenue KPIs
    private BigDecimal totalRevenueThisMonth;
    private BigDecimal fineRevenueThisMonth;
    private BigDecimal membershipRevenueThisMonth;
}
