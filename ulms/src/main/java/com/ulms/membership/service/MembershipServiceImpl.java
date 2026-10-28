package com.ulms.membership.service;

import com.cloudinary.Api;
import com.ulms.auth.entity.User;
import com.ulms.exception.ApiException;
import com.ulms.membership.dto.MembershipPlansResponse;
import com.ulms.membership.entity.MembershipPlan;
import com.ulms.membership.entity.UserMembership;
import com.ulms.membership.repository.MembershipPlanRepository;
import com.ulms.membership.repository.UserMembershipRepository;
import com.ulms.notification.entity.Notification;
import com.ulms.notification.repository.NotificationRepository;
import com.ulms.notification.service.NotificationService;
import com.ulms.payment.service.PaymentService;
import com.ulms.util.SecurityUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MembershipServiceImpl implements MembershipService{

    private final MembershipPlanRepository membershipPlanRepository;
    private final SecurityUtil securityUtil;
    private final UserMembershipRepository userMembershipRepository;
    private final PaymentService paymentService;
    private final NotificationService notificationService;
    private final NotificationRepository notificationRepository;

    @Override
    public List<MembershipPlansResponse> listMembershipPlan() {
        List<MembershipPlan> list = membershipPlanRepository.findByIsActive(true);
        if(list.isEmpty()){
            throw new ApiException("Hiện chưa có gói khả dụng");
        }
        System.out.println("List Member Plan"+ list);
        List<MembershipPlansResponse> listPlan = new ArrayList<>();
        for(MembershipPlan m : list){
            MembershipPlansResponse plan = new MembershipPlansResponse();
            plan.setPlanId(m.getPlanId());
            System.out.println("Id:  "+ m.getPlanId());
            plan.setName(m.getName());
            plan.setPrice(m.getPrice());
            plan.setDurationDays(m.getDurationDays());
            plan.setDepositDiscountPct(m.getDepositDiscountPct());
            plan.setMaxDepositAmount(m.getMaxDepositAmount());
            plan.setFreeDepositPriceLimit(m.getFreeDepositPriceLimit());
            plan.setDescription(m.getDescription());

            listPlan.add(plan);
        }
        return listPlan;
    }

    @Transactional
    @Override
    public String purchaseMembership(Byte paymentMethod, Short planId, Boolean planType, HttpServletRequest request) {
        User user = securityUtil.getCurrentUser();

        MembershipPlan membershipPlan = membershipPlanRepository.findById(planId).orElse(null);
        if (membershipPlan == null){
            throw new ApiException("Không tìm thấy gói hội viên phù hợp");
        }

        BigDecimal finalPrice = membershipPlan.getPrice(); // Mặc định là nguyên giá gói mới

        UserMembership userMembership = userMembershipRepository.findByUser_UserId(user.getUserId());

        if (userMembership != null && userMembership.getEndDate() != null) {
            // Tính số ngày còn lại của gói hiện tại
            long dayRemain = ChronoUnit.DAYS.between(LocalDate.now(), userMembership.getEndDate().toLocalDate());

            if (Boolean.TRUE.equals(planType)) {
                // CASE 1: MUA MỚI HOẶC GIA HẠN (RENEW)
                finalPrice = membershipPlan.getPrice();

            } else {
                // CASE 2: NÂNG CẤP GÓI (UPGRADE)
                if (userMembership == null || userMembership.getMembershipPlan() == null) {
                    throw new ApiException("Bạn chưa đăng ký gói hội viên nào để nâng cấp");
                }

                if (dayRemain <= 0) {
                    throw new ApiException("Gói hội viên của bạn đã hết hạn, vui lòng chọn Mua mới hoặc Gia hạn");
                }

                // Chặn nếu gói mới có giá NHỎ HƠN hoặc BẰNG gói hiện tại
                if (userMembership.getMembershipPlan().getPrice().compareTo(membershipPlan.getPrice()) >= 0) {
                    throw new ApiException("Bạn chỉ được phép nâng cấp lên gói có giá trị cao hơn gói hiện tại");
                }

                int dayInOldPlan = userMembership.getMembershipPlan().getDurationDays();
                BigDecimal oldPlanPrice = userMembership.getMembershipPlan().getPrice();

                // Giá trị 1 ngày của gói cũ
                BigDecimal dailyRate = oldPlanPrice.divide(BigDecimal.valueOf(dayInOldPlan), 2, RoundingMode.HALF_UP);
                BigDecimal moneyRemain = dailyRate.multiply(BigDecimal.valueOf(dayRemain));

                // Giá phải trả = Giá gói MỚI - Tiền thừa gói CŨ
                finalPrice = membershipPlan.getPrice().subtract(moneyRemain);
                if (finalPrice.compareTo(BigDecimal.ZERO) < 0) {
                    finalPrice = BigDecimal.ZERO;
                }
            }
        } else {
            // Người dùng mới toanh mua lần đầu -> trả nguyên giá gói mới
            userMembership = new UserMembership();
            finalPrice = membershipPlan.getPrice();
        }

        // HÌNH THỨC 1: CASH TẠI QUẦY
        if (paymentMethod == 1) {
            paymentService.activateOrRenewMembership(user, membershipPlan, planType,  finalPrice,  paymentMethod,  "CASH_"+LocalDateTime.now());
            return "Thanh toán gói hội viên bằng tiền mặt thành công";
        }

        // HÌNH THỨC 2: THANH TOÁN ONLINE VNPAY
        if (paymentMethod == 2) {
            return paymentService.initPayment(user, (byte) 2, finalPrice, "Thanh toan goi " + membershipPlan.getName(), null, null, planId, planType, request);
        }

        throw new ApiException("Phương thức thanh toán không được hỗ trợ");
    }

    @Transactional
    @Override
    public void handleMembershipPaid(User user, MembershipPlan membershipPlan, boolean isRenew) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime newEndDate;

        // 1. Tìm bản ghi Membership hiện tại của User
        UserMembership userMembership = userMembershipRepository.findByUser_UserId(user.getUserId());
        if (userMembership == null) {
            userMembership = new UserMembership();
            userMembership.setUser(user);
        }

        // 2. Tính toán ngày hết hạn mới:
        // Nếu là GIA HẠN (isRenew = true) cùng gói và gói cũ chưa hết hạn -> Cộng dồn ngày
        if (isRenew && userMembership.getEndDate() != null
                && userMembership.getEndDate().isAfter(now)
                && userMembership.getMembershipPlan() != null
                && userMembership.getMembershipPlan().getPlanId().equals(membershipPlan.getPlanId())) {

            newEndDate = userMembership.getEndDate().plusDays(membershipPlan.getDurationDays());
        } else {
            // Mua mới hoặc Nâng cấp gói -> Bắt đầu tính từ thời điểm hiện tại
            userMembership.setStartDate(now);
            newEndDate = now.plusDays(membershipPlan.getDurationDays());
        }

        // 3. Cập nhật và lưu lại trạng thái ACTIVE (1)
        userMembership.setMembershipPlan(membershipPlan);
        userMembership.setEndDate(newEndDate);
        userMembership.setStatus((byte) 1); // 1: ACTIVE
        userMembershipRepository.save(userMembership);

        // 4. Bắn thông báo xác nhận cho User
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(notificationService.getNotificationTitle(3)); // Kích hoạt gói thành công
        notification.setType((byte) 5); // 5: MEMBERSHIP
        notification.setIsRead(false);
        notificationRepository.save(notification);
    }

    @Override
    public List<MembershipPlansResponse> listUpgradeMembershipPlan() {
        User user = securityUtil.getCurrentUser();
        UserMembership userMembership = userMembershipRepository.findByUser_UserId(user.getUserId());
        if (userMembership == null || userMembership.getMembershipPlan() == null || userMembership.getMembershipPlan().getPlanId() == null) {
            throw new ApiException("Bạn chưa đăng ký gói hội viên nào hoặc gói hiện tại không còn khả dụng.");
        }
        MembershipPlan membershipPlan = membershipPlanRepository.findById(userMembership.getMembershipPlan().getPlanId()).orElse(null);
        if (membershipPlan == null) {
            throw new ApiException("Gói hội viên hiện tại không còn khả dụng");
        }

        LocalDateTime endAt = userMembership.getEndDate();
        int dayRemain = 0;
        if (endAt != null && LocalDateTime.now().isBefore(endAt)) {
            dayRemain = (int) ChronoUnit.DAYS.between(LocalDate.now(), endAt.toLocalDate());
        }
        int durationDays = membershipPlan.getDurationDays();

        // Tính tiền thừa gói cũ theo ngày (dùng BigDecimal chuẩn xác)
        BigDecimal dailyRate = durationDays > 0 
                ? membershipPlan.getPrice().divide(BigDecimal.valueOf(durationDays), 2, RoundingMode.HALF_UP) 
                : BigDecimal.ZERO;
        BigDecimal priceRemain = dailyRate.multiply(BigDecimal.valueOf(dayRemain));

        List<MembershipPlan> list = membershipPlanRepository.findByIsActive(true);
        if(list.isEmpty()){
            throw new ApiException("Hiện chưa có gói khả dụng");
        }

        List<MembershipPlansResponse> listPlan = new ArrayList<>();
        for(MembershipPlan m : list){
            // Chỉ lấy các gói cao cấp hơn gói hiện tại (giá cao hơn -> compareTo > 0)
            if (m.getPrice().compareTo(membershipPlan.getPrice()) > 0){
                MembershipPlansResponse plan = new MembershipPlansResponse();
                plan.setPlanId(m.getPlanId());
                plan.setName(m.getName());

                // Giá nâng cấp = Giá gói mới - Tiền thừa gói cũ (không âm)
                BigDecimal finalUpgradePrice = m.getPrice().subtract(priceRemain);
                if (finalUpgradePrice.compareTo(BigDecimal.ZERO) < 0) {
                    finalUpgradePrice = BigDecimal.ZERO;
                }
                plan.setPrice(finalUpgradePrice);

                plan.setDurationDays(m.getDurationDays());
                plan.setDepositDiscountPct(m.getDepositDiscountPct());
                plan.setMaxDepositAmount(m.getMaxDepositAmount());
                plan.setFreeDepositPriceLimit(m.getFreeDepositPriceLimit());
                plan.setDescription(m.getDescription());

                listPlan.add(plan);
            }
        }
        return listPlan;
    }

}
