<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Academic\StoreClassRequest;
use App\Http\Requests\V1\Academic\StoreSectionRequest;
use App\Http\Resources\V1\SchoolClassResource;
use App\Http\Resources\V1\SectionResource;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Traits\ApiResponseTrait;
use App\Traits\HasActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Cache;

class ClassController extends Controller
{
    use ApiResponseTrait, HasActivityLog;

    public function index(Request $request): JsonResponse
    {
        $activeOnly = $request->boolean('active_only');
        $cacheKey = 'classes_list_' . ($activeOnly ? 'active' : 'all');

        $classes = Cache::remember($cacheKey, 60, function () use ($activeOnly) {
            $query = SchoolClass::with(['sections.classTeacher', 'subjects.department'])
                ->withCount(['sections', 'subjects'])
                ->orderBy('numeric_value')
                ->orderBy('name_en');

            if ($activeOnly) {
                $query->where('is_active', true);
            }

            return $query->get();
        });

        return $this->successResponse(SchoolClassResource::collection($classes));
    }

    public function store(StoreClassRequest $request): JsonResponse
    {
        $class = SchoolClass::create($request->validated());

        Cache::forget('classes_list_active');
        Cache::forget('classes_list_all');
        static::logActivity('Class Created', SchoolClass::class, $class->id);

        return $this->successResponse(new SchoolClassResource($class), 'Class created successfully.', 201);
    }

    public function show(SchoolClass $class): JsonResponse
    {
        $class->load(['sections', 'subjects.department', 'subjects.chapters']);
        return $this->successResponse(new SchoolClassResource($class));
    }

    public function update(StoreClassRequest $request, SchoolClass $class): JsonResponse
    {
        $class->update($request->validated());

        Cache::forget('classes_list_active');
        Cache::forget('classes_list_all');
        static::logActivity('Class Updated', SchoolClass::class, $class->id);

        return $this->successResponse(new SchoolClassResource($class), 'Class updated successfully.');
    }

    public function destroy(Request $request, SchoolClass $class): JsonResponse
    {
        if (!$request->user()->hasPermission('academic.manage')) {
            return $this->forbiddenResponse();
        }

        if ($class->lessonPlans()->exists() || $class->assignments()->exists()) {
            return $this->errorResponse('Cannot delete class with linked lesson plans or assignments.', 422);
        }

        $class->delete();

        Cache::forget('classes_list_active');
        Cache::forget('classes_list_all');
        static::logActivity('Class Deleted', SchoolClass::class, $class->id);

        return $this->successResponse(null, 'Class deleted successfully.');
    }

    // Sections
    public function storeSection(StoreSectionRequest $request): JsonResponse
    {
        $section = Section::create($request->validated());

        static::logActivity('Section Created', Section::class, $section->id);

        return $this->successResponse(new SectionResource($section), 'Section created successfully.', 201);
    }

    public function updateSection(StoreSectionRequest $request, Section $section): JsonResponse
    {
        $section->update($request->validated());

        static::logActivity('Section Updated', Section::class, $section->id);

        return $this->successResponse(new SectionResource($section), 'Section updated successfully.');
    }

    public function destroySection(Request $request, Section $section): JsonResponse
    {
        if (!$request->user()->hasPermission('academic.manage')) {
            return $this->forbiddenResponse();
        }

        if ($section->lessonPlans()->exists() || $section->assignments()->exists()) {
            return $this->errorResponse('Cannot delete section with linked lesson plans or assignments.', 422);
        }

        $section->delete();

        static::logActivity('Section Deleted', Section::class, $section->id);

        return $this->successResponse(null, 'Section deleted successfully.');
    }
}