package com.ulms.membership.repository;

import com.ulms.membership.entity.Setting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SettingRepository extends JpaRepository<Setting, Integer> {
    Setting findBySettingKey(String settingKey);
    boolean existsBySettingKey(String settingKey);
}
