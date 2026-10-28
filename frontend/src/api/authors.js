import apiClient from './client';

export const authorApi = {
  // Get list of authors with pagination
  getAuthors: (page = 0, size = 10) =>
    apiClient.get('/ulms/authors', { params: { page, size } }),

  // Get author detail and their books
  getAuthorDetail: (authorId) => apiClient.get(`/ulms/authors/${authorId}`),
};
