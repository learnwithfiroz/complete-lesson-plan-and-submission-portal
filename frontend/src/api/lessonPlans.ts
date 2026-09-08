import { apiClient } from './client';
import type { ApiResponse, PaginatedResponse } from '../types/api';
import type { LessonPlan, LessonPlanFormData, LessonPlanFilterParams } from '../types/lessonPlan';

export const lessonPlansApi = {
  getLessonPlans: async (params: LessonPlanFilterParams = {}): Promise<PaginatedResponse<LessonPlan>> => {
    const response = await apiClient.get<PaginatedResponse<LessonPlan>>('/api/v1/lesson-plans', { params });
    return response.data;
  },

  getLessonPlan: async (id: number): Promise<ApiResponse<LessonPlan>> => {
    const response = await apiClient.get<ApiResponse<LessonPlan>>(`/api/v1/lesson-plans/${id}`);
    return response.data;
  },

  createLessonPlan: async (data: LessonPlanFormData): Promise<ApiResponse<LessonPlan>> => {
    if (data.attachment instanceof File) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'outcomes' || key === 'activities') {
          formData.append(key, JSON.stringify(value));
        } else if (value !== undefined && value !== null) {
          formData.append(key, value as any);
        }
      });
      const response = await apiClient.post<ApiResponse<LessonPlan>>('/api/v1/lesson-plans', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    const response = await apiClient.post<ApiResponse<LessonPlan>>('/api/v1/lesson-plans', data);
    return response.data;
  },

  updateLessonPlan: async (id: number, data: LessonPlanFormData): Promise<ApiResponse<LessonPlan>> => {
    if (data.attachment instanceof File) {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'outcomes' || key === 'activities') {
          formData.append(key, JSON.stringify(value));
        } else if (value !== undefined && value !== null) {
          formData.append(key, value as any);
        }
      });
      const response = await apiClient.post<ApiResponse<LessonPlan>>(`/api/v1/lesson-plans/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    const response = await apiClient.put<ApiResponse<LessonPlan>>(`/api/v1/lesson-plans/${id}`, data);
    return response.data;
  },

  uploadAttachment: async (id: number, file: File): Promise<ApiResponse<LessonPlan>> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<ApiResponse<LessonPlan>>(`/api/v1/lesson-plans/${id}/upload-attachment`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteLessonPlan: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/api/v1/lesson-plans/${id}`);
    return response.data;
  },

  duplicateLessonPlan: async (id: number): Promise<ApiResponse<LessonPlan>> => {
    const response = await apiClient.post<ApiResponse<LessonPlan>>(`/api/v1/lesson-plans/${id}/duplicate`);
    return response.data;
  },

  submit: async (id: number, comment?: string): Promise<ApiResponse<LessonPlan>> => {
    const response = await apiClient.post<ApiResponse<LessonPlan>>(`/api/v1/lesson-plans/${id}/submit`, { comment });
    return response.data;
  },

  startReview: async (id: number, comment?: string): Promise<ApiResponse<LessonPlan>> => {
    const response = await apiClient.post<ApiResponse<LessonPlan>>(`/api/v1/lesson-plans/${id}/start-review`, { comment });
    return response.data;
  },

  approve: async (id: number, comment?: string): Promise<ApiResponse<LessonPlan>> => {
    const response = await apiClient.post<ApiResponse<LessonPlan>>(`/api/v1/lesson-plans/${id}/approve`, { comment });
    return response.data;
  },

  returnForCorrection: async (id: number, comment: string): Promise<ApiResponse<LessonPlan>> => {
    const response = await apiClient.post<ApiResponse<LessonPlan>>(`/api/v1/lesson-plans/${id}/return`, { comment });
    return response.data;
  },

  reject: async (id: number, comment: string): Promise<ApiResponse<LessonPlan>> => {
    const response = await apiClient.post<ApiResponse<LessonPlan>>(`/api/v1/lesson-plans/${id}/reject`, { comment });
    return response.data;
  },

  archive: async (id: number): Promise<ApiResponse<LessonPlan>> => {
    const response = await apiClient.post<ApiResponse<LessonPlan>>(`/api/v1/lesson-plans/${id}/archive`);
    return response.data;
  },

  restore: async (id: number): Promise<ApiResponse<LessonPlan>> => {
    const response = await apiClient.post<ApiResponse<LessonPlan>>(`/api/v1/lesson-plans/${id}/restore`);
    return response.data;
  },
};