<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        try {
            DB::statement("ALTER TABLE lesson_plan_activities MODIFY COLUMN stage VARCHAR(100) NOT NULL DEFAULT 'introduction'");
        } catch (\Throwable $e) {
            Schema::table('lesson_plan_activities', function (Blueprint $table) {
                $table->string('stage', 100)->default('introduction')->change();
            });
        }
    }

    public function down(): void
    {
        try {
            DB::statement("ALTER TABLE lesson_plan_activities MODIFY COLUMN stage ENUM('introduction', 'presentation', 'guided_practice', 'group_work', 'assessment', 'conclusion') NOT NULL DEFAULT 'introduction'");
        } catch (\Throwable $e) {
            // ignore
        }
    }
};