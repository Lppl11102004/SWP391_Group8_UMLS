package com.ulms.payment.controller;

import com.ulms.exception.ApiResponse;
import com.ulms.payment.dto.CreateFineRequest;
import com.ulms.payment.dto.LibrarianFineResponse;
import com.ulms.payment.dto.WaiveFineRequest;
import com.ulms.payment.service.LibrarianFineService;
import com.ulms.payment.service.FineService;
import jakarta.servlet.http.HttpServletRequest;
import com.ulms.util.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ulms/librarian/fines")
@RequiredArgsConstructor
public class LibrarianFineController {

    private final LibrarianFineService librarianFineService;
    private final FineService fineService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<LibrarianFineResponse>>> getFines(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Byte status,
            @RequestParam(required = false) Byte reason,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        PageResponse<LibrarianFineResponse> result = librarianFineService.getFines(userId, status, reason, keyword, page, size);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách khoản phạt thành công", result));
    }

    @GetMapping("/{fineId}")
    public ResponseEntity<ApiResponse<LibrarianFineResponse>> getFineDetail(
            @PathVariable Long fineId
    ) {
        LibrarianFineResponse result = librarianFineService.getFineDetail(fineId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy chi tiết khoản phạt thành công", result));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<String>> createFine(
            @RequestBody CreateFineRequest request
    ) {
        librarianFineService.createFine(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tạo khoản phạt thành công", null));
    }

    @PostMapping("/{fineId}/pay-cash")
    public ResponseEntity<ApiResponse<String>> payCashFine(
            @PathVariable Long fineId
    ) {
        librarianFineService.payCashFine(fineId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Ghi nhận thu tiền phạt tại quầy thành công", null));
    }

    @PostMapping("/{fineId}/pay")
    public ResponseEntity<ApiResponse<String>> payFine(
            @PathVariable Long fineId,
            @RequestParam(defaultValue = "1") Byte paymentMethod,
            HttpServletRequest request
    ) {
        if (paymentMethod == 1) {
            librarianFineService.payCashFine(fineId);
            return ResponseEntity.ok(new ApiResponse<>(true, "Ghi nhận thu tiền phạt bằng tiền mặt thành công", null));
        } else {
            String vnpayUrl = fineService.purchaseFine((byte) 2, fineId, request);
            return ResponseEntity.ok(new ApiResponse<>(true, "Tạo liên kết thanh toán VNPay thành công", vnpayUrl));
        }
    }

    @PutMapping("/{fineId}/waive")
    public ResponseEntity<ApiResponse<String>> waiveFine(
            @PathVariable Long fineId,
            @RequestBody(required = false) WaiveFineRequest request
    ) {
        librarianFineService.waiveFine(fineId, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Miễn giảm khoản phạt thành công", null));
    }

    @PostMapping("/scan-overdue")
    public ResponseEntity<ApiResponse<String>> triggerScanOverdue() {
        librarianFineService.autoScanOverdueBorrowRecords();
        return ResponseEntity.ok(new ApiResponse<>(true, "Kích hoạt quét sách quá hạn thành công", null));
    }
}
