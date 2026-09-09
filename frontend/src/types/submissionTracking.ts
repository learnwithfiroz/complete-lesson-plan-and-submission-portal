export type SubmissionCategory = 'lesson_plan' | 'assignment' | 'question';

export interface SubmissionFile {
  id: number;
  file_name: string;
  file_url: string;
  download_url?: string;
  file_size: number;
  file_type?: string;
  gdrive_file_id?: string | null;
  gdrive_view_link?: string | null;
  gdrive_download_link?: string | null;
  gdrive_synced_at?: string | null;
}

export interface TeacherSubmissionDetail {
  id: number;
  status: 'submitted' | 'approved' | 'revision_requested';
  update_count?: number;
  submitted_at: string;
  last_updated_at?: string | null;
  remarks?: string | null;
  gdrive_folder_id?: string | null;
  gdrive_folder_url?: string | null;
  files: SubmissionFile[];
}

export interface SubmissionBatchStats {
  total_teachers: number;
  submitted_count: number;
  not_submitted_count: number;
  completion_percent: number;
}

export interface SubmissionBatch {
  id: number;
  category: SubmissionCategory;
  title: string;
  class_id?: number | null;
  class_name: string;
  start_date: string;
  end_date: string;
  date_range_display: string;
  allow_multiple_files: boolean;
  instructions?: string | null;
  is_active: boolean;
  gdrive_folder_id?: string | null;
  gdrive_folder_url?: string | null;
  created_at: string;
  stats?: SubmissionBatchStats;
  my_submission?: TeacherSubmissionDetail | null;
}

export interface TeacherRowItem {
  teacher_id: number;
  employee_id?: string;
  serial_number?: number;
  sl?: number;
  name: string;
  salutation?: string;
  gender?: string;
  designation: string;
  department_name: string;
  phone?: string;
  is_submitted: boolean;
  submission_id?: number;
  status: 'submitted' | 'approved' | 'revision_requested' | 'not_submitted';
  update_count?: number;
  submitted_at?: string;
  last_updated_at?: string | null;
  remarks?: string;
  gdrive_folder_id?: string | null;
  gdrive_folder_url?: string | null;
  files: SubmissionFile[];
}

export interface BatchDetailResponse {
  batch: SubmissionBatch;
  is_admin?: boolean;
  my_submission?: TeacherSubmissionDetail | null;
  stats?: SubmissionBatchStats;
  teachers?: TeacherRowItem[];
}

export interface GoogleDriveStatus {
  is_configured: boolean;
  root_folder_id?: string | null;
  root_folder_url?: string | null;
  client_id_set: boolean;
  refresh_token_set: boolean;
}

export interface SundayTeacherItem {
  sl?: number;
  employee_id?: string;
  serial_number?: number;
  name: string;
  salutation?: string;
  gender?: string;
  designation: string;
  department: string;
  phone: string;
  update_count?: number;
  submitted_at: string | null;
  last_updated_at?: string | null;
  gdrive_folder_url?: string | null;
  files: Array<{ name: string; url: string; gdrive_view_link?: string | null; gdrive_download_link?: string | null }>;
  file_count: number;
}

export interface SundayReportData {
  school_name: string;
  school_name_bn?: string;
  address: string;
  eiin: string;
  school_code: string;
  college_code: string;
  website?: string;
  email?: string;
  ref_no?: string;
  batch: {
    id: number;
    title: string;
    category: SubmissionCategory;
    class_name: string;
    date_range: string;
    deadline_display: string;
    gdrive_folder_url?: string | null;
  };
  generated_at: string;
  summary: {
    total_teachers: number;
    submitted_count: number;
    not_submitted_count: number;
    completion_percent: number;
  };
  not_submitted_teachers: SundayTeacherItem[];
  submitted_teachers: SundayTeacherItem[];
}

