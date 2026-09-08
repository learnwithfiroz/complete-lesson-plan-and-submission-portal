import type { Subject } from './academic';
import type { Department, User } from './auth';
import type { LessonPlanFormData } from './lessonPlan';

export interface LessonPlanTemplate {
  id: number;
  title: string;
  subject_id?: number | null;
  department_id?: number | null;
  created_by: number;
  is_system: boolean;
  is_active: boolean;
  template_data: Partial<LessonPlanFormData>;
  created_at: string;
  subject?: Subject;
  department?: Department;
  creator?: User;
}