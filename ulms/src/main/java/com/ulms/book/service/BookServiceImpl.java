package com.ulms.book.service;

import com.ulms.auth.entity.User;
import com.ulms.auth.repository.UserRepository;
import com.ulms.book.dto.BookDetailResponse;
import com.ulms.book.dto.BookListResponse;
import com.ulms.book.dto.BookSearchRequest;
import com.ulms.book.dto.ReviewResponse;
import com.ulms.book.entity.*;
import com.ulms.book.repository.*;
import com.ulms.exception.ApiException;
import com.ulms.util.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;


import java.awt.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookServiceImpl implements BookService{

    private final CategoryRepository categoryRepository;
    private final BookRepository bookRepository;
    private final BookImageRepository bookImageRepository;
    private final BookCopyRepository bookCopyRepository;
    private final EBookRepository eBookRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    @Override
    public List<BookListResponse> getListBook() {

        List<Book> books = bookRepository.findByStatusTrueOrderByCategory_CategoryIdAsc();

        if (books.isEmpty()) {
            throw new ApiException("Hiện tại chưa có sách");
        }

        List<BookListResponse> listBook = new ArrayList<>();

        for (Book b : books) {
            BookListResponse book = new BookListResponse();
            book.setBookId(b.getBookId());
            book.setTitle(b.getTitle());
            book.setPrice(b.getPrice());
            book.setCoverImageUrl(b.getCoverImageUrl());
            System.out.println("====="+ b.getCoverImageUrl());
            book.setDescription(b.getDescription());
            book.setPublisherName(b.getPublisher().getName());
            // Nếu Book đang có Category
            book.setCategoryName(b.getCategory().getName());
            listBook.add(book);
        }
        if (listBook.isEmpty()){
            throw new ApiException("Hệ thống chưa ghi nhận cuốn sách nào được thêm");
        }
        return listBook;
    }

    @Override
    public PageResponse<BookListResponse> searchBooks(BookSearchRequest request) {

        Page<Book> books = searchPageableBook(request);
        List<BookListResponse> list = standardListBookResponse(books);

        return new PageResponse<>(
                list,
                books.getNumber(),
                books.getSize(),
                books.getTotalElements()
        );
    }

    public Page<Book> searchPageableBook(BookSearchRequest request){
        Pageable pageable = PageRequest.of(
                request.getPage(),
                request.getSize()
        );

        Page<Book> books = bookRepository.searchBooks(
                request.getKeyword(),
                request.getCategoryId(),
                request.getAuthorId(),
                request.getPublisherId(),
                request.getFromYear(),
                request.getToYear(),
                request.getMinPrice(),
                request.getMaxPrice(),
                pageable
        );
        return books;
    }

    public List<BookListResponse> standardListBookResponse(Page<Book> request){
        List<BookListResponse> list = new ArrayList<>();

        for (Book b : request.getContent()) {

            BookListResponse response = new BookListResponse();

            response.setBookId(b.getBookId());
            response.setTitle(b.getTitle());
            response.setPrice(b.getPrice());
            response.setCoverImageUrl(b.getCoverImageUrl());
            response.setDescription(b.getDescription());
            response.setCategoryName(b.getCategory().getName());
            response.setPublisherName(b.getPublisher().getName());

            list.add(response);
        }
        return list;
    }

    @Override
    public BookDetailResponse getBookDetail(Long bookId) {
        BookDetailResponse bookDetail = new BookDetailResponse();

        Book book = bookRepository.findByBookIdAndStatusTrue(bookId).orElse(null);
        if (book == null) {
            throw new ApiException("Cuốn sách này hiện tại không khả dụng");
        }

        List<BookImage> listBookImage = bookImageRepository.findByBookId(bookId);

        Integer totalCopies = bookCopyRepository.countByBookId(bookId);
        Integer availableCopies = bookCopyRepository.countByBookIdAndStatus(bookId, (byte)1);

        EBook eBook = eBookRepository.findByBookId(book.getBookId());

        Double averageRating = reviewRepository.getAverageRating(bookId, (byte)1);
        Integer totalReviews = reviewRepository.countByBookId(bookId);

        BookSearchRequest request = new BookSearchRequest();
        request.setAuthorId(book.getAuthor().getAuthorId());
        Page<Book> books = searchPageableBook(request);
        List<BookListResponse> listRelateBook = standardListBookResponse(books);

        //Chuẩn hoá book detail
        bookDetail.setBookId(bookId);
        bookDetail.setTitle(book.getTitle());
        bookDetail.setPrice(book.getPrice());
        bookDetail.setIsbn(book.getIsbn());
        bookDetail.setCoverImageUrl(book.getCoverImageUrl());
        bookDetail.setImages(listBookImage);
        bookDetail.setDescription(book.getDescription());
        bookDetail.setCategoryId(book.getCategory().getCategoryId());
        bookDetail.setCategoryName(book.getCategory().getName());
        bookDetail.setPublisherId(book.getPublisher().getPublisherId());
        bookDetail.setPublisherName(book.getPublisher().getName());
        bookDetail.setPublishedYear(book.getPublishedYear());
        bookDetail.setAuthorId(book.getAuthor().getAuthorId());
        bookDetail.setAuthorName(book.getAuthor().getName());
        bookDetail.setAuthorAvatarUrl(book.getAuthor().getAvatarUrl());
        bookDetail.setAvatarUrl(book.getAuthor().getAvatarUrl());
        bookDetail.setAuthorBio(book.getAuthor().getBio());
        bookDetail.setTotalCopies(totalCopies);
        bookDetail.setAvailableCopies(availableCopies);
        bookDetail.setIsAvailable(availableCopies != null && availableCopies > 0);
        if (eBook == null){
            bookDetail.setHasEbook(false);
            bookDetail.setEbookId(null);
            bookDetail.setEbookTotalPages(null);
        } else {
            bookDetail.setHasEbook(true);
            bookDetail.setEbookId(eBook.getEbookId());
            bookDetail.setEbookTotalPages(eBook.getTotalPages());
        }
        if (averageRating == null) {
            averageRating = 0.0;
        }
        bookDetail.setAverageRating(BigDecimal.valueOf(averageRating));
        bookDetail.setTotalReviews(totalReviews);
        bookDetail.setListRelateBook(listRelateBook);

        return bookDetail;
    }

    @Override
    public List<ReviewResponse> getBookReview(Long bookId, Integer page, Integer size) {
        Page<Review> reviews = searchPageableReview(bookId, (byte)1, page,size);
        List<ReviewResponse> list = standardListReview(reviews);
        return list;
    }

    public Page<Review> searchPageableReview(Long bookId, Byte status, Integer page, Integer size){
        Pageable pageable = PageRequest.of(
                page,
                size
        );

        Page<Review> reviews = reviewRepository.searchReviews(
                bookId,
                status,
                pageable
        );
        return reviews;
    }

    public List<ReviewResponse> standardListReview(Page<Review> request){
        List<ReviewResponse> list = new ArrayList<>();

        for (Review r : request.getContent()) {

            ReviewResponse response = new ReviewResponse();

            response.setReviewId(r.getReviewId());
            User user = userRepository.findById(r.getUserId()).orElse(null);
            if(user != null){
                response.setReviewerName(user.getFullName());
            } else {
                response.setReviewerName(null);
            }
            response.setRating(r.getRating());
            response.setComment(r.getComment());
            response.setCreatedAt(r.getCreatedAt());
            list.add(response);
        }
        return list;
    }

}
