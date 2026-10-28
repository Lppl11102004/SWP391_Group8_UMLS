package com.ulms.book.repository;

import com.ulms.book.entity.Author;
import com.ulms.book.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AuthorRepository extends JpaRepository<Author, Integer> {

    @Query("""
        SELECT a
        FROM Author a
        ORDER BY a.createdAt DESC
    """)
    Page<Author> getAllAuthors(Pageable pageable);

    boolean existsByName(String name);
    boolean existsByNameAndAuthorIdNot(String name, Integer authorId);

    @Query("""
        SELECT a FROM Author a
        WHERE (:keyword IS NULL OR :keyword = ''
               OR LOWER(a.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
        ORDER BY a.createdAt DESC
    """)
    Page<Author> searchAuthorsForAdmin(@Param("keyword") String keyword, Pageable pageable);
}
