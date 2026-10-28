package com.ulms.auth.controller;

import com.ulms.auth.dto.*;
import com.ulms.auth.service.AdminUserService;
import com.ulms.exception.ApiResponse;
import com.ulms.util.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ulms/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AdminUserResponse>>> searchUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Byte roleId,
            @RequestParam(required = false) Byte status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<AdminUserResponse> response = adminUserService.searchUsers(keyword, roleId, status, page, size);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tải danh sách người dùng thành công", response));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<AdminUserDetailResponse>> getUserDetail(@PathVariable Long userId) {
        AdminUserDetailResponse response = adminUserService.getUserDetail(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tải chi tiết người dùng thành công", response));
    }

    @PostMapping("/librarian")
    public ResponseEntity<ApiResponse<AdminUserResponse>> createLibrarian(@RequestBody CreateLibrarianRequest request) {
        AdminUserResponse response = adminUserService.createLibrarian(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tạo tài khoản thủ thư thành công", response));
    }

    @PatchMapping("/{userId}/status")
    public ResponseEntity<ApiResponse<AdminUserResponse>> updateUserStatus(
            @PathVariable Long userId,
            @RequestBody UpdateUserStatusRequest request) {
        AdminUserResponse response = adminUserService.updateUserStatus(userId, request);
        String msg = (request.getStatus() != null && request.getStatus() == 2)
                ? "Khóa tài khoản người dùng thành công"
                : "Mở khóa tài khoản người dùng thành công";
        return ResponseEntity.ok(new ApiResponse<>(true, msg, response));
    }

    @PatchMapping("/{userId}/role")
    public ResponseEntity<ApiResponse<AdminUserResponse>> updateUserRole(
            @PathVariable Long userId,
            @RequestBody UpdateUserRoleRequest request) {
        AdminUserResponse response = adminUserService.updateUserRole(userId, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật vai trò người dùng thành công", response));
    }

    @PostMapping("/{userId}/reset-password")
    public ResponseEntity<ApiResponse<AdminResetPasswordResponse>> resetUserPassword(@PathVariable Long userId) {
        AdminResetPasswordResponse response = adminUserService.resetUserPassword(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Đặt lại mật khẩu người dùng thành công", response));
    }
}
