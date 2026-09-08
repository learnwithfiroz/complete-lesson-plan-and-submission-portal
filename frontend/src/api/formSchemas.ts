import { apiClient } from './client';
import type { FormSchema } from '../types/formBuilder';

export const formSchemasApi = {
  getSchemas: (formType?: string) =>
    apiClient.get<{ success: boolean; data: FormSchema[] }>('/api/v1/form-schemas', {
      params: formType ? { form_type: formType } : {},
    }),

  getDefaultSchema: (formType: string = 'admission') =>
    apiClient.get<{ success: boolean; data: FormSchema }>(`/api/v1/form-schemas/default/${formType}`),

  getSchema: (id: number) =>
    apiClient.get<{ success: boolean; data: FormSchema }>(`/api/v1/form-schemas/${id}`),

  createSchema: (data: Partial<FormSchema>) =>
    apiClient.post<{ success: boolean; message: string; data: FormSchema }>('/api/v1/form-schemas', data),

  updateSchema: (id: number, data: Partial<FormSchema>) =>
    apiClient.put<{ success: boolean; message: string; data: FormSchema }>(`/api/v1/form-schemas/${id}`, data),

  duplicateSchema: (id: number) =>
    apiClient.post<{ success: boolean; message: string; data: FormSchema }>(`/api/v1/form-schemas/${id}/duplicate`),

  deleteSchema: (id: number) =>
    apiClient.delete<{ success: boolean; message: string }>(`/api/v1/form-schemas/${id}`),
};
