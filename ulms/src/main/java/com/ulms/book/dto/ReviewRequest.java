package com.ulms.book.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ReviewRequest {
    private Long bookId;
    private Byte rating;
    private String comment;
}
