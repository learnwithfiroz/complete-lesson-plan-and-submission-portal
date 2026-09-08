<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TeacherSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'batch_id',
        'teacher_id',
        'status',
        'update_count',
        'submitted_at',
        'last_updated_at',
        'remarks',
        'gdrive_folder_id',
        'gdrive_folder_url',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'last_updated_at' => 'datetime',
        'update_count' => 'integer',
    ];

    public function batch(): BelongsTo
    {
        return $this->belongsTo(SubmissionBatch::class, 'batch_id');
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function files(): HasMany
    {
        return $this->hasMany(SubmissionFile::class, 'submission_id');
    }
}
