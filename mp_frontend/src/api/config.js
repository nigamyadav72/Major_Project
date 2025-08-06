const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

import axios from 'axios';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Include cookies for session-based auth
});

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Only redirect to login for non-cart API calls
    if (error.response?.status === 401 && !error.config.url.includes('/cart/')) {
      // Handle unauthorized access
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;