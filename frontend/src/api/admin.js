import apiClient from './client';

export const adminApi = {
  // ==========================================
  // NHÓM 1: BÁO CÁO & THỐNG KÊ (REPORTS & DASHBOARD)
  // ==========================================
  getDashboard: () => {
    return apiClient.get('/ulms/admin/dashboard');
  },

  getPaymentReport: (params) => {
    return apiClient.get('/ulms/admin/reports/payments', { params });
  },

  getTopBorrowedBooks: (params) => {
    return apiClient.get('/ulms/admin/reports/top-books', { params });
  },

  getMembershipReport: () => {
    return apiClient.get('/ulms/admin/reports/memberships');
  },

  // ==========================================
  // NHÓM 2: QUẢN LÝ NGƯỜI DÙNG (USERS)
  // ==========================================
  searchUsers: (params) => {
    return apiClient.get('/ulms/admin/users', { params });
  },

  getUserDetail: (userId) => {
    return apiClient.get(`/ulms/admin/users/${userId}`);
  },

  createLibrarian: (data) => {
    return apiClient.post('/ulms/admin/users/librarian', data);
  },

  updateUserStatus: (userId, data) => {
    return apiClient.patch(`/ulms/admin/users/${userId}/status`, data);
  },

  updateUserRole: (userId, data) => {
    return apiClient.patch(`/ulms/admin/users/${userId}/role`, data);
  },

  resetUserPassword: (userId) => {
    return apiClient.post(`/ulms/admin/users/${userId}/reset-password`);
  },

  // ==========================================
  // NHÓM 3: CẤU HÌNH HỆ THỐNG (SETTINGS)
  // ==========================================
  getAllSettings: () => {
    return apiClient.get('/ulms/admin/settings');
  },

  getSettingById: (settingId) => {
    return apiClient.get(`/ulms/admin/settings/${settingId}`);
  },

  createSetting: (data) => {
    return apiClient.post('/ulms/admin/settings', data);
  },

  updateSetting: (settingId, data) => {
    return apiClient.put(`/ulms/admin/settings/${settingId}`, data);
  },

  // ==========================================
  // NHÓM 4: GÓI HỘI VIÊN (MEMBERSHIP PLANS)
  // ==========================================
  getAllPlans: () => {
    return apiClient.get('/ulms/admin/membership-plans');
  },

  getPlanById: (planId) => {
    return apiClient.get(`/ulms/admin/membership-plans/${planId}`);
  },

  createPlan: (data) => {
    return apiClient.post('/ulms/admin/membership-plans', data);
  },

  updatePlan: (planId, data) => {
    return apiClient.put(`/ulms/admin/membership-plans/${planId}`, data);
  },

  toggleActivePlan: (planId) => {
    return apiClient.patch(`/ulms/admin/membership-plans/${planId}/toggle-active`);
  },

  // ==========================================
  // NHÓM 5: DANH MỤC DỮ LIỆU (MASTER DATA)
  // ==========================================
  // 5.1 Thể loại (Categories)
  getAllCategories: () => {
    return apiClient.get('/ulms/admin/categories');
  },

  getCategoryById: (categoryId) => {
    return apiClient.get(`/ulms/admin/categories/${categoryId}`);
  },

  createCategory: (data) => {
    return apiClient.post('/ulms/admin/categories', data);
  },

  updateCategory: (categoryId, data) => {
    return apiClient.put(`/ulms/admin/categories/${categoryId}`, data);
  },

  deleteCategory: (categoryId) => {
    return apiClient.delete(`/ulms/admin/categories/${categoryId}`);
  },

  // 5.2 Tác giả (Authors)
  searchAuthors: (params) => {
    return apiClient.get('/ulms/admin/authors', { params });
  },

  getAuthorById: (authorId) => {
    return apiClient.get(`/ulms/admin/authors/${authorId}`);
  },

  createAuthor: (data) => {
    return apiClient.post('/ulms/admin/authors', data);
  },

  updateAuthor: (authorId, data) => {
    return apiClient.put(`/ulms/admin/authors/${authorId}`, data);
  },

  deleteAuthor: (authorId) => {
    return apiClient.delete(`/ulms/admin/authors/${authorId}`);
  },

  // 5.3 Nhà xuất bản (Publishers)
  searchPublishers: (params) => {
    return apiClient.get('/ulms/admin/publishers', { params });
  },

  getPublisherById: (publisherId) => {
    return apiClient.get(`/ulms/admin/publishers/${publisherId}`);
  },

  createPublisher: (data) => {
    return apiClient.post('/ulms/admin/publishers', data);
  },

  updatePublisher: (publisherId, data) => {
    return apiClient.put(`/ulms/admin/publishers/${publisherId}`, data);
  },

  deletePublisher: (publisherId) => {
    return apiClient.delete(`/ulms/admin/publishers/${publisherId}`);
  },

  // ==========================================
  // NHÓM 6: THÔNG BÁO HÀNG LOẠT (BROADCAST)
  // ==========================================
  broadcastNotification: (data) => {
    return apiClient.post('/ulms/admin/notifications/broadcast', data);
  },

  getNotificationHistory: (params) => {
    return apiClient.get('/ulms/admin/notifications/history', { params });
  },
};

export default adminApi;
