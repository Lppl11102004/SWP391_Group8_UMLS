package com.ulms.payment.service;

import com.ulms.payment.dto.CreateFineRequest;
import com.ulms.payment.dto.LibrarianFineResponse;
import com.ulms.payment.dto.WaiveFineRequest;
import com.ulms.util.PageResponse;

public interface LibrarianFineService {

    PageResponse<LibrarianFineResponse> getFines(Long userId, Byte status, Byte reason, String keyword, Integer page, Integer size);

    LibrarianFineResponse getFineDetail(Long fineId);

    void createFine(CreateFineRequest request);

    void payCashFine(Long fineId);

    void waiveFine(Long fineId, WaiveFineRequest request);

    void autoScanOverdueBorrowRecords();
}
