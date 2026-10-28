package com.ulms.reservation.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LibrarianDashboardResponse {
    private Integer pendingReservations;
    private Integer activeBorrows;
    private Integer overdueBorrows;
    private Integer unpaidFinesCount;
    private BigDecimal unpaidFineAmount;
    private Integer activeBlacklists;
    private Long totalBooks;
    private Long totalCopies;
    private Integer availableCopies;
}
