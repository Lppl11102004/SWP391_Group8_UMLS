package com.ulms.book.controller;

import com.ulms.book.dto.AdminAuthorRequest;
import com.ulms.book.dto.AdminAuthorResponse;
import com.ulms.book.service.AdminAuthorService;
import com.ulms.exception.ApiResponse;
import com.ulms.util.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ulms/admin/authors")
@RequiredArgsConstructor
public class AdminAuthorController {

    private final AdminAuthorService adminAuthorService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<AdminAuthorResponse>>> searchAuthors(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<AdminAuthorResponse> response = adminAuthorService.searchAuthors(keyword, page, size);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tải danh sách tác giả thành công", response));
    }

    @GetMapping("/{authorId}")
    public ResponseEntity<ApiResponse<AdminAuthorResponse>> getAuthorById(@PathVariable Integer authorId) {
        AdminAuthorResponse response = adminAuthorService.getAuthorById(authorId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tải chi tiết tác giả thành công", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AdminAuthorResponse>> createAuthor(@RequestBody AdminAuthorRequest request) {
        AdminAuthorResponse response = adminAuthorService.createAuthor(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tạo tác giả mới thành công", response));
    }

    @PutMapping("/{authorId}")
    public ResponseEntity<ApiResponse<AdminAuthorResponse>> updateAuthor(
            @PathVariable Integer authorId,
            @RequestBody AdminAuthorRequest request) {
        AdminAuthorResponse response = adminAuthorService.updateAuthor(authorId, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật tác giả thành công", response));
    }

    @DeleteMapping("/{authorId}")
    public ResponseEntity<ApiResponse<Void>> deleteAuthor(@PathVariable Integer authorId) {
        adminAuthorService.deleteAuthor(authorId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Xóa tác giả thành công", null));
    }
}
