package com.ulms.book.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LibrarianBookListResponse {
    private Long bookId;
    private String title;
    private String isbn;
    private String coverImageUrl;
    private BigDecimal price;
    private Integer publishedYear;
    private String authorName;
    private String authorAvatarUrl;
    private String avatarUrl;
    private String publisherName;
    private String categoryName;
    private Boolean status;
    private Integer totalCopies;
    private Integer availableCopies;
    private Integer borrowedCopies;
    private Boolean hasEBook;

    public String getAuthorAvatarUrl() {
        return authorAvatarUrl != null ? authorAvatarUrl : avatarUrl;
    }

    public String getAvatarUrl() {
        return avatarUrl != null ? avatarUrl : authorAvatarUrl;
    }
    private LocalDateTime createdAt;
}
