<?php

use App\Http\Controllers\Api\V1\AcademicYearController;
use App\Http\Controllers\Api\V1\AuditLogController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BulkImportController;
use App\Http\Controllers\Api\V1\ClassController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\DepartmentController;
use App\Http\Controllers\Api\V1\LessonPlanController;
use App\Http\Controllers\Api\V1\LessonPlanTemplateController;
use App\Http\Controllers\Api\V1\NoticeController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\FormSchemaController;
use App\Http\Controllers\Api\V1\PublicSettingsController;
use App\Http\Controllers\Api\V1\ReportController;
use App\Http\Controllers\Api\V1\RoleController;
use App\Http\Controllers\Api\V1\SubjectController;
use App\Http\Controllers\Api\V1\SubmissionTrackingController;
use App\Http\Controllers\Api\V1\SystemDeployController;
use App\Http\Controllers\Api\V1\TeacherAssignmentController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Public Endpoints
    Route::get('/settings/public', [PublicSettingsController::class, 'index']);
    Route::get('/form-schemas/default/{form_type?}', [FormSchemaController::class, 'getDefault']);
    Route::get('/system/status', [SystemDeployController::class, 'systemStatus']);
    Route::match(['get', 'post'], '/system/setup', [SystemDeployController::class, 'autoSetup']);
    Route::match(['get', 'post'], '/system/auto-migrate', [SystemDeployController::class, 'autoMigrate']);
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:60,1');
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:20,1');
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);


    // Authenticated Routes
    Route::middleware(['auth:sanctum'])->group(function () {
        // Auth & Profile
        Route::get('/user', [AuthController::class, 'user']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/logout-all-devices', [AuthController::class, 'logoutAllDevices']);
        Route::get('/profile', [ProfileController::class, 'show']);
        Route::put('/profile', [ProfileController::class, 'update']);
        Route::put('/profile/change-password', [ProfileController::class, 'changePassword']);
        Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar']);
        Route::delete('/profile/avatar', [ProfileController::class, 'deleteAvatar']);
        Route::get('/profile/login-history', [ProfileController::class, 'loginHistory']);

        // Dashboard Stats
        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

        // User Management CRUD
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::get('/users/{user}', [UserController::class, 'show']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::patch('/users/{user}/toggle-status', [UserController::class, 'toggleStatus']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);

        // Roles & Permissions
        Route::get('/roles', [RoleController::class, 'index']);
        Route::get('/roles/{role}', [RoleController::class, 'show']);
        Route::put('/roles/{role}/permissions', [RoleController::class, 'updatePermissions']);
        Route::get('/permissions', [RoleController::class, 'permissions']);

        // Departments
        Route::get('/departments', [DepartmentController::class, 'index']);
        Route::post('/departments', [DepartmentController::class, 'store']);
        Route::get('/departments/{department}', [DepartmentController::class, 'show']);
        Route::put('/departments/{department}', [DepartmentController::class, 'update']);
        Route::delete('/departments/{department}', [DepartmentController::class, 'destroy']);

        // Academic Structure
        Route::get('/academic/years', [AcademicYearController::class, 'index']);
        Route::post('/academic/years', [AcademicYearController::class, 'store']);
        Route::get('/academic/years/{academicYear}', [AcademicYearController::class, 'show']);
        Route::put('/academic/years/{academicYear}', [AcademicYearController::class, 'update']);
        Route::delete('/academic/years/{academicYear}', [AcademicYearController::class, 'destroy']);
        Route::patch('/academic/years/{academicYear}/set-current', [AcademicYearController::class, 'setCurrent']);

        Route::post('/academic/terms', [AcademicYearController::class, 'storeTerm']);
        Route::put('/academic/terms/{term}', [AcademicYearController::class, 'updateTerm']);
        Route::delete('/academic/terms/{term}', [AcademicYearController::class, 'destroyTerm']);

        Route::get('/academic/classes', [ClassController::class, 'index']);
        Route::post('/academic/classes', [ClassController::class, 'store']);
        Route::get('/academic/classes/{class}', [ClassController::class, 'show']);
        Route::put('/academic/classes/{class}', [ClassController::class, 'update']);
        Route::delete('/academic/classes/{class}', [ClassController::class, 'destroy']);

        Route::post('/academic/sections', [ClassController::class, 'storeSection']);
        Route::put('/academic/sections/{section}', [ClassController::class, 'updateSection']);
        Route::delete('/academic/sections/{section}', [ClassController::class, 'destroySection']);

        Route::get('/academic/subjects', [SubjectController::class, 'index']);
        Route::post('/academic/subjects', [SubjectController::class, 'store']);
        Route::get('/academic/subjects/{subject}', [SubjectController::class, 'show']);
        Route::put('/academic/subjects/{subject}', [SubjectController::class, 'update']);
        Route::delete('/academic/subjects/{subject}', [SubjectController::class, 'destroy']);

        Route::post('/academic/chapters', [SubjectController::class, 'storeChapter']);
        Route::put('/academic/chapters/{chapter}', [SubjectController::class, 'updateChapter']);
        Route::delete('/academic/chapters/{chapter}', [SubjectController::class, 'destroyChapter']);

        Route::get('/academic/teacher-assignments', [TeacherAssignmentController::class, 'index']);
        Route::post('/academic/teacher-assignments', [TeacherAssignmentController::class, 'store']);
        Route::delete('/academic/teacher-assignments/{teacherAssignment}', [TeacherAssignmentController::class, 'destroy']);
        Route::get('/academic/my-assignments', [TeacherAssignmentController::class, 'myAssignments']);

        // Lesson Plans CRUD, Workflow & PDF
        Route::get('/lesson-plans-calendar', [LessonPlanController::class, 'calendar']);
        Route::post('/users/import-teachers', [BulkImportController::class, 'importTeachers']);
        Route::post('/academic/import-subjects', [BulkImportController::class, 'importSubjects']);
        Route::get('/lesson-plans', [LessonPlanController::class, 'index']);
        Route::post('/lesson-plans', [LessonPlanController::class, 'store']);
        Route::get('/lesson-plans/{lessonPlan}', [LessonPlanController::class, 'show']);
        Route::put('/lesson-plans/{lessonPlan}', [LessonPlanController::class, 'update']);
        Route::delete('/lesson-plans/{lessonPlan}', [LessonPlanController::class, 'destroy']);
        Route::post('/lesson-plans/{lessonPlan}/duplicate', [LessonPlanController::class, 'duplicate']);
        Route::post('/lesson-plans/{lessonPlan}/upload-attachment', [LessonPlanController::class, 'uploadAttachment']);

        Route::post('/lesson-plans/{lessonPlan}/submit', [LessonPlanController::class, 'submit']);
        Route::post('/lesson-plans/{lessonPlan}/start-review', [LessonPlanController::class, 'startReview']);
        Route::post('/lesson-plans/{lessonPlan}/approve', [LessonPlanController::class, 'approve']);
        Route::post('/lesson-plans/{lessonPlan}/return', [LessonPlanController::class, 'returnForCorrection']);
        Route::post('/lesson-plans/{lessonPlan}/reject', [LessonPlanController::class, 'reject']);
        Route::post('/lesson-plans/{lessonPlan}/archive', [LessonPlanController::class, 'archive']);
        Route::post('/lesson-plans/{lessonPlan}/restore', [LessonPlanController::class, 'restore']);
        Route::get('/lesson-plans/{lessonPlan}/pdf', [LessonPlanController::class, 'viewPdf']);
        Route::get('/lesson-plans/{lessonPlan}/download-pdf', [LessonPlanController::class, 'downloadPdf']);

        // Template Management
        Route::get('/templates', [LessonPlanTemplateController::class, 'index']);
        Route::post('/templates', [LessonPlanTemplateController::class, 'store']);
        Route::get('/templates/{template}', [LessonPlanTemplateController::class, 'show']);
        Route::delete('/templates/{template}', [LessonPlanTemplateController::class, 'destroy']);

        // Reports & Exports
        Route::get('/reports/summary', [ReportController::class, 'summary']);
        Route::get('/reports/export/excel', [ReportController::class, 'exportExcel']);

        // Live Notices & Announcements
        Route::get('/notices/live-ticker', [NoticeController::class, 'liveTicker']);
        Route::get('/notices', [NoticeController::class, 'index']);
        Route::post('/notices', [NoticeController::class, 'store']);
        Route::get('/notices/{notice}', [NoticeController::class, 'show']);
        Route::post('/notices/{notice}', [NoticeController::class, 'update']);
        Route::put('/notices/{notice}', [NoticeController::class, 'update']);
        Route::delete('/notices/{notice}', [NoticeController::class, 'destroy']);
        Route::patch('/notices/{notice}/toggle-pin', [NoticeController::class, 'togglePin']);
        Route::patch('/notices/{notice}/toggle-publish', [NoticeController::class, 'togglePublish']);
        Route::get('/notices/{notice}/attachment', [NoticeController::class, 'downloadAttachment']);
        Route::post('/notices/{notice}/read', [NoticeController::class, 'markAsRead']);
        Route::get('/notices/{notice}/readers', [NoticeController::class, 'readers']);

        // Notifications & Audit Logs
        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::get('/audit-logs', [AuditLogController::class, 'index']);

        // Submission Tracking & Google Drive Integration
        Route::get('/submission-tracking/drive-status', [SubmissionTrackingController::class, 'getGoogleDriveStatus']);
        Route::get('/submission-tracking', [SubmissionTrackingController::class, 'index']);
        Route::post('/submission-tracking', [SubmissionTrackingController::class, 'store']);
        Route::get('/submission-tracking/{batch}', [SubmissionTrackingController::class, 'show']);
        Route::post('/submission-tracking/{batch}/sync-drive', [SubmissionTrackingController::class, 'syncDrive']);
        Route::get('/submission-tracking/{batch}/download-all-zip', [SubmissionTrackingController::class, 'downloadAllZip']);
        Route::get('/submission-tracking/{batch}/sunday-report', [SubmissionTrackingController::class, 'exportSundayReport']);
        Route::patch('/submission-tracking/{batch}/toggle-active', [SubmissionTrackingController::class, 'toggleActive']);
        Route::delete('/submission-tracking/{batch}', [SubmissionTrackingController::class, 'destroy']);
        Route::post('/submission-tracking/{batch}/submit', [SubmissionTrackingController::class, 'submitFiles']);
        Route::delete('/submission-tracking/files/{file}', [SubmissionTrackingController::class, 'deleteFile']);
        Route::patch('/submission-tracking/submissions/{submission}/status', [SubmissionTrackingController::class, 'updateSubmissionStatus']);

        // Dynamic Form Studio & Schema Builder CRUD
        Route::get('/form-schemas', [FormSchemaController::class, 'index']);
        Route::post('/form-schemas', [FormSchemaController::class, 'store']);
        Route::get('/form-schemas/{formSchema}', [FormSchemaController::class, 'show']);
        Route::put('/form-schemas/{formSchema}', [FormSchemaController::class, 'update']);
        Route::post('/form-schemas/{formSchema}/duplicate', [FormSchemaController::class, 'duplicate']);
        Route::delete('/form-schemas/{formSchema}', [FormSchemaController::class, 'destroy']);
    });
});