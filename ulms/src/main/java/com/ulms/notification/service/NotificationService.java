package com.ulms.notification.service;

import com.ulms.notification.dto.NotificationResponse;
import com.ulms.util.PageResponse;

public interface NotificationService {
    String getNotificationTitle(Integer request);
    PageResponse<NotificationResponse> getNotification(Byte type, Boolean isRead, Integer page, Integer size);
    PageResponse<NotificationResponse> readAllNotification();
    void readOnlyNotification(Long notificationId);
}
