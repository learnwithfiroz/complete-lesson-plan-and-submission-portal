import { apiClient } from './client';
import type { ApiResponse } from '../types/api';
import type { LessonPlan } from '../types/lessonPlan';

export const calendarApi = {
  getCalendarEvents: async (params: {
    start_date?: string;
    end_date?: string;
    class_id?: number | string;
    subject_id?: number | string;
    status?: string;
  } = {}): Promise<ApiResponse<LessonPlan[]>> => {
    const response = await apiClient.get<ApiResponse<LessonPlan[]>>('/api/v1/lesson-plans-calendar', { params });
    return response.data;
  },
};