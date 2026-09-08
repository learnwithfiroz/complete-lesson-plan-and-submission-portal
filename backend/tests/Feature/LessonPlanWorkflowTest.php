<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\Department;
use App\Models\LessonPlan;
use App\Models\Role;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Subject;
use App\Models\Term;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LessonPlanWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected User $teacher;
    protected User $coordinator;
    protected User $principal;
    protected AcademicYear $year;
    protected Term $term;
    protected SchoolClass $class;
    protected Section $section;
    protected Subject $subject;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleAndPermissionSeeder::class);

        $dept = Department::create(['name_bn' => 'গণিত', 'name_en' => 'Mathematics', 'code' => 'MATH']);

        $teacherRole = Role::where('name', 'teacher')->first();
        $coordRole = Role::where('name', 'academic_coordinator')->first();
        $principalRole = Role::where('name', 'principal')->first();

        $this->teacher = User::create([
            'name' => 'Teacher One',
            'email' => 'teacher1@bsisc.edu.bd',
            'password' => bcrypt('Password123!'),
            'department_id' => $dept->id,
            'is_active' => true,
        ]);
        $this->teacher->roles()->attach($teacherRole);

        $this->coordinator = User::create([
            'name' => 'Academic Coordinator',
            'email' => 'coordinator@bsisc.edu.bd',
            'password' => bcrypt('Password123!'),
            'department_id' => $dept->id,
            'is_active' => true,
        ]);
        $this->coordinator->roles()->attach($coordRole);

        $this->principal = User::create([
            'name' => 'Principal',
            'email' => 'principal@bsisc.edu.bd',
            'password' => bcrypt('Password123!'),
            'is_active' => true,
        ]);
        $this->principal->roles()->attach($principalRole);

        $this->year = AcademicYear::create(['name' => '2026', 'start_date' => '2026-01-01', 'end_date' => '2026-12-31', 'is_current' => true]);
        $this->term = Term::create(['academic_year_id' => $this->year->id, 'name_bn' => '১ম সাময়িক', 'name_en' => 'Term 1', 'start_date' => '2026-01-01', 'end_date' => '2026-04-30', 'is_current' => true]);
        $this->class = SchoolClass::create(['name_bn' => 'শ্রেণী ১০', 'name_en' => 'Class 10', 'numeric_value' => 10]);
        $this->section = Section::create(['class_id' => $this->class->id, 'name_bn' => 'পদ্মা', 'name_en' => 'Padma']);
        $this->subject = Subject::create(['name_bn' => 'গণিত', 'name_en' => 'Mathematics', 'code' => 'MATH-10', 'class_id' => $this->class->id, 'department_id' => $dept->id]);
    }

    public function test_full_lesson_plan_workflow_lifecycle(): void
    {
        // 1. Teacher creates draft
        $response = $this->actingAs($this->teacher, 'sanctum')->postJson('/api/v1/lesson-plans', [
            'academic_year_id' => $this->year->id,
            'term_id' => $this->term->id,
            'class_id' => $this->class->id,
            'section_id' => $this->section->id,
            'subject_id' => $this->subject->id,
            'title' => 'Quadratic Equations Lifecycle',
            'topic' => 'Solving by factorization',
            'lesson_date' => '2026-09-10',
            'period_number' => 2,
            'duration_minutes' => 45,
            'activities' => [
                [
                    'stage' => 'introduction',
                    'duration_minutes' => 5,
                    'teacher_activities' => 'Hook questions',
                    'student_activities' => 'Respond to questions',
                ],
            ],
            'outcomes' => [
                ['outcome_text' => 'Factorize quadratic expressions', 'sort_order' => 1],
            ],
        ]);

        $response->assertStatus(201);
        $planId = $response->json('data.id');
        $this->assertEquals('draft', $response->json('data.status'));

        // 2. Teacher submits plan
        $submitRes = $this->actingAs($this->teacher, 'sanctum')->postJson("/api/v1/lesson-plans/{$planId}/submit", [
            'comment' => 'Ready for academic review',
        ]);
        $submitRes->assertStatus(200);
        $this->assertEquals('submitted', $submitRes->json('data.status'));

        // 3. Coordinator starts review
        $reviewRes = $this->actingAs($this->coordinator, 'sanctum')->postJson("/api/v1/lesson-plans/{$planId}/start-review");
        $reviewRes->assertStatus(200);
        $this->assertEquals('under_review', $reviewRes->json('data.status'));

        // 4. Coordinator returns for correction
        $returnRes = $this->actingAs($this->coordinator, 'sanctum')->postJson("/api/v1/lesson-plans/{$planId}/return", [
            'comment' => 'Please add more formative assessment steps in activities.',
        ]);
        $returnRes->assertStatus(200);
        $this->assertEquals('returned', $returnRes->json('data.status'));

        // 5. Teacher resubmits
        $resubmitRes = $this->actingAs($this->teacher, 'sanctum')->postJson("/api/v1/lesson-plans/{$planId}/submit", [
            'comment' => 'Updated assessment steps.',
        ]);
        $resubmitRes->assertStatus(200);
        $this->assertEquals('submitted', $resubmitRes->json('data.status'));

        // 6. Principal approves
        $approveRes = $this->actingAs($this->principal, 'sanctum')->postJson("/api/v1/lesson-plans/{$planId}/approve", [
            'comment' => 'Excellent lesson plan. Approved.',
        ]);
        $approveRes->assertStatus(200);
        $this->assertEquals('approved', $approveRes->json('data.status'));
    }

    public function test_dashboard_stats_and_reports(): void
    {
        // Create an approved plan
        LessonPlan::create([
            'code' => 'LP-2026-TEST01',
            'teacher_id' => $this->teacher->id,
            'academic_year_id' => $this->year->id,
            'term_id' => $this->term->id,
            'department_id' => $this->teacher->department_id,
            'class_id' => $this->class->id,
            'section_id' => $this->section->id,
            'subject_id' => $this->subject->id,
            'title' => 'Sample Approved Plan',
            'topic' => 'Probability Basics',
            'lesson_date' => '2026-09-10',
            'status' => 'approved',
            'created_by' => $this->teacher->id,
        ]);

        // Dashboard Stats
        $statsRes = $this->actingAs($this->principal, 'sanctum')->getJson('/api/v1/dashboard/stats');
        $statsRes->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => [
                    'summary' => ['total', 'approved', 'draft', 'submitted'],
                    'submission_trends',
                    'plans_by_subject',
                    'recent_plans',
                ],
            ]);

        // Report Summary
        $reportRes = $this->actingAs($this->principal, 'sanctum')->getJson('/api/v1/reports/summary');
        $reportRes->assertStatus(200)
            ->assertJsonStructure(['status', 'data' => ['department_summary', 'teachers_summary']]);

        // Report CSV export
        $csvRes = $this->actingAs($this->principal, 'sanctum')->get('/api/v1/reports/export/excel');
        $csvRes->assertStatus(200);
        $this->assertTrue(str_contains($csvRes->headers->get('content-type'), 'text/csv'));
    }
}
