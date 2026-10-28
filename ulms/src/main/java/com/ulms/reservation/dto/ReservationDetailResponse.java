package com.ulms.reservation.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReservationDetailResponse extends ReservationListResponse {
    private LocalDateTime approvedAt;
    private LocalDateTime expiresAt;
    private LocalDateTime updatedAt;

    // Danh sách sách chi tiết nằm trong đơn
    private List<ReservationBookDetail> listBook;

    // Thông tin phiếu mượn tương ứng (khi ticket đã được duyệt)
    private Long borrowRecordId;
    private Byte borrowStatus;
    private Byte depositStatus;
    private java.math.BigDecimal depositAmount;
    private LocalDateTime borrowDate;
    private LocalDateTime dueDate;
    private List<BorrowDetailResponse> listBorrowDetail;
    private BorrowRecordResponse borrowRecord;
}