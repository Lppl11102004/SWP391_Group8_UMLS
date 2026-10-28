package com.ulms.payment.service;

import com.ulms.auth.entity.User;
import com.ulms.book.entity.Book;
import com.ulms.book.entity.BookCopy;
import com.ulms.book.repository.BookCopyRepository;
import com.ulms.book.repository.BookRepository;
import com.ulms.exception.ApiException;
import com.ulms.payment.dto.FineResponse;
import com.ulms.payment.entity.Fine;
import com.ulms.payment.repository.FineRepository;
import com.ulms.util.PageResponse;
import com.ulms.util.SecurityUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FineServiceImpl implements FineService {

    private final SecurityUtil securityUtil;
    private final FineRepository fineRepository;
    private final BookRepository bookRepository;
    private final BookCopyRepository bookCopyRepository;
    private final PaymentService paymentService;

    @Override
    public PageResponse<FineResponse> getListFine(Byte status, Integer page, Integer size) {

        User user = securityUtil.getCurrentUser();
        Page<Fine> fines = searchPageableFine(user.getUserId(), status, page, size);
        List<FineResponse> list = standardListFineResponse(fines);

        return new PageResponse<>(
                list,
                fines.getNumber(),
                fines.getSize(),
                fines.getTotalElements()
        );
    }


    public Page<Fine> searchPageableFine(Long userId, Byte status, Integer page, Integer size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<Fine> fines = fineRepository.searchFine(
                userId,
                status,
                pageable
        );
        return fines;
    }

    public List<FineResponse> standardListFineResponse(Page<Fine> request) {
        List<FineResponse> list = new ArrayList<>();

        for (Fine f : request.getContent()) {
            FineResponse response = new FineResponse();

            response.setFineId(f.getFineId());
            response.setBorrowRecordId(f.getBorrowRecord().getBorrowId());

            BookCopy bookCopy = f.getBookCopy();
            if (bookCopy != null) {
                response.setBookCopyId(bookCopy.getCopyId());
                Book book = bookRepository.findById(bookCopy.getBookId()).orElse(null);
                if (book != null) {
                    response.setBookTitles(book.getTitle());
                }
            } else {
                response.setBookCopyId(null);
                response.setBookTitles(null);
            }

            response.setUserName(f.getUser().getFullName());
            response.setUserId(f.getUser().getUserId());
            response.setAmount(f.getAmount());
            response.setReason(f.getReason());
            response.setStatus(f.getStatus());
            response.setNote(f.getNote());
            response.setCreatedAt(f.getCreatedAt());
            response.setUpdatedAt(f.getUpdatedAt());

            list.add(response);
        }
        return list;
    }

    @Override
    public FineResponse getFineDetail(Long fineId) {
        User user = securityUtil.getCurrentUser();

        Fine fine = fineRepository.findById(fineId).orElse(null);
        if (fine == null || !user.getUserId().equals(fine.getUser().getUserId())) {
            throw new ApiException("Khoản nợ không khả dụng");
        }

        FineResponse fineResponse = new FineResponse();
        fineResponse.setFineId(fine.getFineId());
        fineResponse.setBorrowRecordId(fine.getBorrowRecord().getBorrowId());

        BookCopy bookCopy = fine.getBookCopy();
        if (bookCopy != null) {
            fineResponse.setBookCopyId(bookCopy.getCopyId());
            Book book = bookRepository.findById(bookCopy.getBookId()).orElse(null);
            if (book != null) {
                fineResponse.setBookTitles(book.getTitle());
            }
        } else {
            fineResponse.setBookCopyId(null);
            fineResponse.setBookTitles(null);
        }

        fineResponse.setUserName(fine.getUser().getFullName());
        fineResponse.setUserId(fine.getUser().getUserId());
        fineResponse.setAmount(fine.getAmount());
        fineResponse.setReason(fine.getReason());
        fineResponse.setStatus(fine.getStatus());
        fineResponse.setNote(fine.getNote());
        fineResponse.setCreatedAt(fine.getCreatedAt());
        fineResponse.setUpdatedAt(fine.getUpdatedAt());

        return fineResponse;
    }

    @Override
    public String purchaseFine(Byte paymentMethod, Long fineId, HttpServletRequest request) {

        User currentUser = securityUtil.getCurrentUser();
        Fine fine = fineRepository.findById(fineId).orElse(null);

        if (fine == null || currentUser == null) {
            throw new ApiException("Khoản nợ không xác định");
        }

        boolean isOwner = fine.getUser() != null && fine.getUser().getUserId().equals(currentUser.getUserId());
        boolean isStaff = currentUser.getRole() != null && (currentUser.getRole().getRoleId() == 2 || currentUser.getRole().getRoleId() == 3);

        if (!isOwner && !isStaff) {
            throw new ApiException("Khoản nợ không xác định hoặc bạn không có quyền thanh toán khoản phạt này");
        }

        // Chống thanh toán lại khoản đã trả
        if (fine.getStatus() == 1) {
            throw new ApiException("Khoản phạt này đã được thanh toán thành công trước đó");
        }

        // Khoản phạt đã được miễn giảm
        if (fine.getStatus() == 2) {
            throw new ApiException("Khoản phạt này đã được thủ thư miễn giảm, không cần thanh toán");
        }

        BigDecimal finalPrice = fine.getAmount();
        User targetUser = fine.getUser();

        // HÌNH THỨC 1: CASH TẠI QUẦY
        if (paymentMethod == 1) {
            paymentService.solveFine(targetUser, fine, finalPrice, paymentMethod, "CASH_" + LocalDateTime.now());
            return "Thanh toán khoản nợ bằng tiền mặt thành công";
        }

        // HÌNH THỨC 2: THANH TOÁN ONLINE VNPAY
        if (paymentMethod == 2) {
            return paymentService.initPayment(targetUser, (byte) 1, finalPrice, "Thanh toan khoan no " + finalPrice, null, fineId, null, null, request);
        }

        throw new ApiException("Phương thức thanh toán không được hỗ trợ");
    }

}
