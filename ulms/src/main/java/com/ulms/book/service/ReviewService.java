package com.ulms.book.service;

import com.ulms.book.dto.BookListResponse;
import com.ulms.book.dto.MyReviewResponse;
import com.ulms.book.dto.ReviewRequest;
import com.ulms.util.PageResponse;

import java.util.List;

public interface ReviewService {
    void reviewBook(List<ReviewRequest> listReview);
    List<BookListResponse> getListReview(Long borrowRecordId);
    PageResponse<MyReviewResponse> getMyReview(Byte status, Integer page, Integer size);
    void updateMyReview(Long reviewId, ReviewRequest reviewRequest);
    void deleteMyReview(Long reviewId);
}
