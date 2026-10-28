package com.ulms.auth.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserProfileUpdateRequest {
    private Long userId;
    private String fullName;
    private String phone;
    private String address;
}
