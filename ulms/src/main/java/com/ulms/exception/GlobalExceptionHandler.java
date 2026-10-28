package com.ulms.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiResponse<Void>> handleApiException(ApiException exception) {
        // Nếu là lỗi chưa đăng nhập thì trả về 401 UNAUTHORIZED
        if ("Chưa đăng nhập hoặc phiên làm việc đã hết hạn!".equals(exception.getMessage())) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, exception.getMessage(), null));
        }
        ApiResponse<Void> response = new ApiResponse<>(
                false,
                exception.getMessage(),
                null
        );
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneralException(Exception exception) {
        ApiResponse<Void> response = new ApiResponse<>(
                false,
                "Đã xảy ra lỗi hệ thống: " + exception.getMessage(),
                null
        );
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(response);
    }
}
