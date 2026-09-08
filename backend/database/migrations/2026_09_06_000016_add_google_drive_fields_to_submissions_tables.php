<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('submission_batches', function (Blueprint $table) {
            if (!Schema::hasColumn('submission_batches', 'gdrive_folder_id')) {
                $table->string('gdrive_folder_id')->nullable()->after('is_active');
                $table->text('gdrive_folder_url')->nullable()->after('gdrive_folder_id');
            }
        });

        Schema::table('teacher_submissions', function (Blueprint $table) {
            if (!Schema::hasColumn('teacher_submissions', 'gdrive_folder_id')) {
                $table->string('gdrive_folder_id')->nullable()->after('update_count');
                $table->text('gdrive_folder_url')->nullable()->after('gdrive_folder_id');
            }
        });

        Schema::table('submission_files', function (Blueprint $table) {
            if (!Schema::hasColumn('submission_files', 'gdrive_file_id')) {
                $table->string('gdrive_file_id')->nullable()->after('file_type');
                $table->text('gdrive_view_link')->nullable()->after('gdrive_file_id');
                $table->text('gdrive_download_link')->nullable()->after('gdrive_view_link');
                $table->timestamp('gdrive_synced_at')->nullable()->after('gdrive_download_link');
            }
        });
    }

    public function down(): void
    {
        Schema::table('submission_batches', function (Blueprint $table) {
            if (Schema::hasColumn('submission_batches', 'gdrive_folder_id')) {
                $table->dropColumn(['gdrive_folder_id', 'gdrive_folder_url']);
            }
        });

        Schema::table('teacher_submissions', function (Blueprint $table) {
            if (Schema::hasColumn('teacher_submissions', 'gdrive_folder_id')) {
                $table->dropColumn(['gdrive_folder_id', 'gdrive_folder_url']);
            }
        });

        Schema::table('submission_files', function (Blueprint $table) {
            if (Schema::hasColumn('submission_files', 'gdrive_file_id')) {
                $table->dropColumn(['gdrive_file_id', 'gdrive_view_link', 'gdrive_download_link', 'gdrive_synced_at']);
            }
        });
    }
};