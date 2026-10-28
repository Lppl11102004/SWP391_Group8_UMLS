package com.ulms.auth.service;

import com.ulms.auth.dto.*;

public interface  AuthService {
    void register(RegisterRequest registerRequest);
    void resendEmailVerification(EmailVerifyRequest request);
    void verifyEmail(EmailVerifyRequest request);
    void resetPassword(ForgotPasswordRequest request);
    LoginResponse login(LoginRequest request);
    LoginResponse loginWithGoogle(GoogleLoginRequest request);
}
