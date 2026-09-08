<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\Chapter;
use App\Models\LessonPlan;
use App\Models\LessonPlanActivity;
use App\Models\LessonPlanOutcome;
use App\Models\LessonPlanReview;
use App\Models\LessonPlanStatusHistory;
use App\Models\LessonPlanTemplate;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\Seeder;

class LessonPlanSeeder extends Seeder
{
    public function run(): void
    {
        $year = AcademicYear::where('is_current', true)->first() ?? AcademicYear::first();
        $term = $year->terms()->first();
        $class = SchoolClass::first();
        $section = $class?->sections()->first();
        $subject = Subject::where('code', 'MATH-09')->first() ?? Subject::first();
        $chapter = $subject?->chapters()->first();

        $teacher = User::where('email', 'teacher1@bsisc.edu.bd')->first() ?? User::first();
        $coordinator = User::where('email', 'coordinator@bsisc.edu.bd')->first() ?? User::first();
        $principal = User::where('email', 'principal@bsisc.edu.bd')->first() ?? User::first();

        if (!$year || !$class || !$subject || !$teacher) {
            return;
        }

        // 1. Approved Plan
        $p1 = LessonPlan::create([
            'code' => 'LP-2026-MATH01',
            'teacher_id' => $teacher->id,
            'academic_year_id' => $year->id,
            'term_id' => $term->id,
            'department_id' => $teacher->department_id,
            'class_id' => $class->id,
            'section_id' => $section?->id,
            'subject_id' => $subject->id,
            'chapter_id' => $chapter?->id,
            'title' => 'দ্বিঘাত সমীকরণ ও বাস্তব সমস্যা সমাধান',
            'topic' => 'অধ্যায় ৫: বীজগাণিতিক সমীকরণ সমাধান ও মূল নির্ণয়',
            'lesson_date' => date('Y-m-d', strtotime('+1 day')),
            'period_number' => 2,
            'duration_minutes' => 45,
            'student_count' => 40,
            'status' => 'approved',
            'previous_knowledge' => 'একঘাত সমীকরণ ও মৌলিক উৎপাদক বিশ্লেষণ',
            'competency' => 'বাস্তব জীবনের গাণিতিক সমস্যাকে দ্বিঘাত সমীকরণে রূপান্তর ও সমাধান',
            'teaching_method' => 'Interactive Discussion & Q/A, Lecture & Board Demonstration',
            'teaching_materials' => 'হোয়াইটবোর্ড, পাঠ্যবই পৃষ্ঠা ১৪২, সূত্র চার্ট',
            'formative_assessment' => 'বোর্ড ওয়ার্ক ও একক মূল্যায়ন কুইজ',
            'success_criteria' => 'শিক্ষার্থীরা অন্তত ৪টি দ্বিঘাত সমীকরণ সঠিকভাবে সমাধান করতে পারবে',
            'homework' => 'অনুশীলনী ৫.১ এর ১ থেকে ১০ নম্বর সমস্যা সমাধান',
            'submitted_at' => now()->subDays(2),
            'reviewed_at' => now()->subDay(),
            'created_by' => $teacher->id,
            'updated_by' => $principal->id,
        ]);

        LessonPlanOutcome::create([
            'lesson_plan_id' => $p1->id,
            'outcome_text' => 'দ্বিঘাত সমীকরণের আদর্শ রূপ (ax² + bx + c = 0) চিহ্নিত করতে পারবে',
            'sort_order' => 1,
        ]);
        LessonPlanOutcome::create([
            'lesson_plan_id' => $p1->id,
            'outcome_text' => 'উৎপাদক সূত্রের সাহায্যে সমীকরণের সমাধান করতে পারবে',
            'sort_order' => 2,
        ]);

        LessonPlanActivity::create([
            'lesson_plan_id' => $p1->id,
            'stage' => 'introduction',
            'duration_minutes' => 5,
            'teacher_activities' => 'পূর্বজ্ঞান যাচাই ও বাস্তব উদাহরণ দিয়ে ক্লাসের সূচনা',
            'student_activities' => 'মনোযোগ দিয়ে প্রশ্নের উত্তর প্রদান',
            'sort_order' => 1,
        ]);
        LessonPlanActivity::create([
            'lesson_plan_id' => $p1->id,
            'stage' => 'presentation',
            'duration_minutes' => 15,
            'teacher_activities' => 'দ্বিঘাত সূত্রের প্রতিপাদন ও বোর্ডে ধাপসমূহ ব্যাখ্যা',
            'student_activities' => 'নোট গ্রহণ ও সূত্র পর্যালোচনা',
            'sort_order' => 2,
        ]);
        LessonPlanActivity::create([
            'lesson_plan_id' => $p1->id,
            'stage' => 'guided_practice',
            'duration_minutes' => 15,
            'teacher_activities' => 'জোড়ায় কাজ পরিচালনা ও শিক্ষার্থীদের সমস্যা সমাধানে সহায়তা',
            'student_activities' => 'জোড়ায় বসে অনুশীলন সমস্যার সমাধান',
            'sort_order' => 3,
        ]);
        LessonPlanActivity::create([
            'lesson_plan_id' => $p1->id,
            'stage' => 'conclusion',
            'duration_minutes' => 10,
            'teacher_activities' => 'সারসংক্ষেপ মূল্যায়ন ও বাড়ির কাজ প্রদান',
            'student_activities' => 'বাড়ির কাজ লিপিবদ্ধকরণ',
            'sort_order' => 4,
        ]);

        LessonPlanReview::create([
            'lesson_plan_id' => $p1->id,
            'reviewer_id' => $principal->id,
            'action' => 'approve',
            'comment' => 'Comprehensive pedagogy and clear timing distribution. Approved for classroom delivery.',
        ]);

        LessonPlanStatusHistory::create([
            'lesson_plan_id' => $p1->id,
            'from_status' => 'submitted',
            'to_status' => 'approved',
            'action_by' => $principal->id,
            'comment' => 'Approved by Principal.',
        ]);

        // 2. Under Review Plan
        $p2 = LessonPlan::create([
            'code' => 'LP-2026-MATH02',
            'teacher_id' => $teacher->id,
            'academic_year_id' => $year->id,
            'term_id' => $term->id,
            'department_id' => $teacher->department_id,
            'class_id' => $class->id,
            'section_id' => $section?->id,
            'subject_id' => $subject->id,
            'title' => 'জ্যামিতিক উপপাদ্য: পিথাগোরাসের উপপাদ্য প্রমাণ',
            'topic' => 'অধ্যায় ৯: ত্রিভুজের ক্ষেত্রফল ও পিথাগোরাস উপপাদ্য',
            'lesson_date' => date('Y-m-d', strtotime('+3 days')),
            'period_number' => 3,
            'duration_minutes' => 45,
            'student_count' => 38,
            'status' => 'under_review',
            'submitted_at' => now()->subHours(5),
            'created_by' => $teacher->id,
        ]);

        LessonPlanActivity::create([
            'lesson_plan_id' => $p2->id,
            'stage' => 'presentation',
            'duration_minutes' => 20,
            'teacher_activities' => 'জ্যামিতিক প্রমাণ প্রদর্শন',
            'student_activities' => 'খাতায় চিত্রাঙ্কন ও ধাপ অনুসরণ',
            'sort_order' => 1,
        ]);

        LessonPlanStatusHistory::create([
            'lesson_plan_id' => $p2->id,
            'from_status' => 'submitted',
            'to_status' => 'under_review',
            'action_by' => $coordinator->id,
            'comment' => 'Review initiated by Academic Coordinator.',
        ]);

        // 3. System Template
        LessonPlanTemplate::create([
            'title' => 'BSISC Standard 5E Model Template (Mathematics & Science)',
            'subject_id' => $subject->id,
            'department_id' => $teacher->department_id,
            'created_by' => $coordinator->id,
            'is_system' => true,
            'is_active' => true,
            'template_data' => [
                'title' => 'Standard 5E Instructional Plan',
                'teaching_method' => 'Engage, Explore, Explain, Elaborate, Evaluate',
                'teaching_materials' => 'Whiteboard, Digital Projector, Textbook',
                'outcomes' => [
                    ['outcome_text' => 'Demonstrate foundational comprehension of the core concept', 'sort_order' => 1],
                    ['outcome_text' => 'Execute practical problem-solving using appropriate methods', 'sort_order' => 2],
                ],
                'activities' => [
                    ['stage' => 'introduction', 'duration_minutes' => 5, 'teacher_activities' => 'Hook & Recall', 'student_activities' => 'Engage & Discuss', 'sort_order' => 1],
                    ['stage' => 'presentation', 'duration_minutes' => 15, 'teacher_activities' => 'Direct Instruction', 'student_activities' => 'Listen & Note', 'sort_order' => 2],
                    ['stage' => 'guided_practice', 'duration_minutes' => 15, 'teacher_activities' => 'Facilitate Pair Work', 'student_activities' => 'Solve together', 'sort_order' => 3],
                    ['stage' => 'conclusion', 'duration_minutes' => 10, 'teacher_activities' => 'Summary & Homework', 'student_activities' => 'Record homework', 'sort_order' => 4],
                ],
            ],
        ]);
    }
}
