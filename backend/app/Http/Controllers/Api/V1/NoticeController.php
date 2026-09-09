<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Notice;
use App\Models\NoticeRead;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class NoticeController extends Controller
{
    /**
     * Display a listing of notices.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Notice::with(['creator:id,name,email,designation'])
            ->forAudience($user);

        // Filter: only active/published for regular teachers, unless admin/coord
        if (!$user->hasAnyRole(['super_admin', 'principal', 'academic_coordinator'])) {
            $query->active();
        } elseif ($request->has('is_published')) {
            $query->where('is_published', filter_var($request->is_published, FILTER_VALIDATE_BOOLEAN));
        }

        // Filter: Category
        if ($request->filled('category') && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        // Filter: Priority
        if ($request->filled('priority') && $request->priority !== 'all') {
            $query->where('priority', $request->priority);
        }

        // Filter: Target Audience
        if ($request->filled('target_audience') && $request->target_audience !== 'all') {
            $query->where('target_audience', $request->target_audience);
        }

        // Filter: Search Keyword
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title_bn', 'like', "%{$search}%")
                  ->orWhere('title_en', 'like', "%{$search}%")
                  ->orWhere('content_bn', 'like', "%{$search}%")
                  ->orWhere('content_en', 'like', "%{$search}%");
            });
        }

        $notices = $query->pinnedFirst()
            ->paginate($request->get('per_page', 12));

        return response()->json([
            'success' => true,
            'data' => $notices->items(),
            'meta' => [
                'current_page' => $notices->currentPage(),
                'last_page' => $notices->lastPage(),
                'per_page' => $notices->perPage(),
                'total' => $notices->total(),
            ],
        ]);
    }

    /**
     * Active urgent and pinned notices for the live ticker.
     */
    public function liveTicker(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Notice::active()
            ->forAudience($user)
            ->where(function ($q) {
                $q->where('is_pinned', true)
                  ->orWhere('priority', 'urgent')
                  ->orWhere('priority', 'high');
            })
            ->pinnedFirst()
            ->limit(10)
            ->get([
                'id', 'title_bn', 'title_en', 'category', 'priority', 
                'is_pinned', 'publish_date', 'created_at'
            ]);

        if ($query->isEmpty()) {
            $query = Notice::active()
                ->forAudience($user)
                ->orderByDesc('created_at')
                ->limit(5)
                ->get([
                    'id', 'title_bn', 'title_en', 'category', 'priority', 
                    'is_pinned', 'publish_date', 'created_at'
                ]);
        }

        return response()->json([
            'success' => true,
            'data' => $query,
        ])->header('Cache-Control', 'no-cache, no-store, must-revalidate')
          ->header('Pragma', 'no-cache')
          ->header('Expires', '0');
    }


    /**
     * Store a newly created notice.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasAnyRole(['super_admin', 'principal', 'academic_coordinator'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to create notices.',
            ], 403);
        }

        $validated = $request->validate([
            'title_bn' => 'required|string|max:255',
            'title_en' => 'required|string|max:255',
            'content_bn' => 'required|string',
            'content_en' => 'required|string',
            'category' => 'required|in:academic,curriculum,administrative,urgent,exam,general',
            'priority' => 'required|in:low,normal,high,urgent',
            'target_audience' => 'required|in:all,teachers,coordinators,principal',
            'is_pinned' => 'nullable|boolean',
            'is_published' => 'nullable|boolean',
            'publish_date' => 'nullable|date',
            'expiry_date' => 'nullable|date|after_or_equal:publish_date',
            'attachment' => 'nullable|file|max:10240|mimes:pdf,doc,docx,jpg,jpeg,png,xls,xlsx',
        ]);

        $attachmentPath = null;
        $attachmentName = null;

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $attachmentName = $file->getClientOriginalName();
            $attachmentPath = $file->store('notices', 'public');
        }

        $notice = Notice::create([
            'title_bn' => $validated['title_bn'],
            'title_en' => $validated['title_en'],
            'content_bn' => $validated['content_bn'],
            'content_en' => $validated['content_en'],
            'category' => $validated['category'],
            'priority' => $validated['priority'],
            'target_audience' => $validated['target_audience'],
            'attachment_path' => $attachmentPath,
            'attachment_name' => $attachmentName,
            'is_pinned' => $request->boolean('is_pinned', false),
            'is_published' => $request->boolean('is_published', true),
            'publish_date' => $request->filled('publish_date') ? $request->publish_date : now(),
            'expiry_date' => $request->filled('expiry_date') ? $request->expiry_date : null,
            'created_by' => $user->id,
        ]);

        $notice->load('creator:id,name,email,designation');
        $this->clearNoticeCache();

        return response()->json([
            'success' => true,
            'message' => 'Notice published successfully.',
            'data' => $notice,
        ], 201);
    }

    /**
     * Display the specified notice.
     */
    public function show(Request $request, Notice $notice): JsonResponse
    {
        $notice->load('creator:id,name,email,designation');

        return response()->json([
            'success' => true,
            'data' => $notice,
        ]);
    }

    /**
     * Update the specified notice.
     */
    public function update(Request $request, Notice $notice): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasAnyRole(['super_admin', 'principal', 'academic_coordinator'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to update notices.',
            ], 403);
        }

        $validated = $request->validate([
            'title_bn' => 'sometimes|required|string|max:255',
            'title_en' => 'sometimes|required|string|max:255',
            'content_bn' => 'sometimes|required|string',
            'content_en' => 'sometimes|required|string',
            'category' => 'sometimes|required|in:academic,curriculum,administrative,urgent,exam,general',
            'priority' => 'sometimes|required|in:low,normal,high,urgent',
            'target_audience' => 'sometimes|required|in:all,teachers,coordinators,principal',
            'is_pinned' => 'nullable|boolean',
            'is_published' => 'nullable|boolean',
            'publish_date' => 'nullable|date',
            'expiry_date' => 'nullable|date|after_or_equal:publish_date',
            'attachment' => 'nullable|file|max:10240|mimes:pdf,doc,docx,jpg,jpeg,png,xls,xlsx',
            'remove_attachment' => 'nullable|boolean',
        ]);

        if ($request->boolean('remove_attachment')) {
            if ($notice->attachment_path && Storage::disk('public')->exists($notice->attachment_path)) {
                Storage::disk('public')->delete($notice->attachment_path);
            }
            $notice->attachment_path = null;
            $notice->attachment_name = null;
        }

        if ($request->hasFile('attachment')) {
            if ($notice->attachment_path && Storage::disk('public')->exists($notice->attachment_path)) {
                Storage::disk('public')->delete($notice->attachment_path);
            }
            $file = $request->file('attachment');
            $notice->attachment_name = $file->getClientOriginalName();
            $notice->attachment_path = $file->store('notices', 'public');
        }

        $fields = [
            'title_bn', 'title_en', 'content_bn', 'content_en',
            'category', 'priority', 'target_audience', 'is_pinned',
            'is_published', 'publish_date', 'expiry_date'
        ];

        foreach ($fields as $f) {
            if ($request->has($f)) {
                $notice->{$f} = $request->get($f);
            }
        }

        $notice->save();
        $notice->load('creator:id,name,email,designation');
        $this->clearNoticeCache();

        return response()->json([
            'success' => true,
            'message' => 'Notice updated successfully.',
            'data' => $notice,
        ]);
    }

    /**
     * Remove the specified notice.
     */
    public function destroy(Request $request, Notice $notice): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasAnyRole(['super_admin', 'principal', 'academic_coordinator'])) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to delete notices.',
            ], 403);
        }

        if ($notice->attachment_path && Storage::disk('public')->exists($notice->attachment_path)) {
            Storage::disk('public')->delete($notice->attachment_path);
        }

        $notice->delete();
        $this->clearNoticeCache();

        return response()->json([
            'success' => true,
            'message' => 'Notice deleted successfully.',
        ]);
    }

    /**
     * Toggle pinned status.
     */
    public function togglePin(Request $request, Notice $notice): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasAnyRole(['super_admin', 'principal', 'academic_coordinator'])) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $notice->is_pinned = !$notice->is_pinned;
        $notice->save();
        $this->clearNoticeCache();

        return response()->json([
            'success' => true,
            'message' => $notice->is_pinned ? 'Notice pinned to top.' : 'Notice unpinned.',
            'data' => ['is_pinned' => $notice->is_pinned],
        ]);
    }

    /**
     * Toggle publish status.
     */
    public function togglePublish(Request $request, Notice $notice): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasAnyRole(['super_admin', 'principal', 'academic_coordinator'])) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        $notice->is_published = !$notice->is_published;
        $notice->save();
        $this->clearNoticeCache();

        return response()->json([
            'success' => true,
            'message' => $notice->is_published ? 'Notice published.' : 'Notice unpublished.',
            'data' => ['is_published' => $notice->is_published],
        ]);
    }

    /**
     * Clear notice related caches.
     */
    protected function clearNoticeCache(): void
    {
        try {
            \Illuminate\Support\Facades\Cache::flush();
        } catch (\Throwable $e) {
            // ignore
        }
    }

    /**
     * Download attachment.
     */
    public function downloadAttachment(Notice $notice): BinaryFileResponse|JsonResponse
    {
        if (!$notice->attachment_path || !Storage::disk('public')->exists($notice->attachment_path)) {
            return response()->json(['success' => false, 'message' => 'File not found.'], 404);
        }

        $path = Storage::disk('public')->path($notice->attachment_path);
        return response()->download($path, $notice->attachment_name ?: 'notice_attachment');
    }

    /**
     * Mark notice as read by authenticated user.
     */
    public function markAsRead(Request $request, Notice $notice): JsonResponse
    {
        $user = $request->user();
        $ip = $request->ip();
        $ua = $request->userAgent() ?? '';

        $deviceType = 'Desktop';
        if (preg_match('/(mobile|android|iphone|ipod)/i', $ua)) {
            $deviceType = 'Mobile';
        } elseif (preg_match('/(ipad|tablet)/i', $ua)) {
            $deviceType = 'Tablet';
        }

        $browser = 'Browser';
        if (preg_match('/edg/i', $ua)) $browser = 'Edge';
        elseif (preg_match('/chrome|crios/i', $ua)) $browser = 'Chrome';
        elseif (preg_match('/firefox|fxios/i', $ua)) $browser = 'Firefox';
        elseif (preg_match('/safari/i', $ua)) $browser = 'Safari';

        $noticeRead = NoticeRead::updateOrCreate(
            [
                'notice_id' => $notice->id,
                'user_id' => $user->id,
            ],
            [
                'ip_address' => $ip,
                'device_type' => $deviceType,
                'browser' => $browser,
                'user_agent' => substr($ua, 0, 500),
                'read_at' => now(),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Notice marked as read.',
            'data' => [
                'read_at' => $noticeRead->read_at->toISOString(),
            ],
        ]);
    }

    /**
     * Get notice reader receipts and unread users report for admin/coordinators.
     */
    public function readers(Request $request, Notice $notice): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasAnyRole(['super_admin', 'principal', 'academic_coordinator']) && $notice->created_by !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized.'], 403);
        }

        // 1. Get all reads with user info
        $reads = NoticeRead::with(['user:id,name,name_bn,employee_id,serial_number,designation,department_id,phone,avatar', 'user.department:id,name_bn'])
            ->where('notice_id', $notice->id)
            ->orderByDesc('read_at')
            ->get();

        $readUserIds = $reads->pluck('user_id')->toArray();

        // 2. Target users query based on notice target_audience
        $targetQuery = User::where('is_active', true);
        if ($notice->target_audience === 'teachers') {
            $targetQuery->whereHas('roles', fn($q) => $q->where('name', 'teacher'));
        } elseif ($notice->target_audience === 'coordinators') {
            $targetQuery->whereHas('roles', fn($q) => $q->where('name', 'academic_coordinator'));
        } elseif ($notice->target_audience === 'principal') {
            $targetQuery->whereHas('roles', fn($q) => $q->where('name', 'principal'));
        } else {
            // 'all'
            $targetQuery->whereHas('roles', fn($q) => $q->whereIn('name', ['teacher', 'academic_coordinator', 'principal']));
        }

        $allTargetUsers = $targetQuery->with('department:id,name_bn')->get(['id', 'name', 'name_bn', 'employee_id', 'serial_number', 'designation', 'department_id', 'phone', 'avatar']);
        $totalTarget = $allTargetUsers->count();
        $totalReaders = $reads->count();
        $readPercentage = $totalTarget > 0 ? round(($totalReaders / $totalTarget) * 100, 1) : 0;

        $unreaders = $allTargetUsers->whereNotIn('id', $readUserIds)->values();

        return response()->json([
            'success' => true,
            'data' => [
                'notice_id' => $notice->id,
                'title_bn' => $notice->title_bn,
                'title_en' => $notice->title_en,
                'priority' => $notice->priority,
                'target_audience' => $notice->target_audience,
                'publish_date' => $notice->publish_date?->toISOString(),
                'total_target' => $totalTarget,
                'total_readers' => $totalReaders,
                'total_unreaders' => count($unreaders),
                'read_percentage' => $readPercentage,
                'readers' => $reads->map(fn($r) => [
                    'id' => $r->id,
                    'user_id' => $r->user_id,
                    'name' => $r->user?->name,
                    'name_bn' => $r->user?->name_bn,
                    'employee_id' => $r->user?->employee_id,
                    'serial_number' => $r->user?->serial_number,
                    'designation' => $r->user?->designation,
                    'department' => $r->user?->department?->name_bn,
                    'phone' => $r->user?->phone,
                    'avatar' => $r->user?->avatar ? url($r->user->avatar) : null,
                    'ip_address' => $r->ip_address,
                    'device_type' => $r->device_type,
                    'browser' => $r->browser,
                    'read_at' => $r->read_at?->toISOString(),
                ]),
                'unreaders' => $unreaders->map(fn($u) => [
                    'id' => $u->id,
                    'name' => $u->name,
                    'name_bn' => $u->name_bn,
                    'employee_id' => $u->employee_id,
                    'serial_number' => $u->serial_number,
                    'designation' => $u->designation,
                    'department' => $u->department?->name_bn,
                    'phone' => $u->phone,
                    'avatar' => $u->avatar ? url($u->avatar) : null,
                ]),
            ],
        ]);
    }
}