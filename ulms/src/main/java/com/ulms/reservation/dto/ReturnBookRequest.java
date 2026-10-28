package com.ulms.reservation.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReturnBookRequest {
    private String note;
    private List<CopyReturnItemRequest> items;
}
