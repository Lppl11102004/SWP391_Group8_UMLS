package com.ulms.reservation.service;

import com.ulms.reservation.dto.BorrowCartRequest;
import com.ulms.reservation.dto.BorrowCartResponse;
import com.ulms.reservation.dto.BorrowRecordListResponse;
import com.ulms.reservation.dto.BorrowRecordResponse;
import com.ulms.util.PageResponse;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;

public interface BorrowService {
    void createBorrowCart(BorrowCartRequest request);
    List<BorrowCartResponse> viewListBorrowCart();
    void deleteBorrowCart(Long cartId);
    PageResponse<BorrowRecordListResponse> getListBorrowRecord(Byte status, Integer page, Integer size);
    BorrowRecordResponse getBorrowRecordDetail(Long borrowRecordId);
    void extendBorrowRecord(Long borrowId);
    String purchaseDepositRecord(Byte paymentMethod, Long borrowId,  HttpServletRequest request);
}
