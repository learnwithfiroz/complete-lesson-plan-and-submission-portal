import { apiClient } from './client';
import type { ApiResponse, PaginatedResponse } from '../types/api';
import type { User } from '../types/auth';

export interface UserFilterParams {
  search?: string;
  role?: string;
  role_group?: string;
  department_id?: number | string;
  is_active?: boolean | string;
  page?: number;
  per_page?: number;
}

export interface UserFormData {
  employee_id?: string;
  serial_number?: number | string;
  name: string;
  salutation?: string;
  gender?: string;
  email: string;
  password?: string;
  phone?: string;
  designation?: string;
  department_id?: number | string | null;
  role_ids: number[];
  is_active?: boolean;
}

export const usersApi = {
  getUsers: async (params: UserFilterParams = {}): Promise<PaginatedResponse<User>> => {
    const cleanParams: any = {};
    if (params.search) cleanParams.search = params.search;
    if (params.role) cleanParams.role = params.role;
    if (params.role_group) cleanParams.role_group = params.role_group;
    if (params.department_id) cleanParams.department_id = params.department_id;
    if (params.is_active !== undefined && params.is_active !== '') cleanParams.is_active = params.is_active;
    if (params.page) cleanParams.page = params.page;
    if (params.per_page) cleanParams.per_page = params.per_page;

    const response = await apiClient.get<PaginatedResponse<User>>('/api/v1/users', { params: cleanParams });
    return response.data;
  },

  getUser: async (id: number): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>(`/api/v1/users/${id}`);
    return response.data;
  },

  createUser: async (data: UserFormData): Promise<ApiResponse<User>> => {
    const response = await apiClient.post<ApiResponse<User>>('/api/v1/users', data);
    return response.data;
  },

  updateUser: async (id: number, data: UserFormData): Promise<ApiResponse<User>> => {
    const response = await apiClient.put<ApiResponse<User>>(`/api/v1/users/${id}`, data);
    return response.data;
  },

  toggleStatus: async (id: number): Promise<ApiResponse<User>> => {
    const response = await apiClient.patch<ApiResponse<User>>(`/api/v1/users/${id}/toggle-status`);
    return response.data;
  },

  deleteUser: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/api/v1/users/${id}`);
    return response.data;
  },
};