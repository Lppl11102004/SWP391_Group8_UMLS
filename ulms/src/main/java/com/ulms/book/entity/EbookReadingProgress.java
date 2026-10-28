package com.ulms.book.entity;

import com.ulms.auth.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "ebook_reading_progress",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "UQ_User_EBook",
                        columnNames = {"user_id", "ebook_id"}
                )
        }
)
@Getter
@Setter
public class EbookReadingProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "progress_id")
    private Long progressId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ebook_id", nullable = false)
    private EBook ebook;

    @Column(name = "current_page", nullable = false)
    private Integer currentPage;

    @Column(name = "last_read_at", nullable = false, insertable = false)
    private LocalDateTime lastReadAt;
}
