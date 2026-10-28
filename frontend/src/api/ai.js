import apiClient from './client';

export const aiApi = {
  // Send chat message to AI assistant
  // payload: { message: string, currentBookId?: number, history?: Array<{role: string, text: string}> }
  chat: (payload) => apiClient.post('/ulms/ai/chat', payload),

  // Get AI summary for a specific book
  getBookSummary: (bookId) => apiClient.get(`/ulms/ai/summary/${bookId}`),
};

export default aiApi;
