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
        Schema::create('form_schemas', function (Blueprint $table) {
            $table->id();
            $table->string('form_type')->default('admission'); // admission, job, tender
            $table->string('title');
            $table->text('description')->nullable();
            $table->boolean('is_default')->default(false);
            $table->string('post_payment_action')->default('application_voucher');
            $table->string('layout_style')->default('wizard'); // wizard, single_page, tabbed
            $table->json('schema_data');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['form_type', 'is_default']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('form_schemas');
    }
};
