package com.ulms.notification.repository;

import com.ulms.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    @Query("SELECT n FROM Notification n " +
            "WHERE n.user.userId = :userId " +
            "AND (:type IS NULL OR n.type = :type) " +
            "AND (:isRead IS NULL OR n.isRead = :isRead) " +
            "ORDER BY n.createdAt DESC")
    Page<Notification> searchNotifications(@Param("userId") Long userId,
                                           @Param("type") Byte type,
                                           @Param("isRead") Boolean isRead,
                                           Pageable pageable);

    @Modifying
    @Query("UPDATE Notification n " +
            "SET n.isRead = true, n.readAt = :readAt " +
            "WHERE n.user.userId = :userId AND n.isRead = false")
    int markAllAsRead(@Param("userId") Long userId,
                      @Param("readAt") LocalDateTime readAt);

    @Query("""
        SELECT n FROM Notification n
        WHERE (:type IS NULL OR n.type = :type)
          AND (:keyword IS NULL OR LOWER(n.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(n.user.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(n.user.email) LIKE LOWER(CONCAT('%', :keyword, '%')))
        ORDER BY n.createdAt DESC
    """)
    Page<Notification> searchNotificationsForAdmin(
            @Param("type") Byte type,
            @Param("keyword") String keyword,
            Pageable pageable
    );
}
