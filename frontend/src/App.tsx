import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { I18nProvider } from './locales/i18n';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Auth Pages
import { Login } from './pages/auth/Login';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { Profile } from './pages/profile/Profile';

// Dashboard, Lesson Plans & Features
import { Dashboard } from './pages/dashboard/Dashboard';
import { LessonPlanList } from './pages/lesson-plans/LessonPlanList';
import { CreateLessonPlan } from './pages/lesson-plans/CreateLessonPlan';
import { LessonPlanDetails } from './pages/lesson-plans/LessonPlanDetails';
import { Templates } from './pages/templates/Templates';
import { Reports } from './pages/reports/Reports';
import { Notifications } from './pages/notifications/Notifications';
import { LessonPlanCalendar } from './pages/calendar/LessonPlanCalendar';
import { NoticeBoard } from './pages/notices/NoticeBoard';
import { SubmissionTracking } from './pages/submissions/SubmissionTracking';
import { SubmissionBatchDetails } from './pages/submissions/SubmissionBatchDetails';

// Academic Management Pages
import { AcademicYears } from './pages/academic/AcademicYears';
import { ClassesSections } from './pages/academic/ClassesSections';
import { SubjectsChapters } from './pages/academic/SubjectsChapters';
import { TeacherAssignments } from './pages/academic/TeacherAssignments';
import { DepartmentList } from './pages/departments/DepartmentList';

// User & RBAC Management
import { UserList } from './pages/users/UserList';
import { RoleList } from './pages/users/RoleList';

export const App: React.FC = () => {
  return (
    <I18nProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<Login />} />
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
      </BrowserRouter>
    </I18nProvider>
  );
};

export default App;