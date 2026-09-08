<?php

namespace Tests\Feature;

use App\Models\AcademicYear;
use App\Models\LessonPlan;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Subject;
use App\Models\Term;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LessonPlanCrudTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_teacher_can_create_lesson_plan_draft_with_outcomes_and_activities(): void
    {
        $teacher = User::where('email', 'teacher1@bsisc.edu.bd')->first();
        $year = AcademicYear::where('is_current', true)->first();
        $term = Term::where('academic_year_id', $year->id)->first();
        $class = SchoolClass::where('numeric_value', 9)->first();
        $section = Section::where('class_id', $class->id)->first();
        $subject = Subject::where('code', 'MATH-09')->first();

        $payload = [
            'academic_year_id' => $year->id,
            'term_id' => $term->id,
            'class_id' => $class->id,
            'section_id' => $section->id,
            'subject_id' => $subject->id,
            'title' => 'দ্বিঘাত সমীকরণ ও বাস্তব সমস্যা সমাধান',
            'topic' => 'দ্বিঘাত সমীকরণ ৩.১',
            'lesson_date' => '2026-09-10',
            'period_number' => 2,
            'duration_minutes' => 45,
            'student_count' => 42,
            'curriculum_reference' => 'NCTB Class 9 Mathematics Page 45',
            'competency' => 'শিক্ষার্থীরা দ্বিঘাত সমীকরণের মূল নির্ণয় করতে পারবে',
            'previous_knowledge' => 'একঘাত সমীকরণ সমাধান করার পূর্বজ্ঞান',
            'key_vocabulary' => 'চলক, সহগ, মূল, ঘাত',
            'teaching_method' => 'প্রশ্নোত্তর ও একক অনুশীলন পদ্ধতি',
            'teaching_materials' => 'হোয়াইটবোর্ড, মার্কার, পাঠ্যপুস্তক, মডেল চার্ট',
            'digital_resources' => 'https://youtube.com/math-quad',
            'outcomes' => [
                ['outcome_text' => 'দ্বিঘাত সমীকরণের আদর্শ রূপ লিখতে পারবে', 'sort_order' => 1],
                ['outcome_text' => 'উৎপাদক পদ্ধতি প্রয়োগ করতে পারবে', 'sort_order' => 2],
            ],
            'activities' => [
                [
                    'stage' => 'introduction',
                    'duration_minutes' => 5,
                    'teacher_activities' => 'পূর্বজ্ঞান যাচাই ও পাঠ ঘোষণা',
                    'student_activities' => 'প্রশ্নের উত্তর প্রদান',
                    'teaching_materials' => 'পাঠ্যবই',
                    'assessment_method' => 'মৌখিক প্রশ্ন',
                    'sort_order' => 1,
                ],
                [
                    'stage' => 'presentation',
                    'duration_minutes' => 15,
                    'teacher_activities' => 'বোর্ডে দ্বিঘাত সমীকরণের উদাহরণ উপস্থাপন',
                    'student_activities' => 'মনোযোগ দিয়ে লক্ষ্য করবে ও খাতায় তুলবে',
                    'teaching_materials' => 'হোয়াইটবোর্ড',
                    'assessment_method' => 'পর্যবেক্ষণ',
                    'sort_order' => 2,
                ],
                [
                    'stage' => 'guided_practice',
                    'duration_minutes' => 10,
                    'teacher_activities' => 'শিক্ষার্থীদের সহায়তা প্রদান',
                    'student_activities' => 'জোড়ায় সমস্যা সমাধান করবে',
                    'teaching_materials' => 'ওয়ার্কশিট',
                    'assessment_method' => 'খাতা মূল্যায়ন',
                    'sort_order' => 3,
                ],
                [
                    'stage' => 'conclusion',
                    'duration_minutes' => 5,
                    'teacher_activities' => 'সারসংক্ষেপ ও বাড়ির কাজ প্রদান',
                    'student_activities' => 'বাড়ির কাজ লিখে নেওয়া',
                    'teaching_materials' => 'হোয়াইটবোর্ড',
                    'assessment_method' => 'ফিডব্যাক',
                    'sort_order' => 4,
                ],
            ],
            'homework' => 'অনুশীলনী ৩.১ এর ১ থেকে ৫ পর্যন্ত সমস্যা সমাধান',
            'submit_now' => false,
        ];

        $response = $this->actingAs($teacher, 'sanctum')->postJson('/api/v1/lesson-plans', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'title' => 'দ্বিঘাত সমীকরণ ও বাস্তব সমস্যা সমাধান',
                    'status' => 'draft',
                ],
            ]);

        $this->assertDatabaseHas('lesson_plans', [
            'teacher_id' => $teacher->id,
            'title' => 'দ্বিঘাত সমীকরণ ও বাস্তব সমস্যা সমাধান',
            'status' => 'draft',
        ]);

        $this->assertDatabaseHas('lesson_plan_outcomes', [
            'outcome_text' => 'দ্বিঘাত সমীকরণের আদর্শ রূপ লিখতে পারবে',
        ]);

        $this->assertDatabaseHas('lesson_plan_activities', [
            'stage' => 'presentation',
            'duration_minutes' => 15,
        ]);
    }

    public function test_teacher_can_duplicate_lesson_plan(): void
    {
        $teacher = User::where('email', 'teacher1@bsisc.edu.bd')->first();
        $year = AcademicYear::first();
        $term = Term::first();
        $class = SchoolClass::first();
        $section = Section::first();
        $subject = Subject::first();

        $plan = LessonPlan::create([
            'code' => 'LP-2026-TEST01',
            'teacher_id' => $teacher->id,
            'academic_year_id' => $year->id,
            'term_id' => $term->id,
            'class_id' => $class->id,
            'section_id' => $section->id,
            'subject_id' => $subject->id,
            'title' => 'Master Lesson Plan',
            'topic' => 'Topic 1',
            'lesson_date' => '2026-09-12',
            'period_number' => 1,
            'duration_minutes' => 45,
            'student_count' => 40,
            'status' => 'approved',
            'created_by' => $teacher->id,
        ]);

        $response = $this->actingAs($teacher, 'sanctum')->postJson("/api/v1/lesson-plans/{$plan->id}/duplicate");

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'title' => 'Copy of Master Lesson Plan',
                    'status' => 'draft',
                ],
            ]);

        $this->assertDatabaseHas('lesson_plans', [
            'title' => 'Copy of Master Lesson Plan',
            'status' => 'draft',
        ]);
    }

    public function test_teacher_cannot_delete_another_teachers_draft(): void
    {
        $teacher1 = User::where('email', 'teacher1@bsisc.edu.bd')->first();
        $teacher2 = User::where('email', 'teacher2@bsisc.edu.bd')->first();
        $year = AcademicYear::first();
        $term = Term::first();
        $class = SchoolClass::first();
        $section = Section::first();
        $subject = Subject::first();

        $plan = LessonPlan::create([
            'code' => 'LP-2026-T1PLAN',
            'teacher_id' => $teacher1->id,
            'academic_year_id' => $year->id,
            'term_id' => $term->id,
            'class_id' => $class->id,
            'section_id' => $section->id,
            'subject_id' => $subject->id,
            'title' => 'Teacher 1 Plan',
            'topic' => 'Topic',
            'lesson_date' => '2026-09-15',
            'status' => 'draft',
            'created_by' => $teacher1->id,
        ]);

        $response = $this->actingAs($teacher2, 'sanctum')->deleteJson("/api/v1/lesson-plans/{$plan->id}");

        $response->assertStatus(403);
    }
}
