package com.ulms.book.controller;

import com.ulms.book.dto.AdminCategoryRequest;
import com.ulms.book.dto.AdminCategoryResponse;
import com.ulms.book.service.AdminCategoryService;
import com.ulms.exception.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ulms/admin/categories")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final AdminCategoryService adminCategoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminCategoryResponse>>> getAllCategories() {
        List<AdminCategoryResponse> list = adminCategoryService.getAllCategories();
        return ResponseEntity.ok(new ApiResponse<>(true, "Tải danh sách thể loại thành công", list));
    }

    @GetMapping("/{categoryId}")
    public ResponseEntity<ApiResponse<AdminCategoryResponse>> getCategoryById(@PathVariable Integer categoryId) {
        AdminCategoryResponse response = adminCategoryService.getCategoryById(categoryId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tải chi tiết thể loại thành công", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminCategoryResponse>> createCategory(@RequestBody AdminCategoryRequest request) {
        AdminCategoryResponse response = adminCategoryService.createCategory(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tạo thể loại mới thành công", response));
    }

    @PutMapping("/{categoryId}")
    public ResponseEntity<ApiResponse<AdminCategoryResponse>> updateCategory(
            @PathVariable Integer categoryId,
            @RequestBody AdminCategoryRequest request) {
        AdminCategoryResponse response = adminCategoryService.updateCategory(categoryId, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật thể loại thành công", response));
    }

    @DeleteMapping("/{categoryId}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Integer categoryId) {
        adminCategoryService.deleteCategory(categoryId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Xóa thể loại thành công", null));
    }
}
