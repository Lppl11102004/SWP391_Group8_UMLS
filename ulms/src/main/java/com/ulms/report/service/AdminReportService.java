package com.ulms.report.service;

import com.ulms.report.dto.*;
import com.ulms.util.PageResponse;

import java.time.LocalDateTime;
import java.util.List;

public interface AdminReportService {
    AdminDashboardResponse getDashboard();
    PageResponse<AdminPaymentReportResponse> getPaymentReport(
            Long userId,
            Byte paymentType,
            Byte paymentMethod,
            Byte status,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            String keyword,
            int page,
            int size
    );
    List<AdminTopBookResponse> getTopBorrowedBooks(LocalDateTime fromDate, LocalDateTime toDate, int limit);
    AdminMembershipReportResponse getMembershipReport();
}
