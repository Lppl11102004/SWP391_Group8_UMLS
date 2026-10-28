package com.ulms.book.dto;

import com.ulms.util.PageRequest;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class BookSearchRequest extends PageRequest {

    // Chỉ giữ lại các trường lọc & search:
    private String keyword; // Tìm theo: title, isbn, author name, publisher name
    private Integer categoryId;
    private Integer authorId;
    private Integer publisherId;
    private Integer fromYear;
    private Integer toYear;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;

    // Sắp xếp
    private String sortBy = "createdAt";
    private String sortDir = "DESC";
}