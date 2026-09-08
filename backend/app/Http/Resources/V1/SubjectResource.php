<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'department_id' => $this->department_id,
            'class_id' => $this->class_id,
            'name_bn' => $this->name_bn,
            'name_en' => $this->name_en,
            'code' => $this->code,
            'is_active' => (bool)$this->is_active,
            'department' => new DepartmentResource($this->whenLoaded('department')),
            'school_class' => new SchoolClassResource($this->whenLoaded('schoolClass')),
            'chapters' => ChapterResource::collection($this->whenLoaded('chapters')),
            'chapters_count' => $this->whenCounted('chapters'),
        ];
    }
}