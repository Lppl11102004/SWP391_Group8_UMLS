package com.ulms.book.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookUpdateRequest {
    private String title;
    private Integer authorId;
    private Integer publisherId;
    private Integer categoryId;
    private Integer publishedYear;
    private String description;
    private String coverImageUrl;
    private BigDecimal price;
    private Boolean status;
    private java.util.List<String> imageUrls;
}
