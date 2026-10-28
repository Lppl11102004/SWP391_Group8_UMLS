package com.ulms.auth.service;

import com.ulms.auth.dto.BlacklistStatusResponse;
import com.ulms.auth.dto.UserPasswordUpdateRequest;
import com.ulms.auth.dto.UserProfileResponse;
import com.ulms.auth.dto.UserProfileUpdateRequest;

public interface UserService {
    UserProfileResponse getUserProfile();
    UserProfileResponse updateUserProfile(UserProfileUpdateRequest request);
    UserProfileResponse updateUserPassword(UserPasswordUpdateRequest request);
    UserProfileResponse updateUserAvatar(String avatarUrl);
    BlacklistStatusResponse getMyBlacklistStatus();
}
