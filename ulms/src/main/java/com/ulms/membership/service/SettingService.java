package com.ulms.membership.service;

import com.ulms.membership.dto.RulesResponse;

import java.util.List;

public interface SettingService {
    List<RulesResponse> getListRule();
    RulesResponse getRuleBorrow();
}
