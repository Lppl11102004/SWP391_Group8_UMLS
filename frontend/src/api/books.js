import apiClient from './client';

export const bookApi = {
  // Get home books list
  getHomeBooks: () => apiClient.get('/ulms'),

  // Search & filter books
  searchBooks: (params) => apiClient.get('/ulms/search', { params }),

  // Book detail
  getBookDetail: (bookId) => apiClient.get(`/ulms/books/${bookId}`),

  // Book reviews
  getBookReviews: (bookId, page = 0, size = 10) =>
    apiClient.get(`/ulms/books/${bookId}/reviews`, { params: { page, size } }),

  // Get categories
  getCategories: () => apiClient.get('/ulms/categories'),

  // Get publishers
  getPublishers: () => apiClient.get('/ulms/publishers'),
};
