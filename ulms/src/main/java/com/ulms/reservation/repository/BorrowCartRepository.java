package com.ulms.reservation.repository;

import com.ulms.reservation.entity.BorrowCart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BorrowCartRepository extends JpaRepository<BorrowCart, Long> {
    Boolean existsByBook_BookIdAndUser_UserId(Long bookId, Long userId);
    List<BorrowCart> findByUser_UserId(Long userId);
    BorrowCart findByCartIdAndUser_UserId(Long cartId, Long userId);
    void deleteByUser_UserIdAndBook_BookIdIn(Long userId, List<Long> bookId);
}
