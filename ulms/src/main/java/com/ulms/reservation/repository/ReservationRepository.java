package com.ulms.reservation.repository;

import com.ulms.reservation.entity.Reservation;

import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation,Long> {
    Integer countByUser_UserIdAndCreatedAtGreaterThanEqualAndCreatedAtLessThan(Long userId,    LocalDateTime start, LocalDateTime end);

    @Query("SELECT r FROM Reservation r " +
            "WHERE r.user.userId = :userId " +
            "AND (:status IS NULL OR r.status = :status) " +
            "ORDER BY r.createdAt DESC")
    Page<Reservation> searchReservations(@Param("userId") Long userId,
                                         @Param("status") Byte status,
                                         Pageable pageable);

    Reservation findByReservationIdAndUser_UserId(Long reservationId, Long userId);

    List<Reservation> findByStatusAndExpiresAtLessThan(Byte status, LocalDateTime now);

    @Query("""
            SELECT r FROM Reservation r
            WHERE (:status IS NULL OR r.status = :status)
              AND (:keyword IS NULL OR LOWER(r.user.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(r.user.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR r.user.phone LIKE CONCAT('%', :keyword, '%'))
            ORDER BY r.createdAt DESC
            """)
    Page<Reservation> searchReservationsForLibrarian(@Param("status") Byte status,
                                                   @Param("keyword") String keyword,
                                                   Pageable pageable);

    Integer countByStatus(Byte status);
}
