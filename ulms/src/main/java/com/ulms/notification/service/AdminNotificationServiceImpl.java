package com.ulms.notification.service;

import com.ulms.auth.entity.User;
import com.ulms.auth.repository.UserRepository;
import com.ulms.exception.ApiException;
import com.ulms.notification.dto.AdminNotificationHistoryResponse;
import com.ulms.notification.dto.BroadcastNotificationRequest;
import com.ulms.notification.dto.BroadcastNotificationResponse;
import com.ulms.notification.entity.Notification;
import com.ulms.notification.repository.NotificationRepository;
import com.ulms.util.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminNotificationServiceImpl implements AdminNotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public BroadcastNotificationResponse broadcastNotification(BroadcastNotificationRequest request) {
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new ApiException("Tiêu đề thông báo không được để trống");
        }

        String targetGroup = request.getTargetGroup() != null ? request.getTargetGroup().trim().toUpperCase() : "ALL";
        List<User> targetUsers;

        switch (targetGroup) {
            case "READER":
                targetUsers = userRepository.findByRole_RoleName("READER");
                break;
            case "LIBRARIAN":
                targetUsers = userRepository.findByRole_RoleName("LIBRARIAN");
                break;
            case "ALL":
            default:
                targetUsers = userRepository.findAll();
                targetGroup = "ALL";
                break;
        }

        if (targetUsers.isEmpty()) {
            return BroadcastNotificationResponse.builder()
                    .sentCount(0)
                    .targetGroup(targetGroup)
                    .title(request.getTitle().trim())
                    .sentAt(LocalDateTime.now())
                    .build();
        }

        Byte notificationType = request.getType() != null ? request.getType() : (byte) 3; // 3: SYSTEM
        LocalDateTime now = LocalDateTime.now();

        List<Notification> notifications = new ArrayList<>();
        for (User u : targetUsers) {
            Notification n = new Notification();
            n.setUser(u);
            n.setTitle(request.getTitle().trim());
            n.setType(notificationType);
            n.setIsRead(false);
            n.setCreatedAt(now);
            notifications.add(n);
        }

        notificationRepository.saveAll(notifications);

        return BroadcastNotificationResponse.builder()
                .sentCount(notifications.size())
                .targetGroup(targetGroup)
                .title(request.getTitle().trim())
                .sentAt(now)
                .build();
    }

    @Override
    public PageResponse<AdminNotificationHistoryResponse> getNotificationHistory(Byte type, String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Notification> pageResult = notificationRepository.searchNotificationsForAdmin(
                type,
                (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null,
                pageable
        );

        List<AdminNotificationHistoryResponse> content = pageResult.getContent().stream()
                .map(n -> AdminNotificationHistoryResponse.builder()
                        .notificationId(n.getNotificationId())
                        .userId(n.getUser() != null ? n.getUser().getUserId() : null)
                        .userFullName(n.getUser() != null ? n.getUser().getFullName() : null)
                        .userEmail(n.getUser() != null ? n.getUser().getEmail() : null)
                        .title(n.getTitle())
                        .type(n.getType())
                        .isRead(n.getIsRead())
                        .readAt(n.getReadAt())
                        .createdAt(n.getCreatedAt())
                        .build())
                .toList();

        return new PageResponse<>(
                content,
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalElements()
        );
    }
}
