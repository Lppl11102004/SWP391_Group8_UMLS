package com.ulms.reservation.repository;

import com.ulms.reservation.entity.BorrowDetail;
import com.ulms.reservation.entity.BorrowRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface BorrowDetailRepository extends JpaRepository<BorrowDetail, Long> {
    Integer countByBorrowRecord_BorrowIdAndStatus(Long borrowId, Boolean status);
    List<BorrowDetail> findByBorrowRecord_BorrowId(Long borrowId);

    @Query("""
        SELECT b.bookId,
               b.title,
               b.isbn,
               b.author.name,
               b.category.name,
               COUNT(bd.detailId)
        FROM BorrowDetail bd
        JOIN com.ulms.book.entity.Book b ON bd.bookCopy.bookId = b.bookId
        WHERE (:fromDate IS NULL OR bd.borrowRecord.createdAt >= :fromDate)
          AND (:toDate IS NULL OR bd.borrowRecord.createdAt <= :toDate)
        GROUP BY b.bookId, b.title, b.isbn, b.author.name, b.category.name
        ORDER BY COUNT(bd.detailId) DESC
    """)
    List<Object[]> findTopBorrowedBooks(
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            Pageable pageable
    );
}
