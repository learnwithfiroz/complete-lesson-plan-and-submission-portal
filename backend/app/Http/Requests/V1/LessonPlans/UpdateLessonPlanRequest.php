<?php

namespace App\Http\Requests\V1\LessonPlans;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLessonPlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        $lessonPlan = $this->route('lessonPlan') ?: $this->route('lesson_plan');
        if (!$lessonPlan) return false;

        $user = $this->user();
        if ($user->hasRole('super_admin')) return true;

        return $lessonPlan->teacher_id === $user->id && in_array($lessonPlan->status, ['draft', 'returned']);
    }

    public function rules(): array
    {
        return [
            // Step 1: Basic
            'academic_year_id' => ['required', 'exists:academic_years,id'],
            'term_id' => ['required', 'exists:terms,id'],
            'class_id' => ['required', 'exists:classes,id'],
            'section_id' => ['required', 'exists:sections,id'],
            'subject_id' => ['required', 'exists:subjects,id'],
            'chapter_id' => ['nullable', 'exists:chapters,id'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'title' => ['required', 'string', 'max:255'],
            'topic' => ['required', 'string', 'max:255'],
            'lesson_date' => ['required', 'date'],
            'period_number' => ['nullable', 'integer', 'min:1', 'max:10'],
            'duration_minutes' => ['nullable', 'integer', 'min:15', 'max:180'],
            'student_count' => ['nullable', 'integer', 'min:1', 'max:100'],

            // Step 2: Learning info
            'curriculum_reference' => ['nullable', 'string', 'max:255'],
            'competency' => ['nullable', 'string'],
            'previous_knowledge' => ['nullable', 'string'],
            'key_vocabulary' => ['nullable', 'string'],
            'teaching_method' => ['nullable', 'string', 'max:255'],
            'teaching_materials' => ['nullable', 'string'],
            'digital_resources' => ['nullable', 'string'],
            'reference_book' => ['nullable', 'string'],

            // Dynamic Outcomes
            'outcomes' => ['nullable', 'array'],
            'outcomes.*.outcome_text' => ['required', 'string'],
            'outcomes.*.sort_order' => ['nullable', 'integer'],

            // Step 3: Dynamic Activities
            'activities' => ['nullable', 'array'],
            'activities.*.stage' => ['required', 'in:introduction,presentation,guided_practice,group_work,assessment,conclusion'],
            'activities.*.duration_minutes' => ['required', 'integer', 'min:1'],
            'activities.*.teacher_activities' => ['required', 'string'],
            'activities.*.student_activities' => ['required', 'string'],
            'activities.*.teaching_materials' => ['nullable', 'string'],
            'activities.*.assessment_method' => ['nullable', 'string'],
            'activities.*.sort_order' => ['nullable', 'integer'],

            // Step 4: Assessment & Homework
            'formative_assessment' => ['nullable', 'string'],
            'assessment_questions' => ['nullable', 'string'],
            'success_criteria' => ['nullable', 'string'],
            'homework' => ['nullable', 'string'],
            'remedial_activities' => ['nullable', 'string'],
            'advanced_learner_activities' => ['nullable', 'string'],
            'inclusive_education_support' => ['nullable', 'string'],
            'special_needs_support' => ['nullable', 'string'],
            'teacher_reflection' => ['nullable', 'string'],
            'additional_notes' => ['nullable', 'string'],
            'attachment' => ['nullable', 'file', 'mimes:pdf,doc,docx,ppt,pptx,xls,xlsx,jpg,jpeg,png', 'max:20480'],
            'attachment_path' => ['nullable', 'string'],
            'attachment_name' => ['nullable', 'string'],

            'submit_now' => ['nullable', 'boolean'],
        ];
    }
}