<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AcademicYearResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'is_current' => (bool)$this->is_current,
            'terms' => TermResource::collection($this->whenLoaded('terms')),
            'assignments_count' => $this->whenCounted('assignments'),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}