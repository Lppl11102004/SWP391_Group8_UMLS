package com.ulms.book.dto;

import com.ulms.book.entity.BookImage;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class BookDetailResponse {
    private Long bookId;
    private String title;
    private BigDecimal price;
    private String isbn;
    private String coverImageUrl;
    private List<BookImage> images;
    private List<String> imageUrls;
    private String description;

    private Integer categoryId;
    private String categoryName;

    private Integer publisherId;
    private String publisherName;
    private Integer publishedYear;

    private Integer authorId;
    private String authorName;
    private String authorBio;
    private String authorAvatarUrl;
    private String avatarUrl;

    public String getAuthorAvatarUrl() {
        return authorAvatarUrl != null ? authorAvatarUrl : avatarUrl;
    }

    public String getAvatarUrl() {
        return avatarUrl != null ? avatarUrl : authorAvatarUrl;
    }

    private Integer totalCopies;
    private Integer availableCopies;
    private Boolean isAvailable;

    private Boolean hasEbook;
    private Long ebookId;
    private Integer ebookTotalPages;

    private BigDecimal averageRating;
    private Integer totalReviews;

    private List<BookListResponse> listRelateBook;
}
