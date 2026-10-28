package com.ulms.reservation.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CopyReturnItemRequest {
    private Long copyId;
    private Byte returnStatus; // 1: GOOD, 2: DAMAGED, 3: LOST
    private BigDecimal fineAmount;
    private String damageNote;
}
