import apiClient from './client';

export const librarianApi = {
  // 1. Dashboard statistics
  getDashboard: () => apiClient.get('/ulms/librarian/dashboard'),

  // 2. Reservations
  getReservations: (params = {}) =>
    apiClient.get('/ulms/librarian/reservations', { params }),

  getReservationDetail: (reservationId) =>
    apiClient.get(`/ulms/librarian/reservations/${reservationId}`),

  approveReservation: (reservationId) =>
    apiClient.put(`/ulms/librarian/reservations/${reservationId}/approve`),

  rejectReservation: (reservationId, data = {}) =>
    apiClient.put(`/ulms/librarian/reservations/${reservationId}/reject`, data),

  // 3. Borrow Records
  getBorrowRecords: (params = {}) =>
    apiClient.get('/ulms/librarian/borrow-records', { params }),

  getBorrowRecordDetail: (borrowId) =>
    apiClient.get(`/ulms/librarian/borrow-records/${borrowId}`),

  // Bàn giao sách tại quầy (status 0 -> 1)
  handoverBooks: (borrowId, data = {}) =>
    apiClient.put(`/ulms/librarian/borrow-records/${borrowId}/handover`, data),

  // Tiếp nhận trả sách & hoàn trả cọc (status 1 -> 2)
  returnBooks: (borrowId, data) =>
    apiClient.put(`/ulms/librarian/borrow-records/${borrowId}/return`, data),

  // 4. Fines
  getFines: (params = {}) =>
    apiClient.get('/ulms/librarian/fines', { params }),

  getFineDetail: (fineId) =>
    apiClient.get(`/ulms/librarian/fines/${fineId}`),

  createFine: (data) =>
    apiClient.post('/ulms/librarian/fines', data),

  payCashFine: (fineId) =>
    apiClient.post(`/ulms/librarian/fines/${fineId}/pay-cash`),

  payFine: (fineId, paymentMethod = 1) =>
    apiClient.post(`/ulms/librarian/fines/${fineId}/pay?paymentMethod=${paymentMethod}`),

  payDeposit: (borrowId, paymentMethod = 1) =>
    apiClient.post(`/ulms/librarian/borrow-records/${borrowId}/pay-deposit?paymentMethod=${paymentMethod}`),

  waiveFine: (fineId, data = {}) =>
    apiClient.put(`/ulms/librarian/fines/${fineId}/waive`, data),

  scanOverdue: () =>
    apiClient.post('/ulms/librarian/fines/scan-overdue'),

  // 5. Blacklists
  getBlacklists: (params = {}) =>
    apiClient.get('/ulms/librarian/blacklists', { params }),

  addBlacklist: (data) =>
    apiClient.post('/ulms/librarian/blacklists', data),

  unlockBlacklist: (blacklistId, data = {}) =>
    apiClient.put(`/ulms/librarian/blacklists/${blacklistId}/unlock`, data),

  // 6. Books Inventory & Copies & E-Book
  getBooks: (params = {}) =>
    apiClient.get('/ulms/librarian/books', { params }),

  getBookDetail: (bookId) =>
    apiClient.get(`/ulms/librarian/books/${bookId}`),

  createBook: (data) =>
    apiClient.post('/ulms/librarian/books', data),

  updateBook: (bookId, data) =>
    apiClient.put(`/ulms/librarian/books/${bookId}`, data),

  getBookCopies: (bookId) =>
    apiClient.get(`/ulms/librarian/books/${bookId}/copies`),

  createBookCopy: (bookId, data = {}) =>
    apiClient.post(`/ulms/librarian/books/${bookId}/copies`, data),

  updateCopyStatus: (copyId, data) =>
    apiClient.put(`/ulms/librarian/copies/${copyId}/status`, data),

  manageEBook: (bookId, data) =>
    apiClient.post(`/ulms/librarian/books/${bookId}/ebook`, data),

  getPublishers: () =>
    apiClient.get('/ulms/publishers'),

  getAuthors: (page = 0, size = 100) =>
    apiClient.get('/ulms/authors', { params: { page, size } }),

  getCategories: () =>
    apiClient.get('/ulms/categories'),
};
