package com.ulms.blacklist.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateBlacklistRequest {
    private Long userId;
    private String reason;
}
