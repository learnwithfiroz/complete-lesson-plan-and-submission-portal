<?php

namespace App\Http\Requests\V1\Academic;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDepartmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasPermission('academic.manage') ?? false;
    }

    public function rules(): array
    {
        $deptId = $this->route('department') ? (is_object($this->route('department')) ? $this->route('department')->id : $this->route('department')) : null;

        return [
            'name_bn' => ['required', 'string', 'max:255'],
            'name_en' => ['required', 'string', 'max:255'],
            'code' => ['required', 'string', 'max:50', Rule::unique('departments')->ignore($deptId)],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ];
    }
}