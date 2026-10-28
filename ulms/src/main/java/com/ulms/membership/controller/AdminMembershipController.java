package com.ulms.membership.controller;

import com.ulms.exception.ApiResponse;
import com.ulms.membership.dto.AdminMembershipPlanRequest;
import com.ulms.membership.dto.AdminMembershipPlanResponse;
import com.ulms.membership.service.AdminMembershipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ulms/admin/membership-plans")
@RequiredArgsConstructor
public class AdminMembershipController {

    private final AdminMembershipService adminMembershipService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminMembershipPlanResponse>>> getAllPlans() {
        List<AdminMembershipPlanResponse> list = adminMembershipService.getAllPlans();
        return ResponseEntity.ok(new ApiResponse<>(true, "Tải danh sách gói hội viên thành công", list));
    }

    @GetMapping("/{planId}")
    public ResponseEntity<ApiResponse<AdminMembershipPlanResponse>> getPlanById(@PathVariable Short planId) {
        AdminMembershipPlanResponse response = adminMembershipService.getPlanById(planId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tải chi tiết gói hội viên thành công", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminMembershipPlanResponse>> createPlan(@RequestBody AdminMembershipPlanRequest request) {
        AdminMembershipPlanResponse response = adminMembershipService.createPlan(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tạo gói hội viên mới thành công", response));
    }

    @PutMapping("/{planId}")
    public ResponseEntity<ApiResponse<AdminMembershipPlanResponse>> updatePlan(
            @PathVariable Short planId,
            @RequestBody AdminMembershipPlanRequest request) {
        AdminMembershipPlanResponse response = adminMembershipService.updatePlan(planId, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật gói hội viên thành công", response));
    }

    @PatchMapping("/{planId}/toggle-active")
    public ResponseEntity<ApiResponse<AdminMembershipPlanResponse>> toggleActive(@PathVariable Short planId) {
        AdminMembershipPlanResponse response = adminMembershipService.toggleActive(planId);
        String msg = Boolean.TRUE.equals(response.getIsActive()) ? "Kích hoạt gói hội viên thành công" : "Ẩn gói hội viên thành công";
        return ResponseEntity.ok(new ApiResponse<>(true, msg, response));
    }
}
