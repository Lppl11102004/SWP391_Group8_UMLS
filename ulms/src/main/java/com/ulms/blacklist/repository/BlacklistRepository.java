package com.ulms.blacklist.repository;

import com.ulms.blacklist.entity.Blacklist;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BlacklistRepository extends JpaRepository<Blacklist,Long> {
    Blacklist findByUser_UserId(Long userId);
    Blacklist findTopByUser_UserIdAndIsActiveTrue(Long userId);

    @Query("""
            SELECT b FROM Blacklist b
            WHERE (:isActive IS NULL OR b.isActive = :isActive)
              AND (:keyword IS NULL OR LOWER(b.user.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(b.user.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR b.user.phone LIKE CONCAT('%', :keyword, '%'))
            ORDER BY b.createdAt DESC
            """)
    Page<Blacklist> searchBlacklistForLibrarian(
            @Param("isActive") Boolean isActive,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    Integer countByIsActiveTrue();
}
