package com.ulms.auth.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserPasswordUpdateRequest {
    private Long userId;
    private String currentPassword;
    private String newPassword;
    private String confirmPassword;
}
