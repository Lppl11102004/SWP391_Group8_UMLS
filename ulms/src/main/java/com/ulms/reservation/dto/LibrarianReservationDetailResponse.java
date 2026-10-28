package com.ulms.reservation.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LibrarianReservationDetailResponse {
    private Long reservationId;
    private Long userId;
    private String readerName;
    private String readerEmail;
    private String readerPhone;
    private String membershipPlanName;
    private Short depositDiscountPct;
    private Byte status;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
    private LocalDateTime expiresAt;
    private Long borrowRecordId;
    private Byte borrowStatus;
    private Byte depositStatus;
    private BigDecimal depositAmount;
    private List<LibrarianReservationItemResponse> books;
}
