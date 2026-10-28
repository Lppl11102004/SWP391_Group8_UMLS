package com.ulms.report.dto;

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
public class AdminPaymentReportResponse {
    private Long paymentId;
    private Long userId;
    private String userFullName;
    private String userEmail;
    private Byte paymentType; // 1: FINE, 2: MEMBERSHIP, 3: DEPOSIT, 4: DEPOSIT_REFUND
    private Long borrowRecordId;
    private Long fineId;
    private Short membershipPlanId;
    private String membershipPlanName;
    private BigDecimal amount;
    private Byte paymentMethod; // 1: CASH, 2: VNPAY
    private String txnRef;
    private String gatewayTxnNo;
    private Byte status; // 0: PENDING, 1: SUCCESS, 2: FAILED
    private String note;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
}
