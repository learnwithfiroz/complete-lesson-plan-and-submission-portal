<?php

namespace App\Http\Requests\V1\Academic;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSubjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('academic.manage') ?? false;
    }

    public function rules(): array
    {
        $subjectId = $this->route('subject') ? (is_object($this->route('subject')) ? $this->route('subject')->id : $this->route('subject')) : null;

        return [
            'department_id' => ['nullable', 'exists:departments,id'],
            'class_id' => ['nullable', 'exists:classes,id'],
            'name_bn' => ['required', 'string', 'max:100'],
            'name_en' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:50', Rule::unique('subjects')->ignore($subjectId)],
            'is_active' => ['boolean'],
        ];
    }
}