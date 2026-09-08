import { apiClient } from './client';
import type { ApiResponse } from '../types/api';
import type {
  AcademicYear,
  Term,
  SchoolClass,
  Section,
  Subject,
  Chapter,
  TeacherAssignment,
  MyAssignmentsData,
} from '../types/academic';

export const academicApi = {
  // Years & Terms
  getAcademicYears: async (): Promise<ApiResponse<AcademicYear[]>> => {
    const response = await apiClient.get<ApiResponse<AcademicYear[]>>('/api/v1/academic/years');
    return response.data;
  },

  createAcademicYear: async (data: Partial<AcademicYear>): Promise<ApiResponse<AcademicYear>> => {
    const response = await apiClient.post<ApiResponse<AcademicYear>>('/api/v1/academic/years', data);
    return response.data;
  },

  updateAcademicYear: async (id: number, data: Partial<AcademicYear>): Promise<ApiResponse<AcademicYear>> => {
    const response = await apiClient.put<ApiResponse<AcademicYear>>(`/api/v1/academic/years/${id}`, data);
    return response.data;
  },

  deleteAcademicYear: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/api/v1/academic/years/${id}`);
    return response.data;
  },

  setCurrentYear: async (id: number): Promise<ApiResponse<AcademicYear>> => {
    const response = await apiClient.patch<ApiResponse<AcademicYear>>(`/api/v1/academic/years/${id}/set-current`);
    return response.data;
  },

  createTerm: async (data: Partial<Term>): Promise<ApiResponse<Term>> => {
    const response = await apiClient.post<ApiResponse<Term>>('/api/v1/academic/terms', data);
    return response.data;
  },

  updateTerm: async (id: number, data: Partial<Term>): Promise<ApiResponse<Term>> => {
    const response = await apiClient.put<ApiResponse<Term>>(`/api/v1/academic/terms/${id}`, data);
    return response.data;
  },

  deleteTerm: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/api/v1/academic/terms/${id}`);
    return response.data;
  },

  // Classes & Sections
  getClasses: async (activeOnly = false): Promise<ApiResponse<SchoolClass[]>> => {
    const response = await apiClient.get<ApiResponse<SchoolClass[]>>('/api/v1/academic/classes', {
      params: { active_only: activeOnly },
    });
    return response.data;
  },

  createClass: async (data: Partial<SchoolClass>): Promise<ApiResponse<SchoolClass>> => {
    const response = await apiClient.post<ApiResponse<SchoolClass>>('/api/v1/academic/classes', data);
    return response.data;
  },

  updateClass: async (id: number, data: Partial<SchoolClass>): Promise<ApiResponse<SchoolClass>> => {
    const response = await apiClient.put<ApiResponse<SchoolClass>>(`/api/v1/academic/classes/${id}`, data);
    return response.data;
  },

  deleteClass: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/api/v1/academic/classes/${id}`);
    return response.data;
  },

  createSection: async (data: Partial<Section>): Promise<ApiResponse<Section>> => {
    const response = await apiClient.post<ApiResponse<Section>>('/api/v1/academic/sections', data);
    return response.data;
  },

  updateSection: async (id: number, data: Partial<Section>): Promise<ApiResponse<Section>> => {
    const response = await apiClient.put<ApiResponse<Section>>(`/api/v1/academic/sections/${id}`, data);
    return response.data;
  },

  deleteSection: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/api/v1/academic/sections/${id}`);
    return response.data;
  },

  // Subjects & Chapters
  getSubjects: async (params: { class_id?: number; department_id?: number } = {}): Promise<ApiResponse<Subject[]>> => {
    const response = await apiClient.get<ApiResponse<Subject[]>>('/api/v1/academic/subjects', { params });
    return response.data;
  },

  createSubject: async (data: Partial<Subject>): Promise<ApiResponse<Subject>> => {
    const response = await apiClient.post<ApiResponse<Subject>>('/api/v1/academic/subjects', data);
    return response.data;
  },

  updateSubject: async (id: number, data: Partial<Subject>): Promise<ApiResponse<Subject>> => {
    const response = await apiClient.put<ApiResponse<Subject>>(`/api/v1/academic/subjects/${id}`, data);
    return response.data;
  },

  deleteSubject: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/api/v1/academic/subjects/${id}`);
    return response.data;
  },

  createChapter: async (data: Partial<Chapter>): Promise<ApiResponse<Chapter>> => {
    const response = await apiClient.post<ApiResponse<Chapter>>('/api/v1/academic/chapters', data);
    return response.data;
  },

  updateChapter: async (id: number, data: Partial<Chapter>): Promise<ApiResponse<Chapter>> => {
    const response = await apiClient.put<ApiResponse<Chapter>>(`/api/v1/academic/chapters/${id}`, data);
    return response.data;
  },

  deleteChapter: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/api/v1/academic/chapters/${id}`);
    return response.data;
  },

  // Teacher Assignments
  getAssignments: async (params: { teacher_id?: number; academic_year_id?: number; class_id?: number } = {}): Promise<ApiResponse<TeacherAssignment[]>> => {
    const response = await apiClient.get<ApiResponse<TeacherAssignment[]>>('/api/v1/academic/teacher-assignments', { params });
    return response.data;
  },

  createAssignment: async (data: {
    teacher_id: number;
    academic_year_id: number;
    class_id: number;
    section_id: number;
    subject_id: number;
  }): Promise<ApiResponse<TeacherAssignment>> => {
    const response = await apiClient.post<ApiResponse<TeacherAssignment>>('/api/v1/academic/teacher-assignments', data);
    return response.data;
  },

  deleteAssignment: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete<ApiResponse<null>>(`/api/v1/academic/teacher-assignments/${id}`);
    return response.data;
  },

  getMyAssignments: async (): Promise<ApiResponse<MyAssignmentsData>> => {
    const response = await apiClient.get<ApiResponse<MyAssignmentsData>>('/api/v1/academic/my-assignments');
    return response.data;
  },
};