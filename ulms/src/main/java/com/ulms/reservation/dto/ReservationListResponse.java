package com.ulms.reservation.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ReservationListResponse {
    private Long reservationId;
    private Byte status;
    private String note;
    private LocalDateTime createdAt;
}
