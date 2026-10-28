import apiClient from './client';

export const borrowRecordApi = {
  // Lấy danh sách phiếu mượn trả
  getBorrowRecords: (status = null, page = 0, size = 10) => {
    const params = { page, size };
    if (status !== null && status !== undefined && status !== '') {
      params.status = status;
    }
    return apiClient.get('/ulms/borrow-record', { params });
  },

  // Chi tiết phiếu mượn
  getBorrowRecordDetail: (borrowRecordId) =>
    apiClient.get(`/ulms/borrow-record/${borrowRecordId}`),

  // Tự gia hạn mượn sách trực tuyến (+7 ngày)
  extendBorrowRecord: (borrowRecordId) =>
    apiClient.put(`/ulms/borrow-record/${borrowRecordId}/extend`),

  // Thanh toán tiền đặt cọc phiếu mượn (1: Cash, 2: VNPay)
  payDeposit: (borrowId, paymentMethod = 2) =>
    apiClient.post(`/ulms/borrow-record/${borrowId}`, null, {
      params: { paymentMethod },
    }),

  // Lấy danh sách sách có thể đánh giá sau khi trả
  getBooksToReview: (borrowRecordId) =>
    apiClient.get(`/ulms/borrow-record/${borrowRecordId}/review`),

  // Gửi đánh giá cho sách trong phiếu mượn
  submitReview: (borrowRecordId, reviews) =>
    apiClient.post(`/ulms/borrow-record/${borrowRecordId}/review`, reviews),
};
