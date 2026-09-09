import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { I18nProvider } from './locales/i18n';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PageLoader } from './components/feedback/PageLoader';

// Helper for safe lazy-loading with automatic recovery on build updates
function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    try {
      return await factory();
    } catch (error: any) {
      console.warn('Chunk load error, auto-reloading to fetch newest version...', error);
      const isChunkError =
        error?.message?.includes('dynamically imported module') ||
        error?.message?.includes('Loading chunk') ||
        error?.name === 'ChunkLoadError';

      if (isChunkError || error) {
        const lastReload = sessionStorage.getItem('last_chunk_reload');
        const now = Date.now();
        if (!lastReload || now - parseInt(lastReload, 10) > 5000) {
          sessionStorage.setItem('last_chunk_reload', now.toString());
          window.location.reload();
          return new Promise<{ default: T }>(() => {});
        }
      }
      throw error;
    }
  });
}

// Auth & Setup Pages (Lazy Loaded with auto-retry)
const Login = lazyWithRetry(() => import('./pages/auth/Login').then(m => ({ default: m.Login })));
const ForgotPassword = lazyWithRetry(() => import('./pages/auth/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazyWithRetry(() => import('./pages/auth/ResetPassword').then(m => ({ default: m.ResetPassword })));
const SystemSetup = lazyWithRetry(() => import('./pages/setup/SystemSetup').then(m => ({ default: m.SystemSetup })));
const Profile = lazyWithRetry(() => import('./pages/profile/Profile').then(m => ({ default: m.Profile })));

// Dashboard, Lesson Plans & Features (Lazy Loaded with auto-retry)
const Dashboard = lazyWithRetry(() => import('./pages/dashboard/Dashboard').then(m => ({ default: m.Dashboard })));
const LessonPlanList = lazyWithRetry(() => import('./pages/lesson-plans/LessonPlanList').then(m => ({ default: m.LessonPlanList })));
const CreateLessonPlan = lazyWithRetry(() => import('./pages/lesson-plans/CreateLessonPlan').then(m => ({ default: m.CreateLessonPlan })));
const LessonPlanDetails = lazyWithRetry(() => import('./pages/lesson-plans/LessonPlanDetails').then(m => ({ default: m.LessonPlanDetails })));
const Templates = lazyWithRetry(() => import('./pages/templates/Templates').then(m => ({ default: m.Templates })));
const Reports = lazyWithRetry(() => import('./pages/reports/Reports').then(m => ({ default: m.Reports })));
const Notifications = lazyWithRetry(() => import('./pages/notifications/Notifications').then(m => ({ default: m.Notifications })));
const LessonPlanCalendar = lazyWithRetry(() => import('./pages/calendar/LessonPlanCalendar').then(m => ({ default: m.LessonPlanCalendar })));
const NoticeBoard = lazyWithRetry(() => import('./pages/notices/NoticeBoard').then(m => ({ default: m.NoticeBoard })));
const SubmissionTracking = lazyWithRetry(() => import('./pages/submissions/SubmissionTracking').then(m => ({ default: m.SubmissionTracking })));
const SubmissionBatchDetails = lazyWithRetry(() => import('./pages/submissions/SubmissionBatchDetails').then(m => ({ default: m.SubmissionBatchDetails })));

// Academic Management Pages (Lazy Loaded with auto-retry)
const AcademicYears = lazyWithRetry(() => import('./pages/academic/AcademicYears').then(m => ({ default: m.AcademicYears })));
const ClassesSections = lazyWithRetry(() => import('./pages/academic/ClassesSections').then(m => ({ default: m.ClassesSections })));
const SubjectsChapters = lazyWithRetry(() => import('./pages/academic/SubjectsChapters').then(m => ({ default: m.SubjectsChapters })));
const TeacherAssignments = lazyWithRetry(() => import('./pages/academic/TeacherAssignments').then(m => ({ default: m.TeacherAssignments })));
const DepartmentList = lazyWithRetry(() => import('./pages/departments/DepartmentList').then(m => ({ default: m.DepartmentList })));

// Form Studio & Schema Builder (Lazy Loaded with auto-retry)
const FormBuilderStudio = lazyWithRetry(() => import('./pages/form-builder/FormBuilderStudio').then(m => ({ default: m.FormBuilderStudio })));

// Public Form & Candidate Portal (Lazy Loaded with auto-retry)
const PublicFormView = lazyWithRetry(() => import('./pages/public/PublicFormView').then(m => ({ default: m.PublicFormView })));
const ApplicationTracking = lazyWithRetry(() => import('./pages/public/ApplicationTracking').then(m => ({ default: m.ApplicationTracking })));

// User & RBAC Management (Lazy Loaded with auto-retry)
const UserList = lazyWithRetry(() => import('./pages/users/UserList').then(m => ({ default: m.UserList })));
const RoleList = lazyWithRetry(() => import('./pages/users/RoleList').then(m => ({ default: m.RoleList })));

export const App: React.FC = () => {
  return (
    <I18nProvider>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Authentication & Setup Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/setup" element={<SystemSetup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Public Form & Application Tracking Routes (No login required) */}
            <Route path="/forms/:slug" element={<PublicFormView />} />
            <Route path="/f/:slug" element={<PublicFormView />} />
            <Route path="/apply/:type" element={<PublicFormView />} />
            <Route path="/track" element={<ApplicationTracking />} />
            <Route path="/track/:trackingNumber" element={<ApplicationTracking />} />

            {/* Authenticated Application Routes */}
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />

              {/* Submission Tracking Module */}
              <Route path="/submission-tracking" element={<SubmissionTracking />} />
              <Route path="/submission-tracking/:id" element={<SubmissionBatchDetails />} />

              {/* Lesson Plans Module */}
              <Route path="/lesson-plans" element={<LessonPlanList />} />
              <Route path="/lesson-plans/create" element={<CreateLessonPlan />} />
              <Route path="/lesson-plans/edit/:id" element={<CreateLessonPlan />} />
              <Route path="/lesson-plans/:id" element={<LessonPlanDetails />} />

              {/* Notices, Templates, Reports, Notifications */}
              <Route path="/notices" element={<NoticeBoard />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/calendar" element={<LessonPlanCalendar />} />

              {/* Academic Structure Module */}
              <Route path="/academic/years" element={<AcademicYears />} />
              <Route path="/academic/classes" element={<ClassesSections />} />
              <Route path="/academic/subjects" element={<SubjectsChapters />} />
              <Route path="/academic/assignments" element={<TeacherAssignments />} />
              <Route path="/departments" element={<DepartmentList />} />

              {/* Dynamic Form Studio & Schema Builder */}
              <Route path="/form-builder" element={<FormBuilderStudio />} />
              <Route path="/form-builder/:type" element={<FormBuilderStudio />} />

              {/* User & RBAC Management Module */}
              <Route path="/users" element={<UserList />} />
              <Route path="/roles" element={<RoleList />} />
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </I18nProvider>
  );
};

export default App;