package com.ulms.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminTopBookResponse {
    private Long bookId;
    private String title;
    private String isbn;
    private String authorName;
    private String categoryName;
    private Long borrowCount;
}
