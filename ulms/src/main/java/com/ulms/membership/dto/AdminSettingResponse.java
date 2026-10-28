package com.ulms.membership.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminSettingResponse {
    private Integer settingId;
    private String settingKey;
    private String settingValue;
    private String dataType;
    private String description;
    private LocalDateTime updatedAt;
}
