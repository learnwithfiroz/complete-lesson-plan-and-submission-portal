<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SchoolClassResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name_bn' => $this->name_bn,
            'name_en' => $this->name_en,
            'numeric_value' => $this->numeric_value,
            'version' => $this->version,
            'academic_level' => $this->academic_level,
            'level_code' => $this->level_code,
            'order_no' => $this->order_no,
            'grading_scale' => $this->grading_scale,
            'is_active' => (bool)$this->is_active,
            'sections' => SectionResource::collection($this->whenLoaded('sections')),
            'subjects' => SubjectResource::collection($this->whenLoaded('subjects')),
            'sections_count' => $this->whenCounted('sections'),
            'subjects_count' => $this->whenCounted('subjects'),
        ];
    }
}