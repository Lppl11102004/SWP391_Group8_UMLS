package com.ulms.auth.controller;

import com.ulms.auth.dto.*;
import com.ulms.auth.service.UserService;
import com.ulms.book.dto.MyReviewResponse;
import com.ulms.book.dto.ReviewRequest;
import com.ulms.book.service.ReviewService;
import com.ulms.exception.ApiResponse;
import com.ulms.util.CloudinaryService;
import com.ulms.util.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/ulms")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final CloudinaryService cloudinaryService;
    private final ReviewService reviewService;

    //===========================
    // VIEW PROFILE
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> viewProfile() {
        UserProfileResponse result = userService.getUserProfile();
        return ResponseEntity.ok(result);
    }

    //===========================
    // UPDATE PROFILE
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(
            @RequestBody UserProfileUpdateRequest request
    ) {
        UserProfileResponse result = userService.updateUserProfile(request);
        ApiResponse<UserProfileResponse> response = new ApiResponse<>(
                true,
                "Cập nhật thông tin cá nhân thành công thành công thành công",
                result
        );
        return ResponseEntity.ok(response);
    }

    //===========================
    // UPDATE PASSWORD
    @PostMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updatePassword(
            @RequestBody UserPasswordUpdateRequest request
    ) {
        UserProfileResponse result = userService.updateUserPassword(request);

        ApiResponse<UserProfileResponse> response = new ApiResponse<>(
                true,
                "Cập nhật mật khẩu thành công thành công",
                result
        );
        return ResponseEntity.ok(response);
    }

    //===========================
    // UPDATE AVATAR
    @PostMapping("/me/avatar")
    public ResponseEntity<ApiResponse<UserProfileResponse>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "ulms") String folder) {

        String secureUrl = cloudinaryService.uploadFile(file, folder);
        UserProfileResponse result = userService.updateUserAvatar(secureUrl);
        ApiResponse<UserProfileResponse> response = new ApiResponse<>(
                true,
                "Cập nhật avatar thành công thành công",
                result
        );
        return ResponseEntity.ok(response);
    }

    //===========================
    // GET MY REVIEW
    @GetMapping("/my-reviews")
    public ResponseEntity<ApiResponse<PageResponse<MyReviewResponse>>> getMyReview(
            @RequestParam(name = "status", required = false) Byte status,
            @RequestParam(name = "page", defaultValue = "0") Integer page,
            @RequestParam(name = "size", defaultValue = "10") Integer size
    ) {
        PageResponse<MyReviewResponse> results = reviewService.getMyReview(status, page, size);
        ApiResponse<PageResponse<MyReviewResponse>> response = new ApiResponse<>(
                true,
                results.getContent().isEmpty() ? "Bạn chưa có đánh giá nào" : "Tải danh sách đánh giá thành công",
                results
        );
        return ResponseEntity.ok(response);
    }

    //============================
    // UPDATE REVIEW IN 3 DAY
    @PutMapping("/my-reviews/{id}")
    public ResponseEntity<ApiResponse<Void>> updateReview(
            @PathVariable("id") Long reviewId,
            @RequestBody ReviewRequest request
    ) {
        reviewService.updateMyReview(reviewId, request);
        ApiResponse<Void> response = new ApiResponse<>(
                true,
                "Cập nhật đánh giá thành công",
                null
        );
        return ResponseEntity.ok(response);
    }

    //============================
    // DELETE REVIEW
    @DeleteMapping("/my-reviews/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            @PathVariable("id") Long reviewId
    ) {
        reviewService.deleteMyReview(reviewId);
        ApiResponse<Void> response = new ApiResponse<>(
                true,
                "Xoá đánh giá thành công",
                null
        );
        return ResponseEntity.ok(response);
    }

    //============================
    // VIEW MY BLACKLIST STATUS
    @GetMapping("/my-blacklist")
    public ResponseEntity<ApiResponse<BlacklistStatusResponse>> getMyBlacklist() {
        BlacklistStatusResponse result = userService.getMyBlacklistStatus();
        ApiResponse<BlacklistStatusResponse> response = new ApiResponse<>(
                true,
                "Tra cứu trạng thái danh sách hạn chế thành công",
                result
        );
        return ResponseEntity.ok(response);
    }
}



















