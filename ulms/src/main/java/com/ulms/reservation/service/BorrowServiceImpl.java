package com.ulms.reservation.service;

import com.ulms.auth.entity.User;
import com.ulms.blacklist.entity.Blacklist;
import com.ulms.blacklist.repository.BlacklistRepository;
import com.ulms.book.entity.Book;
import com.ulms.book.repository.BookCopyRepository;
import com.ulms.book.repository.BookRepository;
import com.ulms.exception.ApiException;
import com.ulms.notification.entity.Notification;
import com.ulms.notification.repository.NotificationRepository;
import com.ulms.notification.service.NotificationService;
import com.ulms.payment.repository.FineRepository;
import com.ulms.payment.service.PaymentService;
import com.ulms.reservation.dto.*;
import com.ulms.reservation.entity.BorrowCart;
import com.ulms.reservation.entity.BorrowDetail;
import com.ulms.reservation.entity.BorrowRecord;
import com.ulms.reservation.entity.Reservation;
import com.ulms.reservation.repository.BorrowCartRepository;
import com.ulms.reservation.repository.BorrowDetailRepository;
import com.ulms.reservation.repository.BorrowRecordRepository;
import com.ulms.reservation.repository.ReservationRepository;
import com.ulms.util.PageResponse;
import com.ulms.util.SecurityUtil;
import com.ulms.util.UtilValidate;
import jakarta.persistence.*;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BorrowServiceImpl implements BorrowService{

    private final SecurityUtil securityUtil;
    private final UtilValidate utilValidate;
    private final BorrowCartRepository borrowCartRepository;
    private final BookRepository bookRepository;
    private final BookCopyRepository bookCopyRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final BorrowDetailRepository borrowDetailRepository;
    private final BlacklistRepository blacklistRepository;
    private final FineRepository fineRepository;
    private final PaymentService paymentService;
    private final ReservationRepository reservationRepository;
    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;


    @Override
    public void createBorrowCart(BorrowCartRequest request) {
        Long bookId = request.getBookId();
        Long userId = request.getUserId();

        User user = utilValidate.checkCurrentUser(userId);
        Book book = bookRepository.findByBookIdAndStatusTrue(bookId).orElse(null);
        if (book == null){
            throw new ApiException("Sách này không khả dụng. Vui lòng chọn sách khác");
        }

        Integer bookCopyNumber = bookCopyRepository.countByBookId(book.getBookId());
        if (bookCopyNumber < 1){
            throw new ApiException("Sách này không khả dụng. Vui lòng chọn sách khác");
        }

        if (borrowCartRepository.existsByBook_BookIdAndUser_UserId(bookId, userId)){
            throw new ApiException("Sách này đã đã thêm trước đó");
        }

        BorrowCart borrowCart = new BorrowCart();

        borrowCart.setBook(book);
        borrowCart.setUser(user);

        borrowCartRepository.save(borrowCart);

    }

    @Override
    public List<BorrowCartResponse> viewListBorrowCart() {
        User user = securityUtil.getCurrentUser();
        List<BorrowCartResponse> listCart = new ArrayList<>();
        Long userId = user.getUserId();

        List<BorrowCart> list = borrowCartRepository.findByUser_UserId(userId);
        if(list.isEmpty()){
            throw new ApiException("Danh sách trống");
        }

        for(BorrowCart b : list){
            BorrowCartResponse bcr = new BorrowCartResponse();
            Book book = b.getBook();
            Integer bookCopyNumber = bookCopyRepository.countByBookIdAndStatus(book.getBookId(), (byte)1);
            Boolean available = bookCopyNumber > 0 && book.getStatus();

            bcr.setCartId(b.getCartId());
            bcr.setBookId(book.getBookId());
            bcr.setTitle(book.getTitle());
            bcr.setCoverImageUrl(book.getCoverImageUrl());
            bcr.setAvailable(available);

            listCart.add(bcr);
        }
        return listCart;
    }

    @Override
    public void deleteBorrowCart(Long cartId) {
        User user = securityUtil.getCurrentUser();
        BorrowCart bc = borrowCartRepository.findByCartIdAndUser_UserId(cartId, user.getUserId());
        if (bc == null){
            throw new ApiException("Sách không tồn tại");
        }
        borrowCartRepository.delete(bc);
    }

    @Override
    public PageResponse<BorrowRecordListResponse> getListBorrowRecord(Byte status, Integer page, Integer size) {
        User user = securityUtil.getCurrentUser();
        Page<BorrowRecord> borrowRecords = searchPageableBorrowRecord(user.getUserId(),status, page, size);
        List<BorrowRecordListResponse> list = standardListBorrowRecordListResponse(borrowRecords);

        return new PageResponse<>(
                list,
                borrowRecords.getNumber(),
                borrowRecords.getSize(),
                borrowRecords.getTotalElements()
        );
    }

    @Override
    public BorrowRecordResponse getBorrowRecordDetail(Long borrowRecordId) {

        BorrowRecord br = borrowRecordRepository.findById(borrowRecordId).orElse(null);
        if (br == null){
            throw new ApiException("Hiện tại lịch sử này không khả dụng");
        }
        User user = securityUtil.getCurrentUser();
        if (!br.getUser().getUserId().equals(user.getUserId())) {
            throw new ApiException("Bạn không có quyền truy cập thông tin mượn sách này");
        }

        BorrowRecordResponse response = new BorrowRecordResponse();

        response.setBorrowId(br.getBorrowId());
        response.setUserId(br.getUser().getUserId());
        response.setUserName(br.getUser().getFullName());
        if (br.getLibrarian() != null) {
            response.setLibrarianId(br.getLibrarian().getUserId());
            response.setLibrarianName(br.getLibrarian().getFullName());
        }
        response.setBorrowDate(br.getBorrowDate());
        response.setDueDate(br.getDueDate());
        response.setDepositAmount(br.getDepositAmount());
        response.setExtensionCount(br.getExtensionCount());
        response.setStatus(br.getStatus());
        response.setDepositStatus(br.getDepositStatus());
        response.setNote(br.getNote());
        response.setCreatedAt(br.getCreatedAt());

        List<BorrowDetail> borrowDetails = borrowDetailRepository.findByBorrowRecord_BorrowId(borrowRecordId);
        if (borrowDetails.isEmpty()){
            throw new ApiException("Hiện tại lịch sử này không khả dụng");
        }

        List<BorrowDetailResponse> borrowDetailResponses = new ArrayList<>();
        for (BorrowDetail bd : borrowDetails){
            BorrowDetailResponse bdr = new BorrowDetailResponse();

            bdr.setDetailId(bd.getDetailId());
            bdr.setBorrowId(bd.getBorrowRecord().getBorrowId());
            bdr.setCopyId(bd.getBookCopy().getCopyId());
            bdr.setBarcode(bd.getBookCopy().getBarcode());
            // 3. Đổ đầy đủ thông tin Tên sách, Ảnh và Tác giả
            if (bd.getBookCopy() != null) {
                Book book = bookRepository.findById(bd.getBookCopy().getBookId()).orElse(null);

                if(book != null) {
                    bdr.setBookId(book.getBookId());
                    bdr.setBookTitle(book.getTitle());
                    bdr.setCoverImageUrl(book.getCoverImageUrl());
                    if (book.getAuthor() != null) {
                        bdr.setAuthorName(book.getAuthor().getName());
                    }
                }
            }
            bdr.setStatus(bd.getStatus());
            bdr.setReturnDate(bd.getReturnDate());
            bdr.setReturnStatus(bd.getReturnStatus());
            bdr.setNote(bd.getNote());

            borrowDetailResponses.add(bdr);
        }
        response.setListBorrowDetail(borrowDetailResponses);
        return response;
    }

    @Transactional
    @Override
    public void extendBorrowRecord(Long borrowId) {
        BorrowRecord borrowRecord = borrowRecordRepository.findById(borrowId).orElse(null);
        if (borrowRecord == null){
            throw new ApiException("Phiếu mượn sách yêu cầu không hợp lệ");
        }

        User user = securityUtil.getCurrentUser();
        if (!user.getUserId().equals(borrowRecord.getUser().getUserId())){
            throw new ApiException("Bạn không phải là người mượn sách này");
        }
        //Kiểm tra tình trang của phiếu mượn
        if (borrowRecord.getStatus() != 1) {
            throw new ApiException("Trạng thái gia hạn không thành công");
        }
        if (LocalDateTime.now().isAfter(borrowRecord.getDueDate())) {
            throw new ApiException("Sách đã quá hạn mượn, vui lòng mang đến quầy trả sách và nộp phạt");
        }
        if (borrowRecord.getExtensionCount() != 0) {
            throw new ApiException("Phiếu mượn đã hết lượt gia hạn (tối đa 1 lần)");
        }
        //Kiểm tra blacklist
        Blacklist blacklist = blacklistRepository.findByUser_UserId(user.getUserId());
        if (blacklist != null && blacklist.getIsActive()){
            throw new ApiException("Tài khoản của bạn vi phạm chính sách, không thể thực hiện chức năng này");
        }
        if (fineRepository.existsByUser_UserIdAndStatus(user.getUserId(), (byte) 0 )){
            throw new ApiException("Bạn đang có khoản nợ chưa được thanh toán");
        }
        //Tiến hành tự gia hạn
        borrowRecord.setDueDate(borrowRecord.getDueDate().plusDays(7));
        borrowRecord.setExtensionCount((byte) 1);
        borrowRecordRepository.save(borrowRecord);

        //Thông báo
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(notificationService.getNotificationTitle(5));
        notification.setType((byte) 1); // 4: PAYMENT
        notification.setIsRead(false);
        notificationRepository.save(notification);
    }

    @Transactional
    @Override
    public String purchaseDepositRecord(Byte paymentMethod, Long borrowId, HttpServletRequest request) {
        User user = securityUtil.getCurrentUser();
        if (user == null) {
            throw new ApiException("Vui lòng đăng nhập để thực hiện");
        }

        BorrowRecord borrowRecord = borrowRecordRepository.findById(borrowId).orElse(null);
        if (borrowRecord == null || !user.getUserId().equals(borrowRecord.getUser().getUserId())
                || borrowRecord.getStatus() != 0 || borrowRecord.getDepositStatus() != 3) {
            throw new ApiException("Khoản tiền cọc không xác định hoặc không ở trạng thái chờ thanh toán");
        }

        Reservation reservation = borrowRecord.getReservation();
        if (reservation == null || reservation.getStatus() != 1
                || (reservation.getExpiresAt() != null && reservation.getExpiresAt().isBefore(LocalDateTime.now()))
                || !reservation.getUser().getUserId().equals(user.getUserId())) {
            throw new ApiException("Khoản tiền cọc không xác định, phiếu mượn không còn khả dụng hoặc đã hết hạn giữ chỗ");
        }

        BigDecimal finalPrice = borrowRecord.getDepositAmount();
        if (finalPrice == null || finalPrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ApiException("Số tiền đặt cọc không hợp lệ");
        }

        // HÌNH THỨC 1: TIỀN MẶT TẠI QUẦY
        if (paymentMethod == 1) {
            paymentService.solveDeposit(user, borrowRecord, finalPrice, paymentMethod, "CASH_" + System.currentTimeMillis());
            return "Ghi nhận thanh toán tiền cọc bằng tiền mặt thành công";
        }

        // HÌNH THỨC 2: THANH TOÁN ONLINE VNPAY (paymentType = 3: DEPOSIT)
        if (paymentMethod == 2) {
            return paymentService.initPayment(user, (byte) 3, finalPrice, "Thanh toan tien coc muon sach #" + borrowId, borrowId, null, null, null, request);
        }

        throw new ApiException("Phương thức thanh toán không được hỗ trợ");
    }

    public Page<BorrowRecord> searchPageableBorrowRecord(Long userId, Byte status, Integer page, Integer size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<BorrowRecord> borrowRecords = borrowRecordRepository.getBorrowRecord(userId, status, pageable);
        return borrowRecords;
    }

    public List<BorrowRecordListResponse> standardListBorrowRecordListResponse(Page<BorrowRecord> request) {
        List<BorrowRecordListResponse> list = new ArrayList<>();

        for (BorrowRecord br : request.getContent()) {
            BorrowRecordListResponse response = new BorrowRecordListResponse();

            response.setBorrowId(br.getBorrowId());
            response.setUserId(br.getUser().getUserId());
            response.setUserName(br.getUser().getFullName());
            if (br.getLibrarian() != null) {
                response.setLibrarianId(br.getLibrarian().getUserId());
                response.setLibrarianName(br.getLibrarian().getFullName());
            }
            response.setBorrowDate(br.getBorrowDate());
            response.setDueDate(br.getDueDate());
            response.setDepositAmount(br.getDepositAmount());
            response.setExtensionCount(br.getExtensionCount());
            response.setStatus(br.getStatus());
            response.setDepositStatus(br.getDepositStatus());
            response.setNote(br.getNote());
            response.setCreatedAt(br.getCreatedAt());

            list.add(response);

        }
        return list;
    }
}
