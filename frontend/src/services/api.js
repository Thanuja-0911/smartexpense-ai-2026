import axios from 'axios';

// Use Vite proxy '/api' by default so requests are same-origin (no CORS or network errors)
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 15000,
});

// Request Interceptor: Attach JWT Token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smartexpense_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle errors cleanly
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let message = 'Something went wrong. Please check your internet connection.';

    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message === 'Network Error') {
      message = 'Unable to connect to SmartExpense-AI backend server. Please verify backend is running on port 5003.';
    } else if (error.message) {
      message = error.message;
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('smartexpense_token');
      localStorage.removeItem('smartexpense_user');
      if (
        !window.location.pathname.startsWith('/login') &&
        !window.location.pathname.startsWith('/register') &&
        !window.location.pathname.startsWith('/forgot-password') &&
        !window.location.pathname.startsWith('/reset-password')
      ) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
