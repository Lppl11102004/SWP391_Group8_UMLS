package com.ulms.reservation.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LibrarianReservationListResponse {
    private Long reservationId;
    private Long userId;
    private String readerName;
    private String readerEmail;
    private String readerPhone;
    private Byte status;
    private Integer totalBooks;
    private Integer availableBooks;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
    private LocalDateTime expiresAt;
}
