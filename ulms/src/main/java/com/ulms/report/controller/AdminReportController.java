package com.ulms.report.controller;

import com.ulms.exception.ApiResponse;
import com.ulms.report.dto.*;
import com.ulms.report.service.AdminReportService;
import com.ulms.util.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/ulms/admin")
@RequiredArgsConstructor
public class AdminReportController {

    private final AdminReportService adminReportService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getDashboard() {
        AdminDashboardResponse response = adminReportService.getDashboard();
        return ResponseEntity.ok(new ApiResponse<>(true, "Tải dữ liệu bảng điều khiển quản trị thành công", response));
    }

    @GetMapping("/reports/payments")
    public ResponseEntity<ApiResponse<PageResponse<AdminPaymentReportResponse>>> getPaymentReport(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Byte paymentType,
            @RequestParam(required = false) Byte paymentMethod,
            @RequestParam(required = false) Byte status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<AdminPaymentReportResponse> response = adminReportService.getPaymentReport(
                userId, paymentType, paymentMethod, status, fromDate, toDate, keyword, page, size
        );
        return ResponseEntity.ok(new ApiResponse<>(true, "Tải báo cáo thanh toán thành công", response));
    }

    @GetMapping("/reports/top-books")
    public ResponseEntity<ApiResponse<List<AdminTopBookResponse>>> getTopBorrowedBooks(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            @RequestParam(defaultValue = "10") int limit) {
        List<AdminTopBookResponse> response = adminReportService.getTopBorrowedBooks(fromDate, toDate, limit);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tải danh sách sách được mượn nhiều nhất thành công", response));
    }

    @GetMapping("/reports/memberships")
    public ResponseEntity<ApiResponse<AdminMembershipReportResponse>> getMembershipReport() {
        AdminMembershipReportResponse response = adminReportService.getMembershipReport();
        return ResponseEntity.ok(new ApiResponse<>(true, "Tải báo cáo hội viên thành công", response));
    }
}
