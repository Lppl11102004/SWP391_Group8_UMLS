package com.ulms.reservation.service;

import com.ulms.auth.entity.User;
import com.ulms.blacklist.entity.Blacklist;
import com.ulms.blacklist.repository.BlacklistRepository;
import com.ulms.book.entity.Book;
import com.ulms.book.entity.BookCopy;
import com.ulms.book.repository.BookCopyRepository;
import com.ulms.book.repository.BookRepository;
import com.ulms.exception.ApiException;
import com.ulms.membership.service.SettingService;
import com.ulms.notification.entity.Notification;
import com.ulms.notification.repository.NotificationRepository;
import com.ulms.notification.service.NotificationService;
import com.ulms.reservation.dto.BorrowDetailResponse;
import com.ulms.reservation.dto.BorrowRecordResponse;
import com.ulms.reservation.dto.ReservationBookDetail;
import com.ulms.reservation.dto.ReservationDetailResponse;
import com.ulms.reservation.dto.ReservationListResponse;
import com.ulms.reservation.dto.ReservationRequest;
import com.ulms.reservation.entity.BorrowDetail;
import com.ulms.reservation.entity.BorrowRecord;
import com.ulms.reservation.entity.Reservation;
import com.ulms.reservation.entity.ReservationDetail;
import com.ulms.reservation.repository.*;
import com.ulms.util.PageResponse;
import com.ulms.util.SecurityUtil;
import com.ulms.util.UtilValidate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReservationServiceImpl implements ReservationService {

    private final UtilValidate utilValidate;
    private final BlacklistRepository blacklistRepository;
    private final BookCopyRepository bookCopyRepository;
    private final ReservationRepository reservationRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final BorrowDetailRepository borrowDetailRepository;
    private final SettingService settingService;
    private final BorrowCartRepository borrowCartRepository;
    private final NotificationService notificationService;
    private final BookRepository bookRepository;
    private final ReservationDetailRepository reservationDetailRepository;
    private final NotificationRepository notificationRepository;
    private final SecurityUtil securityUtil;


    @Transactional
    @Override
    public void createReservation(ReservationRequest request) {
        Long userId = request.getUserId();
        List<Long> listBookId = request.getBookId();
        if (listBookId == null || listBookId.isEmpty()) {
            throw new ApiException("Vui lòng chọn sách trước khi tạo ticket");
        }

        //Kiểm tra người dùng đã đăng nhập chưa
        User user = utilValidate.checkCurrentUser(userId);

        //Kiểm tra xem tài khoản có bị cấm mượn sách không
        Blacklist blacklist = blacklistRepository.findByUser_UserId(userId);
        if (blacklist != null && blacklist.getIsActive()) {
            throw new ApiException("Tài khoản của bạn hiện đang nằm trong danh sách hạn chế mượn sách. Vui lòng liên hệ thủ thư");
        }

        //Trong 1 ngày reader chỉ được tạo 2 ticket
        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay();
        Integer ticketNumber = reservationRepository.countByUser_UserIdAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(userId, start, end);
        if (ticketNumber >= 2) {
            throw new ApiException("Bạn đã vượt quá số lượng ticket tạo hôm nay. Hẹn vào ngày mai");
        }

        //Kiểm tra số sách đang mượn hiện tại trong hệ thống
        Integer bookBorrowNumber = 0;
        List<BorrowRecord> listBorrowRecords = borrowRecordRepository.findByUser_UserIdAndStatusIn(userId, List.of((byte) 0, (byte) 1, (byte) 3));
        if (!listBorrowRecords.isEmpty()) {
            for (BorrowRecord br : listBorrowRecords) {
                bookBorrowNumber += borrowDetailRepository.countByBorrowRecord_BorrowIdAndStatus(br.getBorrowId(), true);
            }
        }
        System.out.println("=====Số lượng sách của user hiện tại đã mượn: " + bookBorrowNumber);
        int limitBookBorrow = Integer.parseInt(settingService.getRuleBorrow().getSettingValue());
        if (bookBorrowNumber + listBookId.size() > limitBookBorrow) {
            throw new ApiException("Bạn đã vượt quá số lượng sách được mượn theo quy định là " + limitBookBorrow);
        }

        //Kiểm tra có bị trùng lặp sách không
        if (listBookId.stream().distinct().count() < listBookId.size()) {
            throw new ApiException("Phát hiện sách bị trùng");
        }

        //Kiểm tra tính khả dụng của sách - Lấy ra danh sách Book tránh gọi DB nhiều lần
        List<Book> listBooks = new ArrayList<>();
        for (Long bookId : listBookId) {
            if (bookCopyRepository.countByBookIdAndStatus(bookId, (byte) 1) == 0) {
                throw new ApiException("Phát hiện sách đã hết bản sao");
            }
            Book book = bookRepository.findById(bookId).orElse(null);
            if (book == null || !book.getStatus()) {
                throw new ApiException("Thông tin sách mới vừa cập nhật vui lòng tạo lại Ticket");
            }
            listBooks.add(book);
        }

        //== Them vao 2 bang Reservation
        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setStatus((byte) 0);
        reservation.setNote(request.getNote());
        Reservation newReservation = reservationRepository.save(reservation);

        //== Lưu vào ReservationDetail
        for (Book book : listBooks) {
            ReservationDetail reservationDetail = new ReservationDetail();
            reservationDetail.setReservation(newReservation);
            reservationDetail.setBook(book);
            reservationDetailRepository.save(reservationDetail);
        }
        //== Xoa khỏi Cart và
        borrowCartRepository.deleteByUser_UserIdAndBook_BookIdIn(userId, listBookId);
        //== Tạo thông báo
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(notificationService.getNotificationTitle(0));
        notification.setType((byte) 1);
        notification.setIsRead(false);
        notificationRepository.save(notification);
    }

    @Override
    public PageResponse<ReservationListResponse> getListReservations(Byte status, Integer page, Integer size) {
        User user = securityUtil.getCurrentUser();

        Page<Reservation> reservations = searchPageableReservation(user.getUserId(), status, page, size);
        List<ReservationListResponse> list = standardListReservationResponse(reservations);

        return new PageResponse<>(
                list,
                reservations.getNumber(),
                reservations.getSize(),
                reservations.getTotalElements()
        );
    }

    public Page<Reservation> searchPageableReservation(Long userId, Byte status, Integer page, Integer size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<Reservation> reservations = reservationRepository.searchReservations(userId, status, pageable);
        return reservations;
    }

    public List<ReservationListResponse> standardListReservationResponse(Page<Reservation> request) {
        List<ReservationListResponse> list = new ArrayList<>();

        for (Reservation r : request.getContent()) {
            ReservationListResponse response = new ReservationListResponse();

            response.setReservationId(r.getReservationId());
            response.setStatus(r.getStatus());
            response.setNote(r.getNote());
            response.setCreatedAt(r.getCreatedAt());

            list.add(response);
        }
        return list;
    }

    @Override
    public ReservationDetailResponse getReservationDetail(Long reservationId) {
        //Kiểm tra User đã login chưa
        User user = securityUtil.getCurrentUser();
        //Kiểm tra xem có Ticket phù hợp không
        Reservation reservation = reservationRepository.findByReservationIdAndUser_UserId(reservationId, user.getUserId());
        if (reservation == null) {
            throw new ApiException("Ticket này không hợp lễ");
        }
        //Lấy ra danh sách RAW: lưu book yêu cầu mượn của ticket
        List<ReservationDetail> listRDetail = reservationDetailRepository.findByReservation_ReservationId(reservationId);
        //Tạo danh sách đầy đủ hiển thị các thông tin
        List<ReservationBookDetail> listDetail = new ArrayList<>();
        for (ReservationDetail rd : listRDetail) {
            ReservationBookDetail r = new ReservationBookDetail();

            r.setReservationDetailId(rd.getReservationDetailId());
            r.setBookId(rd.getBook().getBookId());
            r.setBookTitle(rd.getBook().getTitle());
            r.setCoverImageUrl(rd.getBook().getCoverImageUrl());
            r.setAuthorName(rd.getBook().getAuthor().getName());

            listDetail.add(r);
        }
        //Tạo thông tin xuất ra ngoài
        ReservationDetailResponse result = new ReservationDetailResponse();
        result.setReservationId(reservationId);
        result.setStatus(reservation.getStatus());
        result.setNote(reservation.getNote());
        result.setCreatedAt(reservation.getCreatedAt());
        result.setApprovedAt(reservation.getApprovedAt());
        result.setExpiresAt(reservation.getExpiresAt());
        result.setUpdatedAt(reservation.getUpdatedAt());
        result.setListBook(listDetail);

        // Lấy thông tin BorrowRecord và danh sách BorrowDetail nếu đơn đã được duyệt/xử lý
        BorrowRecord borrowRecord = borrowRecordRepository.findByReservation_ReservationId(reservationId);
        if (borrowRecord != null) {
            result.setBorrowRecordId(borrowRecord.getBorrowId());
            result.setBorrowStatus(borrowRecord.getStatus());
            result.setDepositStatus(borrowRecord.getDepositStatus());
            result.setDepositAmount(borrowRecord.getDepositAmount());
            result.setBorrowDate(borrowRecord.getBorrowDate());
            result.setDueDate(borrowRecord.getDueDate());

            List<BorrowDetail> borrowDetails = borrowDetailRepository.findByBorrowRecord_BorrowId(borrowRecord.getBorrowId());
            List<BorrowDetailResponse> bdrList = new ArrayList<>();
            for (BorrowDetail bd : borrowDetails) {
                BorrowDetailResponse bdr = new BorrowDetailResponse();
                bdr.setDetailId(bd.getDetailId());
                bdr.setBorrowId(bd.getBorrowRecord() != null ? bd.getBorrowRecord().getBorrowId() : null);
                if (bd.getBookCopy() != null) {
                    bdr.setCopyId(bd.getBookCopy().getCopyId());
                    bdr.setBarcode(bd.getBookCopy().getBarcode());
                    Book book = bookRepository.findById(bd.getBookCopy().getBookId()).orElse(null);
                    if (book != null) {
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
                bdrList.add(bdr);
            }
            result.setListBorrowDetail(bdrList);

            BorrowRecordResponse brResp = new BorrowRecordResponse();
            brResp.setBorrowId(borrowRecord.getBorrowId());
            if (borrowRecord.getUser() != null) {
                brResp.setUserId(borrowRecord.getUser().getUserId());
                brResp.setUserName(borrowRecord.getUser().getFullName());
            }
            if (borrowRecord.getLibrarian() != null) {
                brResp.setLibrarianId(borrowRecord.getLibrarian().getUserId());
                brResp.setLibrarianName(borrowRecord.getLibrarian().getFullName());
            }
            brResp.setBorrowDate(borrowRecord.getBorrowDate());
            brResp.setDueDate(borrowRecord.getDueDate());
            brResp.setDepositAmount(borrowRecord.getDepositAmount());
            brResp.setExtensionCount(borrowRecord.getExtensionCount());
            brResp.setStatus(borrowRecord.getStatus());
            brResp.setDepositStatus(borrowRecord.getDepositStatus());
            brResp.setNote(borrowRecord.getNote());
            brResp.setCreatedAt(borrowRecord.getCreatedAt());
            brResp.setListBorrowDetail(bdrList);

            result.setBorrowRecord(brResp);
        }

        return result;
    }

    @Transactional
    @Override
    public void cancelReservation(Long reservationId) {
        //Kiểm tra User đã login chưa
        User user = securityUtil.getCurrentUser();
        //Kiểm tra xem có Ticket phù hợp không
        Reservation reservation = reservationRepository.findByReservationIdAndUser_UserId(reservationId, user.getUserId());
        if (reservation == null) {
            throw new ApiException("Ticket này không hợp lệ. Yêu cầu thất bại");
        }
        if (reservation.getStatus() != 0 && reservation.getStatus() != 1) {
            throw new ApiException("Trạng thái Ticket không phù hợp để thực hiện thao tác này");
        }

        //Nếu status = 1 cần điều chỉnh lại bảng BorrowRecord(status)/ BorrowDetail/ BookCopy(status)
        if (reservation.getStatus() == 1) {
            BorrowRecord borrowRecord = borrowRecordRepository.findByReservation_ReservationIdAndUser_UserId(reservationId, user.getUserId());
            if (borrowRecord == null || borrowRecord.getStatus() != 0) {
                throw new ApiException("Không có bản ghi mượn sách hoặc trạng thái không cho phép huỷ bởi người dùng");
            }
            borrowRecord.setStatus((byte) 4);
            borrowRecordRepository.save(borrowRecord);

            List<BorrowDetail> borrowDetails = borrowDetailRepository.findByBorrowRecord_BorrowId(borrowRecord.getBorrowId());
            for (BorrowDetail bd : borrowDetails) {
                BookCopy bookCopy;
                if (bd.getStatus()) {
                    bookCopy = bd.getBookCopy();
                    bookCopy.setStatus((byte) 1);
                    bookCopyRepository.save(bookCopy);
                }
            }
        }
        //Nếu status = 0, 1 sẽ huỷ Ticket
        reservation.setStatus((byte) 3);
        reservationRepository.save(reservation);

        //== Tạo thông báo
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(notificationService.getNotificationTitle(1));
        notification.setType((byte) 1);
        notification.setIsRead(false);
        notificationRepository.save(notification);

    }


    @Scheduled(fixedDelay = 60_000)
    @Transactional
    @Override
    public void autoCancelReservationExpired() {
        List<Reservation> listReservationExpire = reservationRepository.findByStatusAndExpiresAtLessThan((byte) 1, LocalDateTime.now());
        if (listReservationExpire == null || listReservationExpire.isEmpty()) {
            return;
        }

        for (Reservation reservation : listReservationExpire) {
            try {
                //Chuyển reservation sang trạng thái EXPIRE
                reservation.setStatus((byte) 5);
                reservationRepository.save(reservation);

                //Tìm Borrow Record tương ứng
                BorrowRecord borrowRecord = borrowRecordRepository.findByReservation_ReservationId(reservation.getReservationId());
                if (borrowRecord != null && borrowRecord.getStatus() == 0) {
                    // Huỷ borrow record
                    borrowRecord.setStatus((byte) 4);
                    borrowRecordRepository.save(borrowRecord);

                    //Trả danh sách book copy về status = 1
                    List<BorrowDetail> borrowDetails = borrowDetailRepository.findByBorrowRecord_BorrowId(borrowRecord.getBorrowId());
                    for (BorrowDetail bd : borrowDetails) {
                        BookCopy bookCopy;
                        if (bd.getStatus()) {
                            bookCopy = bd.getBookCopy();
                            bookCopy.setStatus((byte) 1);
                            bookCopyRepository.save(bookCopy);
                        }
                    }
                }

                //Gửi thông báo
                Notification notification = new Notification();
                notification.setUser(reservation.getUser());
                notification.setTitle(notificationService.getNotificationTitle(2));
                notification.setType((byte) 1);
                notification.setIsRead(false);
                notificationRepository.save(notification);

            } catch (Exception e) {
                System.err.println("Lỗi khi tự động hủy Reservation #" + reservation.getReservationId() + ": " + e.getMessage());
            }


        }

    }

}
