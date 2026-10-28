import apiClient from './client';

export const cartAndReservationApi = {
  // Add book to borrow cart
  addToCart: (userId, bookId) =>
    apiClient.post('/ulms/add-to-cart', { userId, bookId }),

  // View borrow cart
  getCart: () => apiClient.get('/ulms/add-to-cart'),

  // Delete item from cart by cartId
  deleteCartItem: (cartId) => apiClient.delete(`/ulms/add-to-cart/${cartId}`),

  // Create reservation ticket
  createReservation: (data) => apiClient.post('/ulms/reservation', data),

  // Get my reservation tickets list
  getReservations: (status = null, page = 0, size = 10) => {
    const params = { page, size };
    if (status !== null && status !== undefined && status !== '') {
      params.status = status;
    }
    return apiClient.get('/ulms/reservation', { params });
  },

  // Get reservation ticket detail
  getReservationDetail: (id) => apiClient.get(`/ulms/reservation/${id}`),

  // Cancel reservation ticket
  cancelReservation: (id) => apiClient.put(`/ulms/reservation/${id}`),
};
