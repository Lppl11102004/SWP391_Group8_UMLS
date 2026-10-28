package com.ulms.book.service;

import com.ulms.book.dto.*;
import com.ulms.book.entity.*;
import com.ulms.book.repository.*;
import com.ulms.exception.ApiException;
import com.ulms.util.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LibrarianBookServiceImpl implements LibrarianBookService {

    private final BookRepository bookRepository;
    private final BookCopyRepository bookCopyRepository;
    private final EBookRepository eBookRepository;
    private final AuthorRepository authorRepository;
    private final PublisherRepository publisherRepository;
    private final CategoryRepository categoryRepository;
    private final BookImageRepository bookImageRepository;

    @Override
    public PageResponse<LibrarianBookListResponse> getBooks(String keyword, Integer categoryId, Integer authorId, Integer publisherId, Boolean status, Integer page, Integer size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Book> bookPage = bookRepository.searchBooksForLibrarian(keyword, categoryId, authorId, publisherId, status, pageable);

        List<LibrarianBookListResponse> list = new ArrayList<>();
        for (Book b : bookPage.getContent()) {
            LibrarianBookListResponse res = new LibrarianBookListResponse();
            res.setBookId(b.getBookId());
            res.setTitle(b.getTitle());
            res.setIsbn(b.getIsbn());
            res.setCoverImageUrl(b.getCoverImageUrl());
            res.setPrice(b.getPrice());
            res.setPublishedYear(b.getPublishedYear());
            if (b.getAuthor() != null) {
                res.setAuthorName(b.getAuthor().getName());
                res.setAuthorAvatarUrl(b.getAuthor().getAvatarUrl());
                res.setAvatarUrl(b.getAuthor().getAvatarUrl());
            }
            if (b.getPublisher() != null) {
                res.setPublisherName(b.getPublisher().getName());
            }
            if (b.getCategory() != null) {
                res.setCategoryName(b.getCategory().getName());
            }
            res.setStatus(b.getStatus());

            Integer totalCopies = bookCopyRepository.countByBookId(b.getBookId());
            Integer availableCopies = bookCopyRepository.countByBookIdAndStatus(b.getBookId(), (byte) 1);
            Integer borrowedCopies = bookCopyRepository.countByBookIdAndStatus(b.getBookId(), (byte) 2);

            res.setTotalCopies(totalCopies != null ? totalCopies : 0);
            res.setAvailableCopies(availableCopies != null ? availableCopies : 0);
            res.setBorrowedCopies(borrowedCopies != null ? borrowedCopies : 0);
            res.setHasEBook(eBookRepository.findByBook_BookId(b.getBookId()) != null);
            res.setCreatedAt(b.getCreatedAt());

            list.add(res);
        }

        return new PageResponse<>(list, bookPage.getNumber(), bookPage.getSize(), bookPage.getTotalElements());
    }

    @Override
    public BookDetailResponse getBookDetail(Long bookId) {
        Book b = bookRepository.findById(bookId)
                .orElseThrow(() -> new ApiException("Không tìm thấy sách #" + bookId));

        BookDetailResponse res = new BookDetailResponse();
        res.setBookId(b.getBookId());
        res.setTitle(b.getTitle());
        res.setPrice(b.getPrice());
        res.setIsbn(b.getIsbn());
        res.setCoverImageUrl(b.getCoverImageUrl());
        res.setDescription(b.getDescription());
        res.setPublishedYear(b.getPublishedYear());

        if (b.getCategory() != null) {
            res.setCategoryId(b.getCategory().getCategoryId());
            res.setCategoryName(b.getCategory().getName());
        }
        if (b.getPublisher() != null) {
            res.setPublisherId(b.getPublisher().getPublisherId());
            res.setPublisherName(b.getPublisher().getName());
        }
        if (b.getAuthor() != null) {
            res.setAuthorId(b.getAuthor().getAuthorId());
            res.setAuthorName(b.getAuthor().getName());
            res.setAuthorBio(b.getAuthor().getBio());
            res.setAuthorAvatarUrl(b.getAuthor().getAvatarUrl());
            res.setAvatarUrl(b.getAuthor().getAvatarUrl());
        }

        Integer totalCopies = bookCopyRepository.countByBookId(b.getBookId());
        Integer availableCopies = bookCopyRepository.countByBookIdAndStatus(b.getBookId(), (byte) 1);
        res.setTotalCopies(totalCopies != null ? totalCopies : 0);
        res.setAvailableCopies(availableCopies != null ? availableCopies : 0);
        res.setIsAvailable(res.getAvailableCopies() > 0 && Boolean.TRUE.equals(b.getStatus()));

        EBook ebook = eBookRepository.findByBook_BookId(bookId);
        if (ebook != null) {
            res.setHasEbook(true);
            res.setEbookId(ebook.getEbookId());
            res.setEbookTotalPages(ebook.getTotalPages());
        } else {
            res.setHasEbook(false);
        }

        List<BookImage> images = bookImageRepository.findByBookId(bookId);
        res.setImages(images);
        if (images != null) {
            res.setImageUrls(images.stream().map(BookImage::getImageUrl).toList());
        }

        return res;
    }

    @Transactional
    @Override
    public Long createBook(BookCreateRequest request) {
        if (request == null || request.getTitle() == null || request.getTitle().isBlank()) {
            throw new ApiException("Tiêu đề sách không được để trống");
        }
        if (request.getIsbn() == null || request.getIsbn().isBlank()) {
            throw new ApiException("Mã ISBN không được để trống");
        }
        if (bookRepository.existsByIsbn(request.getIsbn().trim())) {
            throw new ApiException("Mã ISBN '" + request.getIsbn() + "' đã tồn tại trong hệ thống");
        }

        Author author = null;
        if (request.getAuthorId() != null) {
            author = authorRepository.findById(request.getAuthorId())
                    .orElseThrow(() -> new ApiException("Tác giả không tồn tại"));
        }

        Publisher publisher = null;
        if (request.getPublisherId() != null) {
            publisher = publisherRepository.findById(request.getPublisherId())
                    .orElseThrow(() -> new ApiException("Nhà xuất bản không tồn tại"));
        }

        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ApiException("Thể loại không tồn tại"));
        }

        Book book = new Book();
        book.setTitle(request.getTitle().trim());
        book.setIsbn(request.getIsbn().trim());
        book.setAuthor(author);
        book.setPublisher(publisher);
        book.setCategory(category);
        book.setPublishedYear(request.getPublishedYear());
        book.setDescription(request.getDescription());
        book.setCoverImageUrl(request.getCoverImageUrl());
        book.setPrice(request.getPrice());
        book.setStatus(request.getStatus() != null ? request.getStatus() : true);
        book.setCreatedAt(LocalDateTime.now());
        book.setUpdatedAt(LocalDateTime.now());

        Book savedBook = bookRepository.save(book);

        // Lưu danh sách hình ảnh của sách vào bảng book_images
        if (request.getImageUrls() != null && !request.getImageUrls().isEmpty()) {
            for (String url : request.getImageUrls()) {
                if (url != null && !url.isBlank()) {
                    BookImage img = new BookImage();
                    img.setBookId(savedBook.getBookId());
                    img.setImageUrl(url.trim());
                    img.setCreatedAt(LocalDateTime.now());
                    bookImageRepository.save(img);
                }
            }
        }

        // Khởi tạo các bản sao vật lý cho bảng book_copies nếu được yêu cầu
        if (request.getInitialCopies() != null && request.getInitialCopies() > 0) {
            long ts = System.currentTimeMillis();
            for (int i = 1; i <= request.getInitialCopies(); i++) {
                BookCopy copy = new BookCopy();
                copy.setBookId(savedBook.getBookId());
                copy.setBarcode("BC" + savedBook.getBookId() + (ts % 100000) + String.format("%03d", i));
                copy.setStatus((byte) 1); // 1: AVAILABLE
                copy.setCreatedAt(LocalDateTime.now());
                bookCopyRepository.save(copy);
            }
        }

        return savedBook.getBookId();
    }

    @Transactional
    @Override
    public void updateBook(Long bookId, BookUpdateRequest request) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ApiException("Không tìm thấy sách #" + bookId));

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            book.setTitle(request.getTitle().trim());
        }
        if (request.getAuthorId() != null) {
            Author author = authorRepository.findById(request.getAuthorId())
                    .orElseThrow(() -> new ApiException("Tác giả không tồn tại"));
            book.setAuthor(author);
        }
        if (request.getPublisherId() != null) {
            Publisher publisher = publisherRepository.findById(request.getPublisherId())
                    .orElseThrow(() -> new ApiException("Nhà xuất bản không tồn tại"));
            book.setPublisher(publisher);
        }
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ApiException("Thể loại không tồn tại"));
            book.setCategory(category);
        }
        if (request.getPublishedYear() != null) {
            book.setPublishedYear(request.getPublishedYear());
        }
        if (request.getDescription() != null) {
            book.setDescription(request.getDescription());
        }
        if (request.getCoverImageUrl() != null) {
            book.setCoverImageUrl(request.getCoverImageUrl());
        }
        if (request.getPrice() != null) {
            book.setPrice(request.getPrice());
        }
        if (request.getStatus() != null) {
            book.setStatus(request.getStatus());
        }
        book.setUpdatedAt(LocalDateTime.now());

        bookRepository.save(book);

        // Cập nhật danh sách hình ảnh sách nếu có truyền lên
        if (request.getImageUrls() != null) {
            bookImageRepository.deleteByBookId(bookId);
            for (String url : request.getImageUrls()) {
                if (url != null && !url.isBlank()) {
                    BookImage img = new BookImage();
                    img.setBookId(bookId);
                    img.setImageUrl(url.trim());
                    img.setCreatedAt(LocalDateTime.now());
                    bookImageRepository.save(img);
                }
            }
        }
    }

    @Override
    public List<BookCopyResponse> getBookCopies(Long bookId) {
        if (!bookRepository.existsById(bookId)) {
            throw new ApiException("Không tìm thấy sách #" + bookId);
        }

        List<BookCopy> copies = bookCopyRepository.findByBookId(bookId);
        List<BookCopyResponse> result = new ArrayList<>();
        for (BookCopy c : copies) {
            BookCopyResponse res = new BookCopyResponse();
            res.setCopyId(c.getCopyId());
            res.setBookId(c.getBookId());
            res.setBarcode(c.getBarcode());
            res.setStatus(c.getStatus());
            res.setCreatedAt(c.getCreatedAt());
            res.setUpdatedAt(c.getUpdatedAt());
            result.add(res);
        }
        return result;
    }

    @Transactional
    @Override
    public void createBookCopy(Long bookId, BookCopyCreateRequest request) {
        if (!bookRepository.existsById(bookId)) {
            throw new ApiException("Không tìm thấy sách #" + bookId);
        }

        if (request != null && request.getQuantity() != null && request.getQuantity() > 1) {
            int count = Math.min(request.getQuantity(), 50); // limit 50 per batch
            long now = System.currentTimeMillis();
            for (int i = 1; i <= count; i++) {
                BookCopy copy = new BookCopy();
                copy.setBookId(bookId);
                copy.setBarcode("BC" + bookId + "_" + now + "_" + i);
                copy.setStatus((byte) 1); // 1: AVAILABLE
                copy.setCreatedAt(LocalDateTime.now());
                copy.setUpdatedAt(LocalDateTime.now());
                bookCopyRepository.save(copy);
            }
            return;
        }

        String barcode = (request != null && request.getBarcode() != null && !request.getBarcode().isBlank())
                ? request.getBarcode().trim()
                : "BC" + bookId + "_" + System.currentTimeMillis();

        if (bookCopyRepository.existsByBarcode(barcode)) {
            throw new ApiException("Mã Barcode '" + barcode + "' đã tồn tại trên hệ thống");
        }

        BookCopy copy = new BookCopy();
        copy.setBookId(bookId);
        copy.setBarcode(barcode);
        copy.setStatus((byte) 1); // 1: AVAILABLE
        copy.setCreatedAt(LocalDateTime.now());
        copy.setUpdatedAt(LocalDateTime.now());
        bookCopyRepository.save(copy);
    }

    @Transactional
    @Override
    public void updateCopyStatus(Long copyId, BookCopyStatusUpdateRequest request) {
        BookCopy copy = bookCopyRepository.findById(copyId)
                .orElseThrow(() -> new ApiException("Không tìm thấy bản sao #" + copyId));

        if (request == null || request.getStatus() == null) {
            throw new ApiException("Vui lòng cung cấp trạng thái mới cho bản sao");
        }

        copy.setStatus(request.getStatus());
        copy.setUpdatedAt(LocalDateTime.now());
        bookCopyRepository.save(copy);
    }

    @Transactional
    @Override
    public void manageEBook(Long bookId, EBookManageRequest request) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ApiException("Không tìm thấy sách #" + bookId));

        if (request == null || request.getFileUrl() == null || request.getFileUrl().isBlank()) {
            throw new ApiException("Đường dẫn file E-Book không được để trống");
        }

        EBook ebook = eBookRepository.findByBook_BookId(bookId);
        if (ebook == null) {
            ebook = new EBook();
            ebook.setBook(book);
            ebook.setCreatedAt(LocalDateTime.now());
        }

        ebook.setFileUrl(request.getFileUrl().trim());
        ebook.setTotalPages(request.getTotalPages());
        ebook.setFileSizeKb(request.getFileSizeKb());
        ebook.setUpdatedAt(LocalDateTime.now());
        eBookRepository.save(ebook);
    }
}
