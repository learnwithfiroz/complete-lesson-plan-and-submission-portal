import { apiClient } from './client';
import type { ApiResponse } from '../types/api';
import type { SubmissionBatch, SubmissionCategory, BatchDetailResponse } from '../types/submissionTracking';

export interface BatchListResponse {
  batches: SubmissionBatch[];
  counts: {
    active: number;
    inactive: number;
    total_teachers: number;
  };
}

export const submissionTrackingApi = {
  getBatches: async (category: SubmissionCategory = 'lesson_plan', status: 'active' | 'inactive' | 'all' = 'active'): Promise<ApiResponse<BatchListResponse>> => {
    const response = await apiClient.get<ApiResponse<BatchListResponse>>('/api/v1/submission-tracking', {
      params: { category, status },
    });
    return response.data;
  },

  createBatch: async (data: {
    category: SubmissionCategory;
    title: string;
    class_id?: number | null;
    start_date: string;
    end_date: string;
    allow_multiple_files?: boolean;
    instructions?: string;
  }): Promise<ApiResponse<SubmissionBatch>> => {
    const response = await apiClient.post<ApiResponse<SubmissionBatch>>('/api/v1/submission-tracking', data);
    return response.data;
  },

  getBatchDetails: async (id: number): Promise<ApiResponse<BatchDetailResponse>> => {
    const response = await apiClient.get<ApiResponse<BatchDetailResponse>>(`/api/v1/submission-tracking/${id}`);
    return response.data;
  },

  toggleActive: async (id: number): Promise<ApiResponse<SubmissionBatch>> => {
    const response = await apiClient.patch<ApiResponse<SubmissionBatch>>(`/api/v1/submission-tracking/${id}/toggle-active`);
    return response.data;
  },

  deleteBatch: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/api/v1/submission-tracking/${id}`);
    return response.data;
  },

  submitFiles: async (batchId: number, files: File[], remarks?: string): Promise<ApiResponse<any>> => {
    const formData = new FormData();
    files.forEach((f) => {
      formData.append('files[]', f);
    });
    if (remarks) {
      formData.append('remarks', remarks);
    }
    const response = await apiClient.post<ApiResponse<any>>(`/api/v1/submission-tracking/${batchId}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteFile: async (fileId: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/api/v1/submission-tracking/files/${fileId}`);
    return response.data;
  },

  updateStatus: async (submissionId: number, status: 'submitted' | 'approved' | 'revision_requested', remarks?: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.patch<ApiResponse<any>>(`/api/v1/submission-tracking/submissions/${submissionId}/status`, {
      status,
      remarks,
    });
    return response.data;
  },

  getSundayReport: async (batchId: number): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(`/api/v1/submission-tracking/${batchId}/sunday-report`);
    return response.data;
  },

  downloadAllZip: async (batchId: number, batchTitle: string): Promise<void> => {
    const response = await apiClient.get(`/api/v1/submission-tracking/${batchId}/download-all-zip`, {
      responseType: 'blob',
    });

    if (response.data && (response.data.type === 'application/json' || (response.data as Blob).type?.includes('json'))) {
      const text = await (response.data as Blob).text();
      let errorMsg = 'ZIP ফাইল তৈরি করা সম্ভব হয়নি।';
      try {
        const json = JSON.parse(text);
        errorMsg = json.message || errorMsg;
      } catch (e) {}
      throw new Error(errorMsg);
    }

    const blob = new Blob([response.data], { type: 'application/zip' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeName = (batchTitle || 'Batch').replace(/[^a-zA-Z0-9_\-]/g, '_');
    link.setAttribute('download', `BSISC_${safeName}_Files.zip`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => window.URL.revokeObjectURL(url), 2000);
  },

  syncBatchToDrive: async (batchId: number): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(`/api/v1/submission-tracking/${batchId}/sync-drive`);
    return response.data;
  },

  getDriveStatus: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>('/api/v1/submission-tracking/drive-status');
    return response.data;
  },
};

