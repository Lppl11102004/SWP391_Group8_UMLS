package com.ulms.payment.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class PaymentResponse {
    private Long paymentId;
    private String txnRef;
    private Byte status;
    private LocalDateTime paidAt;
    private Byte paymentMethod;
    private BigDecimal amount;
    private String bankCode;
    private Byte paymentType;
    private String note;
    private LocalDateTime createdAt;
}
