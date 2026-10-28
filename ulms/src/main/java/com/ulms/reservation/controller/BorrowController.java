package com.ulms.reservation.controller;

import com.ulms.auth.dto.RegisterRequest;
import com.ulms.book.dto.BookListResponse;
import com.ulms.book.dto.ReviewRequest;
import com.ulms.book.repository.ReviewRepository;
import com.ulms.book.service.ReviewService;
import com.ulms.exception.ApiResponse;
import com.ulms.reservation.dto.*;
import com.ulms.reservation.service.BorrowService;
import com.ulms.reservation.service.ReservationService;
import com.ulms.util.PageResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ulms")
@RequiredArgsConstructor
public class BorrowController {

    private final BorrowService borrowService;
    private final ReservationService reservationService;
    private final ReviewService reviewService;

    //===========================
    // ADD TO CART/ WISHLIST BOOK
    @PostMapping("/add-to-cart")
    public ResponseEntity<ApiResponse> addToCart(
            @RequestBody BorrowCartRequest request
    ) {
        System.out.println("BorrowCartRequest: " + request.getUserId());
        borrowService.createBorrowCart(request);

        ApiResponse<Void> response = new ApiResponse<>(
                true,
                "Thêm thành công thành công",
                null
        );
        return ResponseEntity.ok(response);
    }

    //===========================
    // VIEW CART/ WISHLIST BOOK
    @GetMapping("/add-to-cart")
    public ResponseEntity<ApiResponse<List<BorrowCartResponse>>> viewCart() {
        List<BorrowCartResponse> result = borrowService.viewListBorrowCart();

        ApiResponse<List<BorrowCartResponse>> response = new ApiResponse<>(
                true,
                "Thêm thành công thành công",
                result
        );
        return ResponseEntity.ok(response);
    }

    //===========================
    // DELETE VIEW CART/ WISHLIST BOOK
    @DeleteMapping("/add-to-cart/{id}")
    public ResponseEntity<ApiResponse> deleteCart(
            @PathVariable("id") Long cartId
    ) {
        borrowService.deleteBorrowCart(cartId);
        ApiResponse<List<BorrowCartResponse>> response = new ApiResponse<>(
                true,
                "Xoá thành công thành công",
                null
        );
        return ResponseEntity.ok(response);
    }

    //===========================
    // CRATE RESERVATION
    @PostMapping("/reservation")
    public ResponseEntity<ApiResponse> createReservation(
            @RequestBody ReservationRequest request
    ) {
        System.out.println("BorrowCartRequest: " + request.getUserId());
        reservationService.createReservation(request);

        ApiResponse<Void> response = new ApiResponse<>(
                true,
                "Thêm thành công thành công",
                null
        );
        return ResponseEntity.ok(response);
    }

    //===========================
    // VIEW RESERVATION LIST
    @GetMapping("/reservation")
    public ResponseEntity<ApiResponse<PageResponse<ReservationListResponse>>> viewReservationList(
            @RequestParam(name = "status", required = false) Byte status,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size
    ) {
        PageResponse<ReservationListResponse> result = reservationService.getListReservations(status, page, size);
        ApiResponse<PageResponse<ReservationListResponse>> response = new ApiResponse<>(
                true,
                result.getContent().isEmpty()?"Danh sách trống":"Tải danh sách yêu cầu đặt sách thành công",
                result
        );
        return ResponseEntity.ok(response);
    }

    //===========================
    // CANCEL RESERVATION
    @PutMapping("/reservation/{id}")
    public ResponseEntity<ApiResponse<Void>> cancelReservation(
            @PathVariable("id") Long reservationId
    ) {
        reservationService.cancelReservation(reservationId);
        ApiResponse<Void> response = new ApiResponse<>(
                true,
                "Yêu cầu huỷ Ticket thành công",
                null
        );
        return ResponseEntity.ok(response);
    }

