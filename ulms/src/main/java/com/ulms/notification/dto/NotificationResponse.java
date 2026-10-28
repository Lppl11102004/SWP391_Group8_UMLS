package com.ulms.notification.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class NotificationResponse {
    private Long notificationId;
    private String title;
    private Byte type;
    private Boolean isRead;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
}
