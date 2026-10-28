import axios from 'axios';

// Create Axios client with base URL pointing to current origin (handled by Vite proxy in dev)
// Or environment variable VITE_API_BASE_URL if configured
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors gracefully
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, clear token if expired and redirect to login if on protected route
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath.startsWith('/login') || currentPath.startsWith('/register') || currentPath.startsWith('/verify-email');
      if (!isAuthPage && localStorage.getItem('accessToken')) {
        console.warn('Session expired or unauthorized. Logging out.');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('authChange'));
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
