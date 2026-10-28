package com.ulms.membership.controller;

import com.ulms.exception.ApiResponse;
import com.ulms.membership.dto.AdminSettingRequest;
import com.ulms.membership.dto.AdminSettingResponse;
import com.ulms.membership.dto.AdminSettingUpdateRequest;
import com.ulms.membership.service.AdminSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ulms/admin/settings")
@RequiredArgsConstructor
public class AdminSettingController {

    private final AdminSettingService adminSettingService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminSettingResponse>>> getAllSettings() {
        List<AdminSettingResponse> list = adminSettingService.getAllSettings();
        return ResponseEntity.ok(new ApiResponse<>(true, "Tải danh sách cấu hình hệ thống thành công", list));
    }

    @GetMapping("/{settingId}")
    public ResponseEntity<ApiResponse<AdminSettingResponse>> getSettingById(@PathVariable Integer settingId) {
        AdminSettingResponse response = adminSettingService.getSettingById(settingId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tải chi tiết cấu hình thành công", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminSettingResponse>> createSetting(@RequestBody AdminSettingRequest request) {
        AdminSettingResponse response = adminSettingService.createSetting(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tạo cấu hình mới thành công", response));
    }

    @PutMapping("/{settingId}")
    public ResponseEntity<ApiResponse<AdminSettingResponse>> updateSetting(
            @PathVariable Integer settingId,
            @RequestBody AdminSettingUpdateRequest request) {
        AdminSettingResponse response = adminSettingService.updateSetting(settingId, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật cấu hình thành công", response));
    }
}
