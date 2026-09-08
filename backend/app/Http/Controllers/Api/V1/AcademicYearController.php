<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Academic\StoreAcademicYearRequest;
use App\Http\Requests\V1\Academic\StoreTermRequest;
use App\Http\Resources\V1\AcademicYearResource;
use App\Http\Resources\V1\TermResource;
use App\Models\AcademicYear;
use App\Models\Term;
use App\Traits\ApiResponseTrait;
use App\Traits\HasActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AcademicYearController extends Controller
{
    use ApiResponseTrait, HasActivityLog;

    public function index(): JsonResponse
    {
        $years = AcademicYear::with(['terms'])->withCount('assignments')->latest('start_date')->get();
        return $this->successResponse(AcademicYearResource::collection($years));
    }

    public function store(StoreAcademicYearRequest $request): JsonResponse
    {
        return DB::transaction(function () use ($request) {
            if ($request->boolean('is_current')) {
                AcademicYear::query()->update(['is_current' => false]);
            }

            $year = AcademicYear::create($request->validated());

            static::logActivity('Academic Year Created', AcademicYear::class, $year->id);

            return $this->successResponse(new AcademicYearResource($year), 'Academic year created successfully.', 201);
        });
    }

    public function show(AcademicYear $academicYear): JsonResponse
    {
        $academicYear->load(['terms', 'assignments.teacher', 'assignments.schoolClass', 'assignments.subject']);
        return $this->successResponse(new AcademicYearResource($academicYear));
    }

    public function update(StoreAcademicYearRequest $request, AcademicYear $academicYear): JsonResponse
    {
        return DB::transaction(function () use ($request, $academicYear) {
            if ($request->boolean('is_current')) {
                AcademicYear::where('id', '!=', $academicYear->id)->update(['is_current' => false]);
            }

            $academicYear->update($request->validated());

            static::logActivity('Academic Year Updated', AcademicYear::class, $academicYear->id);

            return $this->successResponse(new AcademicYearResource($academicYear), 'Academic year updated successfully.');
        });
    }

    public function destroy(Request $request, AcademicYear $academicYear): JsonResponse
    {
        if (!$request->user()->hasPermission('academic.manage')) {
            return $this->forbiddenResponse();
        }

        if ($academicYear->lessonPlans()->exists() || $academicYear->assignments()->exists()) {
            return $this->errorResponse('Cannot delete academic year with linked lesson plans or assignments.', 422);
        }

        $academicYear->delete();

        static::logActivity('Academic Year Deleted', AcademicYear::class, $academicYear->id);

        return $this->successResponse(null, 'Academic year deleted successfully.');
    }

    public function setCurrent(AcademicYear $academicYear): JsonResponse
    {
        DB::transaction(function () use ($academicYear) {
            AcademicYear::query()->update(['is_current' => false]);
            $academicYear->update(['is_current' => true]);
        });

        static::logActivity('Current Academic Year Changed', AcademicYear::class, $academicYear->id);

        return $this->successResponse(new AcademicYearResource($academicYear), 'Current academic year updated.');
    }

    // Terms
    public function storeTerm(StoreTermRequest $request): JsonResponse
    {
        if ($request->boolean('is_current')) {
            Term::where('academic_year_id', $request->academic_year_id)->update(['is_current' => false]);
        }

        $term = Term::create($request->validated());

        static::logActivity('Term Created', Term::class, $term->id);

        return $this->successResponse(new TermResource($term), 'Term created successfully.', 201);
    }

    public function updateTerm(StoreTermRequest $request, Term $term): JsonResponse
    {
        if ($request->boolean('is_current')) {
            Term::where('academic_year_id', $term->academic_year_id)
                ->where('id', '!=', $term->id)
                ->update(['is_current' => false]);
        }

        $term->update($request->validated());

        static::logActivity('Term Updated', Term::class, $term->id);

        return $this->successResponse(new TermResource($term), 'Term updated successfully.');
    }

    public function destroyTerm(Request $request, Term $term): JsonResponse
    {
        if (!$request->user()->hasPermission('academic.manage')) {
            return $this->forbiddenResponse();
        }

        if ($term->lessonPlans()->exists()) {
            return $this->errorResponse('Cannot delete term with linked lesson plans.', 422);
        }

        $term->delete();

        static::logActivity('Term Deleted', Term::class, $term->id);

        return $this->successResponse(null, 'Term deleted successfully.');
    }
}