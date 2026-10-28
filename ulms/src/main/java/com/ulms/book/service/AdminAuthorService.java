package com.ulms.book.service;

import com.ulms.book.dto.AdminAuthorRequest;
import com.ulms.book.dto.AdminAuthorResponse;
import com.ulms.util.PageResponse;

public interface AdminAuthorService {
    PageResponse<AdminAuthorResponse> searchAuthors(String keyword, int page, int size);
    AdminAuthorResponse getAuthorById(Integer authorId);
    AdminAuthorResponse createAuthor(AdminAuthorRequest request);
    AdminAuthorResponse updateAuthor(Integer authorId, AdminAuthorRequest request);
    void deleteAuthor(Integer authorId);
}
