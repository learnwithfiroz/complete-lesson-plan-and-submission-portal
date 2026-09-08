<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Subject;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AcademicManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_super_admin_can_list_academic_years(): void
    {
        $admin = User::where('email', 'admin@bsisc.edu.bd')->first();

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/v1/academic/years');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'start_date', 'end_date', 'is_current', 'terms'],
                ],
            ]);
    }

    public function test_user_can_list_classes_and_sections(): void
    {
        $teacher = User::where('email', 'teacher1@bsisc.edu.bd')->first();

        $response = $this->actingAs($teacher, 'sanctum')->getJson('/api/v1/academic/classes');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name_bn', 'name_en', 'numeric_value', 'sections'],
                ],
            ]);
    }

    public function test_coordinator_can_assign_teacher_to_class(): void
    {
        $coordinator = User::where('email', 'coordinator@bsisc.edu.bd')->first();
        $teacher = User::where('email', 'teacher4@bsisc.edu.bd')->first(); // Bangla teacher
        $year = AcademicYear::first();
        $class = SchoolClass::where('numeric_value', 8)->first();
        $section = Section::where('class_id', $class->id)->first();
        $subject = Subject::where('code', 'BAN1-08')->first();

        $payload = [
            'teacher_id' => $teacher->id,
            'academic_year_id' => $year->id,
            'class_id' => $class->id,
            'section_id' => $section->id,
            'subject_id' => $subject->id,
        ];

        $response = $this->actingAs($coordinator, 'sanctum')->postJson('/api/v1/academic/teacher-assignments', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
            ]);

        $this->assertDatabaseHas('teacher_assignments', [
            'teacher_id' => $teacher->id,
            'class_id' => $class->id,
            'subject_id' => $subject->id,
        ]);
    }

    public function test_teacher_can_fetch_own_assigned_classes_and_subjects(): void
    {
        $teacher = User::where('email', 'teacher1@bsisc.edu.bd')->first();

        $response = $this->actingAs($teacher, 'sanctum')->getJson('/api/v1/academic/my-assignments');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'data' => [
                    'academic_year',
                    'assignments',
                    'classes',
                    'sections',
                    'subjects',
                ],
            ]);
    }
}
