export interface DepartmentSummaryReport {
  id: number;
  name_bn: string;
  name_en: string;
  code: string;
  total_plans: number;
  approved_plans: number;
  submitted_plans: number;
  returned_plans: number;
}

export interface TeacherSummaryReport {
  id: number;
  name: string;
  email: string;
  designation?: string;
  department?: {
    name_bn: string;
    name_en: string;
  };
  total_plans: number;
  approved_plans: number;
  pending_plans: number;
  returned_plans: number;
}

export interface ReportSummaryData {
  department_summary: DepartmentSummaryReport[];
  teachers_summary: TeacherSummaryReport[];
}