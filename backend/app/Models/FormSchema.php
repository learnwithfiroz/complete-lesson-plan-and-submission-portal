<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class FormSchema extends Model
{
    use HasFactory;

    protected $fillable = [
        'form_type',
        'title',
        'slug',
        'description',
        'instructions',
        'is_default',
        'is_active',
        'post_payment_action',
        'layout_style',
        'submission_count',
        'deadline',
        'schema_data',
        'created_by',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'is_active' => 'boolean',
        'schema_data' => 'array',
        'submission_count' => 'integer',
        'deadline' => 'datetime',
    ];

    public static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->slug)) {
                $baseSlug = Str::slug($model->title) ?: $model->form_type;
                $slug = $baseSlug;
                $count = 1;
                while (static::where('slug', $slug)->exists()) {
                    $slug = "{$baseSlug}-" . ($count++);
                }
                $model->slug = $slug;
            }
        });
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(FormSubmission::class, 'form_schema_id');
    }
}