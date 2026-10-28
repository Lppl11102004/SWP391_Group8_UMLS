package com.ulms.auth.repository;

import com.ulms.auth.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    boolean existsByEmailAndUserIdNot(String email, Long userId);
    boolean existsByPhoneAndUserIdNot(String phone, Long userId);

    @EntityGraph(attributePaths = {"role"})
    User findByEmail(String email);

    @Query("""
        SELECT u FROM User u
        WHERE (:keyword IS NULL OR :keyword = ''
               OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR u.phone LIKE CONCAT('%', :keyword, '%'))
          AND (:roleId IS NULL OR u.role.roleId = :roleId)
          AND (:status IS NULL OR u.status = :status)
        ORDER BY u.createdAt DESC
    """)
    Page<User> searchUsersForAdmin(
            @Param("keyword") String keyword,
            @Param("roleId") Byte roleId,
            @Param("status") Byte status,
            Pageable pageable
    );

    Long countByRole_RoleId(Byte roleId);

    Long countByCreatedAtGreaterThanEqual(LocalDateTime fromDate);

    List<User> findByRole_RoleName(String roleName);
}
