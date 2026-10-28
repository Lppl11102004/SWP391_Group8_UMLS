package com.ulms.book.service;


import com.ulms.auth.entity.User;
import com.ulms.book.dto.BookListResponse;
import com.ulms.book.dto.BookSearchRequest;
import com.ulms.book.dto.MyReviewResponse;
import com.ulms.book.dto.ReviewRequest;
import com.ulms.book.entity.Book;
import com.ulms.book.entity.BookCopy;
import com.ulms.book.entity.Review;
import com.ulms.book.repository.BookRepository;
import com.ulms.book.repository.ReviewRepository;
import com.ulms.exception.ApiException;
import com.ulms.reservation.entity.BorrowDetail;
import com.ulms.reservation.entity.BorrowRecord;
import com.ulms.reservation.repository.BorrowDetailRepository;
import com.ulms.reservation.repository.BorrowRecordRepository;
import com.ulms.util.PageResponse;
import com.ulms.util.SecurityUtil;
import com.ulms.util.UtilValidate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final BorrowRecordRepository borrowRecordRepository;
    private final SecurityUtil securityUtil;
    private final BorrowDetailRepository borrowDetailRepository;
    private final BookRepository bookRepository;
    private final ReviewRepository reviewRepository;
    private final UtilValidate utilValidate;

    @Transactional
    @Override
    public void reviewBook(List<ReviewRequest> listReview) {
        User user = securityUtil.getCurrentUser();

        if (listReview.isEmpty()) {
            throw new ApiException("Vui lòng điền đầy đủ các tiêu chí");
        }
        for (ReviewRequest rr : listReview) {
            if (rr.getBookId() == null) {
                throw new ApiException("Mã sách không được để trống");
            }
            if (rr.getRating() == null || rr.getRating() < 1 || rr.getRating() > 5) {
                throw new ApiException("Số sao đánh giá phải từ 1 đến 5 sao");
            }
            if (reviewRepository.existsByUserIdAndBookId(user.getUserId(), rr.getBookId())) {
                throw new ApiException("Bạn đã gửi đánh giá cho cuốn sách này trước đó rồi");
            }
            String comment = rr.getComment();
            if (comment != null && comment.length() > 1000) {
                throw new ApiException("Nội dung đánh giá không được vượt quá 1000 ký tự");
            }
            if (!utilValidate.checkBadWord(comment)) {
                throw new ApiException("Bạn đã sử dụng các từ ngữ vi phạm nguyên tắc cộng đồng. Vui lòng đánh giá lại");
            }
            Review review = new Review();
            review.setBookId(rr.getBookId());
            review.setUserId(user.getUserId());
            review.setRating(rr.getRating());
            review.setComment(comment);
            review.setStatus((byte) 1);

            reviewRepository.save(review);
        }
    }

    @Override
    public List<BookListResponse> getListReview(Long borrowRecordId) {
        User user = securityUtil.getCurrentUser();
        Long userId = user.getUserId();
        BorrowRecord borrowRecord = borrowRecordRepository.findById(borrowRecordId).orElse(null);

        if (borrowRecord == null || !user.getUserId().equals(borrowRecord.getUser().getUserId())) {
            throw new ApiException("Hiện tại không thể thực hiện đánh giá");
        }

        if (borrowRecord.getStatus() != 2) {
            throw new ApiException("Vui lòng thực hiện việc trả sách trước khi để lại đánh giá");
        }

        List<BorrowDetail> borrowDetails = borrowDetailRepository.findByBorrowRecord_BorrowId(borrowRecordId);
        if (borrowDetails.isEmpty()) {
            throw new ApiException("Không tìm thấy chi tiết sách trong phiếu mượn");
        }

        List<BookListResponse> listBook = new ArrayList<>();

        for (BorrowDetail bd : borrowDetails) {
            BookCopy bookCopy = bd.getBookCopy();
            if (bookCopy == null || bookCopy.getBookId() == null) {
                continue;
            }
            Long bookId = bookCopy.getBookId();
            Book book = bookRepository.findById(bookId).orElse(null);
            if (book == null) {
                continue;
            }
            if (reviewRepository.existsByUserIdAndBookId(userId, book.getBookId())) {
                continue;
            }
            BookListResponse br = new BookListResponse();
            br.setBookId(book.getBookId());
            br.setTitle(book.getTitle());
            br.setPrice(book.getPrice());
            br.setCoverImageUrl(book.getCoverImageUrl());
            br.setDescription(book.getDescription());
            if (book.getCategory() != null) {
                br.setCategoryName(book.getCategory().getName());
            }
            if (book.getPublisher() != null) {
                br.setPublisherName(book.getPublisher().getName());
            }
            listBook.add(br);
        }
        return listBook;
    }

    @Override
    public PageResponse<MyReviewResponse> getMyReview(Byte status, Integer page, Integer size) {

        User user = securityUtil.getCurrentUser();

        Page<Review> reviews = searchPageableReview(user.getUserId(), status, page, size);
        List<MyReviewResponse> list = standardListReviewResponse(reviews);

        return new PageResponse<>(
                list,
                reviews.getNumber(),
                reviews.getSize(),
                reviews.getTotalElements()
        );
    }

    @Override
    public void updateMyReview(Long reviewId, ReviewRequest reviewRequest) {
        User user = securityUtil.getCurrentUser();
        Long bookId = reviewRequest.getBookId();
        Byte rating = reviewRequest.getRating();
        String comment = reviewRequest.getComment();

        Review review = reviewRepository.findById(reviewId).orElse(null);

        if (review == null || !bookId.equals(review.getBookId()) || !user.getUserId().equals(review.getUserId())){
            throw new ApiException("Chỉnh sửa cho đánh giá này không hợp lệ");
        }
        if (ChronoUnit.DAYS.between(review.getCreatedAt(), LocalDateTime.now()) > 3){
            throw  new ApiException("Điều chỉnh không phù hợp vì vươợt quá số ngày quy định(>3 ngày)");
        }
        if (rating == null || comment == null){
            throw new ApiException("Vui lòng điền đầy đủ thông tin");
        }
        utilValidate.checkBadWord(comment);

        review.setRating(rating);
        review.setComment(comment);
        review.setUpdatedAt(LocalDateTime.now());
        reviewRepository.save(review);
    }

    @Override
    public void deleteMyReview(Long reviewId) {
        User user = securityUtil.getCurrentUser();

        Review review = reviewRepository.findById(reviewId).orElse(null);
        if (review == null || !review.getUserId().equals(user.getUserId())){
            throw new ApiException("Thao tác không hợp lệ");
        }
        review.setStatus((byte) 0);
        reviewRepository.save(review);
    }

    public Page<Review> searchPageableReview(Long userId, Byte status, Integer page, Integer size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<Review> reviews = reviewRepository.searchMyReviews(
                userId,
                status,
                pageable
        );
        return reviews;
    }

    public List<MyReviewResponse> standardListReviewResponse(Page<Review> request) {
        List<MyReviewResponse> list = new ArrayList<>();

        for (Review r : request.getContent()) {

            MyReviewResponse response = new MyReviewResponse();

            response.setReviewId(r.getReviewId());

            Long bookId = r.getBookId();
            if (bookId != null) {
                Book book = bookRepository.findById(bookId).orElse(null);
                if (book != null) {
                    response.setBookTitle(book.getTitle());
                }
                response.setBookId(bookId);
            }
            response.setStatus(r.getStatus());
            response.setRating(r.getRating());
            response.setComment(r.getComment());
            response.setCreatedAt(r.getCreatedAt());
            list.add(response);
        }
        return list;
    }
}
