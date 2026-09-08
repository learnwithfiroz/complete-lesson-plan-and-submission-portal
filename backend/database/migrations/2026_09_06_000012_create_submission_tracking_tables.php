<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('submission_batches', function (Blueprint $table) {
            $table->id();
            $table->enum('category', ['lesson_plan', 'assignment', 'question'])->default('lesson_plan');
            $table->string('title');
            $table->foreignId('class_id')->nullable()->constrained('classes')->nullOnDelete();
            $table->date('start_date');
            $table->date('end_date');
            $table->boolean('allow_multiple_files')->default(true);
            $table->text('instructions')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->index(['category', 'is_active']);
            $table->index(['start_date', 'end_date']);
        });

        Schema::create('teacher_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('batch_id')->constrained('submission_batches')->cascadeOnDelete();
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            $table->enum('status', ['submitted', 'approved', 'revision_requested'])->default('submitted');
            $table->timestamp('submitted_at')->useCurrent();
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->unique(['batch_id', 'teacher_id']);
            $table->index('status');
        });

        Schema::create('submission_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('submission_id')->constrained('teacher_submissions')->cascadeOnDelete();
            $table->string('file_path');
            $table->string('file_name');
            $table->unsignedBigInteger('file_size')->default(0);
            $table->string('file_type')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('submission_files');
        Schema::dropIfExists('teacher_submissions');
        Schema::dropIfExists('submission_batches');
    }
};
