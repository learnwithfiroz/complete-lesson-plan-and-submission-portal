<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\SubmissionBatch;
use App\Models\SubmissionFile;
use App\Models\TeacherSubmission;
use App\Models\User;
use App\Services\GoogleDriveService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

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

    public function store(Request $request, GoogleDriveService $driveService): JsonResponse
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

        // Create initial Google Drive folder for this batch
        try {
            $driveFolder = $driveService->createOrGetFolder($batch->title);
            if ($driveFolder) {
                $batch->update([
                    'gdrive_folder_id' => $driveFolder['id'],
                    'gdrive_folder_url' => $driveFolder['webViewLink'],
                ]);
            }
        } catch (\Exception $e) {
            Log::warning('Drive batch folder creation error: ' . $e->getMessage());
        }

        return $this->successResponse($batch, 'নতুন ব্যাচ সফলভাবে তৈরি হয়েছে।', 201);
    }

    public function show(Request $request, SubmissionBatch $batch): JsonResponse
    {
        $user = $request->user();
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

    public function toggleActive(SubmissionBatch $batch): JsonResponse
    {
        $batch->update([
            'is_active' => !$batch->is_active,
        ]);

        $statusText = $batch->is_active ? 'সক্রিয় (Active)' : 'লক/নিষ্ক্রিয় (Locked/Inactive)';
        return $this->successResponse($batch, "ব্যাচ স্ট্যাটাস পরিবর্তন করে {$statusText} করা হয়েছে।");
    }

    public function destroy(SubmissionBatch $batch): JsonResponse
    {
        $batch->delete();
        return $this->successResponse(null, 'ব্যাচ সফলভাবে ডিলিট করা হয়েছে।');
    }

    public function submitFiles(Request $request, SubmissionBatch $batch, GoogleDriveService $driveService): JsonResponse
    {
        try {
            $user = $request->user();

            if (!$user) {
                return $this->errorResponse('আপনার সেশন শেষ হয়ে গেছে। অনুগ্রহ করে পুনরায় লগইন করুন।', 401);
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

            return DB::transaction(function () use ($request, $batch, $user, $driveService) {
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
                    // This is an update / revision
                    $submission->increment('update_count');
                    $submission->update([
                        'last_updated_at' => now(),
                        'status' => 'submitted',
                    ]);
                }

                if ($request->filled('remarks')) {
                    $submission->update(['remarks' => $request->input('remarks')]);
                }

                if (!$batch->allow_multiple_files) {
                    // Remove existing files if single file mode
                    $submission->files()->delete();
                }

                $uploadedFiles = [];
                $targetDir = "submissions/{$batch->id}/{$user->id}";
                $targetFullPath = storage_path('app/public/' . $targetDir);
                if (!file_exists($targetFullPath)) {
                    @mkdir($targetFullPath, 0755, true);
                }

                foreach ($request->file('files') as $file) {
                    $originalName = $file->getClientOriginalName();
                    $filename = time() . '_' . preg_replace('/[^a-zA-Z0-9_\.-]/', '_', $originalName);
                    
                    // Safe move without finfo requirement
                    $file->move($targetFullPath, $filename);
                    $path = $targetDir . '/' . $filename;

                    $subFile = SubmissionFile::create([
                        'submission_id' => $submission->id,
                        'file_path' => $path,
                        'file_name' => $originalName,
                        'file_size' => @filesize($targetFullPath . '/' . $filename) ?: $file->getSize(),
                        'file_type' => strtolower($file->getClientOriginalExtension() ?: pathinfo($originalName, PATHINFO_EXTENSION)),
                    ]);
                    $uploadedFiles[] = $subFile;
                }

                $submission->load(['files', 'teacher', 'batch']);

                // Automatic Google Drive Sync under [Batch Title] / [Teacher Name (EMP ID)]
                try {
                    $driveService->syncTeacherSubmission($submission);
                } catch (\Throwable $driveEx) {
                    Log::warning('Google Drive auto-sync notice: ' . $driveEx->getMessage());
                }

                $submission->load('files');

                return $this->successResponse($submission, 'পাঠ পরিকল্পনা সফলভাবে জমা ও সংরক্ষিত হয়েছে!', 201);
            });
        } catch (\Illuminate\Validation\ValidationException $ve) {
            $msg = collect($ve->errors())->flatten()->first() ?: 'ফাইল যাচাইকরণ ব্যর্থ হয়েছে।';
            return $this->errorResponse($msg, 422);
        } catch (\Throwable $e) {
            Log::error('Teacher SubmitFiles Exception: ' . $e->getMessage(), [
                'batch_id' => $batch->id ?? null,
                'user_id' => $request->user()?->id ?? null,
                'trace' => $e->getTraceAsString(),
            ]);
            return $this->errorResponse('ফাইল আপলোড প্রক্রিয়া সম্পন্ন করা যায়নি: ' . $e->getMessage(), 500);
        }
    }

    public function syncDrive(SubmissionBatch $batch, GoogleDriveService $driveService): JsonResponse
    {
        try {
            $result = $driveService->syncEntireBatch($batch);
            return $this->successResponse($result, "ব্যাচের সকল ফাইল Google Drive-এ শিক্ষকভিত্তিক ফোল্ডারে সফলভাবে সিঙ্ক হয়েছে!");
        } catch (\Exception $e) {
            return $this->errorResponse('Google Drive সিঙ্ক করতে সমস্যা হয়েছে: ' . $e->getMessage(), 500);
        }
    }

    public function getGoogleDriveStatus(GoogleDriveService $driveService): JsonResponse
    {
        return $this->successResponse($driveService->getStatus());
    }

    public function deleteFile(Request $request, SubmissionFile $file): JsonResponse
    {
        $user = $request->user();
        $submission = $file->submission;
        $batch = $submission->batch;

        $isAdmin = $user->hasAnyRole(['super_admin', 'principal', 'academic_coordinator']);
        if (!$isAdmin && $submission->teacher_id !== $user->id) {
            return $this->errorResponse('আপনার এই ফাইলটি মুছে ফেলার অনুমতি নেই।', 403);
        }

        if (!$batch->is_active) {
            return $this->errorResponse('এই ব্যাচটি লক করা আছে। ফাইল মোছা যাবে না।', 422);
        }

        Storage::disk('public')->delete($file->file_path);
        $file->delete();

        if ($submission->files()->count() === 0) {
            $submission->delete();
        }

        return $this->successResponse(null, 'ফাইল সফলভাবে মুছে ফেলা হয়েছে।');
    }

    public function updateSubmissionStatus(Request $request, TeacherSubmission $submission): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:submitted,approved,revision_requested'],
            'remarks' => ['nullable', 'string'],
        ]);

        $submission->update($validated);

        return $this->successResponse($submission, 'সাবমিশন স্ট্যাটাস আপডেট হয়েছে।');
    }

    public function downloadAllZip(SubmissionBatch $batch)
    {
        $submissions = $batch->submissions()->with(['teacher.department:id,name_bn,name_en', 'files'])->get();
        if ($submissions->isEmpty()) {
            return response()->json(['success' => false, 'message' => 'কোনো ফাইল জমা হয়নি।'], 404);
        }

        $zipFileName = 'BSISC_' . preg_replace('/[^a-zA-Z0-9_\-]/', '_', $batch->title) . '_Files.zip';
        $tempPath = storage_path('app/temp_' . time() . '.zip');

        $zip = new \ZipArchive();
        if ($zip->open($tempPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
            return response()->json(['success' => false, 'message' => 'ZIP ফাইল তৈরি করা সম্ভব হয়নি।'], 500);
        }

        foreach ($submissions as $sub) {
            $teacher = $sub->teacher;
            $deptName = $teacher?->department?->name_en ?: 'General';
            $safeTeacherName = preg_replace('/[^a-zA-Z0-9_\-]/', '_', $teacher->name);
            $folderName = "{$deptName}/{$safeTeacherName}";

            foreach ($sub->files as $f) {
                $filePath = storage_path('app/public/' . $f->file_path);
                if (file_exists($filePath)) {
                    $zip->addFile($filePath, "{$folderName}/" . $f->file_name);
                }
            }
        }

        $zip->close();

        return response()->download($tempPath, $zipFileName)->deleteFileAfterSend(true);
    }

    public function exportSundayReport(SubmissionBatch $batch): JsonResponse
    {
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