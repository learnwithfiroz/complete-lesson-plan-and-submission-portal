<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\LessonPlans\StoreLessonPlanRequest;
use App\Http\Requests\V1\LessonPlans\UpdateLessonPlanRequest;
use App\Http\Resources\V1\LessonPlanResource;
use App\Models\LessonPlan;
use App\Services\LessonPlanService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class LessonPlanController extends Controller
{
    use ApiResponseTrait;

    public function __construct(
        protected LessonPlanService $lessonPlanService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = LessonPlan::with([
            'teacher.department',
            'academicYear',
            'term',
            'schoolClass',
            'section',
            'subject',
            'chapter',
        ]);

        // Role-based visibility
        if ($user->hasRole('teacher') && !$user->hasRole(['super_admin', 'principal', 'academic_coordinator'])) {
            $query->where('teacher_id', $user->id);
        } elseif ($user->hasRole('academic_coordinator')) {
            $desigLower = strtolower($user->designation ?? '');
            $isInstitutionLeadership = str_contains($desigLower, 'vp') || str_contains($desigLower, 'vice') || ($user->department && $user->department->code === 'ADM');
            if ($request->boolean('my_plans')) {
                $query->where('teacher_id', $user->id);
            } elseif (!$isInstitutionLeadership && $user->department_id) {
                $query->where(function ($q) use ($user) {
                    $q->where('department_id', $user->department_id)
                      ->orWhere('teacher_id', $user->id);
                });
            }
        }

        // Filters
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('academic_year_id')) {
            $query->where('academic_year_id', $request->academic_year_id);
        }
        if ($request->filled('term_id')) {
            $query->where('term_id', $request->term_id);
        }
        if ($request->filled('class_id')) {
            $query->where('class_id', $request->class_id);
        }
        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }
        if ($request->filled('teacher_id')) {
            $query->where('teacher_id', $request->teacher_id);
        }
        if ($request->filled('date_from')) {
            $query->where('lesson_date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->where('lesson_date', '<=', $request->date_to);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('code', 'like', "%{$s}%")
                  ->orWhere('title', 'like', "%{$s}%")
                  ->orWhere('topic', 'like', "%{$s}%");
            });
        }

        $sortBy = $request->get('sort_by', 'created_at');
        $sortDir = $request->get('sort_dir', 'desc');
        $query->orderBy($sortBy, $sortDir);

        $perPage = min((int)$request->get('per_page', 15), 100);
        $lessonPlans = $query->paginate($perPage);

        return $this->paginatedResponse(
            $lessonPlans->setCollection(
                $lessonPlans->getCollection()->map(fn($item) => new LessonPlanResource($item))
            )
        );
    }

    public function store(StoreLessonPlanRequest $request): JsonResponse
    {
        $data = $request->validated();
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            if ($file->isValid()) {
                $targetDir = storage_path('app/public/lesson_plans');
                if (!file_exists($targetDir)) {
                    @mkdir($targetDir, 0755, true);
                }
                $originalName = $file->getClientOriginalName();
                $filename = time() . '_' . preg_replace('/[^a-zA-Z0-9_\.-]/', '_', $originalName);
                $file->move($targetDir, $filename);
                $data['attachment_path'] = 'lesson_plans/' . $filename;
                $data['attachment_name'] = $originalName;
            }
        }

        $plan = $this->lessonPlanService->createLessonPlan($data, $request->user());
        $plan->load(['teacher', 'academicYear', 'term', 'schoolClass', 'section', 'subject', 'chapter', 'outcomes', 'activities']);

        return $this->successResponse(new LessonPlanResource($plan), 'Lesson plan created successfully.', 201);
    }

    public function show(LessonPlan $lessonPlan): JsonResponse
    {
        $lessonPlan->load([
            'teacher.department',
            'academicYear',
            'term',
            'schoolClass',
            'section',
            'subject',
            'chapter',
            'outcomes',
            'activities',
            'reviews.reviewer',
            'statusHistories.actor',
        ]);

        return $this->successResponse(new LessonPlanResource($lessonPlan));
    }

    public function update(UpdateLessonPlanRequest $request, LessonPlan $lessonPlan): JsonResponse
    {
        $user = $request->user();

        // Teachers can only edit draft or returned plans
        if ($user->hasRole('teacher') && !$user->hasRole(['super_admin', 'principal', 'academic_coordinator'])) {
            if ($lessonPlan->teacher_id !== $user->id) {
                return $this->errorResponse('Unauthorized action.', 403);
            }
            if (!in_array($lessonPlan->status, ['draft', 'returned'])) {
                return $this->errorResponse('Cannot edit a plan that is submitted or approved.', 422);
            }
        }

        $data = $request->validated();
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            if ($file->isValid()) {
                $originalName = $file->getClientOriginalName();
                $filename = time() . '_' . preg_replace('/[^a-zA-Z0-9_\.-]/', '_', $originalName);
                $targetFullPath = storage_path('app/public/lesson_plans');
                if (!file_exists($targetFullPath)) {
                    @mkdir($targetFullPath, 0755, true);
                }
                $file->move($targetFullPath, $filename);
                $data['attachment_path'] = 'lesson_plans/' . $filename;
                $data['attachment_name'] = $originalName;
            }
        }

        $plan = $this->lessonPlanService->updateLessonPlan($lessonPlan, $data, $user);
        $plan->load(['teacher', 'academicYear', 'term', 'schoolClass', 'section', 'subject', 'chapter', 'outcomes', 'activities']);

        return $this->successResponse(new LessonPlanResource($plan), 'Lesson plan updated successfully.');
    }

    public function uploadAttachment(Request $request, LessonPlan $lessonPlan): JsonResponse
    {
        $user = $request->user();
        if ($user->hasRole('teacher') && !$user->hasRole(['super_admin', 'principal', 'academic_coordinator'])) {
            if ($lessonPlan->teacher_id !== $user->id) {
                return $this->errorResponse('Unauthorized action.', 403);
            }
        }

        if (!$request->hasFile('file') || !$request->file('file')->isValid()) {
            return $this->errorResponse('সঠিক ফাইল আপলোড করুন।', 422);
        }

        $file = $request->file('file');
        if ($file->getSize() > 20971520) { // 20MB
            return $this->errorResponse('ফাইল সাইজ সর্বোচ্চ ২০ মেগাবাইট (20MB) হতে পারবে।', 422);
        }

        $originalName = $file->getClientOriginalName();
        $filename = time() . '_' . preg_replace('/[^a-zA-Z0-9_\.-]/', '_', $originalName);
        $targetFullPath = storage_path('app/public/lesson_plans');
        if (!file_exists($targetFullPath)) {
            @mkdir($targetFullPath, 0755, true);
        }
        $file->move($targetFullPath, $filename);

        $lessonPlan->update([
            'attachment_path' => 'lesson_plans/' . $filename,
            'attachment_name' => $originalName,
        ]);

        $lessonPlan->load(['teacher', 'academicYear', 'term', 'schoolClass', 'section', 'subject', 'chapter', 'outcomes', 'activities']);

        return $this->successResponse(new LessonPlanResource($lessonPlan), 'Lesson plan document uploaded successfully.');
    }

    public function destroy(Request $request, LessonPlan $lessonPlan): JsonResponse
    {
        $user = $request->user();
        if ($user->hasRole('teacher') && !$user->hasRole(['super_admin', 'principal'])) {
            if ($lessonPlan->teacher_id !== $user->id || !in_array($lessonPlan->status, ['draft', 'returned'])) {
                return $this->errorResponse('Unauthorized to delete this lesson plan.', 403);
            }
        }

        $lessonPlan->delete();
        return $this->successResponse(null, 'Lesson plan deleted successfully.');
    }

    public function duplicate(Request $request, LessonPlan $lessonPlan): JsonResponse
    {
        $newPlan = $this->lessonPlanService->duplicate($lessonPlan, $request->user());
        $newPlan->load(['teacher', 'academicYear', 'term', 'schoolClass', 'section', 'subject', 'chapter', 'outcomes', 'activities']);

        return $this->successResponse(new LessonPlanResource($newPlan), 'Lesson plan duplicated successfully.', 201);
    }

    public function submit(Request $request, LessonPlan $lessonPlan): JsonResponse
    {
        $user = $request->user();
        if ($lessonPlan->teacher_id !== $user->id && !$user->hasRole(['super_admin', 'principal', 'academic_coordinator'])) {
            return $this->errorResponse('Unauthorized.', 403);
        }
        if (!in_array($lessonPlan->status, ['draft', 'returned'])) {
            return $this->errorResponse('Only draft or returned plans can be submitted.', 422);
        }

        $plan = $this->lessonPlanService->submit($lessonPlan, $user, $request->input('comment'));
        $plan->load(['teacher', 'academicYear', 'term', 'schoolClass', 'section', 'subject', 'chapter', 'outcomes', 'activities']);

        return $this->successResponse(new LessonPlanResource($plan), 'Lesson plan submitted for review.');
    }

    public function startReview(Request $request, LessonPlan $lessonPlan): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasRole(['super_admin', 'principal', 'academic_coordinator'])) {
            return $this->errorResponse('Unauthorized reviewer role.', 403);
        }
        if ($lessonPlan->status !== 'submitted') {
            return $this->errorResponse('Only submitted plans can be moved to under review.', 422);
        }

        $plan = $this->lessonPlanService->startReview($lessonPlan, $user, $request->input('comment'));
        $plan->load(['teacher', 'academicYear', 'term', 'schoolClass', 'section', 'subject', 'chapter', 'outcomes', 'activities']);

        return $this->successResponse(new LessonPlanResource($plan), 'Review process started.');
    }

    public function approve(Request $request, LessonPlan $lessonPlan): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasRole(['super_admin', 'principal', 'academic_coordinator'])) {
            return $this->errorResponse('Unauthorized reviewer role.', 403);
        }
        if (!in_array($lessonPlan->status, ['submitted', 'under_review'])) {
            return $this->errorResponse('Only submitted or under review plans can be approved.', 422);
        }

        $plan = $this->lessonPlanService->approve($lessonPlan, $user, $request->input('comment'));
        $plan->load(['teacher', 'academicYear', 'term', 'schoolClass', 'section', 'subject', 'chapter', 'outcomes', 'activities']);

        return $this->successResponse(new LessonPlanResource($plan), 'Lesson plan approved successfully.');
    }

    public function returnForCorrection(Request $request, LessonPlan $lessonPlan): JsonResponse
    {
        $request->validate([
            'comment' => 'required|string|min:5|max:1000',
        ]);

        $user = $request->user();
        if (!$user->hasRole(['super_admin', 'principal', 'academic_coordinator'])) {
            return $this->errorResponse('Unauthorized reviewer role.', 403);
        }
        if (!in_array($lessonPlan->status, ['submitted', 'under_review'])) {
            return $this->errorResponse('Only submitted or under review plans can be returned.', 422);
        }

        $plan = $this->lessonPlanService->returnForCorrection($lessonPlan, $user, $request->input('comment'));
        $plan->load(['teacher', 'academicYear', 'term', 'schoolClass', 'section', 'subject', 'chapter', 'outcomes', 'activities']);

        return $this->successResponse(new LessonPlanResource($plan), 'Lesson plan returned for correction.');
    }

    public function reject(Request $request, LessonPlan $lessonPlan): JsonResponse
    {
        $request->validate([
            'comment' => 'required|string|min:5|max:1000',
        ]);

        $user = $request->user();
        if (!$user->hasRole(['super_admin', 'principal', 'academic_coordinator'])) {
            return $this->errorResponse('Unauthorized reviewer role.', 403);
        }
        if (!in_array($lessonPlan->status, ['submitted', 'under_review'])) {
            return $this->errorResponse('Only submitted or under review plans can be rejected.', 422);
        }

        $plan = $this->lessonPlanService->reject($lessonPlan, $user, $request->input('comment'));
        $plan->load(['teacher', 'academicYear', 'term', 'schoolClass', 'section', 'subject', 'chapter', 'outcomes', 'activities']);

        return $this->successResponse(new LessonPlanResource($plan), 'Lesson plan rejected.');
    }

    public function archive(Request $request, LessonPlan $lessonPlan): JsonResponse
    {
        $plan = $this->lessonPlanService->archive($lessonPlan, $request->user());
        return $this->successResponse(new LessonPlanResource($plan), 'Lesson plan archived.');
    }

    public function restore(Request $request, LessonPlan $lessonPlan): JsonResponse
    {
        $plan = $this->lessonPlanService->restore($lessonPlan, $request->user());
        return $this->successResponse(new LessonPlanResource($plan), 'Lesson plan restored.');
    }

    public function downloadPdf(LessonPlan $lessonPlan): Response
    {
        $pdf = $this->lessonPlanService->generatePdf($lessonPlan);
        return $pdf->download("Lesson_Plan_{$lessonPlan->code}.pdf");
    }

    public function viewPdf(LessonPlan $lessonPlan): Response
    {
        $pdf = $this->lessonPlanService->generatePdf($lessonPlan);
        return $pdf->stream("Lesson_Plan_{$lessonPlan->code}.pdf");
    }

    public function calendar(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = LessonPlan::with(['teacher.department', 'schoolClass', 'subject', 'section']);

        if ($user->hasRole('teacher') && !$user->hasRole(['super_admin', 'principal', 'academic_coordinator'])) {
            $query->where('teacher_id', $user->id);
        } elseif ($user->hasRole('academic_coordinator') && $user->department_id) {
            $query->where(function ($q) use ($user) {
                $q->where('department_id', $user->department_id)->orWhere('teacher_id', $user->id);
            });
        }

        if ($request->filled('start_date')) {
            $query->where('lesson_date', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->where('lesson_date', '<=', $request->end_date);
        }
        if ($request->filled('class_id')) {
            $query->where('class_id', $request->class_id);
        }
        if ($request->filled('subject_id')) {
            $query->where('subject_id', $request->subject_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $plans = $query->orderBy('lesson_date')->orderBy('period_number')->get();

        return $this->successResponse($plans);
    }
}