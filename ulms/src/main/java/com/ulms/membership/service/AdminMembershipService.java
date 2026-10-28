package com.ulms.membership.service;

import com.ulms.membership.dto.AdminMembershipPlanRequest;
import com.ulms.membership.dto.AdminMembershipPlanResponse;

import java.util.List;

public interface AdminMembershipService {
    List<AdminMembershipPlanResponse> getAllPlans();
    AdminMembershipPlanResponse getPlanById(Short planId);
    AdminMembershipPlanResponse createPlan(AdminMembershipPlanRequest request);
    AdminMembershipPlanResponse updatePlan(Short planId, AdminMembershipPlanRequest request);
    AdminMembershipPlanResponse toggleActive(Short planId);
}
