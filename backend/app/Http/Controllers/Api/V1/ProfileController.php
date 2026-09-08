<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\V1\Auth\ChangePasswordRequest;
use App\Http\Requests\V1\Auth\UpdateProfileRequest;
use App\Http\Resources\V1\UserResource;
use App\Models\User;
use App\Traits\ApiResponseTrait;
use App\Traits\HasActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    use ApiResponseTrait, HasActivityLog;

    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->load(['roles.permissions', 'department']);
        return $this->successResponse(new UserResource($user));
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update($request->validated());

        static::logActivity('Profile Updated', User::class, $user->id);

        $user->load(['roles.permissions', 'department']);
        return $this->successResponse(new UserResource($user), 'Profile updated successfully.');
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update([
            'password' => Hash::make($request->password),
        ]);

        static::logActivity('Password Changed', User::class, $user->id);

        return $this->successResponse(null, 'Password changed successfully.');
    }

    public function updateAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:4096'],
        ]);

        $user = $request->user();

        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                $oldPath = str_replace('/storage/', '', $user->avatar);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            $path = $request->file('avatar')->store('avatars', 'public');
            $user->update(['avatar' => '/storage/' . $path]);
        }

        static::logActivity('Avatar Updated', User::class, $user->id);

        $user->load(['roles.permissions', 'department']);
        return $this->successResponse(new UserResource($user), 'প্রোফাইল ছবি সফলভাবে আপডেট হয়েছে!');
    }

    public function deleteAvatar(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->avatar) {
            $oldPath = str_replace('/storage/', '', $user->avatar);
            if (Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }
            $user->update(['avatar' => null]);
        }

        static::logActivity('Avatar Removed', User::class, $user->id);

        $user->load(['roles.permissions', 'department']);
        return $this->successResponse(new UserResource($user), 'প্রোফাইল ছবি মুছে ফেলা হয়েছে।');
    }

    public function loginHistory(Request $request): JsonResponse
    {
        $user = $request->user();
        $histories = $user->loginHistories()
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $histories->items(),
            'meta' => [
                'current_page' => $histories->currentPage(),
                'last_page' => $histories->lastPage(),
                'per_page' => $histories->perPage(),
                'total' => $histories->total(),
            ],
            'summary' => [
                'total_logins' => (int)($user->login_count ?? 0),
                'last_login_at' => $user->last_login_at?->toISOString(),
                'last_login_ip' => $user->last_login_ip ?? $request->ip(),
                'current_ip' => $request->ip(),
                'current_device' => $user->last_login_device,
            ]
        ]);
    }
}