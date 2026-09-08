import { apiClient, ensureCsrfCookie } from './client';
import type { ApiResponse } from '../types/api';
import type { User, LoginHistoryResponse } from '../types/auth';
import type { PublicSettings } from '../types/settings';

export interface LoginPayload {
  email: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponseData {
  user: User;
  token: string;
}

export interface UpdateProfilePayload {
  name: string;
  name_bn?: string;
  salutation?: string;
  gender?: string;
  religion?: string;
  blood_group?: string;
  date_of_birth?: string;
  join_date?: string;
  nid?: string;
  nationality?: string;
  father_name?: string;
  mother_name?: string;
  present_address?: string;
  permanent_address?: string;
  home_district?: string;
  emergency_contact_name?: string;
  emergency_contact_relation?: string;
  emergency_contact_phone?: string;
  appointment_subject?: string;
  teaching_subject?: string;
  school_hours?: string;
  employee_type?: string;
  bio?: string;
  facebook_url?: string;
  bank_account_no?: string;
  bank_name?: string;
  email: string;
  phone?: string;
  designation?: string;
}

export const authApi = {
  getCsrfCookie: async () => {
    return apiClient.get('/sanctum/csrf-cookie');
  },

  login: async (payload: LoginPayload): Promise<ApiResponse<LoginResponseData>> => {
    await ensureCsrfCookie();
    const response = await apiClient.post<ApiResponse<LoginResponseData>>('/api/v1/login', payload);
    return response.data;
  },

  logout: async (): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>('/api/v1/logout');
    return response.data;
  },

  logoutAllDevices: async (): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>('/api/v1/logout-all-devices');
    return response.data;
  },

  getAuthUser: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>('/api/v1/user');
    return response.data;
  },

  forgotPassword: async (email: string): Promise<ApiResponse<{ reset_token?: string; email: string }>> => {
    await ensureCsrfCookie();
    const response = await apiClient.post<ApiResponse<{ reset_token?: string; email: string }>>('/api/v1/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (payload: { token: string; email: string; password: string; password_confirmation: string }): Promise<ApiResponse<null>> => {
    await ensureCsrfCookie();
    const response = await apiClient.post<ApiResponse<null>>('/api/v1/reset-password', payload);
    return response.data;
  },

  getPublicSettings: async (): Promise<ApiResponse<PublicSettings>> => {
    const response = await apiClient.get<ApiResponse<PublicSettings>>('/api/v1/settings/public');
    return response.data;
  },

  updateProfile: async (payload: UpdateProfilePayload): Promise<ApiResponse<User>> => {
    const response = await apiClient.put<ApiResponse<User>>('/api/v1/profile', payload);
    return response.data;
  },

  changePassword: async (payload: { current_password: string; password: string; password_confirmation: string }): Promise<ApiResponse<null>> => {
    const response = await apiClient.put<ApiResponse<null>>('/api/v1/profile/change-password', payload);
    return response.data;
  },

  updateAvatar: async (formData: FormData): Promise<ApiResponse<User>> => {
    const response = await apiClient.post<ApiResponse<User>>('/api/v1/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  removeAvatar: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.delete<ApiResponse<User>>('/api/v1/profile/avatar');
    return response.data;
  },

  getLoginHistory: async (page = 1, perPage = 15): Promise<LoginHistoryResponse> => {
    const response = await apiClient.get<LoginHistoryResponse>('/api/v1/profile/login-history', {
      params: { page, per_page: perPage },
    });
    return response.data;
  },
};