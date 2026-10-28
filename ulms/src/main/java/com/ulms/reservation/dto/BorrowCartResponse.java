package com.ulms.reservation.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class BorrowCartResponse {
    private Long cartId;
    private Long bookId;
    private String title;
    private String coverImageUrl;
    private BigDecimal price;
    private Boolean available;
}