    //===========================
    // VIEW RESERVATION DETAIL
    @GetMapping("/reservation/{id}")
    public ResponseEntity<ApiResponse<ReservationDetailResponse>> getReservationDetail(
            @PathVariable("id") Long reservationId
    ) {
        ReservationDetailResponse result = reservationService.getReservationDetail(reservationId);
        ApiResponse<ReservationDetailResponse> response = new ApiResponse<>(
                true,
                "Tải chỉ tiết Ticket thành công",
                result
        );
        return ResponseEntity.ok(response);
    }

    //===========================
    // VIEW BORROW RECORD LIST
    @GetMapping("/borrow-record")
    public ResponseEntity<ApiResponse<PageResponse<BorrowRecordListResponse>>> viewBorrowRecordList(
            @RequestParam(name = "status", required = false) Byte status,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size
    ) {
        PageResponse<BorrowRecordListResponse> result = borrowService.getListBorrowRecord(status, page, size);
        ApiResponse<PageResponse<BorrowRecordListResponse>> response = new ApiResponse<>(
                true,
                result.getContent().isEmpty()?"Danh sách trống":"Tải lịch sử mượn  sách thành công",
                result
        );
        return ResponseEntity.ok(response);
    }

    //===========================
    // VIEW BORROW RECORD DETAIL
    @GetMapping("/borrow-record/{id}")
    public ResponseEntity<ApiResponse<BorrowRecordResponse>> getBorrowRecordDetail(
            @PathVariable("id") Long borrowRecordId
    ) {
        BorrowRecordResponse result = borrowService.getBorrowRecordDetail(borrowRecordId);
        ApiResponse<BorrowRecordResponse> response = new ApiResponse<>(
                true,
                result == null ?"Thông tin không khả dụng":"Tải chi tiết lịch sử mượn sách sách thành công",
                result
        );
        return ResponseEntity.ok(response);
    }

    //===========================
    // EXTEND BORROW RECORD
    @PutMapping("/borrow-record/{id}/extend")
    public ResponseEntity<ApiResponse<Void>> extendBrrowRecord(
            @PathVariable("id") Long borrowRecordId
    ) {
        borrowService.extendBorrowRecord(borrowRecordId);
        ApiResponse<Void> response = new ApiResponse<>(
                true,
                "Gia hạn thành công",
                null
        );
        return ResponseEntity.ok(response);
    }

    //============================
    // GET LIST BOOK CAN REVIEW BOOK
    @GetMapping("/borrow-record/{id}/review")
    public ResponseEntity<ApiResponse<List<BookListResponse>>> getBookCanReview(
            @PathVariable("id") Long borrowRecordId
    ){
        List<BookListResponse> result = reviewService.getListReview(borrowRecordId);
        ApiResponse<List<BookListResponse>> response = new ApiResponse<>(
                true,
                "Danh sách bạn có thể đánh giá",
                result
        );
        return ResponseEntity.ok(response);
    }

    //============================
    //REVIEW BOOK
    @PostMapping("/borrow-record/{id}/review")
    public ResponseEntity<ApiResponse<Void>> reviewBook(
            @PathVariable("id") Long borrowRecordId,
            @RequestBody List<ReviewRequest> request
    ){
        reviewService.reviewBook(request);

        ApiResponse<Void> response = new ApiResponse<>(
                true,
                "Đánh giá thành công",
                null
        );
        return ResponseEntity.ok(response);
    }

    //============================
    //PAY DEPOSIT RECORD
    @PostMapping("/borrow-record/{id}")
    public ResponseEntity<ApiResponse<String>> payFine(
            @RequestParam("paymentMethod") Byte paymentMethod,
            @PathVariable("id") Long borrowId,
            HttpServletRequest request
    ){
        String result = borrowService.purchaseDepositRecord(paymentMethod, borrowId, request);
        ApiResponse<String> response = new ApiResponse<>(
                true,
                "Xử lý thanh toán tiền cọc thành công",
                result // Đưa link VNPay vào trường data
        );
        return ResponseEntity.ok(response);
    }
}
