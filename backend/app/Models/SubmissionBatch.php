<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubmissionBatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'category',
        'title',
        'class_id',
        'start_date',
        'end_date',
        'allow_multiple_files',
        'instructions',
        'is_active',
        'gdrive_folder_id',
        'gdrive_folder_url',
        'created_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'allow_multiple_files' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(TeacherSubmission::class, 'batch_id');
    }
}
