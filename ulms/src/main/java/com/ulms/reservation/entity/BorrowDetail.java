package com.ulms.reservation.entity;

import com.ulms.book.entity.BookCopy;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "borrow_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BorrowDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "detail_id")
    private Long detailId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "borrow_id", nullable = false)
    private BorrowRecord borrowRecord;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "copy_id", nullable = false)
    private BookCopy bookCopy;

    @Column(name = "return_date")
    private LocalDateTime returnDate;

    @Column(name = "status")
    private Boolean status; // Thay đổi khi reader đến nhận sách nhưng sách hết hoặc có vấn đề

    @Column(name = "return_status")
    private Byte returnStatus;

    @Column(name = "note", length = 255)
    private String note;
}