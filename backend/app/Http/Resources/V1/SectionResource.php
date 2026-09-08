<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SectionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'class_id' => $this->class_id,
            'name_bn' => $this->name_bn,
            'name_en' => $this->name_en,
            'capacity' => $this->capacity,
            'school_class' => new SchoolClassResource($this->whenLoaded('schoolClass')),
        ];
    }
}