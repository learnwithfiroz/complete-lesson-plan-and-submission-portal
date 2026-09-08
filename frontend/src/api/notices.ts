import { apiClient } from './client';
import type { Notice, NoticeListParams, NoticeReadersResponse } from '../types/notice';

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const noticeApi = {
  getNotices: async (params?: NoticeListParams): Promise<PaginatedResponse<Notice>> => {
    const res = await apiClient.get('/api/v1/notices', { params });
    return res.data;
  },

  getLiveTicker: async (): Promise<{ success: boolean; data: Notice[] }> => {
    const res = await apiClient.get('/api/v1/notices/live-ticker');
    return res.data;
  },

  getNotice: async (id: number): Promise<{ success: boolean; data: Notice }> => {
    const res = await apiClient.get(`/api/v1/notices/${id}`);
    return res.data;
  },

  createNotice: async (formData: FormData): Promise<{ success: boolean; message: string; data: Notice }> => {
    const res = await apiClient.post('/api/v1/notices', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  updateNotice: async (id: number, formData: FormData): Promise<{ success: boolean; message: string; data: Notice }> => {
    const res = await apiClient.post(`/api/v1/notices/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  deleteNotice: async (id: number): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.delete(`/api/v1/notices/${id}`);
    return res.data;
  },

  togglePin: async (id: number): Promise<{ success: boolean; message: string; data: { is_pinned: boolean } }> => {
    const res = await apiClient.patch(`/api/v1/notices/${id}/toggle-pin`);
    return res.data;
  },

  togglePublish: async (id: number): Promise<{ success: boolean; message: string; data: { is_published: boolean } }> => {
    const res = await apiClient.patch(`/api/v1/notices/${id}/toggle-publish`);
    return res.data;
  },

  downloadAttachmentUrl: (id: number): string => {
    return `/api/v1/notices/${id}/attachment`;
  },

  markNoticeAsRead: async (id: number): Promise<{ success: boolean; message: string; data: { read_at: string } }> => {
    const res = await apiClient.post(`/api/v1/notices/${id}/read`);
    return res.data;
  },

  getNoticeReaders: async (id: number): Promise<NoticeReadersResponse> => {
    const res = await apiClient.get<NoticeReadersResponse>(`/api/v1/notices/${id}/readers`);
    return res.data;
  },
};