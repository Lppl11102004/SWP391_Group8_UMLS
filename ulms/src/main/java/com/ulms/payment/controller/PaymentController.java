package com.ulms.payment.controller;

import com.ulms.exception.ApiResponse;
import com.ulms.payment.dto.FineResponse;
import com.ulms.payment.dto.PaymentResponse;
import com.ulms.payment.service.FineService;
import com.ulms.payment.service.PaymentService;
import com.ulms.util.PageResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ulms")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final FineService fineService;

    @GetMapping("/my-fines")
    public ResponseEntity<ApiResponse<PageResponse<FineResponse>>> getListFine(
            @RequestParam(name = "status", required = false) Byte status,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {

        PageResponse<FineResponse> result = fineService.getListFine(status, page, size);
        ApiResponse<PageResponse<FineResponse>> response = new ApiResponse<>(
                true,
                result.getContent().isEmpty()?"Bạn không có khoản nợ nào":"Tải danh sách các khoản nợ thành công",
                result
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my-fines/{id}")
    public ResponseEntity<ApiResponse<FineResponse>> getFineDetail(
            @PathVariable("id") Long fineId,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {

        FineResponse result = fineService.getFineDetail(fineId);
        ApiResponse<FineResponse> response = new ApiResponse<>(
                true,
                "Tải danh sách các khoản nợ thành công",
                result
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/my-fines/{id}")
    public ResponseEntity<ApiResponse<String>> payFine(
            @RequestParam("paymentMethod") Byte paymentMethod,
            @PathVariable("id") Long fineId,
            HttpServletRequest request
    ){
        String result = fineService.purchaseFine(paymentMethod, fineId, request);
        ApiResponse<String> response = new ApiResponse<>(
                true,
                "Xử lý thanh toán khoản nợ thành công",
                result // Đưa link VNPay vào trường data
        );
        return ResponseEntity.ok(response);
    }

    //====================
    // VIEW PAYMENT HISTORY
    @GetMapping("/my-payments")
    public ResponseEntity<ApiResponse<PageResponse<PaymentResponse>>> getPaymentHistory(
            @RequestParam(name = "paymentType", required = false) Byte paymentType,
            @RequestParam(name = "paymentMethod", required = false) Byte paymentMethod,
            @RequestParam(name = "status", required = false) Byte status,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {

        PageResponse<PaymentResponse> result = paymentService.getListPayment(paymentType,paymentMethod,status,page,size);
        ApiResponse<PageResponse<PaymentResponse>> response = new ApiResponse<>(
                true,
                result.getContent().isEmpty() ? "Bạn chưa có giao dịch nào" : "Tải lịch sử giao dịch thành công",
                result
        );
        return ResponseEntity.ok(response);
    }
}
