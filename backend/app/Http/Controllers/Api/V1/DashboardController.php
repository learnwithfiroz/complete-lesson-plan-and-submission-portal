<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\LessonPlan;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\TeacherAssignment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();

        try {
            $isTeacher = $user->hasRole('teacher') && !$user->hasRole(['super_admin', 'principal', 'academic_coordinator']);

            $baseQuery = LessonPlan::query();
            if ($isTeacher) {
                $baseQuery->where('lesson_plans.teacher_id', $user->id);
            } elseif ($user->hasRole('academic_coordinator') && $user->department_id) {
                $baseQuery->where(function ($q) use ($user) {
                    $q->where('lesson_plans.department_id', $user->department_id)
                      ->orWhere('lesson_plans.teacher_id', $user->id);
                });
            }

            // Single aggregated status count query
            $agg = (clone $baseQuery)
                ->selectRaw("
                    COUNT(*) as total,
                    COALESCE(SUM(CASE WHEN lesson_plans.status = 'draft' THEN 1 ELSE 0 END), 0) as draft,
                    COALESCE(SUM(CASE WHEN lesson_plans.status = 'submitted' THEN 1 ELSE 0 END), 0) as submitted,
                    COALESCE(SUM(CASE WHEN lesson_plans.status = 'under_review' THEN 1 ELSE 0 END), 0) as under_review,
                    COALESCE(SUM(CASE WHEN lesson_plans.status = 'approved' THEN 1 ELSE 0 END), 0) as approved,
                    COALESCE(SUM(CASE WHEN lesson_plans.status = 'returned' THEN 1 ELSE 0 END), 0) as returned,
                    COALESCE(SUM(CASE WHEN lesson_plans.status = 'rejected' THEN 1 ELSE 0 END), 0) as rejected
                ")
                ->first();

            // Weekly submission trends (last 7 days)
            $sevenDaysAgo = Carbon::today()->subDays(6);
            $dailySubmissions = (clone $baseQuery)
                ->where('lesson_plans.lesson_date', '>=', $sevenDaysAgo)
                ->select(DB::raw('DATE(lesson_plans.lesson_date) as date'), DB::raw('COUNT(*) as count'))
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->pluck('count', 'date');

            $trendDates = [];
            $trendCounts = [];
            for ($i = 6; $i >= 0; $i--) {
                $d = Carbon::today()->subDays($i)->format('Y-m-d');
                $trendDates[] = Carbon::parse($d)->format('M d');
                $trendCounts[] = (int)($dailySubmissions[$d] ?? 0);
            }

            // Plans by Subject (safely qualified)
            $plansBySubject = (clone $baseQuery)
                ->join('subjects', 'lesson_plans.subject_id', '=', 'subjects.id')
                ->select('subjects.name_en as subject_name', DB::raw('COUNT(lesson_plans.id) as count'))
                ->groupBy('subjects.name_en', 'subjects.id')
                ->orderByDesc('count')
                ->limit(6)
                ->get();

            // Recent 5 Lesson Plans
            $recentPlans = (clone $baseQuery)
                ->with(['teacher.department', 'schoolClass', 'subject'])
                ->orderBy('lesson_plans.created_at', 'desc')
                ->limit(5)
                ->get();

            // Institutional summary for admins
            $adminOverview = null;
            if (!$isTeacher) {
                $adminOverview = [
                    'total_teachers' => User::whereHas('roles', fn($q) => $q->where('name', 'teacher'))->count(),
                    'total_classes' => SchoolClass::count(),
                    'total_subjects' => Subject::count(),
                    'active_year' => AcademicYear::where('is_current', true)->first()?->name ?? '2026',
                ];
            }

            $data = [
                'summary' => [
                    'total' => (int)($agg->total ?? 0),
                    'draft' => (int)($agg->draft ?? 0),
                    'submitted' => (int)($agg->submitted ?? 0),
                    'under_review' => (int)($agg->under_review ?? 0),
                    'approved' => (int)($agg->approved ?? 0),
                    'returned' => (int)($agg->returned ?? 0),
                    'rejected' => (int)($agg->rejected ?? 0),
                ],
                'submission_trends' => [
                    'labels' => $trendDates,
                    'data' => $trendCounts,
                ],
                'plans_by_subject' => $plansBySubject,
                'recent_plans' => $recentPlans,
                'admin_overview' => $adminOverview,
            ];
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Dashboard stats error: ' . $e->getMessage());
            $data = [
                'summary' => ['total' => 0, 'draft' => 0, 'submitted' => 0, 'under_review' => 0, 'approved' => 0, 'returned' => 0, 'rejected' => 0],
                'submission_trends' => ['labels' => [], 'data' => []],
                'plans_by_subject' => [],
                'recent_plans' => [],
                'admin_overview' => null,
            ];
        }

        return response()->json([
            'status' => 'success',
            'data' => $data,
        ]);
    }
}