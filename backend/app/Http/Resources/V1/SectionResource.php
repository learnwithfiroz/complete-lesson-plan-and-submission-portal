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
            'version' => $this->version,
            'shift' => $this->shift,
            'shift_time' => $this->shift_time,
            'group_name' => $this->group_name,
            'order_no' => $this->order_no,
            'class_teacher_id' => $this->class_teacher_id,
            'class_teacher_name' => $this->class_teacher_name,
            'coordinator_name' => $this->coordinator_name,
            'vp_name' => $this->vp_name,
            'class_teacher' => $this->whenLoaded('classTeacher', fn() => [
                'id' => $this->classTeacher->id,
                'name' => $this->classTeacher->name,
                'email' => $this->classTeacher->email,
                'phone' => $this->classTeacher->phone,
                'employee_id' => $this->classTeacher->employee_id,
            ]),
            'school_class' => new SchoolClassResource($this->whenLoaded('schoolClass')),
        ];
    }
}