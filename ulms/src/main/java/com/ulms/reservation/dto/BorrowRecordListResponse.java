package com.ulms.reservation.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class BorrowRecordListResponse {
    private Long borrowId;
    private Long userId;
    private String userName;
    private Long librarianId;
    private String librarianName;
    private LocalDateTime borrowDate;
    private LocalDateTime dueDate;
    private BigDecimal depositAmount;
    private Byte extensionCount;
    private Byte status;
    private Byte depositStatus;
    private String note;
    private LocalDateTime createdAt;
}
