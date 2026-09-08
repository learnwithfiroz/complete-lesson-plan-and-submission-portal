<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->index(['phone', 'is_active'], 'users_phone_is_active_index');
            $table->index(['department_id', 'is_active'], 'users_dept_is_active_index');
        });

        Schema::table('lesson_plans', function (Blueprint $table) {
            $table->index(['academic_year_id', 'status'], 'lp_year_status_index');
            $table->index(['term_id', 'status'], 'lp_term_status_index');
            $table->index(['department_id', 'status'], 'lp_dept_status_index');
        });

        Schema::table('activity_logs', function (Blueprint $table) {
            $table->index(['user_id', 'created_at'], 'logs_user_created_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('users_phone_is_active_index');
            $table->dropIndex('users_dept_is_active_index');
        });

        Schema::table('lesson_plans', function (Blueprint $table) {
            $table->dropIndex('lp_year_status_index');
            $table->dropIndex('lp_term_status_index');
            $table->dropIndex('lp_dept_status_index');
        });

        Schema::table('activity_logs', function (Blueprint $table) {
            $table->dropIndex('logs_user_created_index');
        });
    }
};
