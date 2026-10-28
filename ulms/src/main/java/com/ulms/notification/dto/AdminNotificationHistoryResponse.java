package com.ulms.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminNotificationHistoryResponse {
    private Long notificationId;
    private Long userId;
    private String userFullName;
    private String userEmail;
    private String title;
    private Byte type;
    private Boolean isRead;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
}
