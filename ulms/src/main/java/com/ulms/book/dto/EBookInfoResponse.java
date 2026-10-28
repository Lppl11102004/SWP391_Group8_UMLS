package com.ulms.book.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EBookInfoResponse {
    private Long ebookId;
    private Long bookId;
    private String title;
    private String authorName;
    private String coverImageUrl;
    private Integer totalPages;
    private Integer lastReadPage;
}
