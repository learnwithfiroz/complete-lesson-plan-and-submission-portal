import type { AcademicYear, Chapter, SchoolClass, Section, Subject, Term } from './academic';

export type ActivityStage = 'introduction' | 'presentation' | 'guided_practice' | 'group_work' | 'assessment' | 'conclusion';

export interface LessonPlanOutcome {
  id?: number;
  outcome_text: string;
  sort_order: number;
}

export interface LessonPlanActivity {
  id?: number;
  stage: ActivityStage;
  duration_minutes: number;
  teacher_activities: string;
  student_activities: string;
  teaching_materials?: string;
  assessment_method?: string;
  sort_order: number;
}

export interface LessonPlanReview {
  id: number;
  action: 'approve' | 'return' | 'reject' | 'comment';
  comment: string;
  created_at: string;
  reviewer?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface LessonPlanStatusHistory {
  id: number;
  from_status?: string | null;
  to_status: string;
  comment?: string | null;
  created_at: string;
  actor?: {
    id: number;
    name: string;
    email?: string;
  };
}

export type LessonPlanStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'returned' | 'rejected' | 'archived';

export interface LessonPlan {
  id: number;
  code: string;
  title: string;
  topic: string;
  lesson_date: string;
  period_number: number;
  duration_minutes: number;
  student_count: number;
  status: LessonPlanStatus;
  submitted_at?: string | null;
  reviewed_at?: string | null;
  teacher_id?: number;

  curriculum_reference?: string | null;
  competency?: string | null;
  previous_knowledge?: string | null;
  key_vocabulary?: string | null;
  teaching_method?: string | null;
  teaching_materials?: string | null;
  digital_resources?: string | null;
  reference_book?: string | null;

  formative_assessment?: string | null;
  assessment_questions?: string | null;
  success_criteria?: string | null;
  homework?: string | null;
  remedial_activities?: string | null;
  advanced_learner_activities?: string | null;
  inclusive_education_support?: string | null;
  special_needs_support?: string | null;
  teacher_reflection?: string | null;
  additional_notes?: string | null;
  attachment_name?: string | null;
  attachment_url?: string | null;

  can_edit?: boolean;
  can_submit?: boolean;
  can_review?: boolean;
  can_delete?: boolean;

  teacher?: {
    id: number;
    name: string;
    email: string;
    designation?: string;
    department?: {
      id: number;
      name_bn: string;
      name_en: string;
    };
  };
  academic_year?: AcademicYear;
  academicYear?: AcademicYear;
  term?: Term;
  school_class?: SchoolClass;
  schoolClass?: SchoolClass;
  section?: Section;
  subject?: Subject;
  chapter?: Chapter | null;

  outcomes?: LessonPlanOutcome[];
  activities?: LessonPlanActivity[];
  reviews?: LessonPlanReview[];
  status_histories?: LessonPlanStatusHistory[];
  statusHistories?: LessonPlanStatusHistory[];

  created_at?: string;
  updated_at?: string;
}

export interface LessonPlanFormData {
  academic_year_id: number | '';
  term_id: number | '';
  class_id: number | '';
  section_id: number | '';
  subject_id: number | '';
  chapter_id: number | '';

  title: string;
  topic: string;
  lesson_date: string;
  period_number: number;
  duration_minutes: number;
  student_count: number;

  curriculum_reference: string;
  competency: string;
  previous_knowledge: string;
  key_vocabulary: string;
  teaching_method: string;
  teaching_materials: string;
  digital_resources: string;
  reference_book: string;

  formative_assessment: string;
  assessment_questions: string;
  success_criteria: string;
  homework: string;
  remedial_activities: string;
  advanced_learner_activities: string;
  inclusive_education_support: string;
  special_needs_support: string;
  teacher_reflection: string;
  additional_notes: string;

  outcomes: LessonPlanOutcome[];
  activities: LessonPlanActivity[];
  attachment?: File | null;
  attachment_name?: string | null;
  submit_now?: boolean;
}

export interface LessonPlanFilterParams {
  search?: string;
  status?: string;
  academic_year_id?: number | string;
  term_id?: number | string;
  class_id?: number | string;
  subject_id?: number | string;
  teacher_id?: number | string;
  date_from?: string;
  date_to?: string;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}