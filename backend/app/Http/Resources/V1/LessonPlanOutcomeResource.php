<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LessonPlanOutcomeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'lesson_plan_id' => $this->lesson_plan_id,
            'outcome_text' => $this->outcome_text,
            'sort_order' => $this->sort_order,
        ];
    }
}