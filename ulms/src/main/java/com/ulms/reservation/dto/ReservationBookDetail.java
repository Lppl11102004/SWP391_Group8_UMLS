package com.ulms.reservation.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReservationBookDetail {
    private Long reservationDetailId;
    private Long bookId;
    private String bookTitle;
    private String coverImageUrl;
    private String authorName;
}
