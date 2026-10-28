import apiClient from './client';

export const myPaymentsApi = {
  // Xem lịch sử giao dịch & biên lai tài chính cá nhân
  // paymentType: 1 (FINE), 2 (MEMBERSHIP), 3 (DEPOSIT), 4 (DEPOSIT_REFUND)
  // paymentMethod: 1 (CASH), 2 (VNPAY)
  // status: 0 (PENDING), 1 (SUCCESS), 2 (FAILED)
  getPaymentHistory: (params = {}) =>
    apiClient.get('/ulms/my-payments', { params }),

  // Đồng bộ trạng thái giao dịch với VNPay Sandbox (QueryDR)
  syncPayment: (txnRef) =>
    apiClient.post(`/api/payment/sync/${txnRef}`),
};
