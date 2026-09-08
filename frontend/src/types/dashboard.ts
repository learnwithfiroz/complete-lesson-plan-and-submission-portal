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
}