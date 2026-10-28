import apiClient from './client';

export const userApi = {
  // Get user profile
  getProfile: () => apiClient.get('/ulms/me'),

  // Update profile
  updateProfile: (data) => apiClient.put('/ulms/me', data),

  // Change password
  changePassword: (data) => apiClient.post('/ulms/me', data),

  // Upload avatar (Multipart form-data)
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'ulms');
    return apiClient.post('/ulms/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get blacklist status of current logged in user
  getMyBlacklist: () => apiClient.get('/ulms/my-blacklist'),
};
