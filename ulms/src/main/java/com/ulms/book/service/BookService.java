package com.ulms.book.service;

import com.ulms.book.dto.BookDetailResponse;
import com.ulms.book.dto.BookListResponse;
import com.ulms.book.dto.BookSearchRequest;
import com.ulms.book.dto.ReviewResponse;

import com.ulms.util.PageResponse;
import org.springframework.data.domain.PageRequest;


import java.util.List;

public interface BookService {
    List<BookListResponse> getListBook();
    PageResponse<BookListResponse> searchBooks(BookSearchRequest request);
    BookDetailResponse getBookDetail(Long bookId);
    List<ReviewResponse> getBookReview(Long bookId, Integer page, Integer size);
}
