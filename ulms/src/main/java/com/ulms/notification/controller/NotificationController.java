package com.ulms.notification.controller;

import com.ulms.exception.ApiResponse;
import com.ulms.notification.dto.NotificationResponse;
import com.ulms.notification.repository.NotificationRepository;
import com.ulms.notification.service.NotificationService;
import com.ulms.reservation.dto.ReservationListResponse;
import com.ulms.util.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ulms/notification")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    //===================
    // VIEW LIST NOTIFY BY STATUS
    @GetMapping()
    public ResponseEntity<ApiResponse<PageResponse<NotificationResponse>>> viewNotification(
            @RequestParam(name = "type", required = false) Byte type,
            @RequestParam(name = "isRead", required = false) Boolean isRead,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size
    ) {
        PageResponse<NotificationResponse> result = notificationService.getNotification(type, isRead, page, size);
        ApiResponse<PageResponse<NotificationResponse>> response = new ApiResponse<>(
                true,
                result.getContent().isEmpty()?"Danh sách trống":"Tải danh sách thông báo thành công",
                result
        );
        return ResponseEntity.ok(response);
    }
    //===================
    // READ ALL
    @GetMapping("/mark-all")
    public ResponseEntity<ApiResponse<PageResponse<NotificationResponse>>> markAllNotification() {
        PageResponse<NotificationResponse> result = notificationService.readAllNotification();
        ApiResponse<PageResponse<NotificationResponse>> response = new ApiResponse<>(
                true,
                result.getContent().isEmpty()?"Danh sách trống":"Đã đánh dấu tất cả",
                result
        );
        return ResponseEntity.ok(response);
    }
    //==================
    // READ 1
    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> readNotification(
            @PathVariable("id") Long notificationId
    ) {
        notificationService.readOnlyNotification(notificationId);
        ApiResponse<Void> response = new ApiResponse<>(
                true,
                "Đã đánh dấu đã đọc thành công",
                null
        );
        return ResponseEntity.ok(response);
    }
}
