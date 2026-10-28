package com.ulms.reservation.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class BorrowDetailResponse {
    private Long detailId;
    private Long borrowId;
    private Long copyId;
    private String barcode;
    private Long bookId;
    private String bookTitle;
    private String coverImageUrl;
    private String authorName;
    private Boolean status;
    private LocalDateTime returnDate;
    private Byte returnStatus;
    private String note;
}
