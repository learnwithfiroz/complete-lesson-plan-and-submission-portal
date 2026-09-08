import { apiClient } from './client';
import type { ApiResponse } from '../types/api';
import type { DashboardStatsData } from '../types/dashboard';

export const dashboardApi = {
  getStats: async (): Promise<ApiResponse<DashboardStatsData>> => {
    const response = await apiClient.get<ApiResponse<DashboardStatsData>>('/api/v1/dashboard/stats');
    return response.data;
  },
};