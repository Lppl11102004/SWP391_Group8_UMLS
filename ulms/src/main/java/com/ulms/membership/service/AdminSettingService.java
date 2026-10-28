package com.ulms.membership.service;

import com.ulms.membership.dto.AdminSettingRequest;
import com.ulms.membership.dto.AdminSettingResponse;
import com.ulms.membership.dto.AdminSettingUpdateRequest;

import java.util.List;

public interface AdminSettingService {
    List<AdminSettingResponse> getAllSettings();
    AdminSettingResponse getSettingById(Integer settingId);
    AdminSettingResponse createSetting(AdminSettingRequest request);
    AdminSettingResponse updateSetting(Integer settingId, AdminSettingUpdateRequest request);
}
