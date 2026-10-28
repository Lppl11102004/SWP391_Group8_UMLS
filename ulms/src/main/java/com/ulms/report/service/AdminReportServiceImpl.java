package com.ulms.report.service;

import com.ulms.auth.repository.UserRepository;
import com.ulms.blacklist.repository.BlacklistRepository;
import com.ulms.book.repository.BookCopyRepository;
import com.ulms.book.repository.BookRepository;
import com.ulms.membership.entity.MembershipPlan;
import com.ulms.membership.repository.MembershipPlanRepository;
import com.ulms.membership.repository.UserMembershipRepository;
import com.ulms.payment.entity.Payment;
import com.ulms.payment.repository.FineRepository;
import com.ulms.payment.repository.PaymentRepository;
import com.ulms.report.dto.*;
import com.ulms.reservation.repository.BorrowDetailRepository;
import com.ulms.reservation.repository.BorrowRecordRepository;
import com.ulms.reservation.repository.ReservationRepository;
import com.ulms.util.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminReportServiceImpl implements AdminReportService {

    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final BookCopyRepository bookCopyRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final BorrowDetailRepository borrowDetailRepository;
    private final ReservationRepository reservationRepository;
    private final FineRepository fineRepository;
    private final PaymentRepository paymentRepository;
    private final UserMembershipRepository userMembershipRepository;
    private final MembershipPlanRepository membershipPlanRepository;
    private final BlacklistRepository blacklistRepository;

    @Override
    public AdminDashboardResponse getDashboard() {
        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();

        Long totalUsers = userRepository.count();
        Long newUsersThisMonth = userRepository.countByCreatedAtGreaterThanEqual(startOfMonth);
        Long activeLibrarians = userRepository.countByRole_RoleId((byte) 2);
        Long activeMembers = userMembershipRepository.countTotalActiveMemberships();
        Integer blacklistedUsers = blacklistRepository.countByIsActiveTrue();

        Long totalBooks = bookRepository.count();
        Long totalBookCopies = bookCopyRepository.count();
        Integer activeBorrows = borrowRecordRepository.countByStatus((byte) 1);
        Integer overdueCount = borrowRecordRepository.countOverdueBorrows(LocalDateTime.now());
        Integer pendingReservations = reservationRepository.countByStatus((byte) 0);

        BigDecimal totalRevenueThisMonth = paymentRepository.sumTotalRevenueSince(startOfMonth);
        BigDecimal fineRevenueThisMonth = paymentRepository.sumRevenueByTypeSince((byte) 1, startOfMonth);
        BigDecimal membershipRevenueThisMonth = paymentRepository.sumRevenueByTypeSince((byte) 2, startOfMonth);

        return AdminDashboardResponse.builder()
                .totalUsers(totalUsers != null ? totalUsers : 0L)
                .newUsersThisMonth(newUsersThisMonth != null ? newUsersThisMonth : 0L)
                .activeLibrarians(activeLibrarians != null ? activeLibrarians : 0L)
                .activeMembers(activeMembers != null ? activeMembers : 0L)
                .blacklistedUsers(blacklistedUsers != null ? blacklistedUsers : 0)
                .totalBooks(totalBooks != null ? totalBooks : 0L)
                .totalBookCopies(totalBookCopies != null ? totalBookCopies : 0L)
                .activeBorrows(activeBorrows != null ? activeBorrows : 0)
                .overdueCount(overdueCount != null ? overdueCount : 0)
                .pendingReservations(pendingReservations != null ? pendingReservations : 0)
                .totalRevenueThisMonth(totalRevenueThisMonth != null ? totalRevenueThisMonth : BigDecimal.ZERO)
                .fineRevenueThisMonth(fineRevenueThisMonth != null ? fineRevenueThisMonth : BigDecimal.ZERO)
                .membershipRevenueThisMonth(membershipRevenueThisMonth != null ? membershipRevenueThisMonth : BigDecimal.ZERO)
                .build();
    }

    @Override
    public PageResponse<AdminPaymentReportResponse> getPaymentReport(
            Long userId,
            Byte paymentType,
            Byte paymentMethod,
            Byte status,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            String keyword,
            int page,
            int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Payment> pageResult = paymentRepository.searchPaymentForAdmin(
                userId,
                paymentType,
                paymentMethod,
                status,
                fromDate,
                toDate,
                (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null,
                pageable
        );

        List<AdminPaymentReportResponse> content = pageResult.getContent().stream()
                .map(this::mapPaymentToResponse)
                .toList();

        return new PageResponse<>(
                content,
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalElements()
        );
    }

    @Override
    public List<AdminTopBookResponse> getTopBorrowedBooks(LocalDateTime fromDate, LocalDateTime toDate, int limit) {
        Pageable pageable = PageRequest.of(0, limit <= 0 ? 10 : limit);
        List<Object[]> rows = borrowDetailRepository.findTopBorrowedBooks(fromDate, toDate, pageable);

        List<AdminTopBookResponse> result = new ArrayList<>();
        for (Object[] r : rows) {
            result.add(AdminTopBookResponse.builder()
                    .bookId((Long) r[0])
                    .title((String) r[1])
                    .isbn((String) r[2])
                    .authorName((String) r[3])
                    .categoryName((String) r[4])
                    .borrowCount((Long) r[5])
                    .build());
        }
        return result;
    }

    @Override
    public AdminMembershipReportResponse getMembershipReport() {
        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime soonDate = LocalDateTime.now().plusDays(7);

        Long totalActive = userMembershipRepository.countTotalActiveMemberships();
        Long newThisMonth = userMembershipRepository.countNewMembershipsThisMonth(startOfMonth);
        Long expiringSoon = userMembershipRepository.countExpiringSoonMemberships(soonDate);

        List<MembershipPlan> plans = membershipPlanRepository.findAll();
        List<AdminMembershipReportResponse.PlanSalesItemResponse> planItems = new ArrayList<>();

        for (MembershipPlan p : plans) {
            Long activeUsers = userMembershipRepository.countActiveUsersByPlanId(p.getPlanId());
            Long sold = paymentRepository.countSalesByPlanId(p.getPlanId());
            BigDecimal revenue = paymentRepository.sumRevenueByPlanId(p.getPlanId());

            planItems.add(AdminMembershipReportResponse.PlanSalesItemResponse.builder()
                    .planId(p.getPlanId())
                    .planName(p.getName())
                    .activeUserCount(activeUsers != null ? activeUsers : 0L)
                    .soldCount(sold != null ? sold : 0L)
                    .totalRevenue(revenue != null ? revenue : BigDecimal.ZERO)
                    .build());
        }

        return AdminMembershipReportResponse.builder()
                .totalActiveMemberships(totalActive != null ? totalActive : 0L)
                .newMembershipsThisMonth(newThisMonth != null ? newThisMonth : 0L)
                .expiringSoon(expiringSoon != null ? expiringSoon : 0L)
                .revenueByPlan(planItems)
                .build();
    }

    private AdminPaymentReportResponse mapPaymentToResponse(Payment p) {
        return AdminPaymentReportResponse.builder()
                .paymentId(p.getPaymentId())
                .userId(p.getUser() != null ? p.getUser().getUserId() : null)
                .userFullName(p.getUser() != null ? p.getUser().getFullName() : null)
                .userEmail(p.getUser() != null ? p.getUser().getEmail() : null)
                .paymentType(p.getPaymentType())
                .borrowRecordId(p.getBorrowRecord() != null ? p.getBorrowRecord().getBorrowId() : null)
                .fineId(p.getFine() != null ? p.getFine().getFineId() : null)
                .membershipPlanId(p.getMembershipPlan() != null ? p.getMembershipPlan().getPlanId() : null)
                .membershipPlanName(p.getMembershipPlan() != null ? p.getMembershipPlan().getName() : null)
                .amount(p.getAmount())
                .paymentMethod(p.getPaymentMethod())
                .txnRef(p.getTxnRef())
                .gatewayTxnNo(p.getGatewayTxnNo())
                .status(p.getStatus())
                .note(p.getNote())
                .paidAt(p.getPaidAt())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
