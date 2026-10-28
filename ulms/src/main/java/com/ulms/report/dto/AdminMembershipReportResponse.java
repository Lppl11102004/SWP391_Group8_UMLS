package com.ulms.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminMembershipReportResponse {
    private Long totalActiveMemberships;
    private Long newMembershipsThisMonth;
    private Long expiringSoon;
    private List<PlanSalesItemResponse> revenueByPlan;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PlanSalesItemResponse {
        private Short planId;
        private String planName;
        private Long activeUserCount;
        private Long soldCount;
        private BigDecimal totalRevenue;
    }
}
