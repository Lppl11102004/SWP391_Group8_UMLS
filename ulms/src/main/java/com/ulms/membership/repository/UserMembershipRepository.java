package com.ulms.membership.repository;

import com.ulms.membership.entity.UserMembership;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface UserMembershipRepository extends JpaRepository<UserMembership, Long> {
    UserMembership findByUser_UserId(Long userId);

    @Query("SELECT COUNT(um) FROM UserMembership um WHERE um.membershipPlan.planId = :planId AND um.endDate > CURRENT_TIMESTAMP")
    Long countActiveUsersByPlanId(@Param("planId") Short planId);

    @Query("SELECT COUNT(um) FROM UserMembership um WHERE um.endDate > CURRENT_TIMESTAMP")
    Long countTotalActiveMemberships();

    @Query("SELECT COUNT(um) FROM UserMembership um WHERE um.startDate >= :startOfMonth")
    Long countNewMembershipsThisMonth(@Param("startOfMonth") LocalDateTime startOfMonth);

    @Query("SELECT COUNT(um) FROM UserMembership um WHERE um.endDate > CURRENT_TIMESTAMP AND um.endDate <= :soonDate")
    Long countExpiringSoonMemberships(@Param("soonDate") LocalDateTime soonDate);

    java.util.List<UserMembership> findByEndDateLessThanAndStatus(LocalDateTime now, Byte status);
}
