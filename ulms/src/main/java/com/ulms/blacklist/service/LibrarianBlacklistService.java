package com.ulms.blacklist.service;

import com.ulms.blacklist.dto.CreateBlacklistRequest;
import com.ulms.blacklist.dto.LibrarianBlacklistResponse;
import com.ulms.blacklist.dto.UnlockBlacklistRequest;
import com.ulms.util.PageResponse;

public interface LibrarianBlacklistService {

    PageResponse<LibrarianBlacklistResponse> getBlacklists(Boolean isActive, String keyword, Integer page, Integer size);

    void addBlacklist(CreateBlacklistRequest request);

    void unlockBlacklist(Long blacklistId, UnlockBlacklistRequest request);
}
