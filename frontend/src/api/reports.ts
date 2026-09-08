import { apiClient } from './client';
import type { ApiResponse } from '../types/api';
import type { ReportSummaryData } from '../types/report';

export const reportsApi = {
  getSummary: async (): Promise<ApiResponse<ReportSummaryData>> => {
    const response = await apiClient.get<ApiResponse<ReportSummaryData>>('/api/v1/reports/summary');
    return response.data;
  },
};