package com.ulms.payment.service;

import com.ulms.payment.dto.FineResponse;
import com.ulms.util.PageResponse;
import jakarta.servlet.http.HttpServletRequest;

public interface FineService {
   PageResponse<FineResponse> getListFine(Byte status, Integer page, Integer size);
   FineResponse getFineDetail(Long fineId);

    String purchaseFine (Byte paymentMethod, Long fineId,  HttpServletRequest request);
}
