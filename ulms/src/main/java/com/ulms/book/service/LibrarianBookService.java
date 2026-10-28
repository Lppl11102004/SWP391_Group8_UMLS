package com.ulms.book.service;

import com.ulms.book.dto.*;
import com.ulms.util.PageResponse;

import java.util.List;

public interface LibrarianBookService {

    PageResponse<LibrarianBookListResponse> getBooks(String keyword, Integer categoryId, Integer authorId, Integer publisherId, Boolean status, Integer page, Integer size);

    BookDetailResponse getBookDetail(Long bookId);

    Long createBook(BookCreateRequest request);

    void updateBook(Long bookId, BookUpdateRequest request);

    List<BookCopyResponse> getBookCopies(Long bookId);

    void createBookCopy(Long bookId, BookCopyCreateRequest request);

    void updateCopyStatus(Long copyId, BookCopyStatusUpdateRequest request);

    void manageEBook(Long bookId, EBookManageRequest request);
}
