package com.ulms.membership.service;

import com.ulms.exception.ApiException;
import com.ulms.membership.dto.AdminSettingRequest;
import com.ulms.membership.dto.AdminSettingResponse;
import com.ulms.membership.dto.AdminSettingUpdateRequest;
import com.ulms.membership.entity.Setting;
import com.ulms.membership.repository.SettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminSettingServiceImpl implements AdminSettingService {

    private final SettingRepository settingRepository;

    @Override
    public List<AdminSettingResponse> getAllSettings() {
        return settingRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public AdminSettingResponse getSettingById(Integer settingId) {
        Setting setting = settingRepository.findById(settingId)
                .orElseThrow(() -> new ApiException("Không tìm thấy cấu hình với mã: " + settingId));
        return mapToResponse(setting);
    }

    @Override
    @Transactional
    public AdminSettingResponse createSetting(AdminSettingRequest request) {
        if (request.getSettingKey() == null || request.getSettingKey().trim().isEmpty()) {
            throw new ApiException("Mã cấu hình (settingKey) không được để trống");
        }
        if (request.getSettingValue() == null || request.getSettingValue().trim().isEmpty()) {
            throw new ApiException("Giá trị cấu hình (settingValue) không được để trống");
        }

        String key = request.getSettingKey().trim().toUpperCase();
        if (settingRepository.existsBySettingKey(key)) {
            throw new ApiException("Mã cấu hình đã tồn tại trong hệ thống: " + key);
        }

        Setting setting = new Setting();
        setting.setSettingKey(key);
        setting.setSettingValue(request.getSettingValue().trim());
        setting.setDataType(request.getDataType() != null && !request.getDataType().trim().isEmpty() ? request.getDataType().trim().toUpperCase() : "STRING");
        setting.setDescription(request.getDescription());
        setting.setUpdatedAt(LocalDateTime.now());

        Setting saved = settingRepository.save(setting);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public AdminSettingResponse updateSetting(Integer settingId, AdminSettingUpdateRequest request) {
        Setting setting = settingRepository.findById(settingId)
                .orElseThrow(() -> new ApiException("Không tìm thấy cấu hình với mã: " + settingId));

        if (request.getSettingValue() == null || request.getSettingValue().trim().isEmpty()) {
            throw new ApiException("Giá trị cấu hình không được để trống");
        }

        setting.setSettingValue(request.getSettingValue().trim());
        if (request.getDescription() != null) {
            setting.setDescription(request.getDescription().trim());
        }
        setting.setUpdatedAt(LocalDateTime.now());

        Setting updated = settingRepository.save(setting);
        return mapToResponse(updated);
    }

    private AdminSettingResponse mapToResponse(Setting s) {
        return AdminSettingResponse.builder()
                .settingId(s.getSettingId())
                .settingKey(s.getSettingKey())
                .settingValue(s.getSettingValue())
                .dataType(s.getDataType())
                .description(s.getDescription())
                .updatedAt(s.getUpdatedAt())
                .build();
    }
}
