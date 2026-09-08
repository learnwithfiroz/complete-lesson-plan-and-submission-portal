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
            'name_bn' => ['required', 'string', 'max:100'],
            'name_en' => ['required', 'string', 'max:100'],
            'numeric_value' => ['required', 'integer', 'min:1', 'max:12'],
            'is_active' => ['boolean'],
        ];
    }
}