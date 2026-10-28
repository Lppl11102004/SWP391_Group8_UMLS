package com.ulms.book.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class BookListResponse {
    private Long bookId;
    private String title;
    private BigDecimal price;
    private String coverImageUrl;
    private String description;
    private String categoryName;
    private String publisherName;
}