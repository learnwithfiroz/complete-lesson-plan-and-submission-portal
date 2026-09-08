import { apiClient } from './client';
import type { ApiResponse } from '../types/api';
import type { LessonPlanTemplate } from '../types/template';

export const templatesApi = {
  getTemplates: async (): Promise<ApiResponse<LessonPlanTemplate[]>> => {
    const response = await apiClient.get<ApiResponse<LessonPlanTemplate[]>>('/api/v1/templates');
    return response.data;
  },

  createTemplate: async (data: Partial<LessonPlanTemplate>): Promise<ApiResponse<LessonPlanTemplate>> => {
    const response = await apiClient.post<ApiResponse<LessonPlanTemplate>>('/api/v1/templates', data);
    return response.data;
  },

  deleteTemplate: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/api/v1/templates/${id}`);
    return response.data;
  },
};