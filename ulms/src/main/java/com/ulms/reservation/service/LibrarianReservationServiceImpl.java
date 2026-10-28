package com.ulms.reservation.service;

import com.ulms.auth.entity.User;
import com.ulms.book.entity.Book;
import com.ulms.book.entity.BookCopy;
import com.ulms.book.repository.BookCopyRepository;
import com.ulms.book.repository.BookRepository;
import com.ulms.exception.ApiException;
import com.ulms.membership.entity.MembershipPlan;
import com.ulms.membership.entity.UserMembership;
import com.ulms.membership.repository.UserMembershipRepository;
import com.ulms.notification.entity.Notification;
import com.ulms.notification.repository.NotificationRepository;
import com.ulms.reservation.dto.*;
import com.ulms.reservation.entity.BorrowDetail;
import com.ulms.reservation.entity.BorrowRecord;
import com.ulms.reservation.entity.Reservation;
import com.ulms.reservation.entity.ReservationDetail;
import com.ulms.reservation.repository.BorrowDetailRepository;
import com.ulms.reservation.repository.BorrowRecordRepository;
import com.ulms.reservation.repository.ReservationDetailRepository;
import com.ulms.reservation.repository.ReservationRepository;
import com.ulms.util.PageResponse;
import com.ulms.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.ulms.payment.entity.Fine;
import com.ulms.payment.entity.Payment;
import com.ulms.payment.repository.FineRepository;
import com.ulms.payment.repository.PaymentRepository;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LibrarianReservationServiceImpl implements LibrarianReservationService {

    private final ReservationRepository reservationRepository;
    private final ReservationDetailRepository reservationDetailRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final BorrowDetailRepository borrowDetailRepository;
    private final BookCopyRepository bookCopyRepository;
    private final BookRepository bookRepository;
    private final UserMembershipRepository userMembershipRepository;
    private final NotificationRepository notificationRepository;
    private final FineRepository fineRepository;
    private final PaymentRepository paymentRepository;
    private final com.ulms.blacklist.repository.BlacklistRepository blacklistRepository;
    private final com.ulms.payment.service.PaymentService paymentService;
    private final SecurityUtil securityUtil;

    @Override
    public PageResponse<LibrarianReservationListResponse> getReservations(Byte status, String keyword, Integer page, Integer size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Reservation> reservationPage = reservationRepository.searchReservationsForLibrarian(status, keyword, pageable);

        List<LibrarianReservationListResponse> list = new ArrayList<>();
        for (Reservation r : reservationPage.getContent()) {
            LibrarianReservationListResponse item = new LibrarianReservationListResponse();
            item.setReservationId(r.getReservationId());
            if (r.getUser() != null) {
                item.setUserId(r.getUser().getUserId());
                item.setReaderName(r.getUser().getFullName());
                item.setReaderEmail(r.getUser().getEmail());
                item.setReaderPhone(r.getUser().getPhone());
            }
            item.setStatus(r.getStatus());
            item.setNote(r.getNote());
            item.setCreatedAt(r.getCreatedAt());
            item.setApprovedAt(r.getApprovedAt());
            item.setExpiresAt(r.getExpiresAt());

            List<ReservationDetail> details = reservationDetailRepository.findByReservation_ReservationId(r.getReservationId());
            item.setTotalBooks(details.size());

            int availableCount = 0;
            for (ReservationDetail d : details) {
                if (d.getBook() != null) {
                    Integer count = bookCopyRepository.countByBookIdAndStatus(d.getBook().getBookId(), (byte) 1);
                    if (count != null && count > 0) {
                        availableCount++;
                    }
                }
            }
            item.setAvailableBooks(availableCount);
            list.add(item);
        }

        return new PageResponse<>(list, reservationPage.getNumber(), reservationPage.getSize(), reservationPage.getTotalElements());
    }

    @Override
    public LibrarianReservationDetailResponse getReservationDetail(Long reservationId) {
        Reservation r = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ApiException("Không tìm thấy thông tin ticket #" + reservationId));

        LibrarianReservationDetailResponse response = new LibrarianReservationDetailResponse();
        response.setReservationId(r.getReservationId());
        response.setStatus(r.getStatus());
        response.setNote(r.getNote());
        response.setCreatedAt(r.getCreatedAt());
        response.setApprovedAt(r.getApprovedAt());
        response.setExpiresAt(r.getExpiresAt());

        User reader = r.getUser();
        if (reader != null) {
            response.setUserId(reader.getUserId());
            response.setReaderName(reader.getFullName());
            response.setReaderEmail(reader.getEmail());
            response.setReaderPhone(reader.getPhone());

            // Lấy thông tin gói hội viên
            UserMembership um = userMembershipRepository.findByUser_UserId(reader.getUserId());
            if (um != null && Byte.valueOf((byte) 1).equals(um.getStatus())
                    && (um.getEndDate() == null || um.getEndDate().isAfter(LocalDateTime.now()))
                    && um.getMembershipPlan() != null) {
                response.setMembershipPlanName(um.getMembershipPlan().getName());
                response.setDepositDiscountPct(um.getMembershipPlan().getDepositDiscountPct());
            }
        }

        // Lấy thông tin BorrowRecord nếu đã approve
        BorrowRecord br = borrowRecordRepository.findByReservation_ReservationId(r.getReservationId());
        if (br != null) {
            response.setBorrowRecordId(br.getBorrowId());
            response.setBorrowStatus(br.getStatus());
            response.setDepositStatus(br.getDepositStatus());
            response.setDepositAmount(br.getDepositAmount());
        }

        // Lấy chi tiết sách và số bản sao khả dụng thời gian thực
        List<ReservationDetail> details = reservationDetailRepository.findByReservation_ReservationId(reservationId);
        List<LibrarianReservationItemResponse> bookResponses = new ArrayList<>();

        for (ReservationDetail d : details) {
            Book book = d.getBook();
            if (book == null) continue;

            LibrarianReservationItemResponse item = new LibrarianReservationItemResponse();
            item.setReservationDetailId(d.getReservationDetailId());
            item.setBookId(book.getBookId());
            item.setTitle(book.getTitle());
            item.setCoverImageUrl(book.getCoverImageUrl());
            if (book.getAuthor() != null) {
                item.setAuthorName(book.getAuthor().getName());
            }
            item.setPrice(book.getPrice());

            Integer avail = bookCopyRepository.countByBookIdAndStatus(book.getBookId(), (byte) 1);
            int availableCopies = avail != null ? avail : 0;
            item.setAvailableCopies(availableCopies);
            item.setIsAvailable(availableCopies > 0);

            // Nếu đã tạo borrow_detail thì lấy mã barcode đã gán
            if (br != null) {
                List<BorrowDetail> borrowDetails = borrowDetailRepository.findByBorrowRecord_BorrowId(br.getBorrowId());
                for (BorrowDetail bd : borrowDetails) {
                    if (bd.getBookCopy() != null && book.getBookId().equals(bd.getBookCopy().getBookId())) {
                        item.setAssignedBarcode(bd.getBookCopy().getBarcode());
                        break;
                    }
                }
            }
            bookResponses.add(item);
        }

        response.setBooks(bookResponses);
        return response;
    }

    @Transactional
    @Override
    public void approveReservation(Long reservationId) {
        Reservation r = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ApiException("Không tìm thấy thông tin ticket #" + reservationId));

        if (r.getStatus() != 0) {
            throw new ApiException("Chỉ có thể duyệt ticket đang ở trạng thái Chờ duyệt (PENDING)");
        }

        User librarian = securityUtil.getCurrentUser();
        User reader = r.getUser();
        if (reader == null) {
            throw new ApiException("Không tìm thấy thông tin độc giả của ticket này");
        }

        List<ReservationDetail> details = reservationDetailRepository.findByReservation_ReservationId(reservationId);
        if (details.isEmpty()) {
            throw new ApiException("Ticket này không có sách để duyệt");
        }

        List<BookCopy> assignedCopies = new ArrayList<>();
        List<Book> availableBooks = new ArrayList<>();

        for (ReservationDetail d : details) {
            Book book = d.getBook();
            if (book == null) continue;

            BookCopy copy = bookCopyRepository.findFirstByBookIdAndStatus(book.getBookId(), (byte) 1);
            if (copy != null) {
                assignedCopies.add(copy);
                availableBooks.add(book);
            }
        }

        if (assignedCopies.isEmpty()) {
            throw new ApiException("Tất cả sách trong ticket này đều đã hết bản sao khả dụng trong kho! Vui lòng từ chối ticket.");
        }

        // Tính tiền cọc: 50% giá trị của từng cuốn sách khả dụng
        BigDecimal totalBaseDeposit = BigDecimal.ZERO;
        for (Book b : availableBooks) {
            BigDecimal price = b.getPrice() != null ? b.getPrice() : BigDecimal.ZERO;
            BigDecimal halfPrice = price.multiply(new BigDecimal("0.5"));
            totalBaseDeposit = totalBaseDeposit.add(halfPrice);
        }

        // Kiểm tra chính sách giảm giá cọc theo Hội viên
        BigDecimal finalDeposit = totalBaseDeposit;
        UserMembership um = userMembershipRepository.findByUser_UserId(reader.getUserId());
        if (um != null && Byte.valueOf((byte) 1).equals(um.getStatus())
                && (um.getEndDate() == null || um.getEndDate().isAfter(LocalDateTime.now()))
                && um.getMembershipPlan() != null) {
            MembershipPlan plan = um.getMembershipPlan();
            Short discountPct = plan.getDepositDiscountPct();
            if (discountPct != null && discountPct > 0) {
                if (discountPct >= 100) {
                    finalDeposit = BigDecimal.ZERO;
                } else {
                    BigDecimal discountRate = BigDecimal.valueOf(discountPct).divide(BigDecimal.valueOf(100));
                    BigDecimal discountAmount = totalBaseDeposit.multiply(discountRate);
                    finalDeposit = totalBaseDeposit.subtract(discountAmount);
                }
            }
        }

        if (finalDeposit.compareTo(BigDecimal.ZERO) < 0) {
            finalDeposit = BigDecimal.ZERO;
        }

        // 1. Tạo BorrowRecord (status = 0: PENDING, depositStatus = 3: UNPAID)
        BorrowRecord br = new BorrowRecord();
        br.setUser(reader);
        br.setLibrarian(librarian);
        br.setReservation(r);
        br.setBorrowDate(LocalDateTime.now());
        br.setDueDate(LocalDateTime.now().plusDays(14));
        br.setDepositAmount(finalDeposit);
        br.setExtensionCount((byte) 0);
        br.setStatus((byte) 0); // 0: PENDING (Chờ đến lấy sách)
        if (finalDeposit.compareTo(BigDecimal.ZERO) == 0) {
            br.setDepositStatus((byte) 0); // 0: NO_DEPOSIT (Miễn cọc hoặc không yêu cầu cọc)
        } else {
            br.setDepositStatus((byte) 3); // 3: UNPAID (Chờ thanh toán cọc)
        }
        br.setNote("Đã duyệt " + assignedCopies.size() + "/" + details.size() + " cuốn sách khả dụng");
        br.setUpdatedAt(LocalDateTime.now());
        borrowRecordRepository.save(br);

        // 2. Tạo BorrowDetail và khóa BookCopy (status = 2: RESERVED)
        for (BookCopy copy : assignedCopies) {
            copy.setStatus((byte) 2);
            copy.setUpdatedAt(LocalDateTime.now());
            bookCopyRepository.save(copy);

            BorrowDetail bd = new BorrowDetail();
            bd.setBorrowRecord(br);
            bd.setBookCopy(copy);
            bd.setStatus(true);
            borrowDetailRepository.save(bd);
        }

        // 3. Cập nhật Reservation (status = 1: APPROVED)
        r.setStatus((byte) 1);
        r.setApprovedAt(LocalDateTime.now());
        r.setExpiresAt(LocalDateTime.now().plusDays(3));
        r.setUpdatedAt(LocalDateTime.now());
        reservationRepository.save(r);

        // 4. Gửi thông báo cho Độc giả
        Notification notification = new Notification();
        notification.setUser(reader);
        notification.setTitle("Phiếu mượn #" + reservationId + " đã được duyệt thành công! Tiền cọc: " + finalDeposit + " VNĐ. Vui lòng đến nhận trước " + r.getExpiresAt().toLocalDate());
        notification.setType((byte) 1);
        notification.setIsRead(false);
        notificationRepository.save(notification);
    }

    @Transactional
    @Override
    public void rejectReservation(Long reservationId, RejectReservationRequest request) {
        Reservation r = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ApiException("Không tìm thấy thông tin ticket #" + reservationId));

        if (r.getStatus() != 0) {
            throw new ApiException("Chỉ có thể từ chối ticket đang ở trạng thái Chờ duyệt (PENDING)");
        }

        String note = (request != null && request.getNote() != null && !request.getNote().isBlank())
                ? request.getNote()
                : "Thủ thư từ chối duyệt yêu cầu mượn sách";

        r.setStatus((byte) 4); // 4: REJECTED
        r.setNote(note);
        r.setUpdatedAt(LocalDateTime.now());
        reservationRepository.save(r);

        if (r.getUser() != null) {
            Notification notification = new Notification();
            notification.setUser(r.getUser());
            notification.setTitle("Yêu cầu mượn sách #" + reservationId + " đã bị từ chối. Lý do: " + note);
            notification.setType((byte) 1);
            notification.setIsRead(false);
            notificationRepository.save(notification);
        }
    }

    @Transactional
    @Override
    public void handoverBooks(Long borrowId, HandoverRequest request) {
        BorrowRecord br = borrowRecordRepository.findById(borrowId)
                .orElseThrow(() -> new ApiException("Không tìm thấy phiếu mượn #" + borrowId));

        if (br.getStatus() != 0) {
            throw new ApiException("Phiếu mượn này không ở trạng thái Chờ bàn giao (PENDING)");
        }

        if (br.getDepositAmount() != null && br.getDepositAmount().compareTo(BigDecimal.ZERO) > 0 && br.getDepositStatus() != 1) {
            throw new ApiException("Độc giả chưa hoàn tất thanh toán tiền cọc (" + br.getDepositAmount() + " VNĐ). Không thể bàn giao sách!");
        }

        User librarian = securityUtil.getCurrentUser();

        // Cập nhật BorrowRecord sang BORROWING (1)
        br.setStatus((byte) 1); // 1: BORROWING
        br.setBorrowDate(LocalDateTime.now());
        br.setDueDate(LocalDateTime.now().plusDays(14));
        br.setLibrarian(librarian);
        if (request != null && request.getNote() != null && !request.getNote().isBlank()) {
            br.setNote(request.getNote());
        }
        br.setUpdatedAt(LocalDateTime.now());
        borrowRecordRepository.save(br);

        // Cập nhật Reservation sang COMPLETED (2)
        Reservation r = br.getReservation();
        if (r != null) {
            r.setStatus((byte) 2); // 2: COMPLETED
            r.setUpdatedAt(LocalDateTime.now());
            reservationRepository.save(r);
        }

        // Bắn thông báo bàn giao thành công
        if (br.getUser() != null) {
            Notification notification = new Notification();
            notification.setUser(br.getUser());
            notification.setTitle("Bạn đã nhận sách thành công cho phiếu mượn #" + borrowId + ". Hạn trả sách: " + br.getDueDate().toLocalDate());
            notification.setType((byte) 1);
            notification.setIsRead(false);
            notificationRepository.save(notification);
        }
    }

    @Override
    public PageResponse<BorrowRecordListResponse> getBorrowRecords(Byte status, Byte depositStatus, String keyword, Integer page, Integer size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<BorrowRecord> pageResult = borrowRecordRepository.searchBorrowRecordsForLibrarian(status, depositStatus, keyword, pageable);

        List<BorrowRecordListResponse> list = new ArrayList<>();
        for (BorrowRecord br : pageResult.getContent()) {
            BorrowRecordListResponse item = new BorrowRecordListResponse();
            item.setBorrowId(br.getBorrowId());
            if (br.getUser() != null) {
                item.setUserId(br.getUser().getUserId());
                item.setUserName(br.getUser().getFullName());
            }
            if (br.getLibrarian() != null) {
                item.setLibrarianId(br.getLibrarian().getUserId());
                item.setLibrarianName(br.getLibrarian().getFullName());
            }
            item.setBorrowDate(br.getBorrowDate());
            item.setDueDate(br.getDueDate());
            item.setDepositAmount(br.getDepositAmount());
            item.setExtensionCount(br.getExtensionCount());
            item.setStatus(br.getStatus());
            item.setDepositStatus(br.getDepositStatus());
            item.setNote(br.getNote());
            item.setCreatedAt(br.getCreatedAt());
            list.add(item);
        }

        return new PageResponse<>(list, pageResult.getNumber(), pageResult.getSize(), pageResult.getTotalElements());
    }

    @Override
    public BorrowRecordResponse getBorrowRecordDetail(Long borrowId) {
        BorrowRecord br = borrowRecordRepository.findById(borrowId)
                .orElseThrow(() -> new ApiException("Không tìm thấy thông tin phiếu mượn #" + borrowId));

        BorrowRecordResponse response = new BorrowRecordResponse();
        response.setBorrowId(br.getBorrowId());
        if (br.getUser() != null) {
            response.setUserId(br.getUser().getUserId());
            response.setUserName(br.getUser().getFullName());
        }
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

        List<BorrowDetail> details = borrowDetailRepository.findByBorrowRecord_BorrowId(borrowId);
        List<BorrowDetailResponse> detailResponses = new ArrayList<>();
        for (BorrowDetail bd : details) {
            BorrowDetailResponse bdr = new BorrowDetailResponse();
            bdr.setDetailId(bd.getDetailId());
            bdr.setBorrowId(br.getBorrowId());
            if (bd.getBookCopy() != null) {
                bdr.setCopyId(bd.getBookCopy().getCopyId());
                bdr.setBarcode(bd.getBookCopy().getBarcode());
                Book b = bookRepository.findById(bd.getBookCopy().getBookId()).orElse(null);
                if (b != null) {
                    bdr.setBookId(b.getBookId());
                    bdr.setBookTitle(b.getTitle());
                    bdr.setCoverImageUrl(b.getCoverImageUrl());
                    if (b.getAuthor() != null) {
                        bdr.setAuthorName(b.getAuthor().getName());
                    }
                }
            }
            bdr.setStatus(bd.getStatus());
            bdr.setReturnDate(bd.getReturnDate());
            bdr.setReturnStatus(bd.getReturnStatus());
            bdr.setNote(bd.getNote());
            detailResponses.add(bdr);
        }
        response.setListBorrowDetail(detailResponses);

        return response;
    }

    @Transactional
    @Override
    public void returnBooks(Long borrowId, ReturnBookRequest request) {
        BorrowRecord br = borrowRecordRepository.findById(borrowId)
                .orElseThrow(() -> new ApiException("Không tìm thấy phiếu mượn #" + borrowId));

        if (br.getStatus() != 1 && br.getStatus() != 3) {
            throw new ApiException("Phiếu mượn không ở trạng thái đang mượn hoặc quá hạn để trả sách");
        }

        List<BorrowDetail> details = borrowDetailRepository.findByBorrowRecord_BorrowId(borrowId);
        if (details.isEmpty()) {
            throw new ApiException("Không tìm thấy chi tiết sách của phiếu mượn #" + borrowId);
        }

        LocalDateTime now = LocalDateTime.now();
        User reader = br.getUser();

        // 1. Cập nhật chi tiết từng cuốn sách
        for (BorrowDetail bd : details) {
            BookCopy copy = bd.getBookCopy();
            if (copy == null) continue;

            bd.setReturnDate(now);
            bd.setStatus(false);

            CopyReturnItemRequest itemReq = null;
            if (request != null && request.getItems() != null) {
                for (CopyReturnItemRequest item : request.getItems()) {
                    if (copy.getCopyId().equals(item.getCopyId())) {
                        itemReq = item;
                        break;
                    }
                }
            }

            Byte returnStatus = (itemReq != null && itemReq.getReturnStatus() != null) ? itemReq.getReturnStatus() : (byte) 1;
            bd.setReturnStatus(returnStatus);
            if (itemReq != null && itemReq.getDamageNote() != null) {
                bd.setNote(itemReq.getDamageNote());
            }

            // Cập nhật trạng thái BookCopy
            if (returnStatus == 1) { // 1: GOOD
                copy.setStatus((byte) 1); // 1: AVAILABLE
            } else if (returnStatus == 2) { // 2: DAMAGED
                copy.setStatus((byte) 3); // 3: DAMAGED
            } else if (returnStatus == 3) { // 3: LOST
                copy.setStatus((byte) 4); // 4: LOST
            }
            copy.setUpdatedAt(now);
            bookCopyRepository.save(copy);
            borrowDetailRepository.save(bd);

            // Nếu hỏng hoặc mất và có fineAmount -> tạo bản ghi Fine riêng
            if (itemReq != null && (returnStatus == 2 || returnStatus == 3)
                    && itemReq.getFineAmount() != null && itemReq.getFineAmount().compareTo(BigDecimal.ZERO) > 0) {
                Fine fine = new Fine();
                fine.setBorrowRecord(br);
                fine.setUser(reader);
                fine.setBookCopy(copy);
                fine.setAmount(itemReq.getFineAmount());
                fine.setReason(returnStatus); // 2: DAMAGED, 3: LOST
                fine.setStatus((byte) 0); // 0: UNPAID
                fine.setNote(itemReq.getDamageNote() != null ? itemReq.getDamageNote() : (returnStatus == 2 ? "Phạt hỏng sách" : "Phạt mất sách"));
                fine.setUpdatedAt(now);
                fineRepository.save(fine);
            }
        }

        // 2. Cập nhật BorrowRecord
        br.setStatus((byte) 2); // 2: RETURNED
        if (request != null && request.getNote() != null && !request.getNote().isBlank()) {
            br.setNote(request.getNote());
        }
        br.setUpdatedAt(now);

        // 3. Hoàn trả tiền cọc độc lập (Deposit Refund)
        if (br.getDepositStatus() != null && br.getDepositStatus() == 1
                && br.getDepositAmount() != null && br.getDepositAmount().compareTo(BigDecimal.ZERO) > 0) {
            br.setDepositStatus((byte) 2); // 2: REFUNDED

            Payment refundPayment = new Payment();
            refundPayment.setUser(reader);
            refundPayment.setBorrowRecord(br);
            refundPayment.setPaymentType((byte) 4); // 4: DEPOSIT_REFUND
            refundPayment.setPaymentMethod((byte) 1); // 1: CASH (hoàn tiền mặt tại quầy)
            refundPayment.setAmount(br.getDepositAmount());
            refundPayment.setTxnRef("REFUND_" + System.currentTimeMillis());
            refundPayment.setStatus((byte) 1); // 1: SUCCESS
            refundPayment.setNote("Hoàn trả tiền cọc cho phiếu mượn #" + br.getBorrowId());
            refundPayment.setPaidAt(now);
            refundPayment.setCreatedAt(now);
            paymentRepository.save(refundPayment);
        }
        borrowRecordRepository.save(br);

        // 4. Bắn thông báo cho Độc giả
        if (reader != null) {
            Notification notification = new Notification();
            notification.setUser(reader);
            notification.setTitle("Phiếu mượn #" + borrowId + " đã hoàn tất trả sách. Tiền cọc đã được xử lý hoàn trả.");
            notification.setType((byte) 1);
            notification.setIsRead(false);
            notificationRepository.save(notification);
        }
    }

    @Override
    public LibrarianDashboardResponse getDashboardStatistics() {
        LocalDateTime now = LocalDateTime.now();

        Integer pendingReservations = reservationRepository.countByStatus((byte) 0);
        Integer activeBorrows = borrowRecordRepository.countByStatus((byte) 1);
        Integer overdueBorrows = borrowRecordRepository.countOverdueBorrows(now);

        Integer unpaidFinesCount = fineRepository.countByStatus((byte) 0);
        BigDecimal unpaidFineAmount = fineRepository.sumAmountByStatus((byte) 0);

        Integer activeBlacklists = blacklistRepository.countByIsActiveTrue();

        long totalBooks = bookRepository.count();
        long totalCopies = bookCopyRepository.count();
        Integer availableCopies = bookCopyRepository.countByStatus((byte) 1);

        LibrarianDashboardResponse res = new LibrarianDashboardResponse();
        res.setPendingReservations(pendingReservations != null ? pendingReservations : 0);
        res.setActiveBorrows(activeBorrows != null ? activeBorrows : 0);
        res.setOverdueBorrows(overdueBorrows != null ? overdueBorrows : 0);
        res.setUnpaidFinesCount(unpaidFinesCount != null ? unpaidFinesCount : 0);
        res.setUnpaidFineAmount(unpaidFineAmount != null ? unpaidFineAmount : BigDecimal.ZERO);
        res.setActiveBlacklists(activeBlacklists != null ? activeBlacklists : 0);
        res.setTotalBooks(totalBooks);
        res.setTotalCopies(totalCopies);
        res.setAvailableCopies(availableCopies != null ? availableCopies : 0);

        return res;
    }

    @Transactional
    @Override
    public String payDeposit(Long borrowId, Byte paymentMethod, jakarta.servlet.http.HttpServletRequest request) {
        BorrowRecord br = borrowRecordRepository.findById(borrowId)
                .orElseThrow(() -> new ApiException("Không tìm thấy phiếu mượn #" + borrowId));

        if (br.getDepositStatus() != null && br.getDepositStatus() == 1) {
            throw new ApiException("Phiếu mượn này đã thanh toán tiền cọc thành công!");
        }

        if (br.getStatus() != 0) {
            throw new ApiException("Chỉ có thể nộp tiền cọc khi phiếu mượn ở trạng thái Chờ bàn giao (PENDING)");
        }

        BigDecimal depositAmount = br.getDepositAmount();
        if (depositAmount == null || depositAmount.compareTo(BigDecimal.ZERO) <= 0) {
            br.setDepositStatus((byte) 1);
            br.setUpdatedAt(LocalDateTime.now());
            borrowRecordRepository.save(br);
            return "Số tiền cọc là 0đ, hệ thống đã tự động xác nhận hoàn tất tiền cọc!";
        }

        User reader = br.getUser();
        if (reader == null) {
            throw new ApiException("Không tìm thấy thông tin độc giả của phiếu mượn này");
        }

        // 1: CASH (Tiền mặt tại quầy)
        if (paymentMethod != null && paymentMethod == 1) {
            paymentService.solveDeposit(reader, br, depositAmount, (byte) 1, "CASH_LIB_" + System.currentTimeMillis());
            return "Ghi nhận nộp tiền cọc bằng tiền mặt thành công";
        }

        // 2: VNPAY (Thanh toán online VNPay)
        if (paymentMethod != null && paymentMethod == 2) {
            return paymentService.initPayment(reader, (byte) 3, depositAmount, "Thanh toan tien coc muon sach #" + borrowId, borrowId, null, null, null, request);
        }

        throw new ApiException("Phương thức thanh toán không hợp lệ (1: Tiền mặt, 2: VNPay)");
    }
}
