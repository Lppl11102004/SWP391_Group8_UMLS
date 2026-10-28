package com.ulms.reservation.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LibrarianReservationItemResponse {
    private Long reservationDetailId;
    private Long bookId;
    private String title;
    private String coverImageUrl;
    private String authorName;
    private BigDecimal price;
    private Integer availableCopies;
    private Boolean isAvailable;
    private String assignedBarcode;
}
