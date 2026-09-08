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
        // 1. Add login stats to users table if not exists
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'login_count')) {
                $table->unsignedBigInteger('login_count')->default(0)->after('is_active');
            }
            if (!Schema::hasColumn('users', 'last_login_at')) {
                $table->timestamp('last_login_at')->nullable()->after('login_count');
            }
            if (!Schema::hasColumn('users', 'last_login_ip')) {
                $table->string('last_login_ip', 45)->nullable()->after('last_login_at');
            }
            if (!Schema::hasColumn('users', 'last_login_device')) {
                $table->string('last_login_device', 100)->nullable()->after('last_login_ip');
            }
        });

        // 2. Create login_histories table
        Schema::create('login_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('ip_address', 45)->nullable();
            $table->string('device_type', 30)->default('Desktop'); // Desktop, Mobile, Tablet
            $table->string('browser', 50)->nullable(); // Chrome, Safari, Edge, Firefox, etc.
            $table->string('platform', 50)->nullable(); // Windows, Android, iOS, macOS, Linux
            $table->string('location', 100)->default('Dhaka, Bangladesh');
            $table->text('user_agent')->nullable();
            $table->timestamp('logged_in_at')->useCurrent();
            $table->timestamps();

            $table->index(['user_id', 'logged_in_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('login_histories');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['login_count', 'last_login_at', 'last_login_ip', 'last_login_device']);
        });
    }
};