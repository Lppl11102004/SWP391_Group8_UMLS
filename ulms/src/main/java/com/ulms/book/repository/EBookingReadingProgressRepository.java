package com.ulms.book.repository;

import com.ulms.book.entity.EbookReadingProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EBookingReadingProgressRepository extends JpaRepository<EbookReadingProgress, Long> {
    Optional<EbookReadingProgress> findByUser_UserIdAndEbook_EbookId(Long userId, Long ebookId);

    @Query("SELECT p FROM EbookReadingProgress p WHERE p.user.userId = :userId AND p.ebook.ebookId = :ebookId")
    Optional<EbookReadingProgress> findByUser_UserIdAndEBook_EbookId(@Param("userId") Long userId, @Param("ebookId") Long ebookId);

    @Query("SELECT p FROM EbookReadingProgress p WHERE p.user.userId = :userId ORDER BY p.lastReadAt DESC")
    List<EbookReadingProgress> findReadingShelfByUser(@Param("userId") Long userId);
}

