<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'employee_id' => $this->employee_id,
            'serial_number' => $this->serial_number,
            'sl' => $this->serial_number,
            'name' => $this->name,
            'name_bn' => $this->name_bn,
            'salutation' => $this->salutation,
            'gender' => $this->gender,
            'religion' => $this->religion,
            'blood_group' => $this->blood_group,
            'date_of_birth' => $this->date_of_birth?->format('Y-m-d'),
            'join_date' => $this->join_date?->format('Y-m-d'),
            'nid' => $this->nid,
            'nationality' => $this->nationality,
            'father_name' => $this->father_name,
            'mother_name' => $this->mother_name,
            'present_address' => $this->present_address,
            'permanent_address' => $this->permanent_address,
            'home_district' => $this->home_district,
            'emergency_contact_name' => $this->emergency_contact_name,
            'emergency_contact_relation' => $this->emergency_contact_relation,
            'emergency_contact_phone' => $this->emergency_contact_phone,
            'appointment_subject' => $this->appointment_subject,
            'teaching_subject' => $this->teaching_subject,
            'school_hours' => $this->school_hours,
            'employee_type' => $this->employee_type,
            'bio' => $this->bio,
            'facebook_url' => $this->facebook_url,
            'bank_account_no' => $this->bank_account_no,
            'bank_name' => $this->bank_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'designation' => $this->designation,
            'department' => $this->department ? [
                'id' => $this->department->id,
                'name_bn' => $this->department->name_bn,
                'name_en' => $this->department->name_en,
                'code' => $this->department->code,
            ] : null,
            'avatar' => $this->avatar ? url($this->avatar) : null,
            'is_active' => (bool)$this->is_active,
            'login_count' => (int)($this->login_count ?? 0),
            'last_login_at' => $this->last_login_at?->toISOString(),
            'last_login_ip' => $this->last_login_ip,
            'last_login_device' => $this->last_login_device,
            'roles' => RoleResource::collection($this->whenLoaded('roles')),
            'role_names' => $this->roles->pluck('name'),
            'permissions' => $this->allPermissions(),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}