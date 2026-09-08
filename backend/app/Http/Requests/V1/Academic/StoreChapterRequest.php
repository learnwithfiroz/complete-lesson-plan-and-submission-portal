<?php

namespace App\Http\Requests\V1\Academic;

use Illuminate\Foundation\Http\FormRequest;

class StoreChapterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('academic.manage') ?? false;
    }

    public function rules(): array
    {
        return [
            'subject_id' => ['required', 'exists:subjects,id'],
            'chapter_no' => ['required', 'integer', 'min:1'],
            'title_bn' => ['required', 'string', 'max:255'],
            'title_en' => ['required', 'string', 'max:255'],
        ];
    }
}