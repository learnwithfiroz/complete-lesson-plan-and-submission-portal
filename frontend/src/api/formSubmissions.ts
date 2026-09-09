import { apiClient } from './client';
import type { ApiResponse } from '../types/api';

export interface PublicFormSchemaData {
  id: number;
  slug: string;
  title: string;
  form_type: string;
  description: string | null;
  instructions: string | null;
  is_active: boolean;
  layout_style: 'wizard' | 'single_page' | 'tabbed';
  post_payment_action: string;
  deadline: string | null;
  submission_count: number;
  schema_data: any;
  share_url: string;
}

export interface FormSubmissionRecord {
  id: number;
  form_schema_id: number;
  tracking_number: string;
  applicant_name: string;
  applicant_email: string | null;
  applicant_phone: string | null;
  data: Record<string, any>;
  attachments: Record<string, {
    field_key: string;
    original_name: string;
    file_path: string;
    file_url: string;
    file_size: number;
    mime_type: string;
  }> | null;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'approved' | 'rejected' | 'admitted';
  admin_notes: string | null;
  ip_address: string | null;
  created_at: string;
  updated_at: string;
}

export interface FormSubmissionsListResponse {
  success: boolean;
  schema: {
    id: number;
    title: string;
    form_type: string;
    slug: string;
    submission_count: number;
  };
  data: FormSubmissionRecord[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export const formSubmissionsApi = {
  // Public Form Endpoints
  getPublicForm: async (slugOrId: string | number): Promise<ApiResponse<PublicFormSchemaData>> => {
    const response = await apiClient.get<ApiResponse<PublicFormSchemaData>>(`/api/v1/public/forms/${slugOrId}`);
    return response.data;
  },

  submitPublicForm: async (slugOrId: string | number, payload: FormData | Record<string, any>): Promise<ApiResponse<{
    id: number;
    tracking_number: string;
    applicant_name: string;
    applicant_email: string | null;
    applicant_phone: string | null;
    form_title: string;
    form_type: string;
    status: string;
    submitted_at: string;
    post_payment_action: string;
    tracking_url: string;
  }>> => {
    const isFormData = payload instanceof FormData;
    const response = await apiClient.post(`/api/v1/public/forms/${slugOrId}/submit`, payload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return response.data;
  },

  trackApplication: async (trackingNumber: string): Promise<ApiResponse<FormSubmissionRecord & {
    form_title: string;
    form_type: string;
    post_payment_action: string;
  }>> => {
    const response = await apiClient.get(`/api/v1/public/forms/track/${trackingNumber}`);
    return response.data;
  },

  // Admin Management Endpoints
  getSubmissions: async (
    schemaId: number,
    params: { page?: number; per_page?: number; search?: string; status?: string } = {}
  ): Promise<FormSubmissionsListResponse> => {
    const response = await apiClient.get<FormSubmissionsListResponse>(
      `/api/v1/form-schemas/${schemaId}/submissions`,
      { params }
    );
    return response.data;
  },

  updateStatus: async (
    submissionId: number,
    data: { status: string; admin_notes?: string }
  ): Promise<ApiResponse<FormSubmissionRecord>> => {
    const response = await apiClient.patch<ApiResponse<FormSubmissionRecord>>(
      `/api/v1/form-submissions/${submissionId}/status`,
      data
    );
    return response.data;
  },
};