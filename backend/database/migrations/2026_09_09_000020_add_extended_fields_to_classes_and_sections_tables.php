<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('classes', function (Blueprint $table) {
            if (!Schema::hasColumn('classes', 'version')) {
                $table->string('version')->nullable()->after('numeric_value');
            }
        });

        Schema::table('sections', function (Blueprint $table) {
            if (!Schema::hasColumn('sections', 'version')) {
                $table->string('version')->nullable()->after('name_en');
            }
            if (!Schema::hasColumn('sections', 'shift')) {
                $table->string('shift')->nullable()->after('version');
            }
            if (!Schema::hasColumn('sections', 'shift_time')) {
                $table->string('shift_time')->nullable()->after('shift');
            }
            if (!Schema::hasColumn('sections', 'group_name')) {
                $table->string('group_name')->nullable()->after('shift_time');
            }
            if (!Schema::hasColumn('sections', 'order_no')) {
                $table->integer('order_no')->default(1)->after('group_name');
            }
            if (!Schema::hasColumn('sections', 'class_teacher_id')) {
                $table->foreignId('class_teacher_id')->nullable()->constrained('users')->nullOnDelete()->after('order_no');
            }
            if (!Schema::hasColumn('sections', 'class_teacher_name')) {
                $table->string('class_teacher_name')->nullable()->after('class_teacher_id');
            }
            if (!Schema::hasColumn('sections', 'coordinator_name')) {
                $table->string('coordinator_name')->nullable()->after('class_teacher_name');
            }
            if (!Schema::hasColumn('sections', 'vp_name')) {
                $table->string('vp_name')->nullable()->after('coordinator_name');
            }
        });
    }

    public function down(): void
    {
        Schema::table('sections', function (Blueprint $table) {
            $table->dropForeign(['class_teacher_id']);
            $table->dropColumn([
                'version',
                'shift',
                'shift_time',
                'group_name',
                'order_no',
                'class_teacher_id',
                'class_teacher_name',
                'coordinator_name',
                'vp_name',
            ]);
        });

        Schema::table('classes', function (Blueprint $table) {
            $table->dropColumn('version');
        });
    }
};
