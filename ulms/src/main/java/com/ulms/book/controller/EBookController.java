package com.ulms.book.controller;

import com.ulms.book.dto.*;
import com.ulms.book.service.EBookService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ulms.exception.ApiResponse;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ulms")
@RequiredArgsConstructor
public class EBookController {

    private final EBookService eBookService;

    // ===================================
    // Lấy ra EBook
    @GetMapping("/books/{id}/info")
    public ResponseEntity<ApiResponse<EBookInfoResponse>> getEBookInfo(
            @PathVariable("id") Long bookId
    ) {
        EBookInfoResponse result = eBookService.getEBookInfo(bookId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tải thông tin E-Book thành công", result));
    }

    // ===============================
    // Stream nội dung PDF nhị phân (Dành riêng cho PDF Viewer đọc trực tiếp)

    @GetMapping("/books/{id}/read")
    public ResponseEntity<byte[]> readEBook(
            @PathVariable("id") Long bookId
    ) {
        byte[] pdfContent = eBookService.streamEBookContent(bookId);
        HttpHeaders headers = new HttpHeaders();
        // Định dạng PDF chuẩn
        headers.setContentType(MediaType.APPLICATION_PDF);
        // "inline" = hiển thị trực tiếp trên trình duyệt, không kích hoạt cửa sổ tải về
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"ebook_" + bookId + ".pdf\"");
        // Chặn trình duyệt cache file ra ổ đĩa máy tính
        headers.setCacheControl(CacheControl.noCache().getHeaderValue());
        return new ResponseEntity<>(pdfContent, headers, HttpStatus.OK);
    }

    // ===================================
    // Lấy tiến độ đọc hiện tại
    @GetMapping("/books/{id}/progress")
    public ResponseEntity<ApiResponse<ReadingProgressResponse>> getProgress(
            @PathVariable("id") Long bookId
    ) {
        ReadingProgressResponse result = eBookService.getReadingProgress(bookId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tải tiến độ đọc thành công", result));
    }

    //===================================
    // Lưu lại tiến độ khi người dùng lật trang
    @PutMapping("/books/{id}/progress")
    public ResponseEntity<ApiResponse<Void>> updateProgress(
            @PathVariable("id") Long bookId,
            @RequestParam("page") Integer pageNumber
    ) {
        eBookService.updateReadingProgress(bookId, pageNumber);
        return ResponseEntity.ok(new ApiResponse<>(true, "Đã lưu tiến độ đọc", null));
    }

    // ===================================
    // TỦ SÁCH CÁ NHÂN & TIẾP TỤC ĐỌC E-BOOK (Continue Reading Shelf)
    @GetMapping("/me/reading-shelf")
    public ResponseEntity<ApiResponse<List<ReadingProgressResponse>>> getReadingShelf() {
        List<ReadingProgressResponse> result = eBookService.getReadingShelf();
        return ResponseEntity.ok(new ApiResponse<>(true, "Tải tủ sách cá nhân thành công", result));
    }
}
