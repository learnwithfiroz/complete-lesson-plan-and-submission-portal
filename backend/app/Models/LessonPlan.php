<?php

namespace App\Models;

use App\Traits\HasActivityLog;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class LessonPlan extends Model
{
    use HasFactory, SoftDeletes, HasActivityLog;

    protected $fillable = [
        'code',
        'teacher_id',
        'academic_year_id',
        'term_id',
        'department_id',
        'class_id',
        'section_id',
        'subject_id',
        'chapter_id',
        'title',
        'topic',
        'lesson_date',
        'period_number',
        'duration_minutes',
        'student_count',
        'curriculum_reference',
        'competency',
        'previous_knowledge',
        'key_vocabulary',
        'teaching_method',
        'teaching_materials',
        'digital_resources',
        'reference_book',
        'formative_assessment',
        'assessment_questions',
        'success_criteria',
        'homework',
        'remedial_activities',
        'advanced_learner_activities',
        'inclusive_education_support',
        'special_needs_support',
        'teacher_reflection',
        'additional_notes',
        'attachment_path',
        'attachment_name',
        'status',
        'submitted_at',
        'reviewed_at',
        'created_by',
        'updated_by',
    ];

    protected $appends = [
        'attachment_url',
    ];

    protected $casts = [
        'lesson_date' => 'date',
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
        'period_number' => 'integer',
        'duration_minutes' => 'integer',
        'student_count' => 'integer',
    ];

    public function getAttachmentUrlAttribute(): ?string
    {
        if (!$this->attachment_path) {
            return null;
        }

        return url('storage/' . $this->attachment_path);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function academicYear(): BelongsTo
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function term(): BelongsTo
    {
        return $this->belongsTo(Term::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class, 'class_id');
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function chapter(): BelongsTo
    {
        return $this->belongsTo(Chapter::class);
    }

    public function outcomes(): HasMany
    {
        return $this->hasMany(LessonPlanOutcome::class)->orderBy('sort_order');
    }

    public function activities(): HasMany
    {
        return $this->hasMany(LessonPlanActivity::class)->orderBy('sort_order');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(LessonPlanReview::class)->latest();
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(LessonPlanStatusHistory::class)->latest();
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}