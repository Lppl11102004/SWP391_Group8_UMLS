import apiClient from './client';

export const paymentApi = {
  // Callback verification from VNPay
  handleCallback: (params) =>
    apiClient.get('/api/payment/vnpay-callback', { params }),
};
