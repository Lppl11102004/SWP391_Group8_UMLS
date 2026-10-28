package com.ulms.payment.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LibrarianFineResponse {
    private Long fineId;
    private Long borrowRecordId;
    private Long userId;
    private String userName;
    private String userEmail;
    private String userPhone;
    private Long bookCopyId;
    private String bookTitle;
    private String barcode;
    private BigDecimal amount;
    private Byte reason;
    private Byte status;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
