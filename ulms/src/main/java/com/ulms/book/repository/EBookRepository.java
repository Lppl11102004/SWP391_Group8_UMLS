package com.ulms.book.repository;

import com.ulms.book.entity.EBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface EBookRepository extends JpaRepository<EBook, Long> {
    EBook findByBook_BookId(Long bookId);

    @Query("SELECT e FROM EBook e WHERE e.book.bookId = :bookId")
    EBook findByBookId(@Param("bookId") Long bookId);
}

