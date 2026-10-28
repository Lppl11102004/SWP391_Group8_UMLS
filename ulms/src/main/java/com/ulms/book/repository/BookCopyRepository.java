package com.ulms.book.repository;

import com.ulms.book.entity.BookCopy;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookCopyRepository extends JpaRepository<BookCopy, Long> {
    Integer countByBookId(Long bookId);
    Integer countByBookIdAndStatus(Long bookId, Byte status);
    List<BookCopy> findByBookId(Long bookId);
    List<BookCopy> findByBookIdAndStatus(Long bookId, Byte status);
    BookCopy findFirstByBookIdAndStatus(Long bookId, Byte status);
    Boolean existsByBarcode(String barcode);
    BookCopy findByBarcode(String barcode);
    Integer countByStatus(Byte status);
}
