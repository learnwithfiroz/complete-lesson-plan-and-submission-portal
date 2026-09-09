import { apiClient } from './client';

export interface MessageTemplate {
  id: string;
  name: string;
  language: 'bn' | 'en';
  category?: 'whatsapp' | 'sms' | 'whatsapp_sms' | 'general';
  text: string;
  is_default?: boolean;
  is_system?: boolean;
  updated_at?: string;
}

export interface CreateMessageTemplateDto {
  name: string;
  text: string;
  language?: 'bn' | 'en';
  category?: 'whatsapp' | 'sms' | 'whatsapp_sms' | 'general';
  is_default?: boolean;
}

export interface UpdateMessageTemplateDto {
  name: string;
  text: string;
  language?: 'bn' | 'en';
  category?: 'whatsapp' | 'sms' | 'whatsapp_sms' | 'general';
  is_default?: boolean;
}

export const messageTemplatesApi = {
  /**
   * Fetch all message templates
   */
  getAll: async (): Promise<MessageTemplate[]> => {
    const response = await apiClient.get('/api/v1/message-templates');
    return response.data?.data || [];
  },

  /**
   * Create a new message template
   */
  create: async (data: CreateMessageTemplateDto): Promise<MessageTemplate> => {
    const response = await apiClient.post('/api/v1/message-templates', data);
    return response.data?.data;
  },

  /**
   * Update an existing message template
   */
  update: async (id: string, data: UpdateMessageTemplateDto): Promise<MessageTemplate[]> => {
    const response = await apiClient.put(`/api/v1/message-templates/${id}`, data);
    return response.data?.data;
  },

  /**
   * Delete a message template
   */
  delete: async (id: string): Promise<MessageTemplate[]> => {
    const response = await apiClient.delete(`/api/v1/message-templates/${id}`);
    return response.data?.data;
  },

  /**
   * Reset all templates to default system templates
   */
  reset: async (): Promise<MessageTemplate[]> => {
    const response = await apiClient.post('/api/v1/message-templates/reset');
    return response.data?.data;
  },

  /**
   * Bulk save all templates
   */
  saveAll: async (templates: MessageTemplate[]): Promise<MessageTemplate[]> => {
    const response = await apiClient.post('/api/v1/message-templates/save-all', { templates });
    return response.data?.data;
  },
};
