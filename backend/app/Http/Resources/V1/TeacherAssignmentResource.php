<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TeacherAssignmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'teacher' => new UserResource($this->whenLoaded('teacher')),
            'academic_year' => new AcademicYearResource($this->whenLoaded('academicYear')),
            'school_class' => new SchoolClassResource($this->whenLoaded('schoolClass')),
            'section' => new SectionResource($this->whenLoaded('section')),
            'subject' => new SubjectResource($this->whenLoaded('subject')),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}