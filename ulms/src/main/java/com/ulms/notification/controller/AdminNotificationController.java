package com.ulms.notification.controller;

import com.ulms.exception.ApiResponse;
import com.ulms.notification.dto.AdminNotificationHistoryResponse;
import com.ulms.notification.dto.BroadcastNotificationRequest;
import com.ulms.notification.dto.BroadcastNotificationResponse;
import com.ulms.notification.service.AdminNotificationService;
import com.ulms.util.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ulms/admin/notifications")
@RequiredArgsConstructor
public class AdminNotificationController {

    private final AdminNotificationService adminNotificationService;

    @PostMapping("/broadcast")
    public ResponseEntity<ApiResponse<BroadcastNotificationResponse>> broadcastNotification(
            @RequestBody BroadcastNotificationRequest request) {
        BroadcastNotificationResponse response = adminNotificationService.broadcastNotification(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Gửi thông báo hàng loạt thành công đến " + response.getSentCount() + " người dùng", response));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<PageResponse<AdminNotificationHistoryResponse>>> getNotificationHistory(
            @RequestParam(required = false) Byte type,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<AdminNotificationHistoryResponse> response = adminNotificationService.getNotificationHistory(type, keyword, page, size);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tải lịch sử thông báo thành công", response));
    }
}
