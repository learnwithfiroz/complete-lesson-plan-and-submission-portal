<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\SubmissionBatch;
use App\Models\SubmissionFile;
use App\Models\TeacherSubmission;
use App\Models\User;
use App\Services\ZipBuilder;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class SubmissionTrackingController extends Controller
{
    use ApiResponseTrait;

    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $category = $request->get('category', 'lesson_plan');
            $status = $request->get('status', 'active'); // active, inactive, all

            $query = SubmissionBatch::with(['schoolClass:id,name_bn,name_en', 'creator:id,name'])
                ->withCount(['submissions as submitted_count'])
                ->where('category', $category);

            if ($status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'inactive') {
                $query->where('is_active', false);
            }

            $batches = $query->latest()->get();

            // Get total active teachers in system
            $teacherRole = Role::where('name', 'teacher')->first();
            $totalTeachersCount = $teacherRole 
                ? $teacherRole->users()->where('is_active', true)->count() 
                : User::where('is_active', true)->count();
            if ($totalTeachersCount === 0) {
                $totalTeachersCount = User::where('is_active', true)->count();
            }

            // Summary counts for badges
            $countsSummary = SubmissionBatch::where('category', $category)
                ->selectRaw('SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_count, SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as inactive_count')
                ->first();
            $activeCount = (int)($countsSummary->active_count ?? 0);
            $inactiveCount = (int)($countsSummary->inactive_count ?? 0);

            // Fetch user submissions in 1 batch query if user logged in
            $userSubmissions = collect();
            if ($user && $batches->isNotEmpty()) {
                $userSubmissions = TeacherSubmission::whereIn('batch_id', $batches->pluck('id'))
                    ->where('teacher_id', $user->id)
                    ->with(['files:id,submission_id,file_name,file_path,file_size,file_type,gdrive_file_id,gdrive_view_link,gdrive_download_link,gdrive_synced_at'])
                    ->get()
                    ->keyBy('batch_id');
            }

            $data = $batches->map(function ($batch) use ($totalTeachersCount, $userSubmissions) {
                $submittedCount = (int)($batch->submitted_count ?? 0);
                $notSubmittedCount = max(0, $totalTeachersCount - $submittedCount);
                $completionPercent = $totalTeachersCount > 0 ? round(($submittedCount / $totalTeachersCount) * 100) : 0;

                $mySub = $userSubmissions->get($batch->id);
                $mySubmission = null;
                if ($mySub) {
                    $mySubmission = [
                        'id' => $mySub->id,
                        'status' => $mySub->status,
                        'update_count' => (int)($mySub->update_count ?? 1),
                        'submitted_at' => $mySub->submitted_at?->toISOString(),
                        'last_updated_at' => $mySub->last_updated_at?->toISOString(),
                        'remarks' => $mySub->remarks,
                        'gdrive_folder_id' => $mySub->gdrive_folder_id,
                        'gdrive_folder_url' => $mySub->gdrive_folder_url,
                        'files' => $mySub->files->map(fn($f) => [
                            'id' => $f->id,
                            'file_name' => $f->file_name,
                            'file_url' => $f->file_url,
                            'download_url' => $f->download_url,
                            'file_size' => $f->file_size,
                            'file_type' => $f->file_type,
                            'gdrive_file_id' => $f->gdrive_file_id,
                            'gdrive_view_link' => $f->gdrive_view_link,
                            'gdrive_download_link' => $f->gdrive_download_link,
                            'gdrive_synced_at' => $f->gdrive_synced_at?->toISOString(),
                        ]),
                    ];
                }

                return [
                    'id' => $batch->id,
                    'category' => $batch->category,
                    'title' => $batch->title,
                    'class_id' => $batch->class_id,
                    'class_name' => $batch->schoolClass ? ($batch->schoolClass->name_bn ?: $batch->schoolClass->name_en) : 'সব ক্লাস',
                    'start_date' => $batch->start_date?->format('Y-m-d') ?: date('Y-m-d'),
                    'end_date' => $batch->end_date?->format('Y-m-d') ?: date('Y-m-d'),
                    'date_range_display' => ($batch->start_date ? $batch->start_date->format('d M') : '') . ' - ' . ($batch->end_date ? $batch->end_date->format('d M Y') : ''),
                    'allow_multiple_files' => (bool)$batch->allow_multiple_files,
                    'instructions' => $batch->instructions,
                    'is_active' => (bool)$batch->is_active,
                    'gdrive_folder_id' => $batch->gdrive_folder_id,
                    'gdrive_folder_url' => $batch->gdrive_folder_url,
                    'created_at' => $batch->created_at?->toISOString(),
                    'stats' => [
                        'total_teachers' => $totalTeachersCount,
                        'submitted_count' => $submittedCount,
                        'not_submitted_count' => $notSubmittedCount,
                        'completion_percent' => $completionPercent,
                    ],
                    'my_submission' => $mySubmission,
                ];
            });

            return $this->successResponse([
                'batches' => $data,
                'counts' => [
                    'active' => $activeCount,
                    'inactive' => $inactiveCount,
                    'total_teachers' => $totalTeachersCount,
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('SubmissionTrackingController index error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return $this->successResponse([
                'batches' => [],
                'counts' => [
                    'active' => 0,
                    'inactive' => 0,
                    'total_teachers' => 0,
                ],
            ]);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category' => ['required', 'in:lesson_plan,assignment,question'],
            'title' => ['required', 'string', 'max:255'],
            'class_id' => ['nullable', 'exists:classes,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'allow_multiple_files' => ['nullable', 'boolean'],
            'instructions' => ['nullable', 'string'],
        ]);

        $batch = SubmissionBatch::create([
            'category' => $validated['category'],
            'title' => $validated['title'],
            'class_id' => $validated['class_id'] ?? null,
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'allow_multiple_files' => $validated['allow_multiple_files'] ?? true,
            'instructions' => $validated['instructions'] ?? null,
            'is_active' => true,
            'created_by' => $request->user()->id,
        ]);

        return $this->successResponse($batch, 'নতুন ব্যাচ সফলভাবে তৈরি হয়েছে।', 201);
    }

    public function show($arg1, $arg2 = null): JsonResponse
    {
        $target = ($arg1 instanceof Request) ? $arg2 : ($arg2 ?? $arg1);
        $batch = $target instanceof SubmissionBatch ? $target : SubmissionBatch::find($target);
        if (!$batch) {
            return $this->errorResponse('ব্যাচটি পাওয়া যায়নি বা ইতিমধ্যে মুছে ফেলা হয়েছে।', 404);
        }

        $request = ($arg1 instanceof Request) ? $arg1 : request();
        $user = $request ? $request->user() : null;
        $batch->load(['schoolClass:id,name_bn,name_en', 'creator:id,name']);

        $isAdmin = $user && $user->hasAnyRole(['super_admin', 'principal', 'academic_coordinator']);

        // Fetch My Submission
        $mySub = $user ? $batch->submissions()->where('teacher_id', $user->id)->with('files')->first() : null;
        $mySubmission = null;
        if ($mySub) {
            $mySubmission = [
                'id' => $mySub->id,
                'status' => $mySub->status,
                'update_count' => (int)($mySub->update_count ?? 1),
                'submitted_at' => $mySub->submitted_at?->format('d M Y, h:i A'),
                'last_updated_at' => $mySub->last_updated_at ? $mySub->last_updated_at->format('d M Y, h:i A') : null,
                'remarks' => $mySub->remarks,
                'gdrive_folder_id' => $mySub->gdrive_folder_id,
                'gdrive_folder_url' => $mySub->gdrive_folder_url,
                'files' => $mySub->files->map(fn($f) => [
                    'id' => $f->id,
                    'file_name' => $f->file_name,
                    'file_url' => $f->file_url,
                    'download_url' => $f->download_url,
                    'file_size' => $f->file_size,
                    'file_type' => $f->file_type,
                    'gdrive_file_id' => $f->gdrive_file_id,
                    'gdrive_view_link' => $f->gdrive_view_link,
                    'gdrive_download_link' => $f->gdrive_download_link,
                    'gdrive_synced_at' => $f->gdrive_synced_at ? $f->gdrive_synced_at->format('d M Y, h:i A') : null,
                ]),
            ];
        }

        // Only Admins / Coordinators can see all teachers list & reports
        $teacherList = [];
        $totalTeachers = 0;
        $submittedCount = 0;
        $notSubmittedCount = 0;
        $completionPercent = 0;

        if ($isAdmin) {
            $teacherRole = Role::where('name', 'teacher')->first();
            $teachersQuery = $teacherRole ? $teacherRole->users() : User::query();
            $teachers = $teachersQuery->where('users.is_active', true)
                ->with('department:id,name_bn,name_en')
                ->select('users.id', 'users.employee_id', 'users.serial_number', 'users.name', 'users.salutation', 'users.gender', 'users.designation', 'users.department_id', 'users.phone')
                ->orderByRaw('users.serial_number IS NULL, users.serial_number ASC, users.name ASC')
                ->get();

            $submissions = $batch->submissions()
                ->with(['files:id,submission_id,file_name,file_path,file_size,file_type,gdrive_file_id,gdrive_view_link,gdrive_download_link,gdrive_synced_at'])
                ->get()
                ->keyBy('teacher_id');

            $teacherList = $teachers->map(function ($teacher) use ($submissions) {
                $sub = $submissions->get($teacher->id);
                return [
                    'teacher_id' => $teacher->id,
                    'employee_id' => $teacher->employee_id,
                    'serial_number' => $teacher->serial_number,
                    'sl' => $teacher->serial_number,
                    'name' => $teacher->name,
                    'salutation' => $teacher->salutation,
                    'gender' => $teacher->gender,
                    'designation' => $teacher->designation ?: 'Teacher',
                    'department_name' => $teacher->department?->name_bn ?: $teacher->department?->name_en ?: 'General',
                    'phone' => $teacher->phone,
                    'is_submitted' => $sub !== null,
                    'submission_id' => $sub?->id,
                    'status' => $sub ? $sub->status : 'not_submitted',
                    'update_count' => (int)($sub?->update_count ?? ($sub ? 1 : 0)),
                    'submitted_at' => $sub?->submitted_at?->format('d M Y, h:i A'),
                    'last_updated_at' => $sub?->last_updated_at ? $sub->last_updated_at->format('d M Y, h:i A') : null,
                    'remarks' => $sub?->remarks,
                    'gdrive_folder_id' => $sub?->gdrive_folder_id,
                    'gdrive_folder_url' => $sub?->gdrive_folder_url,
                    'files' => $sub ? $sub->files->map(fn($f) => [
                        'id' => $f->id,
                        'file_name' => $f->file_name,
                        'file_url' => $f->file_url,
                        'download_url' => $f->download_url,
                        'file_size' => $f->file_size,
                        'file_type' => $f->file_type,
                        'gdrive_file_id' => $f->gdrive_file_id,
                        'gdrive_view_link' => $f->gdrive_view_link,
                        'gdrive_download_link' => $f->gdrive_download_link,
                        'gdrive_synced_at' => $f->gdrive_synced_at ? $f->gdrive_synced_at->format('d M Y, h:i A') : null,
                    ]) : [],
                ];
            });

            $submittedCount = $submissions->count();
            $totalTeachers = $teachers->count();
            $notSubmittedCount = max(0, $totalTeachers - $submittedCount);
            $completionPercent = $totalTeachers > 0 ? round(($submittedCount / $totalTeachers) * 100) : 0;
        }

        return $this->successResponse([
            'batch' => [
                'id' => $batch->id,
                'category' => $batch->category,
                'title' => $batch->title,
                'class_name' => $batch->schoolClass ? ($batch->schoolClass->name_bn ?: $batch->schoolClass->name_en) : 'সব ক্লাস',
                'start_date' => $batch->start_date?->format('Y-m-d') ?: date('Y-m-d'),
                'end_date' => $batch->end_date?->format('Y-m-d') ?: date('Y-m-d'),
                'date_range_display' => ($batch->start_date ? $batch->start_date->format('d M') : '') . ' - ' . ($batch->end_date ? $batch->end_date->format('d M Y') : ''),
                'allow_multiple_files' => (bool)$batch->allow_multiple_files,
                'instructions' => $batch->instructions,
                'is_active' => (bool)$batch->is_active,
                'gdrive_folder_id' => $batch->gdrive_folder_id,
                'gdrive_folder_url' => $batch->gdrive_folder_url,
            ],
            'is_admin' => $isAdmin,
            'my_submission' => $mySubmission,
            'stats' => $isAdmin ? [
                'total_teachers' => $totalTeachers,
                'submitted_count' => $submittedCount,
                'not_submitted_count' => $notSubmittedCount,
                'completion_percent' => $completionPercent,
            ] : null,
            'teachers' => $teacherList,
        ]);
    }

    public function toggleActive($arg1, $arg2 = null): JsonResponse
    {
        $target = ($arg1 instanceof Request) ? $arg2 : ($arg2 ?? $arg1);
        $batch = $target instanceof SubmissionBatch ? $target : SubmissionBatch::find($target);
        if (!$batch) {
            return $this->errorResponse('ব্যাচটি পাওয়া যায়নি।', 404);
        }

        $batch->update([
            'is_active' => !$batch->is_active,
        ]);

        $statusText = $batch->is_active ? 'সক্রিয় (Active)' : 'লক/নিষ্ক্রিয় (Locked/Inactive)';
        return $this->successResponse($batch, "ব্যাচ স্ট্যাটাস পরিবর্তন করে {$statusText} করা হয়েছে।");
    }

    public function destroy(Request $request, $batchId = null): JsonResponse
    {
        try {
            $user = $request->user();
            $isAdmin = $user && $user->hasAnyRole(['super_admin', 'principal', 'academic_coordinator']);
            if (!$isAdmin) {
                return $this->errorResponse('আপনার এই ব্যাচটি মুছে ফেলার অনুমতি নেই।', 403);
            }

            $target = $batchId ?? $request->route('batch');
            $batch = $target instanceof SubmissionBatch ? $target : SubmissionBatch::find($target);
            if (!$batch) {
                return $this->errorResponse('ব্যাচটি পাওয়া যায়নি বা ইতিমধ্যে মুছে ফেলা হয়েছে।', 404);
            }

            // Clean up files on storage
            $submissions = $batch->submissions()->with('files')->get();
            foreach ($submissions as $sub) {
                foreach ($sub->files as $f) {
                    if ($f->file_path) {
                        $resolved = $this->resolvePhysicalFilePath($f->file_path);
                        if ($resolved) {
                            @unlink($resolved);
                        }
                    }
                }
            }

            // Remove batch folders if exist
            $batchDir1 = storage_path("app/public/submissions/{$batch->id}");
            if (is_dir($batchDir1)) {
                @File::deleteDirectory($batchDir1);
            }
            $batchDir2 = public_path("storage/submissions/{$batch->id}");
            if (is_dir($batchDir2)) {
                @File::deleteDirectory($batchDir2);
            }

            $batch->delete();

            return $this->successResponse(null, 'ব্যাচ সফলভাবে ডিলিট করা হয়েছে।');
        } catch (\Throwable $e) {
            Log::error('Delete Batch Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return $this->errorResponse('ব্যাচ মোছা সম্ভব হয়নি: ' . $e->getMessage(), 500);
        }
    }

    public function submitFiles(Request $request, $batchId = null): JsonResponse
    {
        try {
            $user = $request->user();

            if (!$user) {
                return $this->errorResponse('আপনার সেশন শেষ হয়ে গেছে। অনুগ্রহ করে পুনরায় লগইন করুন।', 401);
            }

            $target = $batchId ?? $request->route('batch');
            $batch = $target instanceof SubmissionBatch ? $target : SubmissionBatch::find($target);
            if (!$batch) {
                return $this->errorResponse('ব্যাচটি খুঁজে পাওয়া যায়নি বা ইতিমধ্যে বন্ধ/মুছে ফেলা হয়েছে। অনুগ্রহ করে পেজটি রিফ্রেশ করুন।', 404);
            }

            if (!$batch->is_active) {
                return $this->errorResponse('এই ব্যাচটি বর্তমানে বন্ধ বা লক করা আছে। নতুন ফাইল আপলোড করা যাবে না।', 422);
            }

            $validated = $request->validate([
                'files' => ['required', 'array', 'min:1'],
                'remarks' => ['nullable', 'string', 'max:1000'],
            ], [
                'files.required' => 'অন্তত একটি ফাইল নির্বাচন করা আবশ্যক।',
                'files.array' => 'ফাইল ফরম্যাট সঠিক নয়।',
                'files.min' => 'অন্তত একটি ফাইল নির্বাচন করুন।',
            ]);

            if (!$request->hasFile('files')) {
                return $this->errorResponse('কোনো ফাইল পাওয়া যায়নি।', 422);
            }

            foreach ($request->file('files') as $file) {
                if (!$file->isValid()) {
                    return $this->errorResponse('ফাইলের আপলোড ত্রুটিযুক্ত হয়েছে: ' . $file->getErrorMessage(), 422);
                }
                if ($file->getSize() > 52428800) { // 50MB
                    return $this->errorResponse('প্রতিটি ফাইলের সাইজ সর্বোচ্চ ৫০ মেগাবাইট (50MB) হতে পারবে।', 422);
                }
            }

            return DB::transaction(function () use ($request, $batch, $user) {
                $submission = TeacherSubmission::firstOrCreate(
                    [
                        'batch_id' => $batch->id,
                        'teacher_id' => $user->id,
                    ],
                    [
                        'status' => 'submitted',
                        'update_count' => 1,
                        'submitted_at' => now(),
                        'remarks' => $request->input('remarks'),
                    ]
                );

                if (!$submission->wasRecentlyCreated) {
                    $submission->increment('update_count');
                    $submission->update([
                        'last_updated_at' => now(),
                        'status' => 'submitted',
                    ]);
                }

                if ($request->filled('remarks')) {
                    $submission->update(['remarks' => $request->input('remarks')]);
                }

                $targetDir = "submissions/{$batch->id}/{$user->id}";
                $storageDir = storage_path('app/public/' . $targetDir);
                $publicStorageDir = public_path('storage/' . $targetDir);

                if (!is_dir($storageDir)) {
                    @mkdir($storageDir, 0777, true);
                }
                if (!is_dir($publicStorageDir)) {
                    @mkdir($publicStorageDir, 0777, true);
                }

                if (!$batch->allow_multiple_files) {
                    foreach ($submission->files as $existingFile) {
                        if ($existingFile->file_path) {
                            $resolvedOld = $this->resolvePhysicalFilePath($existingFile->file_path);
                            if ($resolvedOld) {
                                @unlink($resolvedOld);
                            }
                        }
                    }
                    $submission->files()->delete();
                }

                $uploadedFiles = [];
                foreach ($request->file('files') as $file) {
                    $originalName = $file->getClientOriginalName();
                    $filename = time() . '_' . preg_replace('/[^a-zA-Z0-9_\.-]/', '_', $originalName);
                    
                    // Move to storage/app/public
                    $file->move($storageDir, $filename);
                    
                    // Also copy to public/storage for fallback
                    @copy($storageDir . '/' . $filename, $publicStorageDir . '/' . $filename);

                    $path = $targetDir . '/' . $filename;

                    $subFile = SubmissionFile::create([
                        'submission_id' => $submission->id,
                        'file_path' => $path,
                        'file_name' => $originalName,
                        'file_size' => @filesize($storageDir . '/' . $filename) ?: $file->getSize(),
                        'file_type' => strtolower($file->getClientOriginalExtension() ?: pathinfo($originalName, PATHINFO_EXTENSION)),
                    ]);
                    $uploadedFiles[] = $subFile;
                }

                $submission->load(['files', 'teacher', 'batch']);

                return $this->successResponse($submission, 'পাঠ পরিকল্পনা সফলভাবে জমা ও সংরক্ষিত হয়েছে!', 201);
            });
        } catch (\Illuminate\Validation\ValidationException $ve) {
            $msg = collect($ve->errors())->flatten()->first() ?: 'ফাইল যাচাইকরণ ব্যর্থ হয়েছে।';
            return $this->errorResponse($msg, 422);
        } catch (\Throwable $e) {
            Log::error('Teacher SubmitFiles Exception: ' . $e->getMessage(), [
                'user_id' => $request->user()?->id ?? null,
                'trace' => $e->getTraceAsString(),
            ]);
            return $this->errorResponse('ফাইল আপলোড প্রক্রিয়া সম্পন্ন করা যায়নি: ' . $e->getMessage(), 500);
        }
    }

    public function syncDrive($arg1, $arg2 = null): JsonResponse
    {
        return $this->successResponse([
            'synced' => true,
            'message' => 'ফাইলগুলো লোকাল সার্ভারে সংরক্ষিত আছে।'
        ], 'ফাইলগুলো লোকাল সার্ভার স্টোরেজে সংরক্ষিত আছে।');
    }

    public function getGoogleDriveStatus(): JsonResponse
    {
        return $this->successResponse([
            'enabled' => false,
            'mode' => 'local_storage',
            'message' => 'লোকাল সার্ভার স্টোরেজ সক্রিয়।'
        ]);
    }

    public function viewFile($arg1, $arg2 = null)
    {
        try {
            $target = ($arg1 instanceof Request) ? $arg2 : ($arg2 ?? $arg1);
            $file = $target instanceof SubmissionFile ? $target : SubmissionFile::find($target);
            if (!$file) {
                return response('ফাইলটি পাওয়া যায়নি।', 404);
            }

            $resolvedPath = $this->resolvePhysicalFilePath($file->file_path);
            if (!$resolvedPath || !file_exists($resolvedPath)) {
                return response('সার্ভারের স্টোরেজে ফাইলটি খুঁজে পাওয়া যায়নি।', 404);
            }

            $mime = $this->getMimeType($file->file_name, $resolvedPath);

            return response()->file($resolvedPath, [
                'Content-Type' => $mime,
                'Content-Disposition' => 'inline; filename="' . rawurlencode($file->file_name) . '"',
                'Cache-Control' => 'public, max-age=86400',
            ]);
        } catch (\Throwable $e) {
            Log::error('View File Error: ' . $e->getMessage());
            return response('ফাইল প্রদর্শনে সমস্যা হয়েছে: ' . $e->getMessage(), 500);
        }
    }

    public function downloadFile($arg1, $arg2 = null)
    {
        try {
            $target = ($arg1 instanceof Request) ? $arg2 : ($arg2 ?? $arg1);
            $file = $target instanceof SubmissionFile ? $target : SubmissionFile::find($target);
            if (!$file) {
                return response('ফাইলটি পাওয়া যায়নি।', 404);
            }

            $resolvedPath = $this->resolvePhysicalFilePath($file->file_path);
            if (!$resolvedPath || !file_exists($resolvedPath)) {
                return response('সার্ভারে ফাইলটি খুঁজে পাওয়া যায়নি।', 404);
            }

            $mime = $this->getMimeType($file->file_name, $resolvedPath);
            $cleanDownloadName = preg_replace('/[^a-zA-Z0-9_\.\-]/', '_', $file->file_name);
            if (empty($cleanDownloadName)) {
                $cleanDownloadName = 'file_' . $file->id . '.' . ($file->file_type ?: 'dat');
            }

            return response()->download($resolvedPath, $cleanDownloadName, [
                'Content-Type' => $mime,
                'Content-Disposition' => 'attachment; filename="' . $cleanDownloadName . '"',
                'Cache-Control' => 'public, must-revalidate',
            ]);
        } catch (\Throwable $e) {
            Log::error('Download File Error: ' . $e->getMessage());
            return response('ফাইল ডাউনলোডে সমস্যা হয়েছে: ' . $e->getMessage(), 500);
        }
    }

    private function resolvePhysicalFilePath(?string $filePath): ?string
    {
        if (!$filePath) return null;

        $cleanPath = ltrim(str_replace('\\', '/', $filePath), '/');
        $withoutStorage = preg_replace('#^(public/|storage/|app/public/)+#i', '', $cleanPath);

        $candidates = [
            storage_path('app/public/' . $withoutStorage),
            public_path('storage/' . $withoutStorage),
            storage_path('app/' . $withoutStorage),
            storage_path('app/public/' . $cleanPath),
            public_path('storage/' . $cleanPath),
            public_path($cleanPath),
            public_path($withoutStorage),
            base_path('storage/app/public/' . $withoutStorage),
            base_path($cleanPath),
        ];

        foreach ($candidates as $path) {
            if (file_exists($path) && is_file($path)) {
                return $path;
            }
        }

        // Fallback: search by filename in submissions folder
        $baseFilename = basename($cleanPath);
        $searchDirs = [
            storage_path('app/public/submissions'),
            public_path('storage/submissions'),
        ];
        foreach ($searchDirs as $dir) {
            if (is_dir($dir)) {
                $files = @glob($dir . '/*/*/' . $baseFilename);
                if (!empty($files) && file_exists($files[0])) {
                    return $files[0];
                }
            }
        }

        return null;
    }

    private function getMimeType(string $filename, string $path): string
    {
        $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        $mimes = [
            'pdf' => 'application/pdf',
            'doc' => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls' => 'application/vnd.ms-excel',
            'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'ppt' => 'application/vnd.ms-powerpoint',
            'pptx' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'txt' => 'text/plain; charset=utf-8',
            'zip' => 'application/zip',
        ];

        return $mimes[$ext] ?? 'application/octet-stream';
    }

    public function deleteFile(Request $request, $fileId = null): JsonResponse
    {
        try {
            $user = $request->user();
            if (!$user) {
                return $this->errorResponse('আপনার সেশন শেষ হয়ে গেছে। অনুগ্রহ করে পুনরায় লগইন করুন।', 401);
            }

            $target = $fileId ?? $request->route('file');
            $file = $target instanceof SubmissionFile ? $target : SubmissionFile::find($target);
            if (!$file) {
                return $this->errorResponse('ফাইলটি পাওয়া যায়নি বা ইতিমধ্যে মুছে ফেলা হয়েছে।', 404);
            }

            $submission = $file->submission;
            if (!$submission) {
                // Delete orphan record
                if ($file->file_path) {
                    $resolved = $this->resolvePhysicalFilePath($file->file_path);
                    if ($resolved) {
                        @unlink($resolved);
                    }
                }
                $file->delete();
                return $this->successResponse(null, 'ফাইল সফলভাবে মুছে ফেলা হয়েছে।');
            }

            $batch = $submission->batch;

            $isAdmin = $user->hasAnyRole(['super_admin', 'principal', 'academic_coordinator']);
            if (!$isAdmin && $submission->teacher_id !== $user->id) {
                return $this->errorResponse('আপনার এই ফাইলটি মুছে ফেলার অনুমতি নেই।', 403);
            }

            if ($batch && !$batch->is_active && !$isAdmin) {
                return $this->errorResponse('এই ব্যাচটি লক করা আছে। ফাইল মোছা যাবে না।', 422);
            }

            // Physically remove local file from both locations
            if ($file->file_path) {
                $resolved = $this->resolvePhysicalFilePath($file->file_path);
                if ($resolved) {
                    @unlink($resolved);
                }
            }

            $file->delete();

            // If no more files remain for this submission, delete the teacher submission record so it resets to not_submitted
            if ($submission->files()->count() === 0) {
                $submission->delete();
            }

            return $this->successResponse(null, 'ফাইল সফলভাবে মুছে ফেলা হয়েছে।');
        } catch (\Throwable $e) {
            Log::error('Delete Submission File Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
            return $this->errorResponse('ফাইল মোছা সম্ভব হয়নি: ' . $e->getMessage(), 500);
        }
    }

    public function updateSubmissionStatus(Request $request, $submissionId = null): JsonResponse
    {
        $target = $submissionId ?? $request->route('submission');
        $submission = $target instanceof TeacherSubmission ? $target : TeacherSubmission::find($target);
        if (!$submission) {
            return $this->errorResponse('সাবমিশনটি পাওয়া যায়নি।', 404);
        }

        $validated = $request->validate([
            'status' => ['required', 'in:submitted,approved,revision_requested'],
            'remarks' => ['nullable', 'string'],
        ]);

        $submission->update($validated);

        return $this->successResponse($submission, 'সাবমিশন স্ট্যাটাস আপডেট হয়েছে।');
    }

    public function downloadAllZip($arg1, $arg2 = null)
    {
        try {
            $target = ($arg1 instanceof Request) ? $arg2 : ($arg2 ?? $arg1);
            $batch = $target instanceof SubmissionBatch ? $target : SubmissionBatch::find($target);
            if (!$batch) {
                return response()->json(['success' => false, 'message' => 'ব্যাচটি পাওয়া যায়নি।'], 404);
            }

            $submissions = $batch->submissions()->with(['teacher.department:id,name_bn,name_en', 'files'])->get();
            if ($submissions->isEmpty()) {
                return response()->json(['success' => false, 'message' => 'কোনো শিক্ষক এখনও ফাইল জমা দেননি।'], 404);
            }

            $zipFileName = 'BSISC_' . preg_replace('/[^a-zA-Z0-9_\-]/', '_', $batch->title) . '_Files.zip';
            $tempPath = storage_path('app/temp_' . time() . '_' . rand(1000, 9999) . '.zip');

            $fileCount = 0;

            // Strategy 1: Use ZipArchive if available
            if (class_exists('\ZipArchive')) {
                $zip = new \ZipArchive();
                if ($zip->open($tempPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) === true) {
                    foreach ($submissions as $sub) {
                        $teacher = $sub->teacher;
                        $deptName = $teacher?->department?->name_en ?: 'General';
                        $safeTeacherName = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $teacher->name ?? 'Teacher');
                        $folderName = "{$deptName}/{$safeTeacherName}";

                        foreach ($sub->files as $f) {
                            $resolved = $this->resolvePhysicalFilePath($f->file_path);
                            if ($resolved) {
                                $zip->addFile($resolved, "{$folderName}/" . $f->file_name);
                                $fileCount++;
                            }
                        }
                    }
                    $zip->close();
                }
            }

            // Strategy 2: If ZipArchive not available or failed to add, use pure PHP ZipBuilder
            if ($fileCount === 0 || !file_exists($tempPath) || filesize($tempPath) === 0) {
                $pureZip = new ZipBuilder();
                $fileCount = 0;
                foreach ($submissions as $sub) {
                    $teacher = $sub->teacher;
                    $deptName = $teacher?->department?->name_en ?: 'General';
                    $safeTeacherName = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $teacher->name ?? 'Teacher');
                    $folderName = "{$deptName}/{$safeTeacherName}";

                    foreach ($sub->files as $f) {
                        $resolved = $this->resolvePhysicalFilePath($f->file_path);
                        if ($resolved) {
                            $pureZip->addFile($resolved, "{$folderName}/" . $f->file_name);
                            $fileCount++;
                        }
                    }
                }

                if ($fileCount > 0) {
                    $pureZip->saveTo($tempPath);
                }
            }

            if ($fileCount === 0 || !file_exists($tempPath)) {
                if (file_exists($tempPath)) {
                    @unlink($tempPath);
                }
                return response()->json(['success' => false, 'message' => 'সার্ভারে জমা হওয়া কোনো ফাইল খুঁজে পাওয়া যায়নি।'], 404);
            }

            return response()->download($tempPath, $zipFileName, [
                'Content-Type' => 'application/zip',
                'Content-Disposition' => 'attachment; filename="' . $zipFileName . '"',
            ])->deleteFileAfterSend(true);
        } catch (\Throwable $e) {
            Log::error('Download Zip Error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['success' => false, 'message' => 'ZIP ফাইল ডাউনলোড ব্যর্থ হয়েছে: ' . $e->getMessage()], 500);
        }
    }

    public function exportSundayReport($arg1, $arg2 = null): JsonResponse
    {
        $target = ($arg1 instanceof Request) ? $arg2 : ($arg2 ?? $arg1);
        $batch = $target instanceof SubmissionBatch ? $target : SubmissionBatch::find($target);
        if (!$batch) {
            return $this->errorResponse('ব্যাচটি পাওয়া যায়নি।', 404);
        }
        $batch->load(['schoolClass:id,name_bn,name_en', 'creator:id,name']);

        $teacherRole = Role::where('name', 'teacher')->first();
        $teachersQuery = $teacherRole ? $teacherRole->users() : User::query();
        $teachers = $teachersQuery->where('users.is_active', true)
            ->with('department:id,name_bn,name_en')
            ->select('users.id', 'users.employee_id', 'users.serial_number', 'users.name', 'users.salutation', 'users.gender', 'users.designation', 'users.department_id', 'users.phone')
            ->orderByRaw('users.serial_number IS NULL, users.serial_number ASC, users.name ASC')
            ->get();

        $submissions = $batch->submissions()
            ->with(['files:id,submission_id,file_name,file_path,file_size,file_type,gdrive_file_id,gdrive_view_link,gdrive_download_link,gdrive_synced_at'])
            ->get()
            ->keyBy('teacher_id');

        $submittedList = [];
        $notSubmittedList = [];

        foreach ($teachers as $t) {
            $sub = $submissions->get($t->id);
            $item = [
                'sl' => $t->serial_number,
                'employee_id' => $t->employee_id,
                'serial_number' => $t->serial_number,
                'name' => $t->name,
                'salutation' => $t->salutation,
                'gender' => $t->gender,
                'designation' => $t->designation ?: 'Teacher',
                'department' => $t->department?->name_bn ?: $t->department?->name_en ?: 'General',
                'phone' => $t->phone ?: 'N/A',
                'update_count' => (int)($sub?->update_count ?? ($sub ? 1 : 0)),
                'submitted_at' => $sub?->submitted_at?->format('d M Y, h:i A'),
                'last_updated_at' => $sub?->last_updated_at ? $sub->last_updated_at->format('d M Y, h:i A') : null,
                'gdrive_folder_url' => $sub?->gdrive_folder_url,
                'files' => $sub ? $sub->files->map(fn($f) => [
                    'name' => $f->file_name,
                    'url' => $f->file_url,
                    'download_url' => $f->download_url,
                    'gdrive_view_link' => $f->gdrive_view_link,
                    'gdrive_download_link' => $f->gdrive_download_link,
                ])->toArray() : [],
                'file_count' => $sub ? $sub->files->count() : 0,
            ];

            if ($sub) {
                $submittedList[] = $item;
            } else {
                $notSubmittedList[] = $item;
            }
        }

        return $this->successResponse([
            'school_name' => "Baridhara Scholars' International School & College (BSISC)",
            'school_name_bn' => 'বারিধারা স্কলার্স ইন্টারন্যাশনাল স্কুল অ্যান্ড কলেজ',
            'address' => 'DOHS Baridhara, Dhaka Cantonment, Dhaka-1206',
            'eiin' => '133988',
            'school_code' => '1242',
            'college_code' => '1760',
            'website' => 'www.bsisc.edu.bd',
            'email' => 'info@bsisc.edu.bd',
            'ref_no' => 'BSISC/ACAD/SUB-MONITOR/' . date('Y') . '/' . str_pad((string)$batch->id, 4, '0', STR_PAD_LEFT),
            'batch' => [
                'id' => $batch->id,
                'title' => $batch->title,
                'category' => $batch->category,
                'class_name' => $batch->schoolClass ? ($batch->schoolClass->name_bn ?: $batch->schoolClass->name_en) : 'সব ক্লাস (All Classes)',
                'date_range' => ($batch->start_date ? $batch->start_date->format('d M') : '') . ' - ' . ($batch->end_date ? $batch->end_date->format('d M Y') : ''),
                'deadline_display' => $batch->end_date ? $batch->end_date->format('l, d F Y (রাত ১১:৫৯)') : '',
                'gdrive_folder_url' => $batch->gdrive_folder_url,
            ],
            'generated_at' => now()->format('l, d F Y - h:i A'),
            'summary' => [
                'total_teachers' => $teachers->count(),
                'submitted_count' => count($submittedList),
                'not_submitted_count' => count($notSubmittedList),
                'completion_percent' => $teachers->count() > 0 ? round((count($submittedList) / $teachers->count()) * 100) : 0,
            ],
            'not_submitted_teachers' => $notSubmittedList,
            'submitted_teachers' => $submittedList,
        ]);
    }
}