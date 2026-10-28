package com.ulms.book.controller;

import com.ulms.book.dto.*;
import com.ulms.book.service.LibrarianBookService;
import com.ulms.exception.ApiResponse;
import com.ulms.util.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ulms/librarian")
@RequiredArgsConstructor
public class LibrarianBookController {

    private final LibrarianBookService librarianBookService;

    @GetMapping("/books")
    public ResponseEntity<ApiResponse<PageResponse<LibrarianBookListResponse>>> getBooks(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Integer authorId,
            @RequestParam(required = false) Integer publisherId,
            @RequestParam(required = false) Boolean status,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size
    ) {
        PageResponse<LibrarianBookListResponse> result = librarianBookService.getBooks(keyword, categoryId, authorId, publisherId, status, page, size);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách sách thành công", result));
    }

    @GetMapping("/books/{bookId}")
    public ResponseEntity<ApiResponse<BookDetailResponse>> getBookDetail(
            @PathVariable Long bookId
    ) {
        BookDetailResponse result = librarianBookService.getBookDetail(bookId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy chi tiết sách thành công", result));
    }

    @PostMapping("/books")
    public ResponseEntity<ApiResponse<Long>> createBook(
            @RequestBody BookCreateRequest request
    ) {
        Long bookId = librarianBookService.createBook(request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Thêm sách mới thành công", bookId));
    }

    @PutMapping("/books/{bookId}")
    public ResponseEntity<ApiResponse<String>> updateBook(
            @PathVariable Long bookId,
            @RequestBody BookUpdateRequest request
    ) {
        librarianBookService.updateBook(bookId, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật thông tin sách thành công", null));
    }

    @GetMapping("/books/{bookId}/copies")
    public ResponseEntity<ApiResponse<List<BookCopyResponse>>> getBookCopies(
            @PathVariable Long bookId
    ) {
        List<BookCopyResponse> result = librarianBookService.getBookCopies(bookId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Lấy danh sách bản sao thành công", result));
    }

    @PostMapping("/books/{bookId}/copies")
    public ResponseEntity<ApiResponse<String>> createBookCopy(
            @PathVariable Long bookId,
            @RequestBody(required = false) BookCopyCreateRequest request
    ) {
        librarianBookService.createBookCopy(bookId, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Thêm bản sao sách thành công", null));
    }

    @PutMapping("/copies/{copyId}/status")
    public ResponseEntity<ApiResponse<String>> updateCopyStatus(
            @PathVariable Long copyId,
            @RequestBody BookCopyStatusUpdateRequest request
    ) {
        librarianBookService.updateCopyStatus(copyId, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật trạng thái bản sao thành công", null));
    }

    @PostMapping("/books/{bookId}/ebook")
    public ResponseEntity<ApiResponse<String>> manageEBook(
            @PathVariable Long bookId,
            @RequestBody EBookManageRequest request
    ) {
        librarianBookService.manageEBook(bookId, request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật tài liệu E-Book thành công", null));
    }
}
