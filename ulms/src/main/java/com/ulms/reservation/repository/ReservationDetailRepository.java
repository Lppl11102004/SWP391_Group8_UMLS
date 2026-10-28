package com.ulms.reservation.repository;

import com.ulms.reservation.entity.ReservationDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
public interface ReservationDetailRepository extends JpaRepository<ReservationDetail, Long> {
    List<ReservationDetail> findByReservation_ReservationId(Long reservationId);
}
