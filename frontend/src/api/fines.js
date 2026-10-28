import apiClient from './client';

export const finesApi = {
  // Lấy danh sách tiền phạt cá nhân (status: 0: UNPAID, 1: PAID, 2: WAIVED)
  getMyFines: (status = null, page = 0, size = 10) => {
    const params = { page, size };
    if (status !== null && status !== undefined && status !== '') {
      params.status = status;
    }
    return apiClient.get('/ulms/my-fines', { params });
  },

  // Xem chi tiết một khoản phạt
  getFineDetail: (fineId) => apiClient.get(`/ulms/my-fines/${fineId}`),

  // Thanh toán nợ phạt (paymentMethod: 1 - Tiền mặt tại quầy, 2 - VNPay trực tuyến)
  payFine: (fineId, paymentMethod = 2) =>
    apiClient.post(`/ulms/my-fines/${fineId}`, null, {
      params: { paymentMethod },
    }),
};
