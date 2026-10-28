package com.ulms.book.service;

import com.ulms.book.dto.AuthorDetailResponse;
import com.ulms.book.dto.AuthorResponse;

import java.util.List;

public interface AuthorService {
    List<AuthorResponse> getListAuthor(Integer page, Integer size);
    AuthorDetailResponse getAuthorDetail(Integer authorId);
}
