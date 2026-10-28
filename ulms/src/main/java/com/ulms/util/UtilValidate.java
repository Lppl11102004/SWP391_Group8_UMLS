package com.ulms.util;

import com.ulms.auth.entity.User;
import com.ulms.auth.repository.UserRepository;
import com.ulms.exception.ApiException;
import com.ulms.membership.entity.UserMembership;
import com.ulms.membership.repository.UserMembershipRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UtilValidate {

    private final SecurityUtil securityUtil;
    private final UserRepository userRepository;
    private final UserMembershipRepository userMembershipRepository;

    public boolean validateFullName(String fullName) {
        //Nếu tên trống thì out
        if (fullName == null) {
            return false;
        }
        //Kiểm tra xem có chưa các kí đặc biệt hay không
        return fullName.matches("^[a-zA-ZÀ-ỹĐđ\\s'-]{2,100}$");
    }

    public boolean validatePhoneNumber(String phone){
        if (phone == null){
            return false;
        }
        String[] spaceChar = phone.trim().split(" ");
        if(spaceChar.length > 1){
            return false;
        }
        return phone.trim().matches("^0[0-9]{9}$");
    }

    public boolean validateEmail(String email){
        if (email == null){
            return false;
        }
        String[] spaceChar = email.trim().split(" ");
        if(spaceChar.length > 1){
            return false;
        }
        return email.trim().matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$");
    }

    public boolean validatePassword(String password){
        if (password == null){
            return false;
        }
        String[] spaceChar = password.trim().split(" ");
        if(spaceChar.length > 1){
            return false;
        }
        //password >8 kí tự, có hoa, thường, số, kí tự đặc biệt
        return password.trim().matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$");
    }

    public User checkCurrentUser(Long request){
        Long userId = securityUtil.getCurrentUserId();
        if (request != null && !java.util.Objects.equals(userId, request)){
            throw new ApiException("Vui lòng đăng nhập để sử dụng tính năng");
        }
        User user = userRepository.findById(request).orElse(null);
        if (user == null){
            throw new ApiException("Vui lòng đăng nhập để sử dụng tính năng");
        }
        return user;
    }

    public void validateMembership(User user) {
        UserMembership membership = userMembershipRepository.findByUser_UserId(user.getUserId());
        if (membership == null || membership.getStatus() != 1 || membership.getEndDate().isBefore(LocalDateTime.now())) {
            throw new ApiException("Tính năng đọc E-Book chỉ dành riêng cho độc giả có gói Membership còn hạn. Vui lòng đăng ký gói!");
        }
    }

    private final List<String> badWords = new ArrayList<>(List.of(
            // Từ chửi tục phổ biến
            "địt", "đụ", "đéo", "đĩ", "đĩ mẹ",
            "địt mẹ", "đụ mẹ", "đụ má", "địt cha",
            "con mẹ mày", "mẹ mày", "bố mày",
            "cặc", "lồn", "buồi", "dái",
            "đụ má mày", "địt con mẹ", "địt cụ",
            "vãi lồn", "vãi cứt", "vãi đái",
            "đéo hiểu", "đéo chịu", "đéo thích",

            // Từ xúc phạm, chửi người khác
            "chó chết", "đồ chó", "thằng chó", "con chó",
            "đồ khốn", "thằng khốn", "con khốn",
            "khốn nạn", "mất dạy", "vô học",
            "ngu si", "ngu như chó", "thằng ngu",
            "con ngu", "đần độn", "súc vật",
            "súc sinh", "đồ rác rưởi", "đồ mất nết",

            // Từ viết không dấu
            "dit", "du", "deo", "di me",
            "dit me", "du ma", "dit cha",
            "con me may", "me may", "bo may",
            "cac", "lon", "buoi", "vai lon",
            "cho chet", "do cho", "thang cho",
            "khon nan", "mat day", "vo hoc",
            "ngu nhu cho", "suc vat", "suc sinh"
    ));

    public Boolean checkBadWord(String request) {
        if (request == null || request.isBlank()) {
            return true;
        }

        String content = request.toLowerCase().trim();

        for (String badWord : badWords) {
            if (content.contains(badWord)) {
                throw new ApiException(
                        "Phần đánh giá của bạn không phù hợp với tiêu chuẩn cộng đồng"
                );
            }
        }

        return true;
    }
}
