import type { Department, User } from './auth';

export interface Term {
  id: number;
  academic_year_id: number;
  name_bn: string;
  name_en: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

export interface AcademicYear {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  terms?: Term[];
  assignments_count?: number;
  created_at?: string;
}

export interface Section {
  id: number;
  class_id: number;
  name_bn: string;
  name_en: string;
  capacity?: number;
  version?: string;
  shift?: string;
  shift_time?: string;
  group_name?: string;
  order_no?: number;
  class_teacher_id?: number | null;
  class_teacher_name?: string | null;
  coordinator_name?: string | null;
  vp_name?: string | null;
  class_teacher?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    employee_id?: string;
  } | null;
}

export interface Chapter {
  id: number;
  subject_id: number;
  chapter_no: number;
  title_bn: string;
  title_en: string;
}

export interface Subject {
  id: number;
  department_id?: number | null;
  class_id?: number | null;
  name_bn: string;
  name_en: string;
  code: string;
  is_active: boolean;
  department?: Department | null;
  chapters?: Chapter[];
  chapters_count?: number;
}

export interface SchoolClass {
  id: number;
  name_bn: string;
  name_en: string;
  numeric_value: number;
  version?: string;
  academic_level?: string;
  level_code?: string;
  order_no?: number;
  grading_scale?: string;
  is_active: boolean;
  sections?: Section[];
  subjects?: Subject[];
  sections_count?: number;
  subjects_count?: number;
}

export interface TeacherAssignment {
  id: number;
  teacher: User;
  academic_year: AcademicYear;
  school_class: SchoolClass;
  section: Section;
  subject: Subject;
  created_at?: string;
}

export interface MyAssignmentsData {
  academic_year: AcademicYear | null;
  assignments: TeacherAssignment[];
  classes: SchoolClass[];
  sections: Section[];
  subjects: Subject[];
}