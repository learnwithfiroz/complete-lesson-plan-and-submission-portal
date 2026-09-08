import { apiClient } from './client';
import type { ApiResponse } from '../types/api';
import type { Role } from '../types/auth';

export interface Permission {
  id: number;
  name: string;
  display_name_bn: string;
  display_name_en: string;
  module: string;
}

export const rolesApi = {
  getRoles: async (): Promise<ApiResponse<Role[]>> => {
    const response = await apiClient.get<ApiResponse<Role[]>>('/api/v1/roles');
    return response.data;
  },

  getRole: async (id: number): Promise<ApiResponse<Role & { permissions: Permission[] }>> => {
    const response = await apiClient.get<ApiResponse<Role & { permissions: Permission[] }>>(`/api/v1/roles/${id}`);
    return response.data;
  },

  updateRolePermissions: async (roleId: number, permissionIds: number[]): Promise<ApiResponse<Role>> => {
    const response = await apiClient.put<ApiResponse<Role>>(`/api/v1/roles/${roleId}/permissions`, {
      permission_ids: permissionIds,
    });
    return response.data;
  },

  getPermissions: async (): Promise<ApiResponse<Record<string, Permission[]>>> => {
    const response = await apiClient.get<ApiResponse<Record<string, Permission[]>>>('/api/v1/permissions');
    return response.data;
  },
};