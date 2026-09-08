# School Lesson Plan Management System
**Baridhara Scholars' International School and College (BSISC), Dhaka Cantonment**

A production-ready, full-stack enterprise web application for curriculum and instructional lesson plan management. Built with a decoupled **Laravel REST API** backend and **React SPA (TypeScript + Vite)** frontend.

---

## 🏛️ Institutional Profile
- **Institution**: Baridhara Scholars' International School and College (BSISC)
- **Location**: DOHS Baridhara, Dhaka Cantonment, Dhaka-1206
- **EIIN**: 134156 | **School Code**: 1085 | **College Code**: 1088
- **Primary Brand Colors**: Deep Navy Blue (`#0f2e5a`), Emerald Green (`#10b981`), Light Gray (`#f8fafc`)
- **Default Language**: **বাংলা (Bengali)** with instant toggle to **English**

---

## 🚀 Technology Stack

### Backend (Laravel REST API)
- **Framework**: Laravel 12 (PHP 8.2+)
- **Database**: MySQL 8.0 with InnoDB foreign key constraints and strict relational integrity
- **Authentication**: Laravel Sanctum SPA session/cookie-based stateful authentication
- **Authorization**: Granular RBAC (Roles & Permissions) with Laravel Form Requests & Policies
- **PDF Generation**: DomPDF (`barryvdh/laravel-dompdf`) for official BSISC printable lesson plan sheets
- **Reporting**: Streaming CSV/Excel exports for teacher compliance and departmental matrix
- **Audit & History**: Immutable workflow transition history, reviewer feedback logs, and activity audit trails
- **Testing**: PHPUnit feature test suite (22 tests, 154 assertions passing)

### Frontend (React SPA)
- **Framework**: React 18 with Vite and TypeScript (Strict Mode)
- **UI Framework**: Bootstrap 5 + React-Bootstrap + Custom Institutional Theme (`custom.css`)
- **State Management**: Zustand (`authStore.ts`) with persistent session recovery
- **Form Management**: React Hook Form + Zod schema validation
- **Data Visualization**: Chart.js + React-Chartjs-2 (Submission trends & Status breakdown charts)
- **Internationalization (i18n)**: Bilingual Engine (Bengali default, English fallback)
- **Icons**: Lucide React

---

## 🔐 Default Demo Accounts & Role Hierarchy

All seeded accounts use the password: `Password123!`

| Role | Name | Email | Permissions & Capabilities |
| :--- | :--- | :--- | :--- |
| **Super Admin** | System Administrator | `admin@bsisc.edu.bd` | Full system control, RBAC configuration, user management, settings |
| **Principal** | Brig Gen (Retd) Principal | `principal@bsisc.edu.bd` | Final approval of all lesson plans, institution analytics, compliance reports |
| **Academic Coordinator** | Prof. Dr. Nasreen Sultana | `coordinator@bsisc.edu.bd` | Departmental review, start review, approve, return for correction, reject, assign teachers |
| **Senior Teacher** | Mohammad Tanvir Ahmed | `teacher1@bsisc.edu.bd` | 5-Stage lesson plan wizard, save draft, duplicate, submit for review, PDF export |
| **Assistant Teacher** | Farhana Yasmin | `teacher2@bsisc.edu.bd` | Lesson plan creation and submission for assigned classes |

---

## 🛠️ Step-by-Step Installation & Running Guide

### 1. Database Configuration
Ensure MySQL 8.0 is running on `127.0.0.1:3306`:
- Database name: `school_lesson_plan`
- User: `root`
- Password: `1234` (or configure in `.env`)

### 2. Backend Setup
```bash
cd e:/Lessonplan/backend

# Install PHP dependencies (if not already installed)
composer install

# Generate application key & run migrations with seeders
php artisan key:generate
php artisan migrate:fresh --seed

# Run backend feature test suite
php artisan test

# Start the Laravel REST API server (Port 8000)
php artisan serve
```

### 3. Frontend Setup
```bash
cd e:/Lessonplan/frontend

# Install Node dependencies (if not already installed)
npm install

# Build frontend to verify TypeScript types
npm run build

# Start Vite development server (Port 5173)
npm run dev
```

Open your browser at `http://localhost:5173` to access the application.

---

## 📋 Key Modules & Features

### 1. 5-Stage Lesson Plan Creation Wizard
- **Step 1: Basic Information**: Title, Topic, Year, Term, Class, Section, Subject, Chapter, Date, Period, Duration.
- **Step 2: Learning Information**: Prior knowledge, Bloom's Taxonomy measurable outcomes table, multi-select teaching methods, instructional materials.
- **Step 3: 5-Stage Procedure Table**: Introduction, Presentation, Guided Practice, Group Work, Assessment, Conclusion with real-time total duration tracking vs planned minutes.
- **Step 4: Assessment & Differentiation**: Formative assessment strategies, success criteria, remedial activities for struggling learners, advanced extension tasks, homework, reflection.
- **Step 5: Preview & Submission**: BSISC institutional sheet layout preview with single-click draft save or direct submission.

### 2. Review & Approval Workflow
- **State Machine**: `Draft` ➔ `Submitted` ➔ `Under Review` ➔ `Approved` / `Returned (Corrections Required)` / `Rejected`.
- **Reviewer Modal**: Coordinators and Principals can review side-by-side, input mandatory feedback, return with revision requests, or grant final approval.
- **Immutable Audit Trail**: Every status change records timestamp, actor role, and comment in the timeline.

### 3. Interactive Dashboard & Analytics
- Role-tailored stats cards: Total Plans, Pending Review, Approved, Returned.
- Weekly submission trend bar chart and status distribution doughnut chart.
- Quick action shortcuts and recent plan activity list.

### 4. Departmental Reports & Data Export
- Departmental matrix showing total plans, approved count, and approval percentage.
- Teacher compliance table tracking submission ratios.
- One-click UTF-8 CSV/Excel export and DomPDF printable lesson plan document.

### 5. Academic Structure & Teacher Allocations
- Academic Years & Terms management with active session indicators.
- Class and Section capacity management.
- Subjects & Chapter syllabus tracking.
- Teacher subject-class allocations (`/academic/assignments` & `/api/v1/academic/my-assignments`).
