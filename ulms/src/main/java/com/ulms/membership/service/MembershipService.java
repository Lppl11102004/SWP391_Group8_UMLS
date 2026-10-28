package com.ulms.membership.service;

import com.ulms.auth.entity.User;
import com.ulms.membership.dto.MembershipPlansResponse;
import com.ulms.membership.entity.MembershipPlan;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

public interface MembershipService {
    List<MembershipPlansResponse> listMembershipPlan();
    String purchaseMembership(Byte paymentMethod, Short planId, Boolean planType, HttpServletRequest request);
    void handleMembershipPaid(User user, MembershipPlan membershipPlan, boolean isRenew);
    List<MembershipPlansResponse> listUpgradeMembershipPlan();
}
