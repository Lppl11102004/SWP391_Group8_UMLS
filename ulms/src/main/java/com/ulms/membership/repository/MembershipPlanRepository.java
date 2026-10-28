package com.ulms.membership.repository;

import com.ulms.membership.entity.MembershipPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MembershipPlanRepository extends JpaRepository<MembershipPlan, Short> {
    List<MembershipPlan> findByIsActive(Boolean isActive);
    boolean existsByName(String name);
    boolean existsByNameAndPlanIdNot(String name, Short planId);
}
