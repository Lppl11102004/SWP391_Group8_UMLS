package com.ulms.util;

import com.ulms.auth.entity.User;
import com.ulms.auth.repository.UserRepository;
import com.ulms.exception.ApiException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
@Component
public class SecurityUtil {

    @Autowired
    private UserRepository userRepository;

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            // Ném ApiException để GlobalExceptionHandler bắt được và trả mã lỗi rõ ràng
            throw new ApiException("Chưa đăng nhập hoặc phiên làm việc đã hết hạn!");
        }
        // 2. Lấy email/username từ Principal
        String email;
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails) {
            email = ((UserDetails) principal).getUsername();
        } else {
            email = principal.toString();
        }
        // 3. Query DB lấy entity User
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new ApiException("Không tìm thấy người dùng");
        }
        return user;
    }

    public Long getCurrentUserId() {
        Long userId = getCurrentUser().getUserId();
        System.out.println("Real UserId log: "+userId);
        return userId;
    }
}