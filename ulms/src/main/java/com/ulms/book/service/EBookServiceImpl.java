package com.ulms.book.service;

import com.ulms.auth.entity.User;
import com.ulms.book.dto.EBookInfoResponse;
import com.ulms.book.dto.ReadingProgressResponse;
import com.ulms.book.entity.Book;
import com.ulms.book.entity.EBook;
import com.ulms.book.entity.EbookReadingProgress;
import com.ulms.book.repository.EBookRepository;
import com.ulms.book.repository.EBookingReadingProgressRepository;
import com.ulms.exception.ApiException;
import com.ulms.util.SecurityUtil;
import com.ulms.util.UtilValidate;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EBookServiceImpl implements EBookService{

    private final SecurityUtil securityUtil;
    private final EBookRepository eBookRepository;
    private final EBookingReadingProgressRepository progressRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final UtilValidate utilValidate;

    // ================
    // LẤY RA EBOOK ĐỂ READER ĐỌC
    @Transactional(readOnly = true)
    @Override
    public EBookInfoResponse getEBookInfo(Long bookId) {
        User user = securityUtil.getCurrentUser();
        // 1. Kiểm tra quyền Membership
        utilValidate.validateMembership(user);
        // 2. Tìm EBook theo bookId
        EBook eBook = eBookRepository.findByBook_BookId(bookId);
        if (eBook == null){
            throw new ApiException("Sách này hiện chưa hỗ trợ phiên bản E-Book");
        }
        // 3. Lấy trang đang đọc dở (nếu có)
        EbookReadingProgress progress = progressRepository
                .findByUser_UserIdAndEbook_EbookId(user.getUserId(), eBook.getEbookId())
                .orElse(null);
        int lastPage = (progress != null) ? progress.getCurrentPage() : 1;
        return new EBookInfoResponse(
                eBook.getEbookId(),
                bookId,
                eBook.getBook().getTitle(),
                eBook.getBook().getAuthor() != null ? eBook.getBook().getAuthor().getName() : "Nhiều tác giả",
                eBook.getBook().getCoverImageUrl(),
                eBook.getTotalPages(),
                lastPage
        );
    }

    @Transactional
    @Override
    public byte[] streamEBookContent(Long bookId) {
        User user = securityUtil.getCurrentUser();
        // 1. Kiểm tra quyền Membership
        utilValidate.validateMembership(user);
        // 2. Lấy E-Book
        EBook eBook = eBookRepository.findByBook_BookId(bookId);
        if (eBook == null){
            throw new ApiException("Sách này hiện chưa hỗ trợ phiên bản E-Book");
        }

        // 3. Cập nhật thời điểm mở sách đọc gần nhất vào progress
        EbookReadingProgress progress = progressRepository
                .findByUser_UserIdAndEbook_EbookId(user.getUserId(), eBook.getEbookId())
                .orElseGet(() -> {
                    EbookReadingProgress newP = new EbookReadingProgress();
                    newP.setUser(user);
                    newP.setEbook(eBook);
                    newP.setCurrentPage(1);
                    return newP;
                });
        progress.setLastReadAt(LocalDateTime.now());
        progressRepository.save(progress);
        // 4. Backend tải stream nhị phân từ Cloudinary về RAM để trả cho Viewer
        try {
            return restTemplate.getForObject(eBook.getFileUrl(), byte[].class);
        } catch (Exception e) {
            throw new ApiException("Không thể tải tài liệu sách điện tử vào lúc này. Vui lòng thử lại sau.");
        }
    }

    // ================
    // CẬP NHẬT TIẾN ĐỘ ĐỌC (Lưu trang hiện tại)
    @Transactional
    @Override
    public void updateReadingProgress(Long bookId, Integer pageNumber) {
        User user = securityUtil.getCurrentUser();
        // Tìm E-Book theo bookId
        EBook eBook = eBookRepository.findByBook_BookId(bookId);
        if (eBook == null){
            throw new ApiException("Không tìm thấy bản E-Book của sách này");
        }
        if (pageNumber == null || pageNumber < 1) {
            pageNumber = 1;
        }
        // Kiểm tra xem đã có tiến độ trước đó chưa
        EbookReadingProgress progress = progressRepository
                .findByUser_UserIdAndEbook_EbookId(user.getUserId(), eBook.getEbookId())
                .orElse(null);
        if (progress == null) {
            // Chưa có -> Tạo mới
            progress = new EbookReadingProgress();
            progress.setUser(user);
            progress.setEbook(eBook);
        }
        // Cập nhật trang mới nhất và thời điểm đọc
        progress.setCurrentPage(pageNumber);
        progress.setLastReadAt(LocalDateTime.now());
        progressRepository.save(progress);
    }

    // =========================================================================
    // LẤY TIẾN ĐỘ ĐỌC (Để cuộn đến trang đọc dở khi mở sách)
    public ReadingProgressResponse getReadingProgress(Long bookId) {
        User user = securityUtil.getCurrentUser();
        EBook eBook = eBookRepository.findByBook_BookId(bookId);
        if (eBook == null) {
            throw new ApiException("Không tìm thấy bản E-Book của sách này");
        }

        EbookReadingProgress progress = progressRepository
                .findByUser_UserIdAndEbook_EbookId(user.getUserId(), eBook.getEbookId())
                .orElse(null);
        int currentPage = (progress != null) ? progress.getCurrentPage() : 1;
        int totalPages = (eBook.getTotalPages() != null && eBook.getTotalPages() > 0) ? eBook.getTotalPages() : 1;

        // Tính % tiến độ đọc
        double percent = Math.min(100.0, Math.round(((double) currentPage / totalPages) * 1000.0) / 10.0);
        ReadingProgressResponse response = new ReadingProgressResponse();
        response.setEbookId(eBook.getEbookId());
        response.setBookId(bookId);
        response.setBookTitle(eBook.getBook().getTitle());
        response.setCoverImageUrl(eBook.getBook().getCoverImageUrl());
        response.setAuthorName(eBook.getBook().getAuthor() != null ? eBook.getBook().getAuthor().getName() : "Nhiều tác giả");
        response.setCurrentPage(currentPage);
        response.setTotalPages(totalPages);
        response.setProgressPercent(percent);
        response.setLastReadAt(progress != null ? progress.getLastReadAt() : null);
        return response;
    }

    // =========================================================================
    // TỦ SÁCH CÁ NHÂN & TIẾP TỤC ĐỌC E-BOOK (Continue Reading Shelf)
    @Transactional(readOnly = true)
    @Override
    public List<ReadingProgressResponse> getReadingShelf() {
        User user = securityUtil.getCurrentUser();
        if (user == null) {
            throw new ApiException("Vui lòng đăng nhập");
        }
        List<EbookReadingProgress> progressList = progressRepository.findReadingShelfByUser(user.getUserId());
        return progressList.stream().map(p -> {
            ReadingProgressResponse response = new ReadingProgressResponse();
            EBook eBook = p.getEbook();
            Book book = eBook.getBook();
            int currentPage = (p.getCurrentPage() != null && p.getCurrentPage() > 0) ? p.getCurrentPage() : 1;
            int totalPages = (eBook.getTotalPages() != null && eBook.getTotalPages() > 0) ? eBook.getTotalPages() : 1;
            double percent = Math.min(100.0, Math.round(((double) currentPage / totalPages) * 1000.0) / 10.0);

            response.setEbookId(eBook.getEbookId());
            response.setBookId(book.getBookId());
            response.setBookTitle(book.getTitle());
            response.setCoverImageUrl(book.getCoverImageUrl());
            response.setAuthorName(book.getAuthor() != null ? book.getAuthor().getName() : "Nhiều tác giả");
            response.setCurrentPage(currentPage);
            response.setTotalPages(totalPages);
            response.setProgressPercent(percent);
            response.setLastReadAt(p.getLastReadAt());
            return response;
        }).toList();
    }
}
