package com.ulms.book.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookCopyCreateRequest {
    private String barcode;
    private Integer quantity;
}
