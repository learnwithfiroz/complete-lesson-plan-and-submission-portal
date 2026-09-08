<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LessonPlanReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reviewer' => [
                'id' => $this->reviewer->id,
                'name' => $this->reviewer->name,
                'designation' => $this->reviewer->designation,
                'roles' => $this->reviewer->roles->pluck('display_name_bn'),
            ],
            'action' => $this->action,
            'comment' => $this->comment,
            'created_at' => $this->created_at?->toISOString(),
            'formatted_time' => $this->created_at?->format('d M Y, h:i A'),
        ];
    }
}