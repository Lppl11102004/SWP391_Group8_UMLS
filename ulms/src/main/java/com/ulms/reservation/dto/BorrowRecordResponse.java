package com.ulms.reservation.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class BorrowRecordResponse extends BorrowRecordListResponse {
    private List<BorrowDetailResponse> listBorrowDetail;
}
