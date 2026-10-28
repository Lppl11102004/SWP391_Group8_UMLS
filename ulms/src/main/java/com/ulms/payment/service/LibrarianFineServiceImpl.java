package com.ulms.payment.service;

import com.ulms.auth.entity.User;
import com.ulms.auth.repository.UserRepository;
import com.ulms.book.entity.Book;
import com.ulms.book.entity.BookCopy;
import com.ulms.book.repository.BookCopyRepository;
import com.ulms.book.repository.BookRepository;
import com.ulms.exception.ApiException;
import com.ulms.membership.entity.Setting;
import com.ulms.membership.repository.SettingRepository;
import com.ulms.notification.entity.Notification;
import com.ulms.notification.repository.NotificationRepository;
import com.ulms.payment.dto.CreateFineRequest;
import com.ulms.payment.dto.LibrarianFineResponse;
import com.ulms.payment.dto.WaiveFineRequest;
import com.ulms.payment.entity.Fine;
import com.ulms.payment.entity.Payment;
import com.ulms.payment.repository.FineRepository;
import com.ulms.payment.repository.PaymentRepository;
import com.ulms.reservation.entity.BorrowRecord;
import com.ulms.reservation.repository.BorrowRecordRepository;
import com.ulms.util.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LibrarianFineServiceImpl implements LibrarianFineService {

    private final FineRepository fineRepository;
    private final PaymentRepository paymentRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final UserRepository userRepository;
    private final BookCopyRepository bookCopyRepository;
    private final BookRepository bookRepository;
    private final SettingRepository settingRepository;
    private final NotificationRepository notificationRepository;

    @Override
    public PageResponse<LibrarianFineResponse> getFines(Long userId, Byte status, Byte reason, String keyword, Integer page, Integer size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Fine> finePage = fineRepository.searchFineForLibrarian(userId, status, reason, keyword, pageable);

        List<LibrarianFineResponse> list = new ArrayList<>();
        for (Fine f : finePage.getContent()) {
            LibrarianFineResponse res = mapToResponse(f);
            list.add(res);
        }

        return new PageResponse<>(list, finePage.getNumber(), finePage.getSize(), finePage.getTotalElements());
    }

    @Override
    public LibrarianFineResponse getFineDetail(Long fineId) {
        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> new ApiException("Không tìm thấy khoản phạt #" + fineId));
        return mapToResponse(fine);
    }

    @Transactional
    @Override
    public void createFine(CreateFineRequest request) {
        if (request == null || request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ApiException("Số tiền phạt phải lớn hơn 0");
        }

        BorrowRecord br = null;
        if (request.getBorrowId() != null) {
            br = borrowRecordRepository.findById(request.getBorrowId()).orElse(null);
        }

        User user = null;
        if (request.getUserId() != null) {
            user = userRepository.findById(request.getUserId()).orElse(null);
        } else if (br != null) {
            user = br.getUser();
        }

        if (user == null) {
            throw new ApiException("Không xác định được độc giả cho khoản phạt này");
        }

        BookCopy copy = null;
        if (request.getCopyId() != null) {
            copy = bookCopyRepository.findById(request.getCopyId()).orElse(null);
        }

        Fine fine = new Fine();
        fine.setBorrowRecord(br);
        fine.setUser(user);
        fine.setBookCopy(copy);
        fine.setAmount(request.getAmount());
        fine.setReason(request.getReason() != null ? request.getReason() : (byte) 1);
        fine.setStatus((byte) 0); // 0: UNPAID
        fine.setNote(request.getNote() != null ? request.getNote() : "Thủ thư lập phiếu phạt");
        fine.setUpdatedAt(LocalDateTime.now());
        fineRepository.save(fine);

        // Gửi thông báo
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle("Bạn có một khoản phạt mới trị giá " + request.getAmount() + " VNĐ. Vui lòng thanh toán.");
        notification.setType((byte) 3); // 4: PAYMENT
        notification.setIsRead(false);
        notificationRepository.save(notification);
    }

    @Transactional
    @Override
    public void payCashFine(Long fineId) {
        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> new ApiException("Không tìm thấy khoản phạt #" + fineId));

        if (fine.getStatus() == 1) {
            throw new ApiException("Khoản phạt này đã được thanh toán trước đó");
        }
        if (fine.getStatus() == 2) {
            throw new ApiException("Khoản phạt này đã được miễn giảm");
        }

        LocalDateTime now = LocalDateTime.now();

        // 1. Cập nhật trạng thái Fine sang PAID (1)
        fine.setStatus((byte) 1);
        fine.setUpdatedAt(now);
        fineRepository.save(fine);

        // 2. Tạo bản ghi Payment CASH
        Payment payment = new Payment();
        payment.setUser(fine.getUser());
        payment.setFine(fine);
        if (fine.getBorrowRecord() != null) {
            payment.setBorrowRecord(fine.getBorrowRecord());
        }
        payment.setPaymentType((byte) 1); // 1: FINE
        payment.setPaymentMethod((byte) 1); // 1: CASH
        payment.setAmount(fine.getAmount());
        payment.setTxnRef("CASH_FINE_" + System.currentTimeMillis());
        payment.setStatus((byte) 1); // 1: SUCCESS
        payment.setNote("Thu tiền phạt bằng tiền mặt tại quầy");
        payment.setPaidAt(now);
        payment.setCreatedAt(now);
        paymentRepository.save(payment);

        // 3. Thông báo cho Độc giả
        if (fine.getUser() != null) {
            Notification notification = new Notification();
            notification.setUser(fine.getUser());
            notification.setTitle("Khoản phạt #" + fineId + " trị giá " + fine.getAmount() + " VNĐ đã được thanh toán thành công bằng tiền mặt.");
            notification.setType((byte) 4); // 4: PAYMENT
            notification.setIsRead(false);
            notificationRepository.save(notification);
        }
    }

    @Transactional
    @Override
    public void waiveFine(Long fineId, WaiveFineRequest request) {
        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> new ApiException("Không tìm thấy khoản phạt #" + fineId));

        if (fine.getStatus() == 1) {
            throw new ApiException("Khoản phạt này đã được thanh toán, không thể miễn giảm");
        }

        String note = (request != null && request.getNote() != null && !request.getNote().isBlank())
                ? request.getNote()
                : "Thủ thư miễn giảm khoản phạt";

        fine.setStatus((byte) 2); // 2: WAIVED
        fine.setNote(note);
        fine.setUpdatedAt(LocalDateTime.now());
        fineRepository.save(fine);

        if (fine.getUser() != null) {
            Notification notification = new Notification();
            notification.setUser(fine.getUser());
            notification.setTitle("Khoản phạt #" + fineId + " đã được thủ thư miễn giảm. Lý do: " + note);
            notification.setType((byte) 4);
            notification.setIsRead(false);
            notificationRepository.save(notification);
        }
    }

    @Scheduled(cron = "0 0 1 * * ?") // Chạy tự động lúc 01:00 AM mỗi ngày
    @Transactional
    @Override
    public void autoScanOverdueBorrowRecords() {
        LocalDateTime now = LocalDateTime.now();

        // 1. Lấy đơn giá phạt trễ hạn từ Setting
        Setting setting = settingRepository.findBySettingKey("FINE_PER_DAY");
        BigDecimal finePerDay = new BigDecimal("5000"); // Mặc định 5,000 VNĐ/ngày
        if (setting != null && setting.getSettingValue() != null) {
            try {
                finePerDay = new BigDecimal(setting.getSettingValue().trim());
            } catch (Exception ignored) {
            }
        }

        // 2. Tìm các phiếu mượn đang mượn (status = 1) mà quá hạn (dueDate < now)
        List<BorrowRecord> overdueBorrows = borrowRecordRepository.findByStatusInAndDueDateLessThan(List.of((byte) 1, (byte) 3), now);
        for (BorrowRecord br : overdueBorrows) {
            try {
                // Đổi trạng thái sang 3: OVERDUE
                br.setStatus((byte) 3);
                br.setUpdatedAt(now);
                borrowRecordRepository.save(br);

                long overdueDays = ChronoUnit.DAYS.between(br.getDueDate().toLocalDate(), LocalDate.now());
                if (overdueDays > 0) {
                    BigDecimal fineAmount = finePerDay.multiply(BigDecimal.valueOf(overdueDays));

                    // Tìm xem đã có Fine overdue chưa thanh toán của phiếu này chưa
                    List<Fine> existingFines = fineRepository.searchFine(br.getUser().getUserId(), (byte) 0, PageRequest.of(0, 100)).getContent();
                    Fine overdueFine = null;
                    for (Fine f : existingFines) {
                        if (f.getBorrowRecord() != null && br.getBorrowId().equals(f.getBorrowRecord().getBorrowId()) && f.getReason() == 1) {
                            overdueFine = f;
                            break;
                        }
                    }

                    if (overdueFine != null) {
                        overdueFine.setAmount(fineAmount);
                        overdueFine.setNote("Phạt quá hạn " + overdueDays + " ngày (" + finePerDay + " VNĐ/ngày)");
                        overdueFine.setUpdatedAt(now);
                        fineRepository.save(overdueFine);
                    } else {
                        Fine newFine = new Fine();
                        newFine.setBorrowRecord(br);
                        newFine.setUser(br.getUser());
                        newFine.setAmount(fineAmount);
                        newFine.setReason((byte) 1); // 1: OVERDUE
                        newFine.setStatus((byte) 0); // 0: UNPAID
                        newFine.setNote("Phạt quá hạn " + overdueDays + " ngày (" + finePerDay + " VNĐ/ngày)");
                        newFine.setUpdatedAt(now);
                        fineRepository.save(newFine);
                    }

                    // Gửi thông báo
                    if (br.getUser() != null) {
                        Notification notification = new Notification();
                        notification.setUser(br.getUser());
                        notification.setTitle("Phiếu mượn #" + br.getBorrowId() + " đã quá hạn " + overdueDays + " ngày. Khoản phạt phát sinh: " + fineAmount + " VNĐ.");
                        notification.setType((byte) 4);
                        notification.setIsRead(false);
                        notificationRepository.save(notification);
                    }
                }
            } catch (Exception e) {
                System.err.println("Lỗi xử lý quét quá hạn phiếu mượn #" + br.getBorrowId() + ": " + e.getMessage());
            }
        }
    }

    private LibrarianFineResponse mapToResponse(Fine f) {
        LibrarianFineResponse res = new LibrarianFineResponse();
        res.setFineId(f.getFineId());
        if (f.getBorrowRecord() != null) {
            res.setBorrowRecordId(f.getBorrowRecord().getBorrowId());
        }
        if (f.getUser() != null) {
            res.setUserId(f.getUser().getUserId());
            res.setUserName(f.getUser().getFullName());
            res.setUserEmail(f.getUser().getEmail());
            res.setUserPhone(f.getUser().getPhone());
        }
        if (f.getBookCopy() != null) {
            res.setBookCopyId(f.getBookCopy().getCopyId());
            res.setBarcode(f.getBookCopy().getBarcode());
            Book b = bookRepository.findById(f.getBookCopy().getBookId()).orElse(null);
            if (b != null) {
                res.setBookTitle(b.getTitle());
            }
        }
        res.setAmount(f.getAmount());
        res.setReason(f.getReason());
        res.setStatus(f.getStatus());
        res.setNote(f.getNote());
        res.setCreatedAt(f.getCreatedAt());
        res.setUpdatedAt(f.getUpdatedAt());
        return res;
    }
}
