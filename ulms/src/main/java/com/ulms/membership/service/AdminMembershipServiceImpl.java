package com.ulms.membership.service;

import com.ulms.exception.ApiException;
import com.ulms.membership.dto.AdminMembershipPlanRequest;
import com.ulms.membership.dto.AdminMembershipPlanResponse;
import com.ulms.membership.entity.MembershipPlan;
import com.ulms.membership.repository.MembershipPlanRepository;
import com.ulms.membership.repository.UserMembershipRepository;
import com.ulms.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminMembershipServiceImpl implements AdminMembershipService {

    private final MembershipPlanRepository membershipPlanRepository;
    private final UserMembershipRepository userMembershipRepository;
    private final PaymentRepository paymentRepository;

    @Override
    public List<AdminMembershipPlanResponse> getAllPlans() {
        return membershipPlanRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public AdminMembershipPlanResponse getPlanById(Short planId) {
        MembershipPlan plan = membershipPlanRepository.findById(planId)
                .orElseThrow(() -> new ApiException("Không tìm thấy gói hội viên với mã: " + planId));
        return mapToResponse(plan);
    }

    @Override
    @Transactional
    public AdminMembershipPlanResponse createPlan(AdminMembershipPlanRequest request) {
        validateRequest(request, null);

        MembershipPlan plan = new MembershipPlan();
        plan.setName(request.getName().trim());
        plan.setPrice(request.getPrice() != null ? request.getPrice() : BigDecimal.ZERO);
        plan.setDurationDays(request.getDurationDays() != null ? request.getDurationDays() : 30);
        plan.setDepositDiscountPct(request.getDepositDiscountPct() != null ? request.getDepositDiscountPct() : (short) 0);
        plan.setMaxDepositAmount(request.getMaxDepositAmount());
        plan.setFreeDepositPriceLimit(request.getFreeDepositPriceLimit());
        plan.setDescription(request.getDescription());
        plan.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        plan.setCreatedAt(LocalDateTime.now());
        plan.setUpdatedAt(LocalDateTime.now());

        MembershipPlan saved = membershipPlanRepository.save(plan);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public AdminMembershipPlanResponse updatePlan(Short planId, AdminMembershipPlanRequest request) {
        MembershipPlan plan = membershipPlanRepository.findById(planId)
                .orElseThrow(() -> new ApiException("Không tìm thấy gói hội viên với mã: " + planId));

        validateRequest(request, planId);

        plan.setName(request.getName().trim());
        if (request.getPrice() != null) plan.setPrice(request.getPrice());
        if (request.getDurationDays() != null) plan.setDurationDays(request.getDurationDays());
        if (request.getDepositDiscountPct() != null) plan.setDepositDiscountPct(request.getDepositDiscountPct());
        plan.setMaxDepositAmount(request.getMaxDepositAmount());
        plan.setFreeDepositPriceLimit(request.getFreeDepositPriceLimit());
        if (request.getDescription() != null) plan.setDescription(request.getDescription());
        if (request.getIsActive() != null) plan.setIsActive(request.getIsActive());
        plan.setUpdatedAt(LocalDateTime.now());

        MembershipPlan updated = membershipPlanRepository.save(plan);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public AdminMembershipPlanResponse toggleActive(Short planId) {
        MembershipPlan plan = membershipPlanRepository.findById(planId)
                .orElseThrow(() -> new ApiException("Không tìm thấy gói hội viên với mã: " + planId));

        plan.setIsActive(!Boolean.TRUE.equals(plan.getIsActive()));
        plan.setUpdatedAt(LocalDateTime.now());

        MembershipPlan updated = membershipPlanRepository.save(plan);
        return mapToResponse(updated);
    }

    private void validateRequest(AdminMembershipPlanRequest request, Short planId) {
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new ApiException("Tên gói hội viên không được để trống");
        }
        String name = request.getName().trim();
        if (planId == null) {
            if (membershipPlanRepository.existsByName(name)) {
                throw new ApiException("Tên gói hội viên đã tồn tại: " + name);
            }
        } else {
            if (membershipPlanRepository.existsByNameAndPlanIdNot(name, planId)) {
                throw new ApiException("Tên gói hội viên đã được sử dụng bởi gói khác: " + name);
            }
        }

        if (request.getPrice() != null && request.getPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new ApiException("Giá gói không được nhỏ hơn 0");
        }
        if (request.getDurationDays() != null && request.getDurationDays() <= 0) {
            throw new ApiException("Thời hạn gói (số ngày) phải lớn hơn 0");
        }
        if (request.getDepositDiscountPct() != null && (request.getDepositDiscountPct() < 0 || request.getDepositDiscountPct() > 100)) {
            throw new ApiException("Phần trăm giảm cọc phải từ 0 đến 100");
        }
    }

    private AdminMembershipPlanResponse mapToResponse(MembershipPlan p) {
        Long activeCount = userMembershipRepository.countActiveUsersByPlanId(p.getPlanId());
        BigDecimal revenue = paymentRepository.sumRevenueByPlanId(p.getPlanId());

        return AdminMembershipPlanResponse.builder()
                .planId(p.getPlanId())
                .name(p.getName())
                .price(p.getPrice())
                .durationDays(p.getDurationDays())
                .depositDiscountPct(p.getDepositDiscountPct())
                .maxDepositAmount(p.getMaxDepositAmount())
                .freeDepositPriceLimit(p.getFreeDepositPriceLimit())
                .description(p.getDescription())
                .isActive(p.getIsActive())
                .activeUserCount(activeCount != null ? activeCount : 0L)
                .totalRevenue(revenue != null ? revenue : BigDecimal.ZERO)
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
