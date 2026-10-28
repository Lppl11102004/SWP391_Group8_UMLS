package com.ulms.membership.service;

import com.ulms.membership.dto.RulesResponse;
import com.ulms.membership.entity.Setting;
import com.ulms.membership.repository.SettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor

public class SettingServiceImpl implements SettingService{

    private final SettingRepository settingRepository;

    @Override
    public List<RulesResponse> getListRule() {
        List<Setting> setting = settingRepository.findAll();
        List<RulesResponse>  listRule = new ArrayList<>();
        for (Setting s : setting){
            RulesResponse rule = new RulesResponse();
            rule.setSettingValue(s.getSettingValue());
            rule.setDataType(s.getDataType());
            rule.setDescription(s.getDescription());

            listRule.add(rule);
        }
        return listRule;
    }

    @Override
    public RulesResponse getRuleBorrow() {
        RulesResponse result = new RulesResponse();
        Setting setting = settingRepository.findById(5).orElse(null);
        if (setting == null) {
            result.setSettingValue("5");
            return result;
        } else {
            result.setSettingValue(setting.getSettingValue());
            result.setDataType(setting.getDataType());
            result.setDescription(setting.getDescription());
        }
        return result;
    }
}
