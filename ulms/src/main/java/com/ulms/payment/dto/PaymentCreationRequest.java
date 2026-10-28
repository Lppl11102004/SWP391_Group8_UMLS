package com.ulms.payment.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentCreationRequest {
    // 2: MEMBERSHIP, 3: DEPOSIT (Cọc mượn sách)
    private Byte paymentType;

    // Nếu là cọc: truyền borrowId
    private Long borrowId;

    // Nếu là mua gói: truyền planId
    private Byte planId;
}
