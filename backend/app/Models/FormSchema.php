<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FormSchema extends Model
{
    use HasFactory;

    protected $fillable = [
        'form_type',
        'title',
        'description',
        'is_default',
        'post_payment_action',
        'layout_style',
        'schema_data',
        'created_by',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'schema_data' => 'array',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
