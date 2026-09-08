import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'react-toastify';
import type { ApiError } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  withCredentials: true,
});

let csrfPromise: Promise<any> | null = null;

export const ensureCsrfCookie = async (): Promise<void> => {
  try {
    if (!csrfPromise) {
      csrfPromise = apiClient.get('/sanctum/csrf-cookie').finally(() => {
        csrfPromise = null;
      });
    }
    await csrfPromise;
  } catch {
    // Gracefully continue for stateless token-based API
  }
};

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    const status = error.response?.status;
    const errorData = error.response?.data;

    if (status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');

      if (window.location.pathname !== '/login' && !window.location.pathname.startsWith('/login')) {
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login';
      }
    } else if (status === 403) {
      toast.error(errorData?.message || 'Access denied: You lack sufficient permissions.');
    } else if (status === 422) {
      const firstError = errorData?.errors ? Object.values(errorData.errors)[0]?.[0] : null;
      if (firstError) {
        toast.error(firstError);
      } else {
        toast.error(errorData?.message || 'Validation failed. Please verify the input fields.');
      }
    } else if (status === 429) {
      toast.warning('Too many attempts. Please wait a moment before trying again.');
    } else if (status && status >= 500) {
      toast.error('A server error occurred. Please contact system support.');
    } else if (error.message === 'Network Error') {
      toast.error('Network connection error. Is the Laravel server running on http://localhost:8000?');
    }

    return Promise.reject(error);
  }
);