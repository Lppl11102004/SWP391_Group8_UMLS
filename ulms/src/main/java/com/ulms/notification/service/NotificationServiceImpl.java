package com.ulms.notification.service;

import com.ulms.auth.entity.User;
import com.ulms.exception.ApiException;
import com.ulms.notification.dto.NotificationResponse;
import com.ulms.notification.entity.Notification;
import com.ulms.notification.repository.NotificationRepository;
import com.ulms.reservation.dto.ReservationListResponse;
import com.ulms.reservation.entity.Reservation;
import com.ulms.util.PageResponse;
import com.ulms.util.SecurityUtil;
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
public class NotificationServiceImpl implements NotificationService{

    private final List<String> listDemoNotificationMessage = List.of("Chúc mừng bạn tạo ticket mượn sách thành công",
                                                                        "Yêu cầu huỷ Ticket thành công",
                                                                            "Ticket của bạn bị huỷ do quá hạn nhận sách",
                                                                                "Thanh toán gói hội viên thành công",
                                                                                    "Thanh toán khoảng nợ thành công",
                                                                                        "Gia hạn sách thành công",
                                                                                            "Thanh toán cọc thành công");

    private final SecurityUtil securityUtil;
    private final NotificationRepository notificationRepository;

    @Override
    public String getNotificationTitle(Integer request) {
        return listDemoNotificationMessage.get(request);
    }

    @Override
    public PageResponse<NotificationResponse> getNotification(Byte type, Boolean isRead, Integer page, Integer size) {
        User user = securityUtil.getCurrentUser();
        Page<Notification> notifications = searchPageableNotification(user.getUserId(),type, isRead , page, size);
        List<NotificationResponse> list = standardListNotificationResponse(notifications);

        return new PageResponse<>(
                list,
                notifications.getNumber(),
                notifications.getSize(),
                notifications.getTotalElements()
        );
    }

    public Page<Notification> searchPageableNotification(Long userId, Byte type, Boolean isRead, Integer page, Integer size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<Notification> notifications = notificationRepository.searchNotifications(userId, type,isRead , pageable);
        return notifications;
    }

    public List<NotificationResponse> standardListNotificationResponse(Page<Notification> request) {
        List<NotificationResponse> list = new ArrayList<>();

        for (Notification no : request.getContent()) {
            NotificationResponse response = new NotificationResponse();

            response.setNotificationId(no.getNotificationId());
            response.setTitle(no.getTitle());
            response.setType(no.getType());
            response.setIsRead(no.getIsRead());
            response.setReadAt(no.getReadAt());
            response.setCreatedAt(no.getCreatedAt());
            list.add(response);

        }
        return list;
    }

    @Transactional
    @Override
    public PageResponse<NotificationResponse> readAllNotification() {
        User user = securityUtil.getCurrentUser();
        if (notificationRepository.markAllAsRead(user.getUserId(), LocalDateTime.now()) == 0){
            throw new ApiException("Tất cả các thông báo đã được đọc");
        }
        return getNotification(null, null, 0,10);
    }

    @Transactional
    @Override
    public void readOnlyNotification(Long notificationId) {
        User user = securityUtil.getCurrentUser();

        // 1. Kiểm tra tồn tại (tránh NullPointerException)
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ApiException("Thông báo không tồn tại"));
        // 2. Kiểm tra quyền sở hữu (chống IDOR: ngăn người khác xem/sửa thông báo không phải của mình)
        if (!notification.getUser().getUserId().equals(user.getUserId())) {
            throw new ApiException("Bạn không có quyền thao tác trên thông báo này");
        }
        // 3. Cập nhật nếu chưa đọc
        if (Boolean.FALSE.equals(notification.getIsRead())) {
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
            notificationRepository.save(notification);
        }
    }
}
