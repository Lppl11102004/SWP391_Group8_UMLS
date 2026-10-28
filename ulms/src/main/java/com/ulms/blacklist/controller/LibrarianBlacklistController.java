package com.ulms.blacklist.controller;

import com.ulms.blacklist.dto.CreateBlacklistRequest;
import com.ulms.blacklist.dto.LibrarianBlacklistResponse;
import com.ulms.blacklist.dto.UnlockBlacklistRequest;
import com.ulms.blacklist.service.LibrarianBlacklistService;
import com.ulms.exception.ApiResponse;
import com.ulms.util.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ulms/librarian/blacklists")
@RequiredArgsConstructor
public class LibrarianBlacklistController {

    private final LibrarianBlacklistService librarianBlacklistService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<LibrarianBlacklistResponse>>> getBlacklists(
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        PageResponse<LibrarianBlacklistResponse> result = librarianBlacklistService.getBlacklists(isActive, keyword, page, size);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách hạn chế thành công", result));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<String>> addBlacklist(
            @RequestBody CreateBlacklistRequest request
    ) {
        librarianBlacklistService.addBlacklist(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Thêm độc giả vào danh sách hạn chế thành công", null));
    }

    @PutMapping("/{blacklistId}/unlock")
    public ResponseEntity<ApiResponse<String>> unlockBlacklist(
            @PathVariable Long blacklistId,
            @RequestBody(required = false) UnlockBlacklistRequest request
    ) {
        librarianBlacklistService.unlockBlacklist(blacklistId, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Mở khóa độc giả khỏi danh sách hạn chế thành công", null));
    }
}
