import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { I18nProvider } from './locales/i18n';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PageLoader } from './components/feedback/PageLoader';

// Auth & Setup Pages (Lazy Loaded)
const Login = lazy(() => import('./pages/auth/Login').then(m => ({ default: m.Login })));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword').then(m => ({ default: m.ResetPassword })));
const SystemSetup = lazy(() => import('./pages/setup/SystemSetup').then(m => ({ default: m.SystemSetup })));
const Profile = lazy(() => import('./pages/profile/Profile').then(m => ({ default: m.Profile })));

// Dashboard, Lesson Plans & Features (Lazy Loaded)
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard').then(m => ({ default: m.Dashboard })));
const LessonPlanList = lazy(() => import('./pages/lesson-plans/LessonPlanList').then(m => ({ default: m.LessonPlanList })));
const CreateLessonPlan = lazy(() => import('./pages/lesson-plans/CreateLessonPlan').then(m => ({ default: m.CreateLessonPlan })));
const LessonPlanDetails = lazy(() => import('./pages/lesson-plans/LessonPlanDetails').then(m => ({ default: m.LessonPlanDetails })));
const Templates = lazy(() => import('./pages/templates/Templates').then(m => ({ default: m.Templates })));
const Reports = lazy(() => import('./pages/reports/Reports').then(m => ({ default: m.Reports })));
const Notifications = lazy(() => import('./pages/notifications/Notifications').then(m => ({ default: m.Notifications })));
const LessonPlanCalendar = lazy(() => import('./pages/calendar/LessonPlanCalendar').then(m => ({ default: m.LessonPlanCalendar })));
const NoticeBoard = lazy(() => import('./pages/notices/NoticeBoard').then(m => ({ default: m.NoticeBoard })));
const SubmissionTracking = lazy(() => import('./pages/submissions/SubmissionTracking').then(m => ({ default: m.SubmissionTracking })));
const SubmissionBatchDetails = lazy(() => import('./pages/submissions/SubmissionBatchDetails').then(m => ({ default: m.SubmissionBatchDetails })));

// Academic Management Pages (Lazy Loaded)
const AcademicYears = lazy(() => import('./pages/academic/AcademicYears').then(m => ({ default: m.AcademicYears })));
const ClassesSections = lazy(() => import('./pages/academic/ClassesSections').then(m => ({ default: m.ClassesSections })));
const SubjectsChapters = lazy(() => import('./pages/academic/SubjectsChapters').then(m => ({ default: m.SubjectsChapters })));
const TeacherAssignments = lazy(() => import('./pages/academic/TeacherAssignments').then(m => ({ default: m.TeacherAssignments })));
const DepartmentList = lazy(() => import('./pages/departments/DepartmentList').then(m => ({ default: m.DepartmentList })));

// User & RBAC Management (Lazy Loaded)
const UserList = lazy(() => import('./pages/users/UserList').then(m => ({ default: m.UserList })));
const RoleList = lazy(() => import('./pages/users/RoleList').then(m => ({ default: m.RoleList })));

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