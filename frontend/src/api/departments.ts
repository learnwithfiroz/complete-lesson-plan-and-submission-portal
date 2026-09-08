import { apiClient } from './client';
import type { ApiResponse } from '../types/api';
import type { Department } from '../types/auth';

export interface DepartmentFormData {
  name_bn: string;
  name_en: string;
  code: string;
  description?: string;
  is_active?: boolean;
}

export const departmentsApi = {
  getDepartments: async (activeOnly = false): Promise<ApiResponse<Department[]>> => {
    const response = await apiClient.get<ApiResponse<Department[]>>('/api/v1/departments', {
      params: { active_only: activeOnly },
    });
    return response.data;
  },

  getDepartment: async (id: number): Promise<ApiResponse<Department>> => {
    const response = await apiClient.get<ApiResponse<Department>>(`/api/v1/departments/${id}`);
    return response.data;
  },

  createDepartment: async (data: DepartmentFormData): Promise<ApiResponse<Department>> => {
    const response = await apiClient.post<ApiResponse<Department>>('/api/v1/departments', data);
    return response.data;
  },

  updateDepartment: async (id: number, data: DepartmentFormData): Promise<ApiResponse<Department>> => {
    const response = await apiClient.put<ApiResponse<Department>>(`/api/v1/departments/${id}`, data);
    return response.data;
  },

  deleteDepartment: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/api/v1/departments/${id}`);
    return response.data;
  },
};