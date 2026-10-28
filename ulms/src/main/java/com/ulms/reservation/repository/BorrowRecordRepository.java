package com.ulms.reservation.repository;

import com.ulms.notification.entity.Notification;
import com.ulms.reservation.entity.BorrowRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {
    List<BorrowRecord> findByUser_UserIdAndStatusIn(Long userId, List<Byte> statuses);

    BorrowRecord findByReservation_ReservationIdAndUser_UserId(Long reservationId, Long userId);

    BorrowRecord findByReservation_ReservationId(Long reservationId);

    @Query("""
                SELECT br
                FROM BorrowRecord br
                WHERE (:userId IS NULL OR br.user.userId = :userId)
                  AND (:status IS NULL OR br.status = :status)
                ORDER BY br.createdAt DESC
            """)
    Page<BorrowRecord> getBorrowRecord(
            @Param("userId") Long userId,
            @Param("status") Byte status,
            Pageable pageable
    );

    @Query("""
            SELECT br FROM BorrowRecord br
            WHERE (:status IS NULL OR br.status = :status)
              AND (:depositStatus IS NULL OR br.depositStatus = :depositStatus)
              AND (:keyword IS NULL OR LOWER(br.user.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(br.user.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR br.user.phone LIKE CONCAT('%', :keyword, '%'))
            ORDER BY br.createdAt DESC
            """)
    Page<BorrowRecord> searchBorrowRecordsForLibrarian(
            @Param("status") Byte status,
            @Param("depositStatus") Byte depositStatus,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    List<BorrowRecord> findByStatusAndDueDateLessThan(Byte status, java.time.LocalDateTime now);
    List<BorrowRecord> findByStatusInAndDueDateLessThan(List<Byte> statuses, java.time.LocalDateTime now);
    List<BorrowRecord> findByStatusAndDueDateBetween(Byte status, java.time.LocalDateTime from, java.time.LocalDateTime to);

    Integer countByStatus(Byte status);

    @Query("SELECT COUNT(br) FROM BorrowRecord br WHERE br.status = 1 AND br.dueDate < :now")
    Integer countOverdueBorrows(@Param("now") java.time.LocalDateTime now);

    Integer countByUser_UserIdAndStatus(Long userId, Byte status);
    Integer countByUser_UserIdAndStatusIn(Long userId, List<Byte> statuses);
}
