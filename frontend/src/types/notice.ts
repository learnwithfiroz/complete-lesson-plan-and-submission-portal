export type NoticeCategory = 'academic' | 'curriculum' | 'administrative' | 'urgent' | 'exam' | 'general';
export type NoticePriority = 'low' | 'normal' | 'high' | 'urgent';
export type NoticeTargetAudience = 'all' | 'teachers' | 'coordinators' | 'principal';

export interface NoticeCreator {
  id: number;
  name: string;
  email: string;
  designation?: string;
}

export interface Notice {
  id: number;
  title_bn: string;
  title_en: string;
  content_bn: string;
  content_en: string;
  category: NoticeCategory;
  priority: NoticePriority;
  target_audience: NoticeTargetAudience;
  attachment_path: string | null;
  attachment_name: string | null;
  is_pinned: boolean;
  is_published: boolean;
  publish_date: string | null;
  expiry_date: string | null;
  created_by: number;
  creator?: NoticeCreator;
  created_at: string;
  updated_at: string;
}

export interface NoticeListParams {
  category?: string;
  priority?: string;
  target_audience?: string;
  search?: string;
  page?: number;
  per_page?: number;
  is_published?: boolean;
}

export interface NoticeFormData {
  title_bn: string;
  title_en: string;
  content_bn: string;
  content_en: string;
  category: NoticeCategory;
  priority: NoticePriority;
  target_audience: NoticeTargetAudience;
  is_pinned: boolean;
  is_published: boolean;
  publish_date?: string;
  expiry_date?: string;
  attachment?: File | null;
  remove_attachment?: boolean;
}

export interface NoticeReaderItem {
  id: number;
  user_id: number;
  name: string;
  name_bn?: string;
  employee_id?: string;
  serial_number?: number;
  designation?: string;
  department?: string;
  phone?: string;
  avatar?: string | null;
  ip_address?: string;
  device_type?: string;
  browser?: string;
  read_at: string;
}

export interface NoticeUnreaderItem {
  id: number;
  name: string;
  name_bn?: string;
  employee_id?: string;
  serial_number?: number;
  designation?: string;
  department?: string;
  phone?: string;
  avatar?: string | null;
}

export interface NoticeReadersResponse {
  success: boolean;
  data: {
    notice_id: number;
    title_bn: string;
    title_en: string;
    priority: NoticePriority;
    target_audience: NoticeTargetAudience;
    publish_date?: string | null;
    total_target: number;
    total_readers: number;
    total_unreaders: number;
    read_percentage: number;
    readers: NoticeReaderItem[];
    unreaders: NoticeUnreaderItem[];
  };
}