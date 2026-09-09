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
        // Add slug and extra fields to form_schemas if not present
        if (Schema::hasTable('form_schemas')) {
            Schema::table('form_schemas', function (Blueprint $table) {
                if (!Schema::hasColumn('form_schemas', 'slug')) {
                    $table->string('slug')->nullable()->after('title');
                }
                if (!Schema::hasColumn('form_schemas', 'is_active')) {
                    $table->boolean('is_active')->default(true)->after('is_default');
                }
                if (!Schema::hasColumn('form_schemas', 'submission_count')) {
                    $table->unsignedInteger('submission_count')->default(0)->after('layout_style');
                }
                if (!Schema::hasColumn('form_schemas', 'deadline')) {
                    $table->dateTime('deadline')->nullable()->after('submission_count');
                }
                if (!Schema::hasColumn('form_schemas', 'instructions')) {
                    $table->text('instructions')->nullable()->after('description');
                }
            });
        }

        // Create form_submissions table for storing public applicant data
        if (!Schema::hasTable('form_submissions')) {
            Schema::create('form_submissions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('form_schema_id')->constrained('form_schemas')->cascadeOnDelete();
                $table->string('tracking_number')->unique();
                $table->string('applicant_name')->nullable();
                $table->string('applicant_email')->nullable();
                $table->string('applicant_phone')->nullable();
                $table->json('data'); // All dynamic section & field answers
                $table->json('attachments')->nullable(); // Uploaded files meta
                $table->string('status')->default('pending'); // pending, reviewed, shortlisted, approved, rejected, admitted
                $table->text('admin_notes')->nullable();
                $table->string('ip_address', 45)->nullable();
                $table->text('user_agent')->nullable();
                $table->timestamps();

                $table->index(['form_schema_id', 'status']);
                $table->index('tracking_number');
                $table->index('applicant_phone');
                $table->index('applicant_email');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('form_submissions');
    }
};