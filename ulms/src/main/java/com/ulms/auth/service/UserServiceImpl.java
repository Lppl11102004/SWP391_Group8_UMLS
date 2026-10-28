package com.ulms.auth.service;

import com.ulms.auth.dto.BlacklistStatusResponse;
import com.ulms.auth.dto.UserPasswordUpdateRequest;
import com.ulms.auth.dto.UserProfileResponse;
import com.ulms.auth.dto.UserProfileUpdateRequest;
import com.ulms.auth.entity.User;
import com.ulms.auth.repository.UserRepository;
import com.ulms.blacklist.entity.Blacklist;
import com.ulms.blacklist.repository.BlacklistRepository;
import com.ulms.config.CustomPasswordEncoder;
import com.ulms.exception.ApiException;
import com.ulms.util.UtilValidate;
import com.ulms.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final SecurityUtil securityUtil;
    private final UserRepository userRepository;
    private final UtilValidate utilValidate;
    private final CustomPasswordEncoder customPasswordEncoder;
    private final BlacklistRepository blacklistRepository;


    @Override
    public UserProfileResponse getUserProfile() {
        User user = securityUtil.getCurrentUser();

        if (user == null){
            throw new ApiException("Vui lòng đăng nhập");
        }

        UserProfileResponse userProfile = new UserProfileResponse();
        userProfile.setUserId(user.getUserId());
        userProfile.setFullName(user.getFullName());
        userProfile.setEmail(user.getEmail());
        userProfile.setPhone(user.getPhone());
        userProfile.setAvatarUrl(user.getAvatarUrl());
        userProfile.setAddress(user.getAddress());
        userProfile.setCreatedAt(user.getCreatedAt());
        userProfile.setLastLoginAt(user.getLastLoginAt());

        // Tra cứu trạng thái Blacklist
        Blacklist blacklist = blacklistRepository.findTopByUser_UserIdAndIsActiveTrue(user.getUserId());
        boolean isBlacklisted = (blacklist != null && Boolean.TRUE.equals(blacklist.getIsActive()));
        userProfile.setIsBlacklisted(isBlacklisted);
        userProfile.setBlacklistReason(isBlacklisted ? blacklist.getReason() : null);

        return userProfile;
    }

    @Override
    public UserProfileResponse updateUserProfile(UserProfileUpdateRequest request) {

        User user = utilValidate.checkCurrentUser(request.getUserId());
        System.out.println("===============: "+ user.getUserId());

        String fullName = request.getFullName();
        String phone = request.getPhone();
        String address = request.getAddress();

        if (!utilValidate.validateFullName(fullName)) {
            throw new ApiException("Họ và tên không hợp lệ. Vui lòng chỉ sử dụng chữ cái, độ dài từ 2-100 ký tự và không chứa số.");
        }

        if (phone != null && !phone.isBlank()) {
            if (user.getPhone() == null || !user.getPhone().equals(phone)) {
                if (!utilValidate.validatePhoneNumber(phone)) {
                    throw new ApiException("Số điện thoại không hợp lệ. Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng số 0.");
                }

                if (userRepository.existsByPhone(phone)) {
                    throw new ApiException("Số điện thoại này đã được sử dụng");
                }
            }
        }

        if (address == null) {
            throw new ApiException("Địa chỉ không hợp lệ");
        }

        user.setFullName(fullName);
        user.setPhone(phone);
        user.setAddress(address);

        User n = userRepository.save(user);
        return getUserProfile();
    }

    @Override
    public UserProfileResponse updateUserPassword(UserPasswordUpdateRequest request) {
        User user = utilValidate.checkCurrentUser(request.getUserId());

        String currentPassword = request.getCurrentPassword();
        String newPassword = request.getNewPassword();
        String confirmPassword = request.getConfirmPassword();

        if (!customPasswordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new ApiException("Mật khẩu hiện tại không chính xác");
        }

        if (!newPassword.equals(confirmPassword)){
            throw new ApiException("Mật khẩu mới và mật khẩu xác nhận không khớp");
        }

        if (!utilValidate.validatePassword(newPassword)) {
            throw new ApiException("Mật khẩu mới không hợp lệ. Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm ít nhất một chữ hoa, một chữ thường, một chữ số và một ký tự đặc biệt (@, $, !, %, , ?, &).");
        }

        user.setPasswordHash(customPasswordEncoder.encode(newPassword));
        userRepository.save(user);
        return getUserProfile();
    }

    @Override
    public UserProfileResponse updateUserAvatar(String avatarUrl) {
        Long userId = securityUtil.getCurrentUserId();
        User user = userRepository.findById(userId).orElse(null);
        if(user == null){
            throw new ApiException("Phiên làm việc hết hạn. Vui lòng đăng nhập lại");
        }
        if (avatarUrl == null){
            throw new ApiException("Cập nhật ảnh thất bại");
        }
        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);
        return getUserProfile();
    }

    @Override
    public BlacklistStatusResponse getMyBlacklistStatus() {
        User user = securityUtil.getCurrentUser();
        if (user == null) {
            throw new ApiException("Vui lòng đăng nhập");
        }
        Blacklist blacklist = blacklistRepository.findTopByUser_UserIdAndIsActiveTrue(user.getUserId());
        boolean isBlacklisted = (blacklist != null && Boolean.TRUE.equals(blacklist.getIsActive()));
        return new BlacklistStatusResponse(
                isBlacklisted,
                isBlacklisted ? blacklist.getReason() : "Tài khoản của bạn bình thường, không nằm trong danh sách hạn chế",
                isBlacklisted ? blacklist.getCreatedAt() : null
        );
    }
}
