<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PermissionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'display_name_bn' => $this->display_name_bn,
            'display_name_en' => $this->display_name_en,
            'module' => $this->module,
        ];
    }
}