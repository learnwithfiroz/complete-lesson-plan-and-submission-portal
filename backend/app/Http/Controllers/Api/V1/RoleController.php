<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Roles\UpdateRolePermissionsRequest;
use App\Http\Resources\V1\PermissionResource;
use App\Http\Resources\V1\RoleResource;
use App\Models\Permission;
use App\Models\Role;
use App\Traits\ApiResponseTrait;
use App\Traits\HasActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Cache;

class RoleController extends Controller
{
    use ApiResponseTrait, HasActivityLog;

    public function index(Request $request): JsonResponse
    {
        if (!$request->user()->hasPermission('roles.view')) {
            return $this->forbiddenResponse();
        }

        $roles = Cache::remember('roles_list', 120, function () {
            return Role::with(['permissions', 'users'])->withCount('users')->get();
        });

        return $this->successResponse(RoleResource::collection($roles));
    }

    public function show(Request $request, Role $role): JsonResponse
    {
        if (!$request->user()->hasPermission('roles.view')) {
            return $this->forbiddenResponse();
        }

        $role->load(['permissions', 'users']);
        return $this->successResponse(new RoleResource($role));
    }

    public function updatePermissions(UpdateRolePermissionsRequest $request, Role $role): JsonResponse
    {
        if ($role->name === 'super_admin') {
            return $this->errorResponse('Super Admin permissions cannot be modified.', 422);
        }

        $role->permissions()->sync($request->permission_ids);

        Cache::forget('roles_list');
        Cache::forget('permissions_grouped');

        static::logActivity('Role Permissions Updated', Role::class, $role->id, [
            'role' => $role->name,
            'permission_count' => count($request->permission_ids),
        ]);

        $role->load('permissions');

        return $this->successResponse(new RoleResource($role), 'Role permissions updated successfully.');
    }

    public function permissions(Request $request): JsonResponse
    {
        $permissions = Cache::remember('permissions_grouped', 300, function () {
            return Permission::all()->groupBy('module');
        });
        return $this->successResponse($permissions);
    }
}