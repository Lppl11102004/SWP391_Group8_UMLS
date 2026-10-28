package com.ulms.book.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookCopyResponse {
    private Long copyId;
    private Long bookId;
    private String barcode;
    private Byte status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
