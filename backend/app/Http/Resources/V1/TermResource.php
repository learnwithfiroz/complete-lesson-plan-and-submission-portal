<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TermResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'academic_year_id' => $this->academic_year_id,
            'name_bn' => $this->name_bn,
            'name_en' => $this->name_en,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'is_current' => (bool)$this->is_current,
        ];
    }
}