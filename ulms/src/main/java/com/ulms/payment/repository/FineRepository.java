package com.ulms.payment.repository;


import com.ulms.payment.entity.Fine;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FineRepository extends JpaRepository<Fine, Long> {
    Boolean existsByUser_UserIdAndStatus(Long userId, Byte status);

    @Query("""
            SELECT f
            FROM Fine f
            WHERE (:userId IS NULL OR f.user.userId = :userId)
              AND (:status IS NULL OR f.status = :status)
            ORDER BY f.createdAt DESC
            """)
    Page<Fine> searchFine(
            @Param("userId") Long userId,
            @Param("status") Byte status,
            Pageable pageable
    );

    @Query("""
            SELECT f FROM Fine f
            WHERE (:userId IS NULL OR f.user.userId = :userId)
              AND (:status IS NULL OR f.status = :status)
              AND (:reason IS NULL OR f.reason = :reason)
              AND (:keyword IS NULL OR LOWER(f.user.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(f.user.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR f.user.phone LIKE CONCAT('%', :keyword, '%'))
            ORDER BY f.createdAt DESC
            """)
    Page<Fine> searchFineForLibrarian(
            @Param("userId") Long userId,
            @Param("status") Byte status,
            @Param("reason") Byte reason,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    Boolean existsByBorrowRecord_BorrowIdAndReasonAndStatus(Long borrowId, Byte reason, Byte status);

    @Query("SELECT COALESCE(SUM(f.amount), 0) FROM Fine f WHERE f.status = :status")
    java.math.BigDecimal sumAmountByStatus(@Param("status") Byte status);

    Integer countByStatus(Byte status);

    @Query("SELECT COALESCE(SUM(f.amount), 0) FROM Fine f WHERE f.user.userId = :userId AND f.status = 0")
    java.math.BigDecimal sumUnpaidAmountByUserId(@Param("userId") Long userId);
}
