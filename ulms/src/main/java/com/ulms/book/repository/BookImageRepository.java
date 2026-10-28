package com.ulms.book.repository;

import com.ulms.book.entity.BookImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookImageRepository extends JpaRepository<BookImage, Long> {
    List<BookImage> findByBookId(Long bookId);

    void deleteByBookId(Long bookId);
}
