import axios from 'axios';
import { supabase } from './supabase';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach Supabase JWT access token automatically
api.interceptors.request.use(
  async (config) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    } catch (err) {
      console.error('Error retrieving Supabase session for API call:', err);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for uniform error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.details?.[0]?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

// ====================================================================
// Borrowings API Methods
// ====================================================================

export const getBorrowings = async (params = {}) => {
  const response = await api.get('/borrowings', { params });
  return response.data;
};

export const getBorrowingById = async (id) => {
  const response = await api.get(`/borrowings/${id}`);
  return response.data;
};

export const createBorrowing = async (borrowingData) => {
  const response = await api.post('/borrowings', borrowingData);
  return response.data;
};

export const updateBorrowing = async (id, borrowingData) => {
  const response = await api.put(`/borrowings/${id}`, borrowingData);
  return response.data;
};

export const markAsReturned = async (id) => {
  const response = await api.put(`/borrowings/${id}/return`);
  return response.data;
};

export const deleteBorrowing = async (id) => {
  const response = await api.delete(`/borrowings/${id}`);
  return response.data;
};

// ====================================================================
// Dashboard API Methods
// ====================================================================

export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

export default api;
