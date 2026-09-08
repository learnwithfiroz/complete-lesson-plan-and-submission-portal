<?php

namespace App\Models;

use App\Traits\HasActivityLog;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

class Notice extends Model
{
    use HasFactory, HasActivityLog;

    protected $fillable = [
        'title_bn',
        'title_en',
        'content_bn',
        'content_en',
        'category',
        'priority',
        'target_audience',
        'attachment_path',
        'attachment_name',
        'is_pinned',
        'is_published',
        'publish_date',
        'expiry_date',
        'created_by',
    ];

    protected $casts = [
        'is_pinned' => 'boolean',
        'is_published' => 'boolean',
        'publish_date' => 'datetime',
        'expiry_date' => 'datetime',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function reads(): HasMany
    {
        return $this->hasMany(NoticeRead::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        $now = Carbon::now();
        return $query->where('is_published', true)
            ->where(function ($q) use ($now) {
                $q->whereNull('publish_date')
                  ->orWhere('publish_date', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('expiry_date')
                  ->orWhere('expiry_date', '>=', $now);
            });
    }

    public function scopeForAudience(Builder $query, ?User $user): Builder
    {
        if (!$user) {
            return $query->where('target_audience', 'all');
        }

        if ($user->hasRole('super_admin')) {
            return $query;
        }

        $audiences = ['all'];
        if ($user->hasRole('principal')) {
            $audiences[] = 'principal';
            $audiences[] = 'coordinators';
            $audiences[] = 'teachers';
        } elseif ($user->hasRole('academic_coordinator')) {
            $audiences[] = 'coordinators';
            $audiences[] = 'teachers';
        } elseif ($user->hasRole('teacher')) {
            $audiences[] = 'teachers';
        }

        return $query->whereIn('target_audience', $audiences);
    }

    public function scopePinnedFirst(Builder $query): Builder
    {
        return $query->orderByDesc('is_pinned')
            ->orderByRaw("CASE priority 
                WHEN 'urgent' THEN 1 
                WHEN 'high' THEN 2 
                WHEN 'normal' THEN 3 
                WHEN 'low' THEN 4 
                ELSE 5 END")
            ->orderByDesc('created_at');
    }
}