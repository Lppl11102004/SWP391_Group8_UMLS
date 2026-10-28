package com.ulms.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BroadcastNotificationRequest {
    private String targetGroup; // ALL, READER, LIBRARIAN
    private String title;
    private Byte type; // Mặc định 3: SYSTEM
}
