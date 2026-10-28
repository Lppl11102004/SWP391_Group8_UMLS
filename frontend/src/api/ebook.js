import apiClient from './client';

export const ebookApi = {
  // Get ebook info (total pages, current page, active membership check)
  getInfo: (bookId) => apiClient.get(`/ulms/books/${bookId}/info`),

  // Stream binary PDF content
  readContent: (bookId) =>
    apiClient.get(`/ulms/books/${bookId}/read`, {
      responseType: 'blob',
    }),

  // Get reading progress
  getProgress: (bookId) => apiClient.get(`/ulms/books/${bookId}/progress`),

  // Update reading progress page
  updateProgress: (bookId, page) =>
    apiClient.put(`/ulms/books/${bookId}/progress`, null, {
      params: { page },
    }),

  // Get reading shelf ("Tiếp tục đọc E-Book")
  getReadingShelf: () => apiClient.get('/ulms/me/reading-shelf'),
};
