<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChapterResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'subject_id' => $this->subject_id,
            'chapter_no' => $this->chapter_no,
            'title_bn' => $this->title_bn,
            'title_en' => $this->title_en,
        ];
    }
}