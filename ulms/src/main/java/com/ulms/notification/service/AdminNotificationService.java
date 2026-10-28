package com.ulms.notification.service;

import com.ulms.notification.dto.AdminNotificationHistoryResponse;
import com.ulms.notification.dto.BroadcastNotificationRequest;
import com.ulms.notification.dto.BroadcastNotificationResponse;
import com.ulms.util.PageResponse;

public interface AdminNotificationService {
    BroadcastNotificationResponse broadcastNotification(BroadcastNotificationRequest request);
    PageResponse<AdminNotificationHistoryResponse> getNotificationHistory(Byte type, String keyword, int page, int size);
}
