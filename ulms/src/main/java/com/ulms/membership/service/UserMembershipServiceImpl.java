package com.ulms.membership.service;

import com.ulms.auth.entity.User;
import com.ulms.exception.ApiException;
import com.ulms.membership.dto.MembershipPlansResponse;
import com.ulms.membership.dto.UserMembershipResponse;
import com.ulms.membership.entity.MembershipPlan;
import com.ulms.membership.entity.UserMembership;
import com.ulms.membership.repository.MembershipPlanRepository;
import com.ulms.membership.repository.UserMembershipRepository;
import com.ulms.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class UserMembershipServiceImpl implements UserMembershipService {

    private final SecurityUtil securityUtil;
    private final UserMembershipRepository userMembershipRepository;
    private final MembershipPlanRepository membershipPlanRepository;

    @Override
    public UserMembershipResponse viewMembershipDetail() {

        User user = securityUtil.getCurrentUser();

        UserMembership userMembership = userMembershipRepository.findByUser_UserId(user.getUserId());
        if (userMembership == null) {
            throw new ApiException("Bạn chưa đăng kí gói hội viên nào");
        }

        UserMembershipResponse result = new UserMembershipResponse();
        result.setUserMembershipId(userMembership.getUserMembershipId());
        result.setUserId(user.getUserId());
        result.setStatus(userMembership.getStatus());
        result.setStartAt(userMembership.getStartDate());
        result.setEndAt(userMembership.getEndDate());
        LocalDateTime endAt = userMembership.getEndDate();
        int totalDayRemain = 0;
        if (LocalDateTime.now().isBefore(userMembership.getEndDate())) {
            totalDayRemain = (int) ChronoUnit.DAYS.between(LocalDate.now(), endAt.toLocalDate());
        }
        result.setTotalDayRemain(totalDayRemain);


        MembershipPlan membershipPlan = (userMembership.getMembershipPlan() != null && userMembership.getMembershipPlan().getPlanId() != null)
                ? membershipPlanRepository.findById(userMembership.getMembershipPlan().getPlanId()).orElse(null)
                : null;
        if (membershipPlan == null) {
            result.setMembershipPlansResponse(null);
        } else {
            MembershipPlansResponse mp = new MembershipPlansResponse();

            mp.setPlanId(membershipPlan.getPlanId());
            mp.setName(membershipPlan.getName());
            mp.setPrice(membershipPlan.getPrice());
            mp.setDurationDays(membershipPlan.getDurationDays());
            mp.setDepositDiscountPct(membershipPlan.getDepositDiscountPct());
            mp.setMaxDepositAmount(membershipPlan.getMaxDepositAmount());
            mp.setFreeDepositPriceLimit(membershipPlan.getFreeDepositPriceLimit());
            mp.setDescription(membershipPlan.getDescription());

            result.setMembershipPlansResponse(mp);
        }

        return result;
    }
}
