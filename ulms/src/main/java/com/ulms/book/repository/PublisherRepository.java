package com.ulms.book.repository;

import com.ulms.book.entity.Publisher;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PublisherRepository extends JpaRepository<Publisher, Integer> {
    boolean existsByName(String name);
    boolean existsByNameAndPublisherIdNot(String name, Integer publisherId);

    @Query("""
        SELECT p FROM Publisher p
        WHERE (:keyword IS NULL OR :keyword = ''
               OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(p.address) LIKE LOWER(CONCAT('%', :keyword, '%')))
        ORDER BY p.createdAt DESC
    """)
    Page<Publisher> searchPublishersForAdmin(@Param("keyword") String keyword, Pageable pageable);
}
