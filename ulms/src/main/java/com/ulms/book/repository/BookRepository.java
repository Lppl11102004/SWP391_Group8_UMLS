package com.ulms.book.repository;

import com.ulms.book.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findByStatusTrueOrderByCategory_CategoryIdAsc();

    @Query("""
                SELECT b
                FROM Book b
                WHERE b.status = true
                AND (
                    :keyword IS NULL OR :keyword = ''
                    OR LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(b.isbn) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(b.author.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(b.publisher.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                )
                AND ( :categoryId IS NULL OR b.category.categoryId = :categoryId )
                AND ( :authorId IS NULL OR b.author.authorId = :authorId )
                AND ( :publisherId IS NULL OR b.publisher.publisherId = :publisherId )
                AND ( :fromYear IS NULL OR b.publishedYear >= :fromYear )
                AND ( :toYear IS NULL OR b.publishedYear <= :toYear )
                AND ( :minPrice IS NULL OR b.price >= :minPrice )
                AND ( :maxPrice IS NULL OR b.price <= :maxPrice )
            """)
    Page<Book> searchBooks(
            @Param("keyword") String keyword,
            @Param("categoryId") Integer categoryId,
            @Param("authorId") Integer authorId,
            @Param("publisherId") Integer publisherId,
            @Param("fromYear") Integer fromYear,
            @Param("toYear") Integer toYear,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            Pageable pageable
    );

    Optional<Book> findByBookIdAndStatusTrue(Long bookId);

    List<Book> findByAuthor_AuthorId(Integer authorId);

    Book findByBookIdAndStatus(Long bookId, Byte status);

    Boolean existsByIsbn(String isbn);

    boolean existsByCategory_CategoryId(Integer categoryId);
    boolean existsByAuthor_AuthorId(Integer authorId);
    boolean existsByPublisher_PublisherId(Integer publisherId);

    @Query("""
                SELECT b
                FROM Book b
                WHERE (:status IS NULL OR b.status = :status)
                AND (
                    :keyword IS NULL OR :keyword = ''
                    OR LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(b.isbn) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(b.author.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                    OR LOWER(b.publisher.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
                )
                AND ( :categoryId IS NULL OR b.category.categoryId = :categoryId )
                AND ( :authorId IS NULL OR b.author.authorId = :authorId )
                AND ( :publisherId IS NULL OR b.publisher.publisherId = :publisherId )
                ORDER BY b.createdAt DESC
            """)
    Page<Book> searchBooksForLibrarian(
            @Param("keyword") String keyword,
            @Param("categoryId") Integer categoryId,
            @Param("authorId") Integer authorId,
            @Param("publisherId") Integer publisherId,
            @Param("status") Boolean status,
            Pageable pageable
    );
}
