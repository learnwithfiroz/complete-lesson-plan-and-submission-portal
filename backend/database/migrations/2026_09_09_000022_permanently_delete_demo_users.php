<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use App\Models\User;

return new class extends Migration
{
    public function up(): void
    {
        // Find dummy demo users
        $demoUsers = User::whereIn('email', [
            'coordinator@bsisc.edu.bd',
            'teacher1@bsisc.edu.bd',
            'teacher2@bsisc.edu.bd',
            'teacher3@bsisc.edu.bd',
            'teacher4@bsisc.edu.bd',
            'teacher5@bsisc.edu.bd',
        ])->orWhereIn('phone', [
            '01711000003',
            '01711000004',
            '01711000005',
            '01711000006',
            '01711000007',
            '01711000008',
        ])->orWhereIn('employee_id', [
            'BSISC-179',
            'BSISC-180',
            'BSISC-181',
            'BSISC-182',
            'BSISC-183',
            'BSISC-184',
        ])->get();

        if ($demoUsers->isEmpty()) {
            return;
        }

        $demoIds = $demoUsers->pluck('id')->toArray();

        // Clean up or reassign foreign key relations safely
        if (DB::getDriverName() === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        }

        DB::table('role_user')->whereIn('user_id', $demoIds)->delete();
        DB::table('teacher_submissions')->whereIn('teacher_id', $demoIds)->delete();
        DB::table('teacher_assignments')->whereIn('teacher_id', $demoIds)->delete();
        DB::table('login_histories')->whereIn('user_id', $demoIds)->delete();
        DB::table('notice_reads')->whereIn('user_id', $demoIds)->delete();
        DB::table('personal_access_tokens')->where('tokenable_type', User::class)->whereIn('tokenable_id', $demoIds)->delete();

        // Delete demo lesson plans
        DB::table('lesson_plans')->whereIn('teacher_id', $demoIds)->orWhereIn('created_by', $demoIds)->delete();

        // Delete demo users
        DB::table('users')->whereIn('id', $demoIds)->delete();

        if (DB::getDriverName() === 'mysql') {
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        }
    }

    public function down(): void
    {
    }
};