package com.ulms.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BlacklistStatusResponse {
    private Boolean isBlacklisted;
    private String reason;
    private LocalDateTime createdAt;
}
