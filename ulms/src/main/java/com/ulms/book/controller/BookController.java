package com.ulms.book.controller;

import com.ulms.book.dto.*;
import com.ulms.book.service.BookService;
import com.ulms.book.service.CategoryService;
import com.ulms.book.service.PublisherService;
import com.ulms.exception.ApiResponse;
import com.ulms.util.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ulms")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;
    private final CategoryService categoryService;
    private final PublisherService publisherService;
    // =========================
    // VIEW LIST BOOK
    @GetMapping()
    public ResponseEntity<List<BookListResponse>> getListBookHome() {
        List<BookListResponse> bookListResponse = bookService.getListBook();
        return ResponseEntity.ok(bookListResponse);
    }
    // =========================
    // SEARCH BOOK
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PageResponse<BookListResponse>>> searchBooks(
            @ModelAttribute BookSearchRequest request) { // Dùng @ModelAttribute thay cho @RequestBody
        PageResponse<BookListResponse> result = bookService.searchBooks(request);
        ApiResponse<PageResponse<BookListResponse>> response = new ApiResponse<>(
                true,
                result.getContent().isEmpty() ? "Danh sách trống" : "Tải danh sách theo yêu cầu thành công",
                result
        );
        return ResponseEntity.ok(response);
    }

    //===========================
    // VIEW DETAIL BOOK
    @GetMapping("/books/{id}")
    public ResponseEntity<ApiResponse<BookDetailResponse>> viewBookDetail(
            @PathVariable("id") Long bookId) {

        BookDetailResponse result = bookService.getBookDetail(bookId);
        ApiResponse<BookDetailResponse> response = new ApiResponse<BookDetailResponse>(
                true,
                result == null ?"Sách này chưa có thông tin chi tiết":"Tải thông tin chi tiết của sách thành công",
                result
        );
        return ResponseEntity.ok(response);
    }
    //===========================
    // VIEW BOOK REVIEW
    @GetMapping("/books/{id}/reviews")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> viewBookReview(
            @PathVariable("id") Long bookId,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {

        List<ReviewResponse> result =
                bookService.getBookReview(bookId, page, size);

        ApiResponse<List<ReviewResponse>> response = new ApiResponse<List<ReviewResponse>>(
                true,
                result.isEmpty()?"Sách này chưa có đánh giá":"Tải danh sách đánh giá thành công",
                result
        );
        return ResponseEntity.ok(response);
    }
    //===========================
    // VIEW CATEGORY
    @GetMapping("/categories")
    public ResponseEntity<List<CategoryResponse>> getListCategory() {
        List<CategoryResponse> bookCategoryResponse = categoryService.viewAllCategory();
        return ResponseEntity.ok(bookCategoryResponse);
    }

    //===========================
    // VIEW PUBLIC
    @GetMapping("/publishers")
    public ResponseEntity<List<PublisherResponse>> getListPublisher() {
        List<PublisherResponse> publisherResponses = publisherService.viewAllPublisher();
        return ResponseEntity.ok(publisherResponses);
    }

}
