package com.ulms.blacklist.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LibrarianBlacklistResponse {
    private Long blacklistId;
    private Long userId;
    private String userName;
    private String userEmail;
    private String userPhone;
    private String reason;
    private Byte createdByType;
    private Long createdByUserId;
    private String createdByUserName;
    private Boolean isActive;
    private LocalDateTime unlockedAt;
    private Long unlockedByUserId;
    private String unlockedByUserName;
    private LocalDateTime createdAt;
}
