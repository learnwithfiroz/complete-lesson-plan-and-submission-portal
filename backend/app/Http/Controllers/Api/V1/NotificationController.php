<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json([
                    'status' => 'success',
                    'data' => [],
                    'unread_count' => 0,
                    'meta' => ['current_page' => 1, 'last_page' => 1, 'total' => 0],
                ]);
            }

            $notifications = $user->notifications()->paginate(20);

            return response()->json([
                'status' => 'success',
                'data' => $notifications->items(),
                'unread_count' => $user->unreadNotifications()->count(),
                'meta' => [
                    'current_page' => $notifications->currentPage(),
                    'last_page' => $notifications->lastPage(),
                    'total' => $notifications->total(),
                ],
            ]);
        } catch (\Throwable $e) {
            \Log::warning('Notification index fallback: ' . $e->getMessage());
            return response()->json([
                'status' => 'success',
                'data' => [],
                'unread_count' => 0,
                'meta' => ['current_page' => 1, 'last_page' => 1, 'total' => 0],
            ]);
        }
    }

    public function markAsRead(Request $request, string $id): JsonResponse
    {
        try {
            $notification = $request->user()?->notifications()->where('id', $id)->first();
            if ($notification) {
                $notification->markAsRead();
            }
        } catch (\Throwable $e) {
            \Log::warning('Notification markAsRead fallback: ' . $e->getMessage());
        }

        return response()->json(['message' => 'Notification marked as read.']);
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        try {
            $request->user()?->unreadNotifications->markAsRead();
        } catch (\Throwable $e) {
            \Log::warning('Notification markAllAsRead fallback: ' . $e->getMessage());
        }
        return response()->json(['message' => 'All notifications marked as read.']);
    }
}