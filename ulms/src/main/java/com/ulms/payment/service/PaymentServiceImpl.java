package com.ulms.payment.service;

import com.ulms.auth.entity.User;
import com.ulms.exception.ApiException;
import com.ulms.membership.entity.MembershipPlan;
import com.ulms.membership.entity.UserMembership;
import com.ulms.membership.repository.MembershipPlanRepository;
import com.ulms.membership.repository.UserMembershipRepository;
import com.ulms.notification.entity.Notification;
import com.ulms.notification.repository.NotificationRepository;
import com.ulms.notification.service.NotificationService;
import com.ulms.payment.dto.PaymentCallbackResponse;
import com.ulms.payment.dto.PaymentResponse;
import com.ulms.payment.entity.Fine;
import com.ulms.payment.entity.Payment;
import com.ulms.payment.repository.FineRepository;
import com.ulms.payment.repository.PaymentRepository;
import com.ulms.reservation.entity.BorrowRecord;
import com.ulms.reservation.repository.BorrowRecordRepository;
import com.ulms.util.PageResponse;
import com.ulms.util.SecurityUtil;
import jakarta.persistence.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final VNPayService vnPayService;
    private final PaymentRepository paymentRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final FineRepository fineRepository;
    private final MembershipPlanRepository membershipPlanRepository;
    private final SecurityUtil securityUtil;
    private final UserMembershipRepository userMembershipRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;


    // TẠO GIAO DỊCH TỔNG QUÁT: Bất kỳ module nào cần thanh toán chỉ việc gọi hàm này
    @Transactional
    public String initPayment(User user, Byte paymentType, BigDecimal amount, String orderInfo,
                              Long borrowId, Long fineId, Short planId, Boolean planType, HttpServletRequest request) {

        // 1. Sinh mã giao dịch duy nhất
        String txnRef = System.currentTimeMillis() + "" + (int) (Math.random() * 1000);
        // 2. Lưu vào bảng payments trạng thái PENDING (0)
        Payment payment = new Payment();
        payment.setUser(user);
        payment.setPaymentType(paymentType);
        payment.setAmount(amount);
        payment.setPaymentMethod((byte) 2); // 2: VNPAY
        payment.setTxnRef(txnRef);
        payment.setStatus((byte) 0); // PENDING
        payment.setCreatedAt(LocalDateTime.now());

        // Gắn ID tham chiếu nếu có
        if (borrowId != null) payment.setBorrowRecord(borrowRecordRepository.getReferenceById(borrowId));
        if (fineId != null) payment.setFine(fineRepository.getReferenceById(fineId));
        if (planId != null) payment.setMembershipPlan(membershipPlanRepository.getReferenceById((short) planId));
        if (planType != null) {
            payment.setNote(planType ? "RENEW" : "UPGRADE");
        }
        paymentRepository.save(payment);
        // 3. Gọi VNPayService để lấy link
        return vnPayService.createPaymentUrl(txnRef, amount, orderInfo, request);
    }

    @Transactional
    public PaymentCallbackResponse handleCallback(Map<String, String> queryParams) {
        // 1. Kiểm tra chữ ký qua VNPayService
        if (!vnPayService.verifySignature(queryParams)) {
            throw new ApiException("Chữ ký VNPay không hợp lệ");
        }
        String txnRef = queryParams.get("vnp_TxnRef");
        Payment payment = paymentRepository.findByTxnRef(txnRef);
        if (payment == null) {
            throw new ApiException("Không tìm thấy giao dịch #" + txnRef);
        }
        if (payment.getStatus() == (byte) 1) {
            return new PaymentCallbackResponse(true, txnRef, "Giao dịch đã được thanh toán và ghi nhận thành công!", "00", payment.getPaymentType());
        }
        String responseCode = queryParams.get("vnp_ResponseCode");
        if ("00".equals(responseCode)) {
            payment.setStatus((byte) 1); // SUCCESS
            payment.setPaidAt(LocalDateTime.now());
            payment.setGatewayTxnNo(queryParams.get("vnp_TransactionNo"));
            payment.setBankCode(queryParams.get("vnp_BankCode"));
            paymentRepository.save(payment);
            // 2. ĐIỀU PHỐI NGHIỆP VỤ RIÊNG BIỆT (Delegate to individual services)
            switch (payment.getPaymentType()) {
                case 1 -> {
                    this.handleFinePaid(payment.getUser(), payment.getFine());
                }
                case 2 -> { // MEMBERSHIP
                    boolean isRenew = !"UPGRADE".equalsIgnoreCase(payment.getNote());
                    // GỌI TRỰC TIẾP HÀM NỘI BỘ TRONG CLASS NÀY:
                    this.handleMembershipPaid(
                            payment.getUser(),
                            payment.getMembershipPlan(),
                            isRenew
                    );
                }
                 case 3 -> {
                     this.handleDepositPaid(payment.getUser(), payment.getBorrowRecord());
                 }
            }
            return new PaymentCallbackResponse(true, txnRef, "Thành công", responseCode, payment.getPaymentType());
        } else {
            payment.setStatus((byte) 2); // FAILED
            paymentRepository.save(payment);
            return new PaymentCallbackResponse(false, txnRef, "Thất bại", responseCode, payment != null ? payment.getPaymentType() : null);
        }
    }

    @Transactional
    public void activateOrRenewMembership(User user, MembershipPlan membershipPlan, Boolean planType, BigDecimal amount, Byte paymentMethod, String txnRef) {

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime newEndDate;
        // 1. Tìm bản ghi gói hội viên hiện tại của User
        UserMembership userMembership = userMembershipRepository.findByUser_UserId(user.getUserId());
        if (userMembership == null) {
            userMembership = new UserMembership();
            userMembership.setUser(user);
        }
        if (membershipPlan == null) {
            throw new com.ulms.exception.ApiException("Không tìm thấy gói hội viên phù hợp để xử lý giao dịch.");
        }
        // 2. Xử lý cộng dồn ngày (nếu là GIA HẠN cùng gói và gói cũ chưa hết hạn)
        if (userMembership.getEndDate() != null
                && userMembership.getEndDate().isAfter(now)
                && Boolean.TRUE.equals(planType)
                && userMembership.getMembershipPlan() != null
                && membershipPlan.getPlanId() != null
                && userMembership.getMembershipPlan().getPlanId().equals(membershipPlan.getPlanId())) {

            // Gia hạn cùng gói: Cộng nối tiếp từ ngày hết hạn cũ
            newEndDate = userMembership.getEndDate().plusDays(membershipPlan.getDurationDays());
        } else {
            // Mua mới hoặc Nâng cấp gói: Bắt đầu tính từ thời điểm hiện tại
            userMembership.setStartDate(now);
            newEndDate = now.plusDays(membershipPlan.getDurationDays());
        }
        // 3. Cập nhật và lưu UserMembership (1: ACTIVE)
        userMembership.setMembershipPlan(membershipPlan);
        userMembership.setEndDate(newEndDate);
        userMembership.setStatus((byte) 1);
        userMembership.setCreatedAt(now);
        userMembershipRepository.save(userMembership);
        // 4. Ghi nhận giao dịch vào bảng Payment (nếu chưa được lưu từ trước)
        Payment payment = new Payment();
        payment.setUser(user);
        payment.setPaymentType((byte) 2); // 2: MEMBERSHIP
        payment.setMembershipPlan(membershipPlan);
        payment.setAmount(amount);
        payment.setPaymentMethod(paymentMethod); // 1: CASH hoặc 2: VNPAY
        payment.setTxnRef(txnRef);
        payment.setStatus((byte) 1); // 1: SUCCESS
        payment.setPaidAt(now);
        payment.setCreatedAt(now);
        paymentRepository.save(payment);
        // 5. Tạo thông báo cho độc giả
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(notificationService.getNotificationTitle(3));
        notification.setType((byte) 5); // 5: MEMBERSHIP
        notification.setIsRead(false);
        notificationRepository.save(notification);
    }

    @Transactional
    @Override
    public void handleMembershipPaid(User user, MembershipPlan membershipPlan, boolean isRenew) {
        if (membershipPlan == null) {
            log.warn("handleMembershipPaid: membershipPlan is null for user {}", user.getUserId());
            return;
        }
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
                && membershipPlan.getPlanId() != null
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

    @Transactional
    @Override
    public void solveFine(User user, Fine fine, BigDecimal amount, Byte paymentMethod, String txnRef) {
        // Cập nhật lại lịch sử nơ
        fine.setStatus((byte) 1);
        fine.setUpdatedAt(LocalDateTime.now());
        fineRepository.save(fine);
        // Cập nhật vào Payment
        Payment payment = new Payment();
        payment.setUser(user);
        payment.setPaymentType((byte) 1); // NỘP PHẠT
        payment.setFine(fine);
        payment.setAmount(amount);
        payment.setPaymentMethod((byte) 1); // CASH
        payment.setTxnRef(txnRef);
        payment.setStatus((byte) 1);
        payment.setNote("Thanh toán khoản nợ");
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);
        //Thông báo
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(notificationService.getNotificationTitle(4));
        notification.setType((byte) 4); // 4: PAYMENT
        notification.setIsRead(false);
        notificationRepository.save(notification);
    }

    @Transactional
    @Override
    public void handleFinePaid(User user, Fine fine) {
        fine.setStatus((byte) 1);
        fine.setUpdatedAt(LocalDateTime.now());
        fineRepository.save(fine);
        // payment note
        Payment payment = paymentRepository.findByFine_FineId(fine.getFineId());
        payment.setNote("Thanh toán khoản nợ");
        paymentRepository.save(payment);
        //Thông báo
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(notificationService.getNotificationTitle(4));
        notification.setType((byte) 4); // 4: PAYMENT
        notification.setIsRead(false);
        notificationRepository.save(notification);
    }

    @Transactional
    @Override
    public PaymentCallbackResponse syncPayment(String txnRef, HttpServletRequest request) {
        Payment payment = paymentRepository.findByTxnRef(txnRef);
        if (payment == null) {
            throw new com.ulms.exception.ApiException("Không tìm thấy giao dịch #" + txnRef);
        }

        // 1. Nếu giao dịch đã thành công từ trước -> trả về thành công luôn
        if (payment.getStatus() == (byte) 1) {
            return new PaymentCallbackResponse(true, txnRef, "Giao dịch đã được thanh toán và ghi nhận thành công!", "00");
        }

        // 2. Gọi sang API tra cứu QueryDR của VNPay Sandbox
        Map<String, Object> queryResult = vnPayService.queryTransaction(payment.getTxnRef(), payment.getCreatedAt(), request);

        String responseCode = queryResult.get("vnp_ResponseCode") != null ? String.valueOf(queryResult.get("vnp_ResponseCode")) : "";
        String transactionStatus = queryResult.get("vnp_TransactionStatus") != null ? String.valueOf(queryResult.get("vnp_TransactionStatus")) : "";

        // 3. Nếu VNPay xác nhận đã thanh toán thành công (Mã "00")
        if ("00".equals(responseCode) && "00".equals(transactionStatus)) {
            payment.setStatus((byte) 1); // SUCCESS
            payment.setPaidAt(LocalDateTime.now());
            if (queryResult.get("vnp_TransactionNo") != null) {
                payment.setGatewayTxnNo(String.valueOf(queryResult.get("vnp_TransactionNo")));
            }
            if (queryResult.get("vnp_BankCode") != null) {
                payment.setBankCode(String.valueOf(queryResult.get("vnp_BankCode")));
            }
            paymentRepository.save(payment);

            // 4. Điều phối nghiệp vụ tương ứng theo PaymentType
            switch (payment.getPaymentType()) {
                case 1 -> { // FINE
                    if (payment.getFine() != null) {
                        this.handleFinePaid(payment.getUser(), payment.getFine());
                    }
                }
                case 2 -> { // MEMBERSHIP
                    boolean isRenew = !"UPGRADE".equalsIgnoreCase(payment.getNote());
                    this.handleMembershipPaid(payment.getUser(), payment.getMembershipPlan(), isRenew);
                }
                case 3 -> { // DEPOSIT
                    if (payment.getBorrowRecord() != null) {
                        this.handleDepositPaid(payment.getUser(), payment.getBorrowRecord());
                    }
                }
            }

            return new PaymentCallbackResponse(true, txnRef, "Đồng bộ giao dịch thành công! Dịch vụ đã được kích hoạt.", "00", payment.getPaymentType());
        } else if ("02".equals(transactionStatus)) {
            payment.setStatus((byte) 2); // FAILED
            paymentRepository.save(payment);
            return new PaymentCallbackResponse(false, txnRef, "Giao dịch thất bại trên cổng VNPay", transactionStatus);
        } else {
            String message = queryResult.get("vnp_Message") != null ? String.valueOf(queryResult.get("vnp_Message")) : "Giao dịch chưa hoàn tất thanh toán";
            return new PaymentCallbackResponse(false, txnRef, message + " (Mã trạng thái: " + transactionStatus + ")", responseCode);
        }
    }

    @Transactional
    @Override
    public void solveDeposit(User user, BorrowRecord borrowRecord, BigDecimal amount, Byte paymentMethod, String txnRef) {
        // Câập nhật lại deposit status
        borrowRecord.setDepositStatus((byte) 1);
        borrowRecord.setUpdatedAt(LocalDateTime.now());
        borrowRecordRepository.save(borrowRecord);
        // Cập nhật payment
        Payment payment = new Payment();
        payment.setUser(user);
        payment.setPaymentType((byte) 3); // NỘP PHẠT
        payment.setBorrowRecord(borrowRecord);
        payment.setAmount(amount);
        payment.setPaymentMethod((byte) 1); // CASH
        payment.setTxnRef(txnRef);
        payment.setStatus((byte) 1);
        payment.setNote("Thanh toán tiền cọc mượn sách");
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);
        // noti
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(notificationService.getNotificationTitle(6));
        notification.setType((byte) 4); // 4: PAYMENT
        notification.setIsRead(false);
        notificationRepository.save(notification);

    }

    @Override
    public void handleDepositPaid(User user, BorrowRecord borrowRecord) {
        borrowRecord.setDepositStatus((byte) 1);
        borrowRecord.setUpdatedAt(LocalDateTime.now());
        borrowRecordRepository.save(borrowRecord);
        //payment note
        Payment payment = paymentRepository.findByBorrowRecord_BorrowId(borrowRecord.getBorrowId());
        if (payment != null) {
            payment.setNote("Thanh toán tiền cọc mượn sách");
            paymentRepository.save(payment);
        }

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(notificationService.getNotificationTitle(6));
        notification.setType((byte) 4); // 4: PAYMENT
        notification.setIsRead(false);
        notificationRepository.save(notification);
    }

    @Override
    public PageResponse<PaymentResponse> getListPayment(Byte paymentType,Byte paymentMethod, Byte status, Integer page, Integer size) {
        User user = securityUtil.getCurrentUser();
        Page<Payment> payments = searchPageablePayment(user, paymentType,paymentMethod, status, page, size);
        List<PaymentResponse> list = standardListBookPayment(payments);

        return new PageResponse<>(
                list,
                payments.getNumber(),
                payments.getSize(),
                payments.getTotalElements()
        );

    }

    public Page<Payment> searchPageablePayment(User user, Byte paymentType,Byte paymentMethod,  Byte status, Integer page, Integer size){
        Pageable pageable = PageRequest.of(
                page,
                size
        );

        Page<Payment> payments = paymentRepository.searchPayment(
                user.getUserId(),
                paymentType,
                paymentMethod,
                status,
                pageable
        );
        return payments;
    }

    public List<PaymentResponse> standardListBookPayment(Page<Payment> request){
        List<PaymentResponse> list = new ArrayList<>();

        for (Payment p : request.getContent()) {

            PaymentResponse response = new PaymentResponse();
            response.setPaymentId(p.getPaymentId());
            response.setTxnRef(p.getTxnRef());
            response.setStatus(p.getStatus());
            response.setPaidAt(p.getPaidAt());
            response.setPaymentMethod(p.getPaymentMethod());
            response.setAmount(p.getAmount());
            response.setBankCode(p.getBankCode());
            response.setPaymentType(p.getPaymentType());
            response.setNote(p.getNote());
            response.setCreatedAt(p.getCreatedAt());

            list.add(response);
        }
        return list;
    }
}
