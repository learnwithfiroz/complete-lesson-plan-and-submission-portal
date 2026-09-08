<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Academic\StoreTeacherAssignmentRequest;
use App\Http\Resources\V1\TeacherAssignmentResource;
use App\Models\AcademicYear;
use App\Models\TeacherAssignment;
use App\Traits\ApiResponseTrait;
use App\Traits\HasActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeacherAssignmentController extends Controller
{
    use ApiResponseTrait, HasActivityLog;

    public function index(Request $request): JsonResponse
    {
        $query = TeacherAssignment::with([
            'teacher.department',
            'academicYear',
            'schoolClass.sections',
            'section',
            'subject.department',
        ]);

        if ($teacherId = $request->input('teacher_id')) {
            $query->where('teacher_id', $teacherId);
        }

        if ($yearId = $request->input('academic_year_id')) {
            $query->where('academic_year_id', $yearId);
        }

        if ($classId = $request->input('class_id')) {
            $query->where('class_id', $classId);
        }

        if ($subjectId = $request->input('subject_id')) {
            $query->where('subject_id', $subjectId);
        }

        $assignments = $query->latest()->get();

        return $this->successResponse(TeacherAssignmentResource::collection($assignments));
    }

    public function store(StoreTeacherAssignmentRequest $request): JsonResponse
    {
        $assignment = TeacherAssignment::firstOrCreate(
            $request->only(['teacher_id', 'academic_year_id', 'class_id', 'section_id', 'subject_id'])
        );

        static::logActivity('Teacher Assignment Created', TeacherAssignment::class, $assignment->id);

        $assignment->load(['teacher', 'academicYear', 'schoolClass', 'section', 'subject']);

        return $this->successResponse(new TeacherAssignmentResource($assignment), 'Teacher assigned successfully.', 201);
    }

    public function destroy(Request $request, TeacherAssignment $teacherAssignment): JsonResponse
    {
        if (!$request->user()->hasPermission('academic.assign_teachers')) {
            return $this->forbiddenResponse();
        }

        $teacherAssignment->delete();

        static::logActivity('Teacher Assignment Deleted', TeacherAssignment::class, $teacherAssignment->id);

        return $this->successResponse(null, 'Assignment revoked successfully.');
    }

    /**
     * Return assigned classes, sections, and subjects for the currently authenticated teacher.
     */
    public function myAssignments(Request $request): JsonResponse
    {
        $user = $request->user();

        // Get current academic year
        $currentYear = AcademicYear::where('is_current', true)->first() ?: AcademicYear::latest('start_date')->first();

        $query = TeacherAssignment::where('teacher_id', $user->id)
            ->with(['academicYear', 'schoolClass', 'section', 'subject.chapters']);

        if ($currentYear) {
            $query->where('academic_year_id', $currentYear->id);
        }

        $assignments = $query->get();

        // Group into distinct classes, sections, and subjects
        $classes = $assignments->pluck('schoolClass')->unique('id')->values();
        $sections = $assignments->pluck('section')->unique('id')->values();
        $subjects = $assignments->pluck('subject')->unique('id')->values();

        return $this->successResponse([
            'academic_year' => $currentYear,
            'assignments' => TeacherAssignmentResource::collection($assignments),
            'classes' => $classes,
            'sections' => $sections,
            'subjects' => $subjects,
        ]);
    }
}