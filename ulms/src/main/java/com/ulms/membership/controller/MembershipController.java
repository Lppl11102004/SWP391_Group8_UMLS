package com.ulms.membership.controller;

import com.ulms.exception.ApiResponse;
import com.ulms.membership.dto.MembershipPlansResponse;
import com.ulms.membership.dto.RulesResponse;
import com.ulms.membership.dto.UserMembershipResponse;
import com.ulms.membership.service.MembershipService;
import com.ulms.membership.service.SettingService;
import com.ulms.membership.service.UserMembershipService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.websocket.server.PathParam;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/ulms")
@RequiredArgsConstructor
public class MembershipController {

    private final MembershipService membershipService;
    private final SettingService settingService;
    private final UserMembershipService userMembershipService;

    //===========================
    //VIEW MEMBERSHIP PLAN(HIEN THI CO BAN)
    @GetMapping("/plans")
    public ResponseEntity<ApiResponse<List<MembershipPlansResponse>>> viewMemPlan() {
        List<MembershipPlansResponse> result = membershipService.listMembershipPlan();

        ApiResponse<List<MembershipPlansResponse>> response = new ApiResponse<List<MembershipPlansResponse>>(
                true,
                result.isEmpty()?"Gói hội viên đang được cập nhật":"Tải danh sách gói hội viên thành công",
                result
        );
        return ResponseEntity.ok(response);
    }

    //===========================
    //VIEW MEMBERSHIP PLAN(HIEN THI RA KHI YEU GIA HAN HOAC NANG GOI)
    @GetMapping("/upgrade-plan")
    public ResponseEntity<ApiResponse<List<MembershipPlansResponse>>> viewUpgradeMemPlan() {
        List<MembershipPlansResponse> result = membershipService.listUpgradeMembershipPlan();

        ApiResponse<List<MembershipPlansResponse>> response = new ApiResponse<List<MembershipPlansResponse>>(
                true,
                result.isEmpty()?"Bạn đã nâng cấp lên gói tối đa, đã hết ưu đãi":"Tải danh sách gói ưu đãi hội viên thành công",
                result
        );
        return ResponseEntity.ok(response);
    }

    //===========================
    //GIA HAN MEMBERSHIP - NANG CAP MEMBERSHIP
    @PostMapping("/plans")
    public ResponseEntity<ApiResponse<String>> extendMembershipPlan(
            @RequestParam("paymentMethod") Byte paymentMethod,
            @RequestParam("planId") Short planId,
            @RequestParam("planType") Boolean planType,
            HttpServletRequest request
    ) {
        String result = membershipService.purchaseMembership(paymentMethod, planId, planType, request);
        ApiResponse<String> response = new ApiResponse<>(
                true,
                "Xử lý đăng ký gói hội viên thành công",
                result // Đưa link VNPay vào trường data
        );
        return ResponseEntity.ok(response);
    }

    //===========================
    //VIEW MEMBERSHIP PLAN
    @GetMapping("/rules")
    public ResponseEntity<ApiResponse<List<RulesResponse>>> viewRule() {
        List<RulesResponse> result = settingService.getListRule();

        ApiResponse<List<RulesResponse>> response = new ApiResponse<List<RulesResponse>>(
                true,
                result.isEmpty()?"Gói hội viên đang được cập nhật":"Tải danh sách gói hội viên thành công",
                result
        );
        return ResponseEntity.ok(response);
    }

    //===========================
    //VIEW MEMBERSHIP PLAN SIGN UP NOW
    @GetMapping("/my-membership")
    public ResponseEntity<ApiResponse<UserMembershipResponse>> viewMyPlan() {
        UserMembershipResponse result = userMembershipService.viewMembershipDetail();

        ApiResponse<UserMembershipResponse> response = new ApiResponse<UserMembershipResponse>(
                true,
                result.getMembershipPlansResponse() == null?"Gói hội viên không còn khả dụng":"Tải danh sách gói hội viên thành công",
                result
        );
        return ResponseEntity.ok(response);
    }

}
