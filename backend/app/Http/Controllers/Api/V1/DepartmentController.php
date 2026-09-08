<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Academic\StoreDepartmentRequest;
use App\Http\Resources\V1\DepartmentResource;
use App\Models\Department;
use App\Traits\ApiResponseTrait;
use App\Traits\HasActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    use ApiResponseTrait, HasActivityLog;

    public function index(Request $request): JsonResponse
    {
        $query = Department::withCount(['users', 'subjects']);

        if ($request->boolean('active_only', false)) {
            $query->where('is_active', true);
        }

        $departments = $query->get();

        return $this->successResponse(DepartmentResource::collection($departments));
    }

    public function store(StoreDepartmentRequest $request): JsonResponse
    {
        $department = Department::create($request->validated());

        static::logActivity('Department Created', Department::class, $department->id);

        return $this->successResponse(new DepartmentResource($department), 'Department created successfully.', 201);
    }

    public function show(Department $department): JsonResponse
    {
        $department->loadCount(['users', 'subjects']);
        return $this->successResponse(new DepartmentResource($department));
    }

    public function update(StoreDepartmentRequest $request, Department $department): JsonResponse
    {
        $department->update($request->validated());

        static::logActivity('Department Updated', Department::class, $department->id);

        return $this->successResponse(new DepartmentResource($department), 'Department updated successfully.');
    }

    public function destroy(Request $request, Department $department): JsonResponse
    {
        if (!$request->user()->hasPermission('academic.manage')) {
            return $this->forbiddenResponse();
        }

        if ($department->users()->exists() || $department->subjects()->exists()) {
            return $this->errorResponse('Cannot delete department with assigned users or subjects.', 422);
        }

        $department->delete();

        static::logActivity('Department Deleted', Department::class, $department->id);

        return $this->successResponse(null, 'Department deleted successfully.');
    }
}