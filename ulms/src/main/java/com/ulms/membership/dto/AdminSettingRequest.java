package com.ulms.membership.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminSettingRequest {
    private String settingKey;
    private String settingValue;
    private String dataType;
    private String description;
}
