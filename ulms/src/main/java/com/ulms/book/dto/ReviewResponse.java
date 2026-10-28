package com.ulms.book.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ReviewResponse {
    private Long reviewId;
    private String reviewerName;
    private Byte rating;
    private String comment;
    private LocalDateTime createdAt;
}
