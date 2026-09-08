import { apiClient } from './client';
import type { ApiResponse } from '../types/api';

export interface NotificationItem {
  id: string;
  type: string;
  data: {
    lesson_plan_id: number;
    lesson_plan_code: string;
    lesson_plan_title: string;
    action: string;
    actor_id: number;
    actor_name: string;
    comment?: string;
    status: string;
    timestamp: string;
  };
  read_at?: string | null;
  created_at: string;
}

export interface NotificationsResponse {
  data: NotificationItem[];
  unread_count: number;
}

export const notificationsApi = {
  getNotifications: async (): Promise<{ data: NotificationItem[]; unread_count: number }> => {
    const response = await apiClient.get<any>('/api/v1/notifications');
    return {
      data: response.data.data,
      unread_count: response.data.unread_count || 0,
    };
  },

  markAsRead: async (id: string): Promise<ApiResponse<null>> => {
    const response = await apiClient.patch<ApiResponse<null>>(`/api/v1/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<ApiResponse<null>> => {
    const response = await apiClient.post<ApiResponse<null>>('/api/v1/notifications/read-all');
    return response.data;
  },
};