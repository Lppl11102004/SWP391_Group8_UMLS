import apiClient from './client';

export const authApi = {
  // Register reader account
  register: (data) => apiClient.post('/ulms/auth/register', data),

  // Resend OTP for verify (tokenType = false) or password reset (tokenType = true)
  resendOtp: (data) => apiClient.post('/ulms/auth/resend-OTP-verify', data),

  // Verify email with OTP
  verifyEmail: (data) => apiClient.post('/ulms/auth/verify-email', data),

  // Reset password
  resetPassword: (data) => apiClient.post('/ulms/auth/reset-password', data),

  // Local login
  login: (data) => apiClient.post('/ulms/auth/login', data),

  // Google OAuth login
  googleLogin: (idToken) => apiClient.post('/ulms/auth/google', { idToken }),

  // Logout
  logout: () => apiClient.post('/ulms/auth/logout'),
};
