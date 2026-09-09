import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'react-toastify';
import type { ApiError } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
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
    const url = error.config?.url || '';

    // Ignore polling / background / public endpoints from intrusive error toasts
    const isBackgroundPoll =
      url.includes('/notifications') ||
      url.includes('/live-ticker') ||
      url.includes('/notices') ||
      url.includes('/system/status') ||
      url.includes('/form-schemas/default');

    if (status === 401) {
      // ONLY trigger session expiry redirect if the primary user profile/auth endpoint fails
      const isCoreAuthEndpoint = url.includes('/api/v1/user') || url.includes('/api/v1/profile');
      
      if (isCoreAuthEndpoint) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');

        if (window.location.pathname !== '/login' && !window.location.pathname.startsWith('/login')) {
          toast.error('Session expired. Please log in again.');
          window.location.href = '/login';
        }
      }
    } else if (status === 403) {
      if (!isBackgroundPoll) {
        toast.warning(errorData?.message || 'Access restricted: You lack permission for this feature.');
      }
    } else if (status === 422) {
      const firstError = errorData?.errors ? Object.values(errorData.errors)[0]?.[0] : null;
      if (firstError) {
        toast.error(firstError);
      } else {
        toast.error(errorData?.message || 'Validation failed. Please verify the input fields.');
      }
    } else if (status === 429) {
      toast.warning('Too many attempts. Please wait a moment before trying again.');
    }

    if (!isBackgroundPoll) {
      if (status && status >= 500) {
        // Prevent repeated 500 toast storms
        toast.error(errorData?.message || 'A server error occurred. Please contact system support.', {
          toastId: 'server-error-single',
        });
      } else if (error.message === 'Network Error') {
        toast.error('Network connection error. Please check your internet connection.', {
          toastId: 'network-error-single',
        });
      }
    }

    return Promise.reject(error);
  }
);