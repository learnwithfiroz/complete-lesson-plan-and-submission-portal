import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from '../../locales/i18n';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard,
  Megaphone,
  FileText,
  PlusCircle,
  Copy,
  BarChart3,
  Calendar,
  GraduationCap,
  BookOpen,
  UserCheck,
  Users,
  ShieldCheck,
  Bell,
  CheckSquare,
  Sliders,
  Briefcase,
  Layers,
  Sparkles,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const { t } = useTranslation();
  const { hasRole } = useAuthStore();

  const isAdminOrCoord = hasRole(['super_admin', 'principal', 'academic_coordinator']);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="sidebar-backdrop d-lg-none"
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1040,
          }}
        />
      )}

      <aside
        className={`institutional-sidebar d-flex flex-column flex-shrink-0 p-3 bg-primary text-white ${isOpen ? 'show' : ''}`}
        style={{
          width: '260px',
          minHeight: '100vh',
          zIndex: 1050,
        }}
      >
        <div className="d-flex align-items-center justify-content-between mb-4 text-white text-decoration-none">
          <div className="d-flex align-items-center">
            <img
              src="/logo.png"
              alt="BSISC Logo"
              style={{ width: 40, height: 40, objectFit: 'contain' }}
              className="rounded bg-white p-1 me-2 shadow-sm"
            />
            <div>
              <div className="fw-bold fs-6 leading-tight">BSISC Lesson Plan</div>
              <small className="text-white-50" style={{ fontSize: '10px' }}>EIIN: 133988 | Code: 1242</small>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            type="button"
            className="btn btn-link text-white p-1 d-lg-none"
            onClick={onCloseMobile}
            aria-label="Close Sidebar"
          >
            <X size={20} />
          </button>
        </div>

      <ul 
        className="nav nav-pills flex-column mb-auto gap-1"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('a')) {
            onCloseMobile?.();
          }
        }}
      >
        {/* Dashboard */}
        <li className="nav-item">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-link text-white d-flex align-items-center ${isActive ? 'bg-secondary' : 'opacity-75'}`}
          >
            <LayoutDashboard size={16} className="me-2" />
            {t('nav.dashboard')}
          </NavLink>
        </li>

        {/* Submission Tracking */}
        <li className="nav-item">
          <NavLink
            to="/submission-tracking"
            className={({ isActive }) => `nav-link text-white d-flex align-items-center ${isActive ? 'bg-secondary fw-bold' : 'opacity-75'}`}
          >
            <CheckSquare size={16} className="me-2 text-info" />
            Submission Tracking
          </NavLink>
        </li>

        {/* Notice Board */}
        <li className="nav-item">
          <NavLink
            to="/notices"
            className={({ isActive }) => `nav-link text-white d-flex align-items-center ${isActive ? 'bg-secondary' : 'opacity-75'}`}
          >
            <Megaphone size={16} className="me-2 text-warning" />
            {t('nav.notices', 'Live Notices')}
          </NavLink>
        </li>

        {/* Lesson Plans */}
        <li className="nav-item">
          <NavLink
            to="/lesson-plans"
            end
            className={({ isActive }) => `nav-link text-white d-flex align-items-center ${isActive ? 'bg-secondary' : 'opacity-75'}`}
          >
            <FileText size={16} className="me-2" />
            {t('nav.lesson_plans')}
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink
            to="/lesson-plans/create"
            className={({ isActive }) => `nav-link text-white d-flex align-items-center ${isActive ? 'bg-secondary' : 'opacity-75'}`}
          >
            <PlusCircle size={16} className="me-2" />
            {t('nav.create_lesson_plan')}
          </NavLink>
        </li>

                {/* Calendar */}
        <li className="nav-item">
          <NavLink
            to="/calendar"
            className={({ isActive }) => `nav-link text-white d-flex align-items-center ${isActive ? 'bg-secondary' : 'opacity-75'}`}
          >
            <Calendar size={16} className="me-2" />
            Curriculum Calendar
          </NavLink>
        </li>

        {/* Templates */}
        <li className="nav-item">
          <NavLink
            to="/templates"
            className={({ isActive }) => `nav-link text-white d-flex align-items-center ${isActive ? 'bg-secondary' : 'opacity-75'}`}
          >
            <Copy size={16} className="me-2" />
            {t('nav.templates')}
          </NavLink>
        </li>

        {/* Reports */}
        <li className="nav-item">
          <NavLink
            to="/reports"
            className={({ isActive }) => `nav-link text-white d-flex align-items-center ${isActive ? 'bg-secondary' : 'opacity-75'}`}
          >
            <BarChart3 size={16} className="me-2" />
            {t('nav.reports')}
          </NavLink>
        </li>

        {/* Notifications */}
        <li className="nav-item">
          <NavLink
            to="/notifications"
            className={({ isActive }) => `nav-link text-white d-flex align-items-center ${isActive ? 'bg-secondary' : 'opacity-75'}`}
          >
            <Bell size={16} className="me-2" />
            Notifications
          </NavLink>
        </li>

        {/* Form Builder Studio Section */}
        {isAdminOrCoord && (
          <>
            <li className="nav-header text-white-50 small mt-3 mb-1 px-3 text-uppercase fw-bold d-flex align-items-center justify-content-between">
              <span>Form Builder Studio</span>
              <span className="badge bg-warning text-dark font-monospace" style={{ fontSize: '9px' }}>PRO</span>
            </li>

            <li className="nav-item">
              <NavLink
                to="/form-builder/admission"
                className={({ isActive }) => `nav-link text-white d-flex align-items-center ${isActive ? 'bg-secondary fw-bold text-success' : 'opacity-75'}`}
              >
                <Sliders size={16} className="me-2 text-warning" />
                Admission Form Builder
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/form-builder/job"
                className={({ isActive }) => `nav-link text-white d-flex align-items-center ${isActive ? 'bg-secondary' : 'opacity-75'}`}
              >
                <Briefcase size={16} className="me-2 text-info" />
                Job Application Form
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/form-builder/tender"
                className={({ isActive }) => `nav-link text-white d-flex align-items-center ${isActive ? 'bg-secondary' : 'opacity-75'}`}
              >
                <Layers size={16} className="me-2 text-light" />
                Tender Bid Form
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/form-builder/custom"
                className={({ isActive }) => `nav-link text-white d-flex align-items-center ${isActive ? 'bg-secondary fw-bold text-success' : 'opacity-75'}`}
              >
                <Sparkles size={16} className="me-2 text-success" />
                Custom Form Builder
              </NavLink>
            </li>
          </>
        )}

        {/* Academic Structure Section */}
        {isAdminOrCoord && (
          <>
            <li className="nav-header text-white-50 small mt-3 mb-1 px-3 text-uppercase fw-bold">
              {t('nav.academic')}
            </li>

            <li className="nav-item">
              <NavLink
                to="/academic/years"
                className={({ isActive }) => `nav-link text-white d-flex align-items-center ${isActive ? 'bg-secondary' : 'opacity-75'}`}
              >
                <Calendar size={16} className="me-2" />
                {t('nav.academic_years')}
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/academic/classes"
                className={({ isActive }) => `nav-link text-white d-flex align-items-center ${isActive ? 'bg-secondary' : 'opacity-75'}`}
              >
                <GraduationCap size={16} className="me-2" />
                {t('nav.classes_sections')}
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/academic/subjects"
                className={({ isActive }) => `nav-link text-white d-flex align-items-center ${isActive ? 'bg-secondary' : 'opacity-75'}`}
              >
                <BookOpen size={16} className="me-2" />
                {t('nav.subjects_chapters')}
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/academic/assignments"
                className={({ isActive }) => `nav-link text-white d-flex align-items-center ${isActive ? 'bg-secondary' : 'opacity-75'}`}
              >
                <UserCheck size={16} className="me-2" />
                {t('nav.teacher_assignments')}
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink
                to="/departments"
                className={({ isActive }) => `nav-link text-white d-flex align-items-center ${isActive ? 'bg-secondary' : 'opacity-75'}`}
              >
                <GraduationCap size={16} className="me-2" />
                একাডেমিক বিভাগসমূহ (Departments)
              </NavLink>
            </li>
          </>
        )}

        {/* User Management Section */}
        {hasRole(['super_admin', 'principal']) && (
          <>
            <li className="nav-header text-white-50 small mt-3 mb-1 px-3 text-uppercase fw-bold">
              {t('nav.users')}
            </li>

            <li className="nav-item">
              <NavLink
                to="/users"
                className={({ isActive }) => `nav-link text-white d-flex align-items-center ${isActive ? 'bg-secondary' : 'opacity-75'}`}
              >
                <Users size={16} className="me-2" />
                {t('nav.users')}
              </NavLink>
            </li>

            {hasRole('super_admin') && (
              <li className="nav-item">
                <NavLink
                  to="/roles"
                  className={({ isActive }) => `nav-link text-white d-flex align-items-center ${isActive ? 'bg-secondary' : 'opacity-75'}`}
                >
                  <ShieldCheck size={16} className="me-2" />
                  {t('nav.roles_permissions')}
                </NavLink>
              </li>
            )}
          </>
        )}
      </ul>

      {/* Footer info */}
      <div className="border-top border-secondary pt-3 mt-auto small text-white-50 text-center">
        BSISC Lesson System v1.0
      </div>
    </aside>
  </>
  );
};