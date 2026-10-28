package com.ulms.reservation.service;

import com.ulms.reservation.dto.*;
import com.ulms.util.PageResponse;

public interface LibrarianReservationService {

    PageResponse<LibrarianReservationListResponse> getReservations(Byte status, String keyword, Integer page, Integer size);

    LibrarianReservationDetailResponse getReservationDetail(Long reservationId);

    void approveReservation(Long reservationId);

    void rejectReservation(Long reservationId, RejectReservationRequest request);

    void handoverBooks(Long borrowId, HandoverRequest request);

    PageResponse<BorrowRecordListResponse> getBorrowRecords(Byte status, Byte depositStatus, String keyword, Integer page, Integer size);

    BorrowRecordResponse getBorrowRecordDetail(Long borrowId);

    void returnBooks(Long borrowId, ReturnBookRequest request);

    LibrarianDashboardResponse getDashboardStatistics();

    String payDeposit(Long borrowId, Byte paymentMethod, jakarta.servlet.http.HttpServletRequest request);
}
