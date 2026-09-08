<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LessonPlanActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'lesson_plan_id',
        'stage',
        'duration_minutes',
        'teacher_activities',
        'student_activities',
        'teaching_materials',
        'assessment_method',
        'sort_order',
    ];

    public function lessonPlan(): BelongsTo
    {
        return $this->belongsTo(LessonPlan::class);
    }
}