package com.ulms.reservation.controller;

import com.ulms.reservation.dto.*;
import com.ulms.reservation.service.LibrarianReservationService;
import com.ulms.exception.ApiResponse;
import com.ulms.util.PageResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ulms/librarian")
@RequiredArgsConstructor
public class LibrarianReservationController {

    private final LibrarianReservationService librarianReservationService;

    @GetMapping("/reservations")
    public ResponseEntity<ApiResponse<PageResponse<LibrarianReservationListResponse>>> getReservations(
            @RequestParam(required = false) Byte status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        PageResponse<LibrarianReservationListResponse> result = librarianReservationService.getReservations(status, keyword, page, size);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách phiếu đặt giữ thành công", result));
    }

    @GetMapping("/reservations/{reservationId}")
    public ResponseEntity<ApiResponse<LibrarianReservationDetailResponse>> getReservationDetail(
            @PathVariable Long reservationId
    ) {
        LibrarianReservationDetailResponse result = librarianReservationService.getReservationDetail(reservationId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy chi tiết phiếu đặt giữ thành công", result));
    }

    @PutMapping("/reservations/{reservationId}/approve")
    public ResponseEntity<ApiResponse<String>> approveReservation(
            @PathVariable Long reservationId
    ) {
        librarianReservationService.approveReservation(reservationId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Duyệt phiếu đặt giữ thành công", null));
    }

    @PutMapping("/reservations/{reservationId}/reject")
    public ResponseEntity<ApiResponse<String>> rejectReservation(
            @PathVariable Long reservationId,
            @RequestBody(required = false) RejectReservationRequest request
    ) {
        librarianReservationService.rejectReservation(reservationId, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Từ chối phiếu đặt giữ thành công", null));
    }

    @GetMapping("/borrow-records")
    public ResponseEntity<ApiResponse<PageResponse<BorrowRecordListResponse>>> getBorrowRecords(
            @RequestParam(required = false) Byte status,
            @RequestParam(required = false) Byte depositStatus,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        PageResponse<BorrowRecordListResponse> result = librarianReservationService.getBorrowRecords(status, depositStatus, keyword, page, size);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách phiếu mượn thành công", result));
    }

    @GetMapping("/borrow-records/{borrowId}")
    public ResponseEntity<ApiResponse<BorrowRecordResponse>> getBorrowRecordDetail(
            @PathVariable Long borrowId
    ) {
        BorrowRecordResponse result = librarianReservationService.getBorrowRecordDetail(borrowId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy chi tiết phiếu mượn thành công", result));
    }

    @PutMapping("/borrow-records/{borrowId}/handover")
    public ResponseEntity<ApiResponse<String>> handoverBooks(
            @PathVariable Long borrowId,
            @RequestBody(required = false) HandoverRequest request
    ) {
        librarianReservationService.handoverBooks(borrowId, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Bàn giao sách cho độc giả thành công", null));
    }

    @PutMapping("/borrow-records/{borrowId}/return")
    public ResponseEntity<ApiResponse<String>> returnBooks(
            @PathVariable Long borrowId,
            @RequestBody(required = false) ReturnBookRequest request
    ) {
        librarianReservationService.returnBooks(borrowId, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tiếp nhận trả sách và hoàn trả tiền cọc thành công", null));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<LibrarianDashboardResponse>> getDashboard() {
        LibrarianDashboardResponse result = librarianReservationService.getDashboardStatistics();
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy số liệu bảng điều khiển thành công", result));
    }

    @PostMapping("/borrow-records/{borrowId}/pay-deposit")
    public ResponseEntity<ApiResponse<String>> payDeposit(
            @PathVariable Long borrowId,
            @RequestParam(defaultValue = "1") Byte paymentMethod,
            HttpServletRequest request
    ) {
        String result = librarianReservationService.payDeposit(borrowId, paymentMethod, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Xử lý nộp tiền cọc thành công", result));
    }
}
