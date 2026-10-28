package com.ulms.payment.repository;

import com.ulms.payment.entity.Fine;
import com.ulms.payment.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Payment findByTxnRef(String txnRef);
    Payment findByBorrowRecord_BorrowId(Long borrowRecordId);
    Payment findByFine_FineId(Long fineId);
    @Query("""
        SELECT p FROM Payment p
        WHERE p.user.userId = :userId
          AND (:paymentType IS NULL OR p.paymentType = :paymentType)
          AND (:paymentMethod IS NULL OR p.paymentMethod = :paymentMethod)
          AND (:status IS NULL OR p.status = :status)
        ORDER BY p.createdAt DESC
    """)
    Page<Payment> searchPayment(
            @Param("userId") Long userId,
            @Param("paymentType") Byte paymentType,
            @Param("paymentMethod") Byte paymentMethod,
            @Param("status") Byte status,
            Pageable pageable
    );

    @Query("""
        SELECT p FROM Payment p
        WHERE (:userId IS NULL OR p.user.userId = :userId)
          AND (:paymentType IS NULL OR p.paymentType = :paymentType)
          AND (:paymentMethod IS NULL OR p.paymentMethod = :paymentMethod)
          AND (:status IS NULL OR p.status = :status)
        ORDER BY p.createdAt DESC
    """)
    Page<Payment> searchPaymentForLibrarian(
            @Param("userId") Long userId,
            @Param("paymentType") Byte paymentType,
            @Param("paymentMethod") Byte paymentMethod,
            @Param("status") Byte status,
            Pageable pageable
    );

    @Query("""
        SELECT p FROM Payment p
        WHERE (:userId IS NULL OR p.user.userId = :userId)
          AND (:paymentType IS NULL OR p.paymentType = :paymentType)
          AND (:paymentMethod IS NULL OR p.paymentMethod = :paymentMethod)
          AND (:status IS NULL OR p.status = :status)
          AND (:fromDate IS NULL OR p.createdAt >= :fromDate)
          AND (:toDate IS NULL OR p.createdAt <= :toDate)
          AND (:keyword IS NULL OR LOWER(p.user.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(p.user.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR p.txnRef LIKE CONCAT('%', :keyword, '%'))
        ORDER BY p.createdAt DESC
    """)
    Page<Payment> searchPaymentForAdmin(
            @Param("userId") Long userId,
            @Param("paymentType") Byte paymentType,
            @Param("paymentMethod") Byte paymentMethod,
            @Param("status") Byte status,
            @Param("fromDate") java.time.LocalDateTime fromDate,
            @Param("toDate") java.time.LocalDateTime toDate,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.membershipPlan.planId = :planId AND p.status = 1")
    java.math.BigDecimal sumRevenueByPlanId(@Param("planId") Short planId);

    @Query("SELECT COUNT(p) FROM Payment p WHERE p.membershipPlan.planId = :planId AND p.status = 1")
    Long countSalesByPlanId(@Param("planId") Short planId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = 1 AND p.paidAt >= :fromDate")
    java.math.BigDecimal sumTotalRevenueSince(@Param("fromDate") java.time.LocalDateTime fromDate);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = 1 AND p.paymentType = :type AND p.paidAt >= :fromDate")
    java.math.BigDecimal sumRevenueByTypeSince(@Param("type") Byte type, @Param("fromDate") java.time.LocalDateTime fromDate);
}
