<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LessonPlanActivityResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'lesson_plan_id' => $this->lesson_plan_id,
            'stage' => $this->stage,
            'duration_minutes' => (int)$this->duration_minutes,
            'teacher_activities' => $this->teacher_activities,
            'student_activities' => $this->student_activities,
            'teaching_materials' => $this->teaching_materials,
            'assessment_method' => $this->assessment_method,
            'sort_order' => (int)$this->sort_order,
        ];
    }
}