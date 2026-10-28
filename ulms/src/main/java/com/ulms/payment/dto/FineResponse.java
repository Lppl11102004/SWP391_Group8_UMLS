package com.ulms.payment.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class FineResponse {
    private Long fineId;
    private Long borrowRecordId;
    private Long bookCopyId;
    private String bookTitles;
    private String userName;
    private Long userId;
    private BigDecimal amount;
    private Byte reason;
    private Byte status;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
