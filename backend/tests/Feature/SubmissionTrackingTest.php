<?php

namespace Tests\Feature;

use App\Models\SubmissionBatch;
use App\Models\TeacherSubmission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SubmissionTrackingTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $teacher;
    protected User $coordinator;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();

        $this->admin = User::where('email', 'admin@bsisc.edu.bd')->first();
        $this->teacher = User::where('email', 'teacher1@bsisc.edu.bd')->first();
        $this->coordinator = User::where('email', 'coordinator@bsisc.edu.bd')->first();
        Storage::fake('public');
    }

    public function test_user_can_list_submission_batches(): void
    {
        SubmissionBatch::create([
            'category' => 'lesson_plan',
            'title' => 'Week 1 Lesson Plan',
            'start_date' => now()->startOfWeek(),
            'end_date' => now()->endOfWeek(),
            'created_by' => $this->admin->id,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->teacher)
            ->getJson('/api/v1/submission-tracking?category=lesson_plan');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'batches',
                    'counts' => ['active', 'inactive', 'total_teachers'],
                ]
            ]);
    }

    public function test_admin_can_create_submission_batch(): void
    {
        $payload = [
            'category' => 'lesson_plan',
            'title' => 'New Weekly Lesson Plan Batch',
            'start_date' => '2026-09-01',
            'end_date' => '2026-09-07',
            'allow_multiple_files' => true,
            'instructions' => 'অনুগ্রহ করে শনিবার রাত ১১:৫৯ এর মধ্যে ওয়ার্ড বা পিডিএফ ফাইল আপলোড করুন।',
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/v1/submission-tracking', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'New Weekly Lesson Plan Batch');

        $this->assertDatabaseHas('submission_batches', [
            'title' => 'New Weekly Lesson Plan Batch',
        ]);
    }

    public function test_teacher_can_submit_files_to_active_batch(): void
    {
        $batch = SubmissionBatch::create([
            'category' => 'lesson_plan',
            'title' => 'Week 2 Lesson Plan',
            'start_date' => now()->startOfWeek(),
            'end_date' => now()->endOfWeek(),
            'created_by' => $this->admin->id,
            'is_active' => true,
            'allow_multiple_files' => true,
        ]);

        $file1 = UploadedFile::fake()->create('LessonPlan_Math.docx', 500);
        $file2 = UploadedFile::fake()->create('LessonPlan_Science.pdf', 300);

        $response = $this->actingAs($this->teacher)
            ->postJson("/api/v1/submission-tracking/{$batch->id}/submit", [
                'files' => [$file1, $file2],
                'remarks' => 'ক্লাস ৮ ও ৯ এর গণিত এবং বিজ্ঞানের পাঠ পরিকল্পনা জমা দেওয়া হলো।',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('teacher_submissions', [
            'batch_id' => $batch->id,
            'teacher_id' => $this->teacher->id,
        ]);
    }

    public function test_coordinator_can_fetch_sunday_morning_report(): void
    {
        $batch = SubmissionBatch::create([
            'category' => 'lesson_plan',
            'title' => 'Week 3 Lesson Plan',
            'start_date' => now()->startOfWeek(),
            'end_date' => now()->endOfWeek(),
            'created_by' => $this->admin->id,
            'is_active' => true,
        ]);

        // Teacher 1 submits
        TeacherSubmission::create([
            'batch_id' => $batch->id,
            'teacher_id' => $this->teacher->id,
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        $response = $this->actingAs($this->coordinator)
            ->getJson("/api/v1/submission-tracking/{$batch->id}/sunday-report");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'school_name',
                    'batch',
                    'generated_at',
                    'summary' => [
                        'total_teachers',
                        'submitted_count',
                        'not_submitted_count',
                        'completion_percent',
                    ],
                    'not_submitted_teachers',
                    'submitted_teachers',
                ]
            ]);
    }

    public function test_admin_can_toggle_batch_active_status(): void
    {
        $batch = SubmissionBatch::create([
            'category' => 'lesson_plan',
            'title' => 'Week 4 Lesson Plan',
            'start_date' => now()->startOfWeek(),
            'end_date' => now()->endOfWeek(),
            'created_by' => $this->admin->id,
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->admin)
            ->patchJson("/api/v1/submission-tracking/{$batch->id}/toggle-active");

        $response->assertStatus(200);
        $this->assertDatabaseHas('submission_batches', [
            'id' => $batch->id,
            'is_active' => false,
        ]);
    }
}