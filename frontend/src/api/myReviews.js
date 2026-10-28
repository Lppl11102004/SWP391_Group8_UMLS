import apiClient from './client';

export const myReviewsApi = {
  // Lấy danh sách đánh giá của chính tôi (status: 1 - ACTIVE, 0 - HIDDEN)
  getMyReviews: (status = null, page = 0, size = 10) => {
    const params = { page, size };
    if (status !== null && status !== undefined && status !== '') {
      params.status = status;
    }
    return apiClient.get('/ulms/my-reviews', { params });
  },

  // Chỉnh sửa đánh giá trong vòng 3 ngày (bookId, rating, comment)
  updateMyReview: (reviewId, data) =>
    apiClient.put(`/ulms/my-reviews/${reviewId}`, data),

  // Xoá mềm đánh giá (status = 0)
  deleteMyReview: (reviewId) =>
    apiClient.delete(`/ulms/my-reviews/${reviewId}`),
};
