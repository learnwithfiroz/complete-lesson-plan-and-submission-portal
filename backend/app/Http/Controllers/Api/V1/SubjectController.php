<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Academic\StoreChapterRequest;
use App\Http\Requests\V1\Academic\StoreSubjectRequest;
use App\Http\Resources\V1\ChapterResource;
use App\Http\Resources\V1\SubjectResource;
use App\Models\Chapter;
use App\Models\Subject;
use App\Traits\ApiResponseTrait;
use App\Traits\HasActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubjectController extends Controller
{
    use ApiResponseTrait, HasActivityLog;

    public function index(Request $request): JsonResponse
    {
        $query = Subject::with(['department', 'schoolClass', 'chapters'])
            ->withCount('chapters');

        if ($classId = $request->input('class_id')) {
            $query->where('class_id', $classId);
        }

        if ($deptId = $request->input('department_id')) {
            $query->where('department_id', $deptId);
        }

        if ($request->boolean('active_only')) {
            $query->where('is_active', true);
        }

        $subjects = $query->get();
        return $this->successResponse(SubjectResource::collection($subjects));
    }

    public function store(StoreSubjectRequest $request): JsonResponse
    {
        $subject = Subject::create($request->validated());

        static::logActivity('Subject Created', Subject::class, $subject->id);

        $subject->load(['department', 'schoolClass']);

        return $this->successResponse(new SubjectResource($subject), 'Subject created successfully.', 201);
    }

    public function show(Subject $subject): JsonResponse
    {
        $subject->load(['department', 'schoolClass', 'chapters']);
        return $this->successResponse(new SubjectResource($subject));
    }

    public function update(StoreSubjectRequest $request, Subject $subject): JsonResponse
    {
        $subject->update($request->validated());

        static::logActivity('Subject Updated', Subject::class, $subject->id);

        $subject->load(['department', 'schoolClass']);

        return $this->successResponse(new SubjectResource($subject), 'Subject updated successfully.');
    }

    public function destroy(Request $request, Subject $subject): JsonResponse
    {
        if (!$request->user()->hasPermission('academic.manage')) {
            return $this->forbiddenResponse();
        }

        if ($subject->lessonPlans()->exists() || $subject->assignments()->exists()) {
            return $this->errorResponse('Cannot delete subject with linked lesson plans or assignments.', 422);
        }

        $subject->delete();

        static::logActivity('Subject Deleted', Subject::class, $subject->id);

        return $this->successResponse(null, 'Subject deleted successfully.');
    }

    // Chapters
    public function storeChapter(StoreChapterRequest $request): JsonResponse
    {
        $chapter = Chapter::create($request->validated());

        static::logActivity('Chapter Created', Chapter::class, $chapter->id);

        return $this->successResponse(new ChapterResource($chapter), 'Chapter created successfully.', 201);
    }

    public function updateChapter(StoreChapterRequest $request, Chapter $chapter): JsonResponse
    {
        $chapter->update($request->validated());

        static::logActivity('Chapter Updated', Chapter::class, $chapter->id);

        return $this->successResponse(new ChapterResource($chapter), 'Chapter updated successfully.');
    }

    public function destroyChapter(Request $request, Chapter $chapter): JsonResponse
    {
        if (!$request->user()->hasPermission('academic.manage')) {
            return $this->forbiddenResponse();
        }

        $chapter->delete();

        static::logActivity('Chapter Deleted', Chapter::class, $chapter->id);

        return $this->successResponse(null, 'Chapter deleted successfully.');
    }
}