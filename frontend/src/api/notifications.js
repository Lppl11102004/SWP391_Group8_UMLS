import apiClient from './client';

export const notificationApi = {
  // Get notifications list
  getNotifications: (params = {}) =>
    apiClient.get('/ulms/notification', { params }),

  // Mark all notifications as read
  markAllAsRead: () => apiClient.get('/ulms/notification/mark-all'),

  // Mark single notification as read
  markAsRead: (notificationId) =>
    apiClient.patch(`/ulms/notification/${notificationId}/read`),
};
