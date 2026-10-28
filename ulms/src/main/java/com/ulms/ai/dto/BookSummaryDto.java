package com.ulms.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookSummaryDto {
    private Long bookId;
    private String title;
    private String authorName;
    private String categoryName;
    private String coverImageUrl;
    private BigDecimal price;
    private String shortDescription;
}
