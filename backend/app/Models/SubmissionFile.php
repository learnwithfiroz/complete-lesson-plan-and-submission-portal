<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubmissionFile extends Model
{
    use HasFactory;

    protected $fillable = [
        'submission_id',
        'file_path',
        'file_name',
        'file_size',
        'file_type',
        'gdrive_file_id',
        'gdrive_view_link',
        'gdrive_download_link',
        'gdrive_synced_at',
    ];

    protected $casts = [
        'gdrive_synced_at' => 'datetime',
    ];

    protected $appends = [
        'file_url',
    ];

    public function submission(): BelongsTo
    {
        return $this->belongsTo(TeacherSubmission::class, 'submission_id');
    }

    public function getFileUrlAttribute(): string
    {
        return url('storage/' . $this->file_path);
    }
}
