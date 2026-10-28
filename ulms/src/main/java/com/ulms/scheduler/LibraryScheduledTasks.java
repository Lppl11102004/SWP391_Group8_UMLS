package com.ulms.scheduler;

import com.ulms.book.entity.BookCopy;
import com.ulms.book.repository.BookCopyRepository;
import com.ulms.membership.entity.UserMembership;
import com.ulms.membership.repository.UserMembershipRepository;
import com.ulms.notification.entity.Notification;
import com.ulms.notification.repository.NotificationRepository;
import com.ulms.payment.service.LibrarianFineService;
import com.ulms.reservation.entity.BorrowDetail;
import com.ulms.reservation.entity.BorrowRecord;
import com.ulms.reservation.entity.Reservation;
import com.ulms.reservation.repository.BorrowDetailRepository;
import com.ulms.reservation.repository.BorrowRecordRepository;
import com.ulms.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Các tác vụ tự động (Scheduled Background Tasks / Cron Jobs) cho hệ thống Thư viện ULMS:
 * 1. Tự động hủy ticket đặt giữ sách đã quá hạn nhận (giải phóng sách cho độc giả khác)
 * 2. Tự động quét phiếu mượn quá hạn và tính phạt phát sinh mỗi ngày
 * 3. Tự động gửi thông báo nhắc nhở trả sách sắp đến hạn (1-2 ngày trước deadline)
 * 4. Tự động quét và cập nhật hết hạn gói hội viên người dùng
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class LibraryScheduledTasks {

    private final ReservationRepository reservationRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final BorrowDetailRepository borrowDetailRepository;
    private final BookCopyRepository bookCopyRepository;
    private final UserMembershipRepository userMembershipRepository;
    private final NotificationRepository notificationRepository;
    private final LibrarianFineService librarianFineService;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    /**
     * TÁC VỤ 1: Tự động hủy các yêu cầu đặt giữ (Ticket) quá hạn nhận sách
     * - Chạy định kỳ mỗi 15 phút
     * - Quét các Reservation có status = 1 (APPROVED) và expiresAt < now
     * - Chuyển status = 5 (EXPIRED), hủy BorrowRecord pending (status = 4), giải phóng BookCopy về AVAILABLE (status = 1)
     */
    @Scheduled(cron = "0 0/15 * * * ?")
    @Transactional
    public void autoCancelExpiredReservations() {
        LocalDateTime now = LocalDateTime.now();
        List<Reservation> expiredReservations = reservationRepository.findByStatusAndExpiresAtLessThan((byte) 1, now);

        if (expiredReservations == null || expiredReservations.isEmpty()) {
            return;
        }

        log.info("[CRON] Bắt đầu quét và hủy {} phiếu đặt giữ sách quá hạn...", expiredReservations.size());

        for (Reservation r : expiredReservations) {
            try {
                // 1. Cập nhật trạng thái phiếu đặt giữ sang 5: Quá hạn
                r.setStatus((byte) 5);
                r.setUpdatedAt(now);
                reservationRepository.save(r);

                // 2. Tìm phiếu mượn tương ứng
                BorrowRecord br = borrowRecordRepository.findByReservation_ReservationId(r.getReservationId());
                if (br != null && br.getStatus() == 0) { // 0: PENDING (chưa lấy sách)
                    br.setStatus((byte) 4); // 4: CANCELLED
                    br.setUpdatedAt(now);
                    borrowRecordRepository.save(br);

                    // Giải phóng các bản sao vật lý
                    List<BorrowDetail> details = borrowDetailRepository.findByBorrowRecord_BorrowId(br.getBorrowId());
                    for (BorrowDetail bd : details) {
                        if (bd.getBookCopy() != null) {
                            BookCopy copy = bd.getBookCopy();
                            copy.setStatus((byte) 1); // 1: AVAILABLE
                            copy.setUpdatedAt(now);
                            bookCopyRepository.save(copy);
                        }
                    }
                }

                // 3. Gửi thông báo cho độc giả
                if (r.getUser() != null) {
                    Notification notification = new Notification();
                    notification.setUser(r.getUser());
                    notification.setTitle("Phiếu đặt mượn #" + r.getReservationId() + " đã hết hạn nhận sách và được hệ thống hủy tự động. Sách đã được giải phóng.");
                    notification.setType((byte) 2); // 2: RESERVATION
                    notification.setIsRead(false);
                    notificationRepository.save(notification);
                }

                log.info("[CRON] Đã hủy thành công phiếu đặt giữ quá hạn #{}", r.getReservationId());
            } catch (Exception e) {
                log.error("[CRON] Lỗi khi xử lý hủy phiếu đặt giữ #{}: {}", r.getReservationId(), e.getMessage());
            }
        }
    }

    /**
     * TÁC VỤ 2: Tự động quét các phiếu mượn quá hạn và tính tiền phạt trễ hạn
     * - Chạy tự động lúc 01:00 AM mỗi ngày
     * - Gọi LibrarianFineService.autoScanOverdueBorrowRecords()
     */
    @Scheduled(cron = "0 0 1,8 * * ?")
    @Transactional
    public void autoScanOverdueBorrowRecords() {
        log.info("[CRON] Bắt đầu tự động quét các phiếu mượn quá hạn và tính phạt trễ hạn...");
        try {
            librarianFineService.autoScanOverdueBorrowRecords();
            log.info("[CRON] Hoàn thành quét phạt quá hạn.");
        } catch (Exception e) {
            log.error("[CRON] Lỗi quét phạt quá hạn: {}", e.getMessage());
        }
    }

    /**
     * TÁC VỤ 3: Tự động gửi thông báo nhắc nhở trả sách sắp đến hạn
     * - Chạy vào lúc 08:00 AM mỗi ngày
     * - Tìm các phiếu mượn có status = 1 (BORROWING) và dueDate trong vòng 48 giờ tới
     */
    @Scheduled(cron = "0 0 8 * * ?")
    @Transactional
    public void autoNotifyDueSoonBorrows() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime soon = now.plusDays(2); // Trong vòng 2 ngày tới
        List<BorrowRecord> dueSoonBorrows = borrowRecordRepository.findByStatusAndDueDateBetween((byte) 1, now, soon);

        if (dueSoonBorrows == null || dueSoonBorrows.isEmpty()) {
            return;
        }

        log.info("[CRON] Gửi thông báo nhắc nhở hạn trả cho {} phiếu mượn sắp đến hạn...", dueSoonBorrows.size());

        for (BorrowRecord br : dueSoonBorrows) {
            try {
                if (br.getUser() != null) {
                    Notification notification = new Notification();
                    notification.setUser(br.getUser());
                    notification.setTitle("Nhắc nhở: Phiếu mượn #" + br.getBorrowId() + " sẽ đến hạn trả vào " + 
                            br.getDueDate().format(DATE_FORMATTER) + ". Quý độc giả vui lòng gia hạn hoặc trả sách đúng hạn.");
                    notification.setType((byte) 1); // 1: BORROW
                    notification.setIsRead(false);
                    notificationRepository.save(notification);
                }
            } catch (Exception e) {
                log.error("[CRON] Lỗi gửi nhắc nhở cho phiếu #{}: {}", br.getBorrowId(), e.getMessage());
            }
        }
    }

    /**
     * TÁC VỤ 4: Tự động quét và cập nhật hết hạn gói hội viên người dùng
     * - Chạy lúc 00:05 AM mỗi ngày
     * - Quét các UserMembership có status = 1 (ACTIVE) và endDate < now
     * - Cập nhật status = 0 (EXPIRED) và thông báo độc giả gia hạn
     */
    @Scheduled(cron = "0 5 0 * * ?")
    @Transactional
    public void autoExpireMemberships() {
        LocalDateTime now = LocalDateTime.now();
        List<UserMembership> expiredMemberships = userMembershipRepository.findByEndDateLessThanAndStatus(now, (byte) 1);

        if (expiredMemberships == null || expiredMemberships.isEmpty()) {
            return;
        }

        log.info("[CRON] Bắt đầu quét và cập nhật {} gói hội viên hết hạn...", expiredMemberships.size());

        for (UserMembership um : expiredMemberships) {
            try {
                um.setStatus((byte) 0); // 0: EXPIRED
                userMembershipRepository.save(um);

                if (um.getUser() != null) {
                    Notification notification = new Notification();
                    notification.setUser(um.getUser());
                    String planName = um.getMembershipPlan() != null ? um.getMembershipPlan().getName() : "Hội viên";
                    notification.setTitle("Gói " + planName + " của bạn đã hết hạn vào ngày " + 
                            um.getEndDate().format(DATE_FORMATTER) + ". Hãy nâng cấp hoặc gia hạn để tiếp tục nhận đặc quyền mượn sách.");
                    notification.setType((byte) 3); // 3: MEMBERSHIP
                    notification.setIsRead(false);
                    notificationRepository.save(notification);
                }
            } catch (Exception e) {
                log.error("[CRON] Lỗi cập nhật hết hạn gói hội viên #{}: {}", um.getUserMembershipId(), e.getMessage());
            }
        }
    }
}
