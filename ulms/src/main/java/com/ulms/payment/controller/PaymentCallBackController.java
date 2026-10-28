package com.ulms.payment.controller;

import com.ulms.exception.ApiResponse;
import com.ulms.payment.dto.PaymentCallbackResponse;
import com.ulms.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentCallBackController {

    private final PaymentService paymentService;

    // Endpoint nhận link callback từ VNPay
    @GetMapping("/vnpay-callback")
    public ResponseEntity<ApiResponse<PaymentCallbackResponse>> handleVNPayCallback(
            @RequestParam Map<String, String> queryParams,
            @org.springframework.web.bind.annotation.RequestHeader(value = "Accept", required = false) String acceptHeader,
            jakarta.servlet.http.HttpServletResponse response
    ) throws java.io.IOException {
        // Chuyển toàn bộ queryParams sang Service xử lý và lưu CSDL
        PaymentCallbackResponse result = paymentService.handleCallback(queryParams);

        // Nếu trình duyệt người dùng truy cập trực tiếp (Accept text/html)
        if (acceptHeader != null && acceptHeader.contains("text/html")) {
            String redirectUrl = "http://localhost:3000/payment/callback?"
                    + "txnRef=" + (result.getTxnRef() != null ? result.getTxnRef() : "")
                    + "&responseCode=" + (result.getResponseCode() != null ? result.getResponseCode() : "")
                    + "&success=" + result.isSuccess()
                    + "&paymentType=" + (result.getPaymentType() != null ? result.getPaymentType() : "")
                    + "&message=" + java.net.URLEncoder.encode(result.getMessage() != null ? result.getMessage() : "", java.nio.charset.StandardCharsets.UTF_8);
            response.sendRedirect(redirectUrl);
            return null;
        }

        // Nếu FE gọi ngầm qua Axios / REST client
        if (result.isSuccess()) {
            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    "Thanh toán giao dịch #" + result.getTxnRef() + " thành công!",
                    result
            ));
        } else {
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    false,
                    "Giao dịch #" + result.getTxnRef() + " thất bại hoặc bị hủy",
                    result
            ));
        }
    }

    // Endpoint chủ động tra cứu và đồng bộ trạng thái từ VNPay (QueryDR)
    @PostMapping("/sync/{txnRef}")
    public ResponseEntity<ApiResponse<PaymentCallbackResponse>> syncPaymentStatus(
            @PathVariable("txnRef") String txnRef,
            jakarta.servlet.http.HttpServletRequest request
    ) {
        PaymentCallbackResponse result = paymentService.syncPayment(txnRef, request);
        if (result.isSuccess()) {
            return ResponseEntity.ok(new ApiResponse<>(
                    true,
                    result.getMessage(),
                    result
            ));
        } else {
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                    false,
                    result.getMessage(),
                    result
            ));
        }
    }
}
