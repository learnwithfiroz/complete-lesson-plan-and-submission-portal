<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Users\StoreUserRequest;
use App\Http\Requests\V1\Users\UpdateUserRequest;
use App\Http\Resources\V1\UserResource;
use App\Models\User;
use App\Traits\ApiResponseTrait;
use App\Traits\HasActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    use ApiResponseTrait, HasActivityLog;

    public function index(Request $request): JsonResponse
    {
        if (!$request->user()->hasPermission('users.view')) {
            return $this->forbiddenResponse();
        }

        $query = User::with(['roles', 'department'])
            ->withCount(['assignments', 'lessonPlans']);

        // Search filter
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('employee_id', 'like', "%{$search}%")
                  ->orWhere('serial_number', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('designation', 'like', "%{$search}%");
            });
        }

        // Role filter
        if ($request->filled('role')) {
            $role = $request->input('role');
            $query->whereHas('roles', function ($q) use ($role) {
                $q->where('name', $role);
            });
        }

        // Role Group filter (Teachers vs Leadership vs Staff vs Support)
        if ($request->filled('role_group')) {
            $roleGroup = $request->input('role_group');
            if ($roleGroup === 'teachers') {
                $query->whereHas('roles', function ($q) {
                    $q->where('name', 'teacher');
                });
            } elseif ($roleGroup === 'leadership') {
                $query->whereHas('roles', function ($q) {
                    $q->whereIn('name', ['principal', 'academic_coordinator']);
                });
            } elseif ($roleGroup === 'staff') {
                $query->whereHas('roles', function ($q) {
                    $q->where('name', 'staff');
                });
            } elseif ($roleGroup === 'support') {
                $query->whereHas('roles', function ($q) {
                    $q->where('name', 'support_staff');
                });
            }
        }

        // Department filter
        if ($request->filled('department_id')) {
            $query->where('department_id', $request->input('department_id'));
        }

        // Status filter
        if ($request->filled('is_active')) {
            $query->where('is_active', filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $perPage = min((int)($request->input('per_page', 50)), 250);
        $users = $query->orderByRaw('serial_number IS NULL, serial_number ASC, name ASC')->paginate($perPage);

        $counts = Cache::remember('user_group_counts', 60, function () {
            return [
                'all' => User::count(),
                'teachers' => User::whereHas('roles', fn($q) => $q->where('name', 'teacher'))->count(),
                'leadership' => User::whereHas('roles', fn($q) => $q->whereIn('name', ['principal', 'academic_coordinator']))->count(),
                'staff' => User::whereHas('roles', fn($q) => $q->where('name', 'staff'))->count(),
                'support' => User::whereHas('roles', fn($q) => $q->where('name', 'support_staff'))->count(),
            ];
        });

        return $this->successResponse(
            UserResource::collection($users),
            'Users retrieved successfully.',
            200,
            [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
                'counts' => $counts,
            ]
        );
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        return DB::transaction(function () use ($request) {
            $user = User::create([
                'employee_id' => $request->employee_id,
                'serial_number' => $request->serial_number,
                'name' => $request->name,
                'salutation' => $request->salutation,
                'gender' => $request->gender,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'phone' => $request->phone,
                'designation' => $request->designation,
                'department_id' => $request->department_id,
                'is_active' => $request->boolean('is_active', true),
            ]);

            $user->roles()->sync($request->role_ids);

            Cache::forget('user_group_counts');
            static::logActivity('User Created', User::class, $user->id, ['name' => $user->name, 'email' => $user->email]);

            $user->load(['roles.permissions', 'department']);

            return $this->successResponse(new UserResource($user), 'User created successfully.', 201);
        });
    }

    public function show(Request $request, User $user): JsonResponse
    {
        if (!$request->user()->hasPermission('users.view')) {
            return $this->forbiddenResponse();
        }

        $user->load(['roles.permissions', 'department', 'assignments.schoolClass', 'assignments.section', 'assignments.subject']);
        return $this->successResponse(new UserResource($user));
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        return DB::transaction(function () use ($request, $user) {
            $data = [
                'employee_id' => $request->employee_id,
                'serial_number' => $request->serial_number,
                'name' => $request->name,
                'salutation' => $request->salutation,
                'gender' => $request->gender,
                'email' => $request->email,
                'phone' => $request->phone,
                'designation' => $request->designation,
                'department_id' => $request->department_id,
                'is_active' => $request->boolean('is_active', $user->is_active),
            ];

            if ($request->filled('password')) {
                $data['password'] = Hash::make($request->password);
            }

            $user->update($data);
            $user->roles()->sync($request->role_ids);

            Cache::forget('user_group_counts');
            static::logActivity('User Updated', User::class, $user->id);

            $user->load(['roles.permissions', 'department']);

            return $this->successResponse(new UserResource($user), 'User updated successfully.');
        });
    }

    public function toggleStatus(Request $request, User $user): JsonResponse
    {
        if (!$request->user()->hasPermission('users.edit')) {
            return $this->forbiddenResponse();
        }

        // Prevent deactivating own account
        if ($request->user()->id === $user->id) {
            return $this->errorResponse('You cannot deactivate your own account.', 422);
        }

        $user->is_active = !$user->is_active;
        $user->save();

        Cache::forget('user_group_counts');
        $statusText = $user->is_active ? 'activated' : 'deactivated';
        static::logActivity("User {$statusText}", User::class, $user->id);

        return $this->successResponse(new UserResource($user), "User has been {$statusText}.");
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        if (!$request->user()->hasPermission('users.delete')) {
            return $this->forbiddenResponse();
        }

        if ($request->user()->id === $user->id) {
            return $this->errorResponse('You cannot delete your own account.', 422);
        }

        $user->delete();

        Cache::forget('user_group_counts');
        static::logActivity('User Deleted', User::class, $user->id);

        return $this->successResponse(null, 'User deleted successfully.');
    }
}