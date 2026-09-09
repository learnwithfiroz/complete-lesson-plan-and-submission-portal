export interface DashboardSummary {
  total: number;
  draft: number;
  submitted: number;
  under_review: number;
  approved: number;
  returned: number;
  rejected: number;
}

export interface SubmissionTrends {
  labels: string[];
  data: number[];
}

export interface PlanBySubject {
  subject_name: string;
  count: number;
}

export interface ServerStorageInfo {
  total_bytes: number;
  free_bytes: number;
  used_bytes: number;
  used_percent: number;
  total_display: string;
  free_display: string;
  used_display: string;
  php_version: string;
  upload_max_filesize: string;
  post_max_size: string;
  memory_limit: string;
}

export interface DashboardStatsData {
  summary: DashboardSummary;
  submission_trends: SubmissionTrends;
  plans_by_subject: PlanBySubject[];
  recent_plans: any[];
  admin_overview?: {
    total_teachers: number;
    total_classes: number;
    total_subjects: number;
    active_year: string;
  } | null;
  server_storage?: ServerStorageInfo | null;
}