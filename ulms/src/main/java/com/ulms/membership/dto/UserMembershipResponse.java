package com.ulms.membership.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class UserMembershipResponse {
    private Long userMembershipId;
    private Long userId;
    //Thông tin gói đang đăng kí
    private MembershipPlansResponse membershipPlansResponse;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private Integer totalDayRemain;
    private Byte status;

}
