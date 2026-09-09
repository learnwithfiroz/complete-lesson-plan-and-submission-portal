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
        $user = $request->user();

        if (!$request->hasFile('avatar') || !$request->file('avatar')->isValid()) {
            return $this->errorResponse('সঠিক ইমেজ ফাইল নির্বাচন করুন।', 422);
        }

        $file = $request->file('avatar');
        if ($file->getSize() > 4194304) { // 4MB
            return $this->errorResponse('ছবির সাইজ সর্বোচ্চ ৪ মেগাবাইট (4MB) হতে পারবে।', 422);
        }

        $ext = strtolower($file->getClientOriginalExtension() ?: pathinfo($file->getClientOriginalName(), PATHINFO_EXTENSION));
        if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp', 'gif'])) {
            return $this->errorResponse('অনুগ্রহ করে JPG, PNG বা WEBP ফরম্যাটের ছবি আপলোড করুন।', 422);
        }

        if ($user->avatar) {
            $oldPath = str_replace('/storage/', '', $user->avatar);
            if (Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }
        }

        $targetFullPath = storage_path('app/public/avatars');
        if (!file_exists($targetFullPath)) {
            @mkdir($targetFullPath, 0755, true);
        }
        $filename = 'avatar_' . $user->id . '_' . time() . '.' . $ext;
        $file->move($targetFullPath, $filename);
        $user->update(['avatar' => '/storage/avatars/' . $filename]);

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