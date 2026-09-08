<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LessonPlanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'title' => $this->title,
            'topic' => $this->topic,
            'lesson_date' => $this->lesson_date?->format('Y-m-d'),
            'period_number' => (int)$this->period_number,
            'duration_minutes' => (int)$this->duration_minutes,
            'student_count' => (int)$this->student_count,
            'status' => $this->status,
            'submitted_at' => $this->submitted_at?->toISOString(),
            'reviewed_at' => $this->reviewed_at?->toISOString(),

            // Relations
            'teacher' => [
                'id' => $this->teacher->id,
                'name' => $this->teacher->name,
                'email' => $this->teacher->email,
                'designation' => $this->teacher->designation,
            ],
            'academic_year' => [
                'id' => $this->academicYear->id,
                'name' => $this->academicYear->name,
            ],
            'term' => [
                'id' => $this->term->id,
                'name_bn' => $this->term->name_bn,
                'name_en' => $this->term->name_en,
            ],
            'school_class' => [
                'id' => $this->schoolClass->id,
                'name_bn' => $this->schoolClass->name_bn,
                'name_en' => $this->schoolClass->name_en,
            ],
            'section' => [
                'id' => $this->section->id,
                'name_bn' => $this->section->name_bn,
                'name_en' => $this->section->name_en,
            ],
            'subject' => [
                'id' => $this->subject->id,
                'name_bn' => $this->subject->name_bn,
                'name_en' => $this->subject->name_en,
                'code' => $this->subject->code,
            ],
            'chapter' => $this->chapter ? [
                'id' => $this->chapter->id,
                'chapter_no' => $this->chapter->chapter_no,
                'title_bn' => $this->chapter->title_bn,
            ] : null,
            'department' => $this->department ? [
                'id' => $this->department->id,
                'name_bn' => $this->department->name_bn,
            ] : null,

            // Nested detail items (when loaded)
            'outcomes' => LessonPlanOutcomeResource::collection($this->whenLoaded('outcomes')),
            'activities' => LessonPlanActivityResource::collection($this->whenLoaded('activities')),
            'reviews' => LessonPlanReviewResource::collection($this->whenLoaded('reviews')),
            'status_histories' => LessonPlanStatusHistoryResource::collection($this->whenLoaded('statusHistories')),

            // Detailed curriculum and pedagogical attributes
            'curriculum_reference' => $this->curriculum_reference,
            'competency' => $this->competency,
            'previous_knowledge' => $this->previous_knowledge,
            'key_vocabulary' => $this->key_vocabulary,
            'teaching_method' => $this->teaching_method,
            'teaching_materials' => $this->teaching_materials,
            'digital_resources' => $this->digital_resources,
            'reference_book' => $this->reference_book,
            'formative_assessment' => $this->formative_assessment,
            'assessment_questions' => $this->assessment_questions,
            'success_criteria' => $this->success_criteria,
            'homework' => $this->homework,
            'remedial_activities' => $this->remedial_activities,
            'advanced_learner_activities' => $this->advanced_learner_activities,
            'inclusive_education_support' => $this->inclusive_education_support,
            'special_needs_support' => $this->special_needs_support,
            'teacher_reflection' => $this->teacher_reflection,
            'additional_notes' => $this->additional_notes,
            'attachment_name' => $this->attachment_name,
            'attachment_url' => $this->attachment_url,

            'can_edit' => in_array($this->status, ['draft', 'returned']) && (auth()->id() === $this->teacher_id || auth()->user()?->hasRole('super_admin')),
            'can_submit' => in_array($this->status, ['draft', 'returned']) && auth()->id() === $this->teacher_id,
            'can_review' => in_array($this->status, ['submitted', 'under_review']) && auth()->user()?->hasPermission('lesson_plans.review'),
            'can_delete' => $this->status === 'draft' && (auth()->id() === $this->teacher_id || auth()->user()?->hasRole('super_admin')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}