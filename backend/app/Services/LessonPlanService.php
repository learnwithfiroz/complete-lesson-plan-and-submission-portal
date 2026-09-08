<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\LessonPlan;
use App\Models\LessonPlanActivity;
use App\Models\LessonPlanOutcome;
use App\Models\LessonPlanReview;
use App\Models\LessonPlanStatusHistory;
use App\Models\Subject;
use App\Models\User;
use App\Notifications\LessonPlanStatusNotification;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LessonPlanService
{
    public static function generateCode(): string
    {
        $year = date('Y');
        do {
            $random = strtoupper(Str::random(6));
            $code = "LP-{$year}-{$random}";
        } while (LessonPlan::where('code', $code)->exists());

        return $code;
    }

    public function createLessonPlan(array $data, User $teacher): LessonPlan
    {
        return DB::transaction(function () use ($data, $teacher) {
            $code = self::generateCode();

            $subject = Subject::find($data['subject_id']);
            $departmentId = $data['department_id'] ?? $subject?->department_id ?? $teacher->department_id;

            $status = (!empty($data['submit_now']) && $data['submit_now'] == true) ? 'submitted' : 'draft';
            $submittedAt = $status === 'submitted' ? now() : null;

            $lessonPlan = LessonPlan::create([
                'code' => $code,
                'teacher_id' => $teacher->id,
                'academic_year_id' => $data['academic_year_id'],
                'term_id' => $data['term_id'],
                'department_id' => $departmentId,
                'class_id' => $data['class_id'],
                'section_id' => $data['section_id'],
                'subject_id' => $data['subject_id'],
                'chapter_id' => $data['chapter_id'] ?? null,

                'title' => $data['title'],
                'topic' => $data['topic'],
                'lesson_date' => $data['lesson_date'],
                'period_number' => $data['period_number'] ?? 1,
                'duration_minutes' => $data['duration_minutes'] ?? 45,
                'student_count' => $data['student_count'] ?? 40,

                'curriculum_reference' => $data['curriculum_reference'] ?? null,
                'competency' => $data['competency'] ?? null,
                'previous_knowledge' => $data['previous_knowledge'] ?? null,
                'key_vocabulary' => $data['key_vocabulary'] ?? null,
                'teaching_method' => $data['teaching_method'] ?? null,
                'teaching_materials' => $data['teaching_materials'] ?? null,
                'digital_resources' => $data['digital_resources'] ?? null,
                'reference_book' => $data['reference_book'] ?? null,

                'formative_assessment' => $data['formative_assessment'] ?? null,
                'assessment_questions' => $data['assessment_questions'] ?? null,
                'success_criteria' => $data['success_criteria'] ?? null,
                'homework' => $data['homework'] ?? null,
                'remedial_activities' => $data['remedial_activities'] ?? null,
                'advanced_learner_activities' => $data['advanced_learner_activities'] ?? null,
                'inclusive_education_support' => $data['inclusive_education_support'] ?? null,
                'special_needs_support' => $data['special_needs_support'] ?? null,
                'teacher_reflection' => $data['teacher_reflection'] ?? null,
                'additional_notes' => $data['additional_notes'] ?? null,
                'attachment_path' => $data['attachment_path'] ?? null,
                'attachment_name' => $data['attachment_name'] ?? null,

                'status' => $status,
                'submitted_at' => $submittedAt,
                'created_by' => $teacher->id,
                'updated_by' => $teacher->id,
            ]);

            if (!empty($data['outcomes']) && is_array($data['outcomes'])) {
                foreach ($data['outcomes'] as $idx => $outcome) {
                    if (!empty($outcome['outcome_text'])) {
                        LessonPlanOutcome::create([
                            'lesson_plan_id' => $lessonPlan->id,
                            'outcome_text' => $outcome['outcome_text'],
                            'sort_order' => $outcome['sort_order'] ?? $idx,
                        ]);
                    }
                }
            }

            if (!empty($data['activities']) && is_array($data['activities'])) {
                foreach ($data['activities'] as $idx => $activity) {
                    LessonPlanActivity::create([
                        'lesson_plan_id' => $lessonPlan->id,
                        'stage' => $activity['stage'],
                        'duration_minutes' => $activity['duration_minutes'] ?? 5,
                        'teacher_activities' => $activity['teacher_activities'],
                        'student_activities' => $activity['student_activities'],
                        'teaching_materials' => $activity['teaching_materials'] ?? null,
                        'assessment_method' => $activity['assessment_method'] ?? null,
                        'sort_order' => $activity['sort_order'] ?? $idx,
                    ]);
                }
            }

            LessonPlanStatusHistory::create([
                'lesson_plan_id' => $lessonPlan->id,
                'from_status' => null,
                'to_status' => $status,
                'action_by' => $teacher->id,
                'comment' => $status === 'submitted' ? 'Plan created and submitted directly for review.' : 'Initial draft saved.',
            ]);

            ActivityLog::create([
                'user_id' => $teacher->id,
                'action' => 'created_lesson_plan',
                'model_type' => LessonPlan::class,
                'model_id' => $lessonPlan->id,
                'payload' => ['code' => $lessonPlan->code, 'status' => $status],
            ]);

            return $lessonPlan;
        });
    }

    public function updateLessonPlan(LessonPlan $lessonPlan, array $data, User $user): LessonPlan
    {
        return DB::transaction(function () use ($lessonPlan, $data, $user) {
            $status = $lessonPlan->status;
            $submittedAt = $lessonPlan->submitted_at;

            if (!empty($data['submit_now']) && $data['submit_now'] == true) {
                $status = 'submitted';
                $submittedAt = now();
            }

            $lessonPlan->update([
                'academic_year_id' => $data['academic_year_id'],
                'term_id' => $data['term_id'],
                'class_id' => $data['class_id'],
                'section_id' => $data['section_id'],
                'subject_id' => $data['subject_id'],
                'chapter_id' => $data['chapter_id'] ?? null,

                'title' => $data['title'],
                'topic' => $data['topic'],
                'lesson_date' => $data['lesson_date'],
                'period_number' => $data['period_number'] ?? 1,
                'duration_minutes' => $data['duration_minutes'] ?? 45,
                'student_count' => $data['student_count'] ?? 40,

                'curriculum_reference' => $data['curriculum_reference'] ?? null,
                'competency' => $data['competency'] ?? null,
                'previous_knowledge' => $data['previous_knowledge'] ?? null,
                'key_vocabulary' => $data['key_vocabulary'] ?? null,
                'teaching_method' => $data['teaching_method'] ?? null,
                'teaching_materials' => $data['teaching_materials'] ?? null,
                'digital_resources' => $data['digital_resources'] ?? null,
                'reference_book' => $data['reference_book'] ?? null,

                'formative_assessment' => $data['formative_assessment'] ?? null,
                'assessment_questions' => $data['assessment_questions'] ?? null,
                'success_criteria' => $data['success_criteria'] ?? null,
                'homework' => $data['homework'] ?? null,
                'remedial_activities' => $data['remedial_activities'] ?? null,
                'advanced_learner_activities' => $data['advanced_learner_activities'] ?? null,
                'inclusive_education_support' => $data['inclusive_education_support'] ?? null,
                'special_needs_support' => $data['special_needs_support'] ?? null,
                'teacher_reflection' => $data['teacher_reflection'] ?? null,
                'additional_notes' => $data['additional_notes'] ?? null,
                'attachment_path' => array_key_exists('attachment_path', $data) ? $data['attachment_path'] : $lessonPlan->attachment_path,
                'attachment_name' => array_key_exists('attachment_name', $data) ? $data['attachment_name'] : $lessonPlan->attachment_name,

                'status' => $status,
                'submitted_at' => $submittedAt,
                'updated_by' => $user->id,
            ]);

            if (isset($data['outcomes'])) {
                $lessonPlan->outcomes()->delete();
                foreach ($data['outcomes'] as $idx => $outcome) {
                    if (!empty($outcome['outcome_text'])) {
                        LessonPlanOutcome::create([
                            'lesson_plan_id' => $lessonPlan->id,
                            'outcome_text' => $outcome['outcome_text'],
                            'sort_order' => $outcome['sort_order'] ?? $idx,
                        ]);
                    }
                }
            }

            if (isset($data['activities'])) {
                $lessonPlan->activities()->delete();
                foreach ($data['activities'] as $idx => $activity) {
                    LessonPlanActivity::create([
                        'lesson_plan_id' => $lessonPlan->id,
                        'stage' => $activity['stage'],
                        'duration_minutes' => $activity['duration_minutes'] ?? 5,
                        'teacher_activities' => $activity['teacher_activities'],
                        'student_activities' => $activity['student_activities'],
                        'teaching_materials' => $activity['teaching_materials'] ?? null,
                        'assessment_method' => $activity['assessment_method'] ?? null,
                        'sort_order' => $activity['sort_order'] ?? $idx,
                    ]);
                }
            }

            if ($status === 'submitted' && $lessonPlan->getOriginal('status') !== 'submitted') {
                LessonPlanStatusHistory::create([
                    'lesson_plan_id' => $lessonPlan->id,
                    'from_status' => $lessonPlan->getOriginal('status'),
                    'to_status' => 'submitted',
                    'action_by' => $user->id,
                    'comment' => 'Lesson plan updated and submitted for review.',
                ]);
            }

            ActivityLog::create([
                'user_id' => $user->id,
                'action' => 'updated_lesson_plan',
                'model_type' => LessonPlan::class,
                'model_id' => $lessonPlan->id,
                'payload' => ['code' => $lessonPlan->code, 'status' => $status],
            ]);

            return $lessonPlan;
        });
    }

    public function submit(LessonPlan $lessonPlan, User $user, ?string $comment = null): LessonPlan
    {
        return DB::transaction(function () use ($lessonPlan, $user, $comment) {
            $fromStatus = $lessonPlan->status;
            $lessonPlan->update([
                'status' => 'submitted',
                'submitted_at' => now(),
                'updated_by' => $user->id,
            ]);

            LessonPlanStatusHistory::create([
                'lesson_plan_id' => $lessonPlan->id,
                'from_status' => $fromStatus,
                'to_status' => 'submitted',
                'action_by' => $user->id,
                'comment' => $comment ?: 'Submitted for academic review.',
            ]);

            ActivityLog::create([
                'user_id' => $user->id,
                'action' => 'submitted_lesson_plan',
                'model_type' => LessonPlan::class,
                'model_id' => $lessonPlan->id,
            ]);

            return $lessonPlan;
        });
    }

    public function startReview(LessonPlan $lessonPlan, User $reviewer, ?string $comment = null): LessonPlan
    {
        return DB::transaction(function () use ($lessonPlan, $reviewer, $comment) {
            $fromStatus = $lessonPlan->status;
            $lessonPlan->update([
                'status' => 'under_review',
                'updated_by' => $reviewer->id,
            ]);

            LessonPlanStatusHistory::create([
                'lesson_plan_id' => $lessonPlan->id,
                'from_status' => $fromStatus,
                'to_status' => 'under_review',
                'action_by' => $reviewer->id,
                'comment' => $comment ?: 'Review process initiated by reviewer.',
            ]);

            return $lessonPlan;
        });
    }

    public function approve(LessonPlan $lessonPlan, User $reviewer, ?string $comment = null): LessonPlan
    {
        return DB::transaction(function () use ($lessonPlan, $reviewer, $comment) {
            $fromStatus = $lessonPlan->status;
            $lessonPlan->update([
                'status' => 'approved',
                'reviewed_at' => now(),
                'updated_by' => $reviewer->id,
            ]);

            LessonPlanReview::create([
                'lesson_plan_id' => $lessonPlan->id,
                'reviewer_id' => $reviewer->id,
                'action' => 'approve',
                'comment' => $comment ?: 'Approved with institutional standards.',
            ]);

            LessonPlanStatusHistory::create([
                'lesson_plan_id' => $lessonPlan->id,
                'from_status' => $fromStatus,
                'to_status' => 'approved',
                'action_by' => $reviewer->id,
                'comment' => $comment ?: 'Approved by reviewer.',
            ]);

            // Notify Teacher
            $lessonPlan->teacher->notify(new LessonPlanStatusNotification($lessonPlan, 'approved', $reviewer, $comment));

            ActivityLog::create([
                'user_id' => $reviewer->id,
                'action' => 'approved_lesson_plan',
                'model_type' => LessonPlan::class,
                'model_id' => $lessonPlan->id,
            ]);

            return $lessonPlan;
        });
    }

    public function returnForCorrection(LessonPlan $lessonPlan, User $reviewer, string $comment): LessonPlan
    {
        return DB::transaction(function () use ($lessonPlan, $reviewer, $comment) {
            $fromStatus = $lessonPlan->status;
            $lessonPlan->update([
                'status' => 'returned',
                'reviewed_at' => now(),
                'updated_by' => $reviewer->id,
            ]);

            LessonPlanReview::create([
                'lesson_plan_id' => $lessonPlan->id,
                'reviewer_id' => $reviewer->id,
                'action' => 'return',
                'comment' => $comment,
            ]);

            LessonPlanStatusHistory::create([
                'lesson_plan_id' => $lessonPlan->id,
                'from_status' => $fromStatus,
                'to_status' => 'returned',
                'action_by' => $reviewer->id,
                'comment' => $comment,
            ]);

            // Notify Teacher
            $lessonPlan->teacher->notify(new LessonPlanStatusNotification($lessonPlan, 'returned', $reviewer, $comment));

            ActivityLog::create([
                'user_id' => $reviewer->id,
                'action' => 'returned_lesson_plan',
                'model_type' => LessonPlan::class,
                'model_id' => $lessonPlan->id,
                'payload' => ['reason' => $comment],
            ]);

            return $lessonPlan;
        });
    }

    public function reject(LessonPlan $lessonPlan, User $reviewer, string $comment): LessonPlan
    {
        return DB::transaction(function () use ($lessonPlan, $reviewer, $comment) {
            $fromStatus = $lessonPlan->status;
            $lessonPlan->update([
                'status' => 'rejected',
                'reviewed_at' => now(),
                'updated_by' => $reviewer->id,
            ]);

            LessonPlanReview::create([
                'lesson_plan_id' => $lessonPlan->id,
                'reviewer_id' => $reviewer->id,
                'action' => 'reject',
                'comment' => $comment,
            ]);

            LessonPlanStatusHistory::create([
                'lesson_plan_id' => $lessonPlan->id,
                'from_status' => $fromStatus,
                'to_status' => 'rejected',
                'action_by' => $reviewer->id,
                'comment' => $comment,
            ]);

            // Notify Teacher
            $lessonPlan->teacher->notify(new LessonPlanStatusNotification($lessonPlan, 'rejected', $reviewer, $comment));

            ActivityLog::create([
                'user_id' => $reviewer->id,
                'action' => 'rejected_lesson_plan',
                'model_type' => LessonPlan::class,
                'model_id' => $lessonPlan->id,
                'payload' => ['reason' => $comment],
            ]);

            return $lessonPlan;
        });
    }

    public function archive(LessonPlan $lessonPlan, User $user): LessonPlan
    {
        return DB::transaction(function () use ($lessonPlan, $user) {
            $fromStatus = $lessonPlan->status;
            $lessonPlan->update([
                'status' => 'archived',
                'updated_by' => $user->id,
            ]);

            LessonPlanStatusHistory::create([
                'lesson_plan_id' => $lessonPlan->id,
                'from_status' => $fromStatus,
                'to_status' => 'archived',
                'action_by' => $user->id,
                'comment' => 'Lesson plan archived.',
            ]);

            return $lessonPlan;
        });
    }

    public function restore(LessonPlan $lessonPlan, User $user): LessonPlan
    {
        return DB::transaction(function () use ($lessonPlan, $user) {
            $lessonPlan->update([
                'status' => 'draft',
                'updated_by' => $user->id,
            ]);

            LessonPlanStatusHistory::create([
                'lesson_plan_id' => $lessonPlan->id,
                'from_status' => 'archived',
                'to_status' => 'draft',
                'action_by' => $user->id,
                'comment' => 'Lesson plan restored to draft.',
            ]);

            return $lessonPlan;
        });
    }

    public function duplicate(LessonPlan $original, User $user): LessonPlan
    {
        return DB::transaction(function () use ($original, $user) {
            $newPlan = $original->replicate([
                'code',
                'status',
                'submitted_at',
                'reviewed_at',
                'created_at',
                'updated_at',
                'deleted_at',
            ]);

            $newPlan->code = self::generateCode();
            $newPlan->title = "Copy of " . $original->title;
            $newPlan->teacher_id = $user->id;
            $newPlan->status = 'draft';
            $newPlan->submitted_at = null;
            $newPlan->reviewed_at = null;
            $newPlan->created_by = $user->id;
            $newPlan->updated_by = $user->id;
            $newPlan->save();

            foreach ($original->outcomes as $outcome) {
                LessonPlanOutcome::create([
                    'lesson_plan_id' => $newPlan->id,
                    'outcome_text' => $outcome->outcome_text,
                    'sort_order' => $outcome->sort_order,
                ]);
            }

            foreach ($original->activities as $activity) {
                LessonPlanActivity::create([
                    'lesson_plan_id' => $newPlan->id,
                    'stage' => $activity->stage,
                    'duration_minutes' => $activity->duration_minutes,
                    'teacher_activities' => $activity->teacher_activities,
                    'student_activities' => $activity->student_activities,
                    'teaching_materials' => $activity->teaching_materials,
                    'assessment_method' => $activity->assessment_method,
                    'sort_order' => $activity->sort_order,
                ]);
            }

            LessonPlanStatusHistory::create([
                'lesson_plan_id' => $newPlan->id,
                'from_status' => null,
                'to_status' => 'draft',
                'action_by' => $user->id,
                'comment' => "Duplicated from Plan {$original->code}.",
            ]);

            return $newPlan;
        });
    }

    public function generatePdf(LessonPlan $lessonPlan)
    {
        $lessonPlan->load([
            'teacher.department',
            'academicYear',
            'term',
            'schoolClass',
            'section',
            'subject',
            'chapter',
            'outcomes',
            'activities',
            'reviews.reviewer',
            'statusHistories.actor',
        ]);

        $pdf = Pdf::loadView('pdf.lesson_plan', ['plan' => $lessonPlan]);
        $pdf->setPaper('a4', 'portrait');
        return $pdf;
    }
}