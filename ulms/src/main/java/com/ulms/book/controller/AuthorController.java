package com.ulms.book.controller;

import com.ulms.book.dto.AuthorDetailResponse;
import com.ulms.book.dto.AuthorResponse;
import com.ulms.book.service.AuthorService;
import com.ulms.exception.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ulms")
@RequiredArgsConstructor
public class AuthorController {

    private final AuthorService authorService;
    //===========================
    // VIEW AUTHOR
    @GetMapping("/authors")
    public ResponseEntity<ApiResponse<List<AuthorResponse>>> viewListAuthor(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {

        List<AuthorResponse> result = authorService.getListAuthor(page, size);
        ApiResponse<List<AuthorResponse>> response = new ApiResponse<>(
                true,
                result.isEmpty()?"Danh sách trống":"Tải danh sách tác giả thành công",
                result
        );
        return ResponseEntity.ok(response);
    }

    //===========================
    // VIEW AUTHOR DETAIL
    @GetMapping("/authors/{id}")
    public ResponseEntity<ApiResponse<AuthorDetailResponse> > viewAuthorDetail(
            @PathVariable("id") Integer authorId
            ) {

        AuthorDetailResponse result = authorService.getAuthorDetail(authorId);
        ApiResponse<AuthorDetailResponse> response = new ApiResponse<>(
                true,
                result == null ?"Thông tin tác giả chưa được cập nhật":"Tải thông tin tác giả thành công",
                result
        );

        return ResponseEntity.ok(response);
    }
}
