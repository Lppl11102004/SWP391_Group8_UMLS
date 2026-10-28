package com.ulms.auth.service;

import com.ulms.auth.dto.*;
import com.ulms.auth.entity.Role;
import com.ulms.auth.entity.User;
import com.ulms.auth.repository.RoleRepository;
import com.ulms.auth.repository.UserRepository;
import com.ulms.blacklist.entity.Blacklist;
import com.ulms.blacklist.repository.BlacklistRepository;
import com.ulms.config.CustomPasswordEncoder;
import com.ulms.exception.ApiException;
import com.ulms.membership.entity.UserMembership;
import com.ulms.membership.repository.UserMembershipRepository;
import com.ulms.notification.entity.Notification;
import com.ulms.notification.repository.NotificationRepository;
import com.ulms.payment.repository.FineRepository;
import com.ulms.reservation.repository.BorrowRecordRepository;
import com.ulms.util.PageResponse;
import com.ulms.util.SecurityUtil;
import com.ulms.util.UtilValidate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMembershipRepository userMembershipRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final FineRepository fineRepository;
    private final BlacklistRepository blacklistRepository;
    private final NotificationRepository notificationRepository;
    private final CustomPasswordEncoder customPasswordEncoder;
    private final SecurityUtil securityUtil;
    private final UtilValidate utilValidate;

    @Override
    public PageResponse<AdminUserResponse> searchUsers(String keyword, Byte roleId, Byte status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> pageResult = userRepository.searchUsersForAdmin(
                (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null,
                roleId,
                status,
                pageable
        );

        List<AdminUserResponse> content = pageResult.getContent().stream()
                .map(this::mapToResponse)
                .toList();

        return new PageResponse<>(
                content,
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalElements()
        );
    }

    @Override
    public AdminUserDetailResponse getUserDetail(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("Không tìm thấy người dùng với mã: " + userId));

        UserMembership membership = userMembershipRepository.findByUser_UserId(userId);
        boolean isMembershipActive = membership != null && membership.getEndDate() != null && membership.getEndDate().isAfter(LocalDateTime.now());

        Integer activeBorrowCount = borrowRecordRepository.countByUser_UserIdAndStatus(userId, (byte) 1);
        BigDecimal unpaidFine = fineRepository.sumUnpaidAmountByUserId(userId);

        Blacklist blacklist = blacklistRepository.findTopByUser_UserIdAndIsActiveTrue(userId);
        boolean isBlacklisted = blacklist != null && Boolean.TRUE.equals(blacklist.getIsActive());

        return AdminUserDetailResponse.builder()
                .userId(user.getUserId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .address(user.getAddress())
                .roleId(user.getRole() != null ? user.getRole().getRoleId() : null)
                .roleName(user.getRole() != null ? user.getRole().getRoleName() : null)
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .membershipPlanId(membership != null && membership.getMembershipPlan() != null ? membership.getMembershipPlan().getPlanId() : null)
                .membershipPlanName(membership != null && membership.getMembershipPlan() != null ? membership.getMembershipPlan().getName() : null)
                .membershipStartDate(membership != null ? membership.getStartDate() : null)
                .membershipEndDate(membership != null ? membership.getEndDate() : null)
                .isMembershipActive(isMembershipActive)
                .activeBorrowCount(activeBorrowCount != null ? activeBorrowCount : 0)
                .unpaidFineAmount(unpaidFine != null ? unpaidFine : BigDecimal.ZERO)
                .isBlacklisted(isBlacklisted)
                .blacklistReason(isBlacklisted ? blacklist.getReason() : null)
                .build();
    }

    @Override
    @Transactional
    public AdminUserResponse createLibrarian(CreateLibrarianRequest request) {
        if (request.getFullName() == null || request.getFullName().trim().isEmpty()) {
            throw new ApiException("Họ và tên không được để trống");
        }
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new ApiException("Email không được để trống");
        }
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new ApiException("Email đã được sử dụng trong hệ thống: " + email);
        }

        String phone = request.getPhone() != null ? request.getPhone().trim() : null;
        if (phone != null && !phone.isEmpty()) {
            if (!utilValidate.validatePhoneNumber(phone)) {
                throw new ApiException("Số điện thoại không hợp lệ. Phải gồm 10 chữ số và bắt đầu bằng số 0.");
            }
            if (userRepository.existsByPhone(phone)) {
                throw new ApiException("Số điện thoại này đã được sử dụng: " + phone);
            }
        }

        String rawPassword = request.getPassword() != null && !request.getPassword().trim().isEmpty()
                ? request.getPassword().trim()
                : "Ulms@123456";

        Role librarianRole = roleRepository.findByRoleName("LIBRARIAN");
        if (librarianRole == null) {
            librarianRole = roleRepository.findById((byte) 2)
                    .orElseThrow(() -> new ApiException("Không tìm thấy vai trò Thủ thư (LIBRARIAN) trong hệ thống"));
        }

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(email);
        user.setPasswordHash(customPasswordEncoder.encode(rawPassword));
        user.setPhone(phone);
        user.setAddress(request.getAddress());
        user.setRole(librarianRole);
        user.setStatus((byte) 1); // Active ngay lập tức
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        User saved = userRepository.save(user);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public AdminUserResponse updateUserStatus(Long userId, UpdateUserStatusRequest request) {
        User currentUser = securityUtil.getCurrentUser();
        if (currentUser != null && currentUser.getUserId().equals(userId)) {
            throw new ApiException("Không thể tự thay đổi trạng thái tài khoản của chính mình");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("Không tìm thấy người dùng với mã: " + userId));

        if (user.getRole() != null && "ADMIN".equalsIgnoreCase(user.getRole().getRoleName())) {
            throw new ApiException("Không thể khóa tài khoản của Quản trị viên (ADMIN) khác");
        }

        if (request.getStatus() == null || (request.getStatus() != 1 && request.getStatus() != 2)) {
            throw new ApiException("Trạng thái không hợp lệ. Chỉ chấp nhận 1 (Hoạt động) hoặc 2 (Đã khóa)");
        }

        user.setStatus(request.getStatus());
        user.setUpdatedAt(LocalDateTime.now());
        User updated = userRepository.save(user);

        // Gửi thông báo nếu bị khóa
        if (request.getStatus() == 2) {
            Notification notification = new Notification();
            notification.setUser(user);
            notification.setTitle("Tài khoản của bạn đã bị khóa");
            notification.setType((byte) 3); // SYSTEM
            notification.setIsRead(false);
            notification.setCreatedAt(LocalDateTime.now());
            notificationRepository.save(notification);
        }

        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public AdminUserResponse updateUserRole(Long userId, UpdateUserRoleRequest request) {
        User currentUser = securityUtil.getCurrentUser();
        if (currentUser != null && currentUser.getUserId().equals(userId)) {
            throw new ApiException("Không thể tự thay đổi vai trò của chính mình");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("Không tìm thấy người dùng với mã: " + userId));

        if (request.getRoleId() == null || request.getRoleId() == 3) {
            throw new ApiException("Không thể cấp hoặc thay đổi quyền Quản trị viên (ADMIN) qua API này");
        }

        Role newRole = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> new ApiException("Không tìm thấy vai trò với mã: " + request.getRoleId()));

        user.setRole(newRole);
        user.setUpdatedAt(LocalDateTime.now());
        User updated = userRepository.save(user);

        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public AdminResetPasswordResponse resetUserPassword(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException("Không tìm thấy người dùng với mã: " + userId));

        // Tạo mật khẩu tạm thời
        String tempPass = "Ulms@" + (1000 + new SecureRandom().nextInt(9000));
        user.setPasswordHash(customPasswordEncoder.encode(tempPass));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        return AdminResetPasswordResponse.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .temporaryPassword(tempPass)
                .build();
    }

    private AdminUserResponse mapToResponse(User u) {
        return AdminUserResponse.builder()
                .userId(u.getUserId())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .avatarUrl(u.getAvatarUrl())
                .roleId(u.getRole() != null ? u.getRole().getRoleId() : null)
                .roleName(u.getRole() != null ? u.getRole().getRoleName() : null)
                .status(u.getStatus())
                .createdAt(u.getCreatedAt())
                .lastLoginAt(u.getLastLoginAt())
                .build();
    }
}
