<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'salutation')) {
                $table->string('salutation', 30)->nullable()->after('name');
            }
            if (!Schema::hasColumn('users', 'gender')) {
                $table->string('gender', 15)->nullable()->after('salutation');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['salutation', 'gender']);
        });
    }
};