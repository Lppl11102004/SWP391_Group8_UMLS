package com.ulms.payment.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateFineRequest {
    private Long borrowId;
    private Long userId;
    private Long copyId;
    private BigDecimal amount;
    private Byte reason; // 1: OVERDUE, 2: DAMAGED, 3: LOST
    private String note;
}
