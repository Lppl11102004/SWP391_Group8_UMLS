package com.ulms.auth.service;

import com.ulms.auth.dto.*;
import com.ulms.util.PageResponse;

public interface AdminUserService {
    PageResponse<AdminUserResponse> searchUsers(String keyword, Byte roleId, Byte status, int page, int size);
    AdminUserDetailResponse getUserDetail(Long userId);
    AdminUserResponse createLibrarian(CreateLibrarianRequest request);
    AdminUserResponse updateUserStatus(Long userId, UpdateUserStatusRequest request);
    AdminUserResponse updateUserRole(Long userId, UpdateUserRoleRequest request);
    AdminResetPasswordResponse resetUserPassword(Long userId);
}
