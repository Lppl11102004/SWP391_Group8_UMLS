package com.ulms.book.service;

import com.ulms.book.dto.EBookInfoResponse;
import com.ulms.book.dto.ReadingProgressResponse;

import java.util.List;

public interface EBookService {
    void updateReadingProgress(Long bookId, Integer pageNumber);
    ReadingProgressResponse getReadingProgress(Long bookId);
    EBookInfoResponse getEBookInfo(Long bookId);
    byte[] streamEBookContent(Long bookId);
    List<ReadingProgressResponse> getReadingShelf();
}
