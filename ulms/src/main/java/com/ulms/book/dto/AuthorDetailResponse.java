package com.ulms.book.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class AuthorDetailResponse extends AuthorResponse{
    private List<BookListResponse> listRelateBook;
}
