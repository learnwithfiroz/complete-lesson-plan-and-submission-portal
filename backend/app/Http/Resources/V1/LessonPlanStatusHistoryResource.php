<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LessonPlanStatusHistoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'from_status' => $this->from_status,
            'to_status' => $this->to_status,
            'comment' => $this->comment,
            'actor' => [
                'id' => $this->actor->id,
                'name' => $this->actor->name,
                'designation' => $this->actor->designation,
            ],
            'created_at' => $this->created_at?->toISOString(),
            'formatted_time' => $this->created_at?->format('d M Y, h:i A'),
        ];
    }
}