package com.ulms.book.controller;

import com.ulms.book.dto.AdminPublisherRequest;
import com.ulms.book.dto.AdminPublisherResponse;
import com.ulms.book.service.AdminPublisherService;
import com.ulms.exception.ApiResponse;
import com.ulms.util.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ulms/admin/publishers")
@RequiredArgsConstructor
public class AdminPublisherController {

    private final AdminPublisherService adminPublisherService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AdminPublisherResponse>>> searchPublishers(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<AdminPublisherResponse> response = adminPublisherService.searchPublishers(keyword, page, size);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tải danh sách nhà xuất bản thành công", response));
    }

    @GetMapping("/{publisherId}")
    public ResponseEntity<ApiResponse<AdminPublisherResponse>> getPublisherById(@PathVariable Integer publisherId) {
        AdminPublisherResponse response = adminPublisherService.getPublisherById(publisherId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tải chi tiết nhà xuất bản thành công", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminPublisherResponse>> createPublisher(@RequestBody AdminPublisherRequest request) {
        AdminPublisherResponse response = adminPublisherService.createPublisher(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tạo nhà xuất bản mới thành công", response));
    }

    @PutMapping("/{publisherId}")
    public ResponseEntity<ApiResponse<AdminPublisherResponse>> updatePublisher(
            @PathVariable Integer publisherId,
            @RequestBody AdminPublisherRequest request) {
        AdminPublisherResponse response = adminPublisherService.updatePublisher(publisherId, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật nhà xuất bản thành công", response));
    }

    @DeleteMapping("/{publisherId}")
    public ResponseEntity<ApiResponse<Void>> deletePublisher(@PathVariable Integer publisherId) {
        adminPublisherService.deletePublisher(publisherId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Xóa nhà xuất bản thành công", null));
    }
}
