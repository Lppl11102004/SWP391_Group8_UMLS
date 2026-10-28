package com.ulms.book.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class MyReviewResponse {
    private Long reviewId;
    private String bookTitle;
    private Long bookId;
    private Byte status;
    private Byte rating;
    private String comment;
    private LocalDateTime createdAt;
}
