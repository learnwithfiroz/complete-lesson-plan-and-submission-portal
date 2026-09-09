<?php

namespace App\Http\Requests\V1\Academic;

use Illuminate\Foundation\Http\FormRequest;

class StoreSectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('academic.manage') ?? false;
    }

    public function rules(): array
    {
        return [
            'class_id' => ['required', 'exists:classes,id'],
            'name_bn' => ['nullable', 'string', 'max:100'],
            'name_en' => ['required', 'string', 'max:100'],
            'capacity' => ['nullable', 'integer', 'min:1', 'max:100'],
            'version' => ['nullable', 'string', 'max:50'],
            'shift' => ['nullable', 'string', 'max:50'],
            'shift_time' => ['nullable', 'string', 'max:50'],
            'group_name' => ['nullable', 'string', 'max:100'],
            'order_no' => ['nullable', 'integer'],
            'class_teacher_id' => ['nullable', 'exists:users,id'],
            'class_teacher_name' => ['nullable', 'string', 'max:100'],
            'coordinator_name' => ['nullable', 'string', 'max:100'],
            'vp_name' => ['nullable', 'string', 'max:100'],
        ];
    }
}