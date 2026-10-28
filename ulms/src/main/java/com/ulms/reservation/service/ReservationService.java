package com.ulms.reservation.service;

import com.ulms.reservation.dto.ReservationDetailResponse;
import com.ulms.reservation.dto.ReservationListResponse;
import com.ulms.reservation.dto.ReservationRequest;
import com.ulms.util.PageResponse;

public interface ReservationService {
    void createReservation(ReservationRequest request);
    PageResponse<ReservationListResponse> getListReservations(Byte status, Integer page, Integer size);
    ReservationDetailResponse getReservationDetail(Long reservationId);
    void cancelReservation(Long reservationId);
    void autoCancelReservationExpired();
}
