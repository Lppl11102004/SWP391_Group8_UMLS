package com.ulms.payment.service;

import com.ulms.auth.entity.User;
import com.ulms.membership.entity.MembershipPlan;
import com.ulms.payment.dto.PaymentCallbackResponse;
import com.ulms.payment.dto.PaymentResponse;
import com.ulms.payment.entity.Fine;
import com.ulms.reservation.entity.BorrowRecord;
import com.ulms.util.PageResponse;
import jakarta.servlet.http.HttpServletRequest;

import java.math.BigDecimal;
import java.util.Map;

public interface PaymentService {
    String initPayment(User user, Byte paymentType, BigDecimal amount, String orderInfo,
                       Long borrowId, Long fineId, Short planId, Boolean planType, HttpServletRequest request);
    PaymentCallbackResponse handleCallback(Map<String, String> queryParams);
    void activateOrRenewMembership(User user, MembershipPlan membershipPlan, Boolean planType, BigDecimal amount, Byte paymentMethod, String txnRef);
    void handleMembershipPaid(User user, MembershipPlan membershipPlan, boolean isRenew);
    void solveFine(User user, Fine fine, BigDecimal amount, Byte paymentMethod, String txnRef);
    void handleFinePaid(User user, Fine fine);
    PaymentCallbackResponse syncPayment(String txnRef, HttpServletRequest request);
    void solveDeposit(User user, BorrowRecord borrowRecord, BigDecimal amount, Byte paymentMethod, String txnRef);
    void handleDepositPaid(User user, BorrowRecord borrowRecord);
    PageResponse<PaymentResponse> getListPayment(Byte paymentType,Byte paymentMethod, Byte status, Integer page, Integer size);
}
