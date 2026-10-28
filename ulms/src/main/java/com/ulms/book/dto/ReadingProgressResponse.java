package com.ulms.book.dto;

import lombok.*;
import java.time.LocalDateTime;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReadingProgressResponse {
    private Long ebookId;
    private Long bookId;
    private String bookTitle;
    private String authorName;
    private String coverImageUrl;
    private Integer currentPage;    // Trang đang đọc
    private Integer totalPages;     // Tổng số trang của sách
    private Double progressPercent; // Phần trăm đã đọc (ví dụ: 45.5%)
    private LocalDateTime lastReadAt;
}
