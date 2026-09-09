<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            if (!Schema::hasColumn('classes', 'academic_level')) {
                $table->string('academic_level')->nullable()->after('version');
            }
            if (!Schema::hasColumn('classes', 'level_code')) {
                $table->string('level_code')->nullable()->after('academic_level');
            }
            if (!Schema::hasColumn('classes', 'order_no')) {
                $table->integer('order_no')->nullable()->after('level_code');
            }
            if (!Schema::hasColumn('classes', 'grading_scale')) {
                $table->text('grading_scale')->nullable()->after('order_no');
            }
        });
    }

    public function down(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            $table->dropColumn([
                'academic_level',
                'level_code',
                'order_no',
                'grading_scale',
            ]);
        });
    }
};
