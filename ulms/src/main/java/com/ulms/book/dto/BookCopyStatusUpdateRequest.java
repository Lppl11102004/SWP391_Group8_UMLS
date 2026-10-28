package com.ulms.book.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookCopyStatusUpdateRequest {
    private Byte status;
}
