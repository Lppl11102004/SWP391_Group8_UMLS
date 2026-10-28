package com.ulms.blacklist.service;

import com.ulms.auth.entity.User;
import com.ulms.auth.repository.UserRepository;
import com.ulms.blacklist.dto.CreateBlacklistRequest;
import com.ulms.blacklist.dto.LibrarianBlacklistResponse;
import com.ulms.blacklist.dto.UnlockBlacklistRequest;
import com.ulms.blacklist.entity.Blacklist;
import com.ulms.blacklist.repository.BlacklistRepository;
import com.ulms.exception.ApiException;
import com.ulms.notification.entity.Notification;
import com.ulms.notification.repository.NotificationRepository;
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
public class LibrarianBlacklistServiceImpl implements LibrarianBlacklistService {

    private final BlacklistRepository blacklistRepository;
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final SecurityUtil securityUtil;

    @Override
    public PageResponse<LibrarianBlacklistResponse> getBlacklists(Boolean isActive, String keyword, Integer page, Integer size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Blacklist> blacklistPage = blacklistRepository.searchBlacklistForLibrarian(isActive, keyword, pageable);

        List<LibrarianBlacklistResponse> list = new ArrayList<>();
        for (Blacklist b : blacklistPage.getContent()) {
            LibrarianBlacklistResponse res = new LibrarianBlacklistResponse();
            res.setBlacklistId(b.getBlacklistId());
            if (b.getUser() != null) {
                res.setUserId(b.getUser().getUserId());
                res.setUserName(b.getUser().getFullName());
                res.setUserEmail(b.getUser().getEmail());
                res.setUserPhone(b.getUser().getPhone());
            }
            res.setReason(b.getReason());
            res.setCreatedByType(b.getCreatedByType());
            if (b.getCreatedByUser() != null) {
                res.setCreatedByUserId(b.getCreatedByUser().getUserId());
                res.setCreatedByUserName(b.getCreatedByUser().getFullName());
            }
            res.setIsActive(b.getIsActive());
            res.setUnlockedAt(b.getUnlockedAt());
            if (b.getUnlockedBy() != null) {
                res.setUnlockedByUserId(b.getUnlockedBy().getUserId());
                res.setUnlockedByUserName(b.getUnlockedBy().getFullName());
            }
            res.setCreatedAt(b.getCreatedAt());
            list.add(res);
        }

        return new PageResponse<>(list, blacklistPage.getNumber(), blacklistPage.getSize(), blacklistPage.getTotalElements());
    }

    @Transactional
    @Override
    public void addBlacklist(CreateBlacklistRequest request) {
        if (request == null || request.getUserId() == null) {
            throw new ApiException("Vui lòng chọn độc giả cần thêm vào danh sách hạn chế");
        }
        if (request.getReason() == null || request.getReason().isBlank()) {
            throw new ApiException("Vui lòng nhập lý do thêm vào danh sách hạn chế");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ApiException("Không tìm thấy độc giả #" + request.getUserId()));

        Blacklist activeBlacklist = blacklistRepository.findTopByUser_UserIdAndIsActiveTrue(user.getUserId());
        if (activeBlacklist != null) {
            throw new ApiException("Độc giả này hiện đã nằm trong danh sách hạn chế mượn sách");
        }

        User librarian = securityUtil.getCurrentUser();

        Blacklist blacklist = new Blacklist();
        blacklist.setUser(user);
        blacklist.setReason(request.getReason());
        blacklist.setCreatedByType((byte) 2); // 2: MANUAL
        blacklist.setCreatedByUser(librarian);
        blacklist.setIsActive(true);
        blacklistRepository.save(blacklist);

        // Gửi thông báo cho Độc giả
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle("Tài khoản của bạn đã bị thêm vào danh sách hạn chế mượn sách. Lý do: " + request.getReason());
        notification.setType((byte) 1);
        notification.setIsRead(false);
        notificationRepository.save(notification);
    }

    @Transactional
    @Override
    public void unlockBlacklist(Long blacklistId, UnlockBlacklistRequest request) {
        Blacklist blacklist = blacklistRepository.findById(blacklistId)
                .orElseThrow(() -> new ApiException("Không tìm thấy bản ghi danh sách hạn chế #" + blacklistId));

        if (!Boolean.TRUE.equals(blacklist.getIsActive())) {
            throw new ApiException("Bản ghi này đã được mở khóa trước đó");
        }

        User librarian = securityUtil.getCurrentUser();

        blacklist.setIsActive(false);
        blacklist.setUnlockedAt(LocalDateTime.now());
        blacklist.setUnlockedBy(librarian);
        blacklistRepository.save(blacklist);

        // Gửi thông báo cho Độc giả
        if (blacklist.getUser() != null) {
            Notification notification = new Notification();
            notification.setUser(blacklist.getUser());
            notification.setTitle("Tài khoản của bạn đã được thủ thư mở khóa khỏi danh sách hạn chế. Bây giờ bạn có thể tiếp tục sử dụng dịch vụ thư viện.");
            notification.setType((byte) 1);
            notification.setIsRead(false);
            notificationRepository.save(notification);
        }
    }
}
