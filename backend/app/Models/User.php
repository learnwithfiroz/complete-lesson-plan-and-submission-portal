<?php

namespace App\Models;

use App\Traits\HasActivityLog;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes, HasActivityLog;

    protected $fillable = [
        'employee_id',
        'serial_number',
        'name',
        'name_bn',
        'salutation',
        'gender',
        'religion',
        'blood_group',
        'date_of_birth',
        'join_date',
        'nid',
        'nationality',
        'father_name',
        'mother_name',
        'present_address',
        'permanent_address',
        'home_district',
        'emergency_contact_name',
        'emergency_contact_relation',
        'emergency_contact_phone',
        'appointment_subject',
        'teaching_subject',
        'school_hours',
        'employee_type',
        'bio',
        'facebook_url',
        'bank_account_no',
        'bank_name',
        'email',
        'password',
        'phone',
        'designation',
        'department_id',
        'avatar',
        'is_active',
        'login_count',
        'last_login_at',
        'last_login_ip',
        'last_login_device',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'serial_number' => 'integer',
        'login_count' => 'integer',
        'last_login_at' => 'datetime',
        'date_of_birth' => 'date',
        'join_date' => 'date',
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'is_active' => 'boolean',
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_user');
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(TeacherAssignment::class, 'teacher_id');
    }

    public function lessonPlans(): HasMany
    {
        return $this->hasMany(LessonPlan::class, 'teacher_id');
    }

    public function templates(): HasMany
    {
        return $this->hasMany(LessonPlanTemplate::class, 'created_by');
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }

    public function loginHistories(): HasMany
    {
        return $this->hasMany(LoginHistory::class)->orderByDesc('logged_in_at');
    }

    public function noticeReads(): HasMany
    {
        return $this->hasMany(NoticeRead::class);
    }

    // Role & Permission Check Helpers
    public function hasRole(string|array $roles): bool
    {
        $roleNames = is_array($roles) ? $roles : func_get_args();
        return $this->roles()->whereIn('name', $roleNames)->exists();
    }

    public function hasAnyRole(array $roles): bool
    {
        return $this->roles()->whereIn('name', $roles)->exists();
    }

    public function hasPermission(string $permission): bool
    {
        if ($this->hasRole('super_admin')) {
            return true;
        }

        return $this->roles()
            ->whereHas('permissions', function ($query) use ($permission) {
                $query->where('name', $permission);
            })
            ->exists();
    }

    public function hasAnyPermission(array $permissions): bool
    {
        if ($this->hasRole('super_admin')) {
            return true;
        }

        return $this->roles()
            ->whereHas('permissions', function ($query) use ($permissions) {
                $query->whereIn('name', $permissions);
            })
            ->exists();
    }

    public function allPermissions()
    {
        if ($this->hasRole('super_admin')) {
            return Permission::pluck('name');
        }

        return $this->roles()
            ->with('permissions')
            ->get()
            ->pluck('permissions')
            ->flatten()
            ->pluck('name')
            ->unique()
            ->values();
    }
}