<?php

namespace App\Http\Requests\V1\Academic;

use Illuminate\Foundation\Http\FormRequest;

class StoreClassRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('academic.manage') ?? false;
    }

    public function rules(): array
    {
        return [
            'name_bn' => ['nullable', 'string', 'max:100'],
            'name_en' => ['required', 'string', 'max:100'],
            'numeric_value' => ['required', 'integer', 'min:0', 'max:12'],
            'version' => ['nullable', 'string', 'max:50'],
            'is_active' => ['boolean'],
        ];
    }
}