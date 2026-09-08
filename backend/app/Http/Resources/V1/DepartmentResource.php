<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DepartmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name_bn' => $this->name_bn,
            'name_en' => $this->name_en,
            'code' => $this->code,
            'description' => $this->description,
            'is_active' => (bool)$this->is_active,
            'users_count' => $this->whenCounted('users'),
            'subjects_count' => $this->whenCounted('subjects'),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}