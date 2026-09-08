<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('teacher_submissions', function (Blueprint $table) {
            if (!Schema::hasColumn('teacher_submissions', 'update_count')) {
                $table->unsignedInteger('update_count')->default(1)->after('status');
            }
            if (!Schema::hasColumn('teacher_submissions', 'last_updated_at')) {
                $table->timestamp('last_updated_at')->nullable()->after('submitted_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('teacher_submissions', function (Blueprint $table) {
            $table->dropColumn(['update_count', 'last_updated_at']);
        });
    }
};