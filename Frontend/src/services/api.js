// frontend/src/services/api.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 80000,
});

// REMOVE the Stripe key interceptor - DO NOT send Stripe keys from frontend

// Request interceptor to add auth token (Keep this one)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('shop-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh-token`, {
            refreshToken,
          });
          
          if (response.data.success && response.data.data) {
            localStorage.setItem('shop-token', response.data.data.token);
            localStorage.setItem('refreshToken', response.data.data.refreshToken);
            originalRequest.headers.Authorization = `Bearer ${response.data.data.token}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          localStorage.removeItem('shop-token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('shop-user');
          window.location.href = '/login';
        }
      } else {
        console.log('No refresh token available');
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;