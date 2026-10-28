package com.ulms.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentCallbackResponse {
    private boolean success;
    private String txnRef;
    private String message;
    private String responseCode;
    private Byte paymentType;

    public PaymentCallbackResponse(boolean success, String txnRef, String message, String responseCode) {
        this.success = success;
        this.txnRef = txnRef;
        this.message = message;
        this.responseCode = responseCode;
    }
}
