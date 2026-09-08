<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'name_bn')) {
                $table->string('name_bn')->nullable()->after('name');
            }
            if (!Schema::hasColumn('users', 'religion')) {
                $table->string('religion', 50)->nullable()->after('gender');
            }
            if (!Schema::hasColumn('users', 'blood_group')) {
                $table->string('blood_group', 10)->nullable()->after('religion');
            }
            if (!Schema::hasColumn('users', 'date_of_birth')) {
                $table->date('date_of_birth')->nullable()->after('blood_group');
            }
            if (!Schema::hasColumn('users', 'join_date')) {
                $table->date('join_date')->nullable()->after('date_of_birth');
            }
            if (!Schema::hasColumn('users', 'nid')) {
                $table->string('nid', 50)->nullable()->after('join_date');
            }
            if (!Schema::hasColumn('users', 'nationality')) {
                $table->string('nationality', 50)->default('Bangladeshi')->after('nid');
            }
            if (!Schema::hasColumn('users', 'father_name')) {
                $table->string('father_name')->nullable()->after('nationality');
            }
            if (!Schema::hasColumn('users', 'mother_name')) {
                $table->string('mother_name')->nullable()->after('father_name');
            }
            if (!Schema::hasColumn('users', 'present_address')) {
                $table->text('present_address')->nullable()->after('mother_name');
            }
            if (!Schema::hasColumn('users', 'permanent_address')) {
                $table->text('permanent_address')->nullable()->after('present_address');
            }
            if (!Schema::hasColumn('users', 'home_district')) {
                $table->string('home_district', 100)->nullable()->after('permanent_address');
            }
            if (!Schema::hasColumn('users', 'emergency_contact_name')) {
                $table->string('emergency_contact_name', 100)->nullable()->after('home_district');
            }
            if (!Schema::hasColumn('users', 'emergency_contact_relation')) {
                $table->string('emergency_contact_relation', 50)->nullable()->after('emergency_contact_name');
            }
            if (!Schema::hasColumn('users', 'emergency_contact_phone')) {
                $table->string('emergency_contact_phone', 30)->nullable()->after('emergency_contact_relation');
            }
            if (!Schema::hasColumn('users', 'appointment_subject')) {
                $table->string('appointment_subject')->nullable()->after('emergency_contact_phone');
            }
            if (!Schema::hasColumn('users', 'teaching_subject')) {
                $table->string('teaching_subject')->nullable()->after('appointment_subject');
            }
            if (!Schema::hasColumn('users', 'school_hours')) {
                $table->string('school_hours', 100)->nullable()->after('teaching_subject');
            }
            if (!Schema::hasColumn('users', 'employee_type')) {
                $table->string('employee_type', 50)->default('Permanent')->after('school_hours');
            }
            if (!Schema::hasColumn('users', 'bio')) {
                $table->text('bio')->nullable()->after('employee_type');
            }
            if (!Schema::hasColumn('users', 'facebook_url')) {
                $table->string('facebook_url')->nullable()->after('bio');
            }
            if (!Schema::hasColumn('users', 'bank_account_no')) {
                $table->string('bank_account_no', 100)->nullable()->after('facebook_url');
            }
            if (!Schema::hasColumn('users', 'bank_name')) {
                $table->string('bank_name', 100)->nullable()->after('bank_account_no');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'name_bn', 'religion', 'blood_group', 'date_of_birth', 'join_date',
                'nid', 'nationality', 'father_name', 'mother_name',
                'present_address', 'permanent_address', 'home_district',
                'emergency_contact_name', 'emergency_contact_relation', 'emergency_contact_phone',
                'appointment_subject', 'teaching_subject', 'school_hours', 'employee_type',
                'bio', 'facebook_url', 'bank_account_no', 'bank_name'
            ]);
        });
    }
};