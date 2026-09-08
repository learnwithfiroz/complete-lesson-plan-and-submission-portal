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
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();
        $isTeacher = $user->hasRole('teacher') && !$user->hasRole(['super_admin', 'principal', 'academic_coordinator']);

        $baseQuery = LessonPlan::query();
        if ($isTeacher) {
            $baseQuery->where('teacher_id', $user->id);
        } elseif ($user->hasRole('academic_coordinator') && $user->department_id) {
            $baseQuery->where(function ($q) use ($user) {
                $q->where('department_id', $user->department_id)->orWhere('teacher_id', $user->id);
            });
        }

        $totalPlans = (clone $baseQuery)->count();
        $draftPlans = (clone $baseQuery)->where('status', 'draft')->count();
        $submittedPlans = (clone $baseQuery)->where('status', 'submitted')->count();
        $underReviewPlans = (clone $baseQuery)->where('status', 'under_review')->count();
        $approvedPlans = (clone $baseQuery)->where('status', 'approved')->count();
        $returnedPlans = (clone $baseQuery)->where('status', 'returned')->count();
        $rejectedPlans = (clone $baseQuery)->where('status', 'rejected')->count();

        // Weekly submission trends (last 7 days)
        $sevenDaysAgo = Carbon::today()->subDays(6);
        $dailySubmissions = (clone $baseQuery)
            ->where('lesson_date', '>=', $sevenDaysAgo)
            ->select(DB::raw('DATE(lesson_date) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->pluck('count', 'date');

        $trendDates = [];
        $trendCounts = [];
        for ($i = 6; $i >= 0; $i--) {
            $d = Carbon::today()->subDays($i)->format('Y-m-d');
            $trendDates[] = Carbon::parse($d)->format('M d');
            $trendCounts[] = $dailySubmissions[$d] ?? 0;
        }

        // Plans by Subject
        $plansBySubject = (clone $baseQuery)
            ->join('subjects', 'lesson_plans.subject_id', '=', 'subjects.id')
            ->select('subjects.name_en as subject_name', DB::raw('COUNT(*) as count'))
            ->groupBy('subjects.name_en')
            ->orderByDesc('count')
            ->limit(6)
            ->get();

        // Recent 5 Lesson Plans
        $recentPlans = (clone $baseQuery)
            ->with(['teacher', 'schoolClass', 'subject'])
            ->orderBy('created_at', 'desc')
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

        return response()->json([
            'status' => 'success',
            'data' => [
                'summary' => [
                    'total' => $totalPlans,
                    'draft' => $draftPlans,
                    'submitted' => $submittedPlans,
                    'under_review' => $underReviewPlans,
                    'approved' => $approvedPlans,
                    'returned' => $returnedPlans,
                    'rejected' => $rejectedPlans,
                ],
                'submission_trends' => [
                    'labels' => $trendDates,
                    'data' => $trendCounts,
                ],
                'plans_by_subject' => $plansBySubject,
                'recent_plans' => $recentPlans,
                'admin_overview' => $adminOverview,
            ],
        ]);
    }
}