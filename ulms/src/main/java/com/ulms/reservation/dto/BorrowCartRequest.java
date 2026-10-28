package com.ulms.reservation.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BorrowCartRequest {
    private Long userId;
    private Long bookId;
}
