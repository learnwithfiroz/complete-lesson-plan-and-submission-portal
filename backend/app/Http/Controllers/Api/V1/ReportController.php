<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\LessonPlan;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $plansByDepartment = Department::withCount([
            'lessonPlans as total_plans',
            'lessonPlans as approved_plans' => fn($q) => $q->where('status', 'approved'),
            'lessonPlans as submitted_plans' => fn($q) => $q->where('status', 'submitted'),
            'lessonPlans as returned_plans' => fn($q) => $q->where('status', 'returned'),
        ])->get();

        $teachersSummary = User::whereHas('roles', fn($q) => $q->where('name', 'teacher'))
            ->with('department')
            ->withCount([
                'lessonPlans as total_plans',
                'lessonPlans as approved_plans' => fn($q) => $q->where('status', 'approved'),
                'lessonPlans as pending_plans' => fn($q) => $q->whereIn('status', ['submitted', 'under_review']),
                'lessonPlans as returned_plans' => fn($q) => $q->where('status', 'returned'),
            ])
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'department_summary' => $plansByDepartment,
                'teachers_summary' => $teachersSummary,
            ],
        ]);
    }

    public function exportExcel(Request $request): StreamedResponse
    {
        $fileName = 'BSISC_Lesson_Plans_Report_' . date('Y_m_d_His') . '.csv';

        $query = LessonPlan::with(['teacher', 'academicYear', 'schoolClass', 'section', 'subject']);
        if ($request->filled('status')) $query->where('status', $request->status);
        if ($request->filled('academic_year_id')) $query->where('academic_year_id', $request->academic_year_id);
        if ($request->filled('class_id')) $query->where('class_id', $request->class_id);

        $plans = $query->get();

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($plans) {
            $output = fopen('php://output', 'w');
            fputs($output, "\xEF\xBB\xBF"); // UTF-8 BOM for Excel Bengali/English support

            // CSV Header row
            fputcsv($output, [
                'Plan Code',
                'Title',
                'Teacher Name',
                'Teacher Email',
                'Academic Year',
                'Class',
                'Section',
                'Subject',
                'Lesson Date',
                'Duration (Mins)',
                'Period',
                'Status',
                'Created At',
            ]);

            foreach ($plans as $p) {
                fputcsv($output, [
                    $p->code,
                    $p->title,
                    $p->teacher->name ?? 'N/A',
                    $p->teacher->email ?? 'N/A',
                    $p->academicYear->name ?? 'N/A',
                    $p->schoolClass->name_en ?? 'N/A',
                    $p->section->name_en ?? 'N/A',
                    $p->subject->name_en ?? 'N/A',
                    $p->lesson_date,
                    $p->duration_minutes,
                    $p->period_number,
                    ucfirst($p->status),
                    $p->created_at->format('Y-m-d H:i'),
                ]);
            }

            fclose($output);
        };

        return response()->stream($callback, 200, $headers);
    }
}