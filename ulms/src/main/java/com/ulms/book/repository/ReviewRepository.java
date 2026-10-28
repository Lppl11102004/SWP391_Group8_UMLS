package com.ulms.book.repository;

import com.ulms.book.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Integer countByBookId(Long bookId);

    // Tính số sao trung bình
    @Query("""
        SELECT AVG(r.rating)
        FROM Review r
        WHERE r.bookId = :bookId
          AND r.status = :status
    """)
    Double getAverageRating(
            @Param("bookId") Long bookId,
            @Param("status") Byte status
    );

    @Query("""
        SELECT r
        FROM Review r
        WHERE r.bookId = :bookId
          AND (:status IS NULL OR r.status = :status)
        ORDER BY r.createdAt DESC
    """)
    Page<Review> searchReviews(
            @Param("bookId") Long bookId,
            @Param("status") Byte status,
            Pageable pageable
    );

    Boolean existsByUserIdAndBookId(Long userId, Long bookId);

    @Query("""
        SELECT r
        FROM Review r
        WHERE r.userId = :userId
          AND (:status IS NULL OR r.status = :status)
        ORDER BY r.createdAt DESC
    """)
    Page<Review> searchMyReviews(
            @Param("userId") Long bookId,
            @Param("status") Byte status,
            Pageable pageable
    );




}
