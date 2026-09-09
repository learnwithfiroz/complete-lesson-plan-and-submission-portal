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
            'teacher' => $this->whenLoaded('teacher', fn() => $this->teacher ? new UserResource($this->teacher) : null),
            'academic_year' => $this->whenLoaded('academicYear', fn() => $this->academicYear ? new AcademicYearResource($this->academicYear) : null),
            'school_class' => $this->whenLoaded('schoolClass', fn() => $this->schoolClass ? new SchoolClassResource($this->schoolClass) : null),
            'section' => $this->whenLoaded('section', fn() => $this->section ? new SectionResource($this->section) : null),
            'subject' => $this->whenLoaded('subject', fn() => $this->subject ? new SubjectResource($this->subject) : null),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}