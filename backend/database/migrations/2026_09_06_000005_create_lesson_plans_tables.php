<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lesson_plans', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->foreignId('teacher_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('academic_year_id')->constrained('academic_years')->cascadeOnDelete();
            $table->foreignId('term_id')->constrained('terms')->cascadeOnDelete();
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
            $table->foreignId('section_id')->constrained('sections')->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained('subjects')->cascadeOnDelete();
            $table->foreignId('chapter_id')->nullable()->constrained('chapters')->nullOnDelete();

            // Step 1: Basic
            $table->string('title');
            $table->string('topic');
            $table->date('lesson_date');
            $table->integer('period_number')->default(1);
            $table->integer('duration_minutes')->default(45);
            $table->integer('student_count')->default(40);

            // Step 2: Learning info
            $table->string('curriculum_reference')->nullable();
            $table->text('competency')->nullable();
            $table->text('previous_knowledge')->nullable();
            $table->text('key_vocabulary')->nullable();
            $table->string('teaching_method')->nullable();
            $table->text('teaching_materials')->nullable();
            $table->text('digital_resources')->nullable();
            $table->text('reference_book')->nullable();

            // Step 4: Assessment & Homework
            $table->text('formative_assessment')->nullable();
            $table->text('assessment_questions')->nullable();
            $table->text('success_criteria')->nullable();
            $table->text('homework')->nullable();
            $table->text('remedial_activities')->nullable();
            $table->text('advanced_learner_activities')->nullable();
            $table->text('inclusive_education_support')->nullable();
            $table->text('special_needs_support')->nullable();
            $table->text('teacher_reflection')->nullable();
            $table->text('additional_notes')->nullable();

            // Status & Workflow
            $table->enum('status', ['draft', 'submitted', 'under_review', 'returned', 'approved', 'rejected', 'archived'])->default('draft');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('updated_by')->nullable()->constrained('users');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['teacher_id', 'status']);
            $table->index(['lesson_date']);
            $table->index(['class_id', 'subject_id']);
        });

        Schema::create('lesson_plan_outcomes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_plan_id')->constrained('lesson_plans')->cascadeOnDelete();
            $table->text('outcome_text');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('lesson_plan_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_plan_id')->constrained('lesson_plans')->cascadeOnDelete();
            $table->enum('stage', ['introduction', 'presentation', 'guided_practice', 'group_work', 'assessment', 'conclusion']);
            $table->integer('duration_minutes')->default(5);
            $table->text('teacher_activities');
            $table->text('student_activities');
            $table->string('teaching_materials')->nullable();
            $table->string('assessment_method')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('lesson_plan_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_plan_id')->constrained('lesson_plans')->cascadeOnDelete();
            $table->foreignId('reviewer_id')->constrained('users')->cascadeOnDelete();
            $table->string('action'); // approve, return, reject, comment
            $table->text('comment');
            $table->timestamps();
        });

        Schema::create('lesson_plan_status_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_plan_id')->constrained('lesson_plans')->cascadeOnDelete();
            $table->string('from_status')->nullable();
            $table->string('to_status');
            $table->foreignId('action_by')->constrained('users')->cascadeOnDelete();
            $table->text('comment')->nullable();
            $table->timestamps();
        });

        Schema::create('lesson_plan_templates', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->foreignId('subject_id')->nullable()->constrained('subjects')->nullOnDelete();
            $table->foreignId('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->boolean('is_system')->default(false);
            $table->boolean('is_active')->default(true);
            $table->json('template_data');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lesson_plan_templates');
        Schema::dropIfExists('lesson_plan_status_histories');
        Schema::dropIfExists('lesson_plan_reviews');
        Schema::dropIfExists('lesson_plan_activities');
        Schema::dropIfExists('lesson_plan_outcomes');
        Schema::dropIfExists('lesson_plan_plans');
    }
};