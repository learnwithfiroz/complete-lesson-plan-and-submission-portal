<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // User Management
            ['name' => 'users.view', 'display_name_bn' => 'ব্যবহারকারী দেখুন', 'display_name_en' => 'View Users', 'module' => 'users'],
            ['name' => 'users.create', 'display_name_bn' => 'নতুন ব্যবহারকারী তৈরি', 'display_name_en' => 'Create Users', 'module' => 'users'],
            ['name' => 'users.edit', 'display_name_bn' => 'ব্যবহারকারী সম্পাদনা', 'display_name_en' => 'Edit Users', 'module' => 'users'],
            ['name' => 'users.delete', 'display_name_bn' => 'ব্যবহারকারী মুছুন', 'display_name_en' => 'Delete Users', 'module' => 'users'],

            // Roles & Permissions
            ['name' => 'roles.view', 'display_name_bn' => 'ভূমিকা দেখুন', 'display_name_en' => 'View Roles', 'module' => 'roles'],
            ['name' => 'roles.manage', 'display_name_bn' => 'ভূমিকা পরিচালনা', 'display_name_en' => 'Manage Roles', 'module' => 'roles'],

            // Academic Setup
            ['name' => 'academic.view', 'display_name_bn' => 'একাডেমিক তথ্য দেখুন', 'display_name_en' => 'View Academic Data', 'module' => 'academic'],
            ['name' => 'academic.manage', 'display_name_bn' => 'একাডেমিক সেটআপ পরিচালনা', 'display_name_en' => 'Manage Academic Setup', 'module' => 'academic'],
            ['name' => 'academic.assign_teachers', 'display_name_bn' => 'শিক্ষক এসাইন করুন', 'display_name_en' => 'Assign Teachers', 'module' => 'academic'],

            // Lesson Plans
            ['name' => 'lesson_plans.view', 'display_name_bn' => 'পাঠ পরিকল্পনা দেখুন', 'display_name_en' => 'View Lesson Plans', 'module' => 'lesson_plans'],
            ['name' => 'lesson_plans.create', 'display_name_bn' => 'পাঠ পরিকল্পনা তৈরি', 'display_name_en' => 'Create Lesson Plans', 'module' => 'lesson_plans'],
            ['name' => 'lesson_plans.edit', 'display_name_bn' => 'পাঠ পরিকল্পনা সম্পাদনা', 'display_name_en' => 'Edit Lesson Plans', 'module' => 'lesson_plans'],
            ['name' => 'lesson_plans.delete', 'display_name_bn' => 'পাঠ পরিকল্পনা মুছুন', 'display_name_en' => 'Delete Lesson Plans', 'module' => 'lesson_plans'],
            ['name' => 'lesson_plans.submit', 'display_name_bn' => 'পাঠ পরিকল্পনা জমা দিন', 'display_name_en' => 'Submit Lesson Plans', 'module' => 'lesson_plans'],
            ['name' => 'lesson_plans.review', 'display_name_bn' => 'পাঠ পরিকল্পনা পর্যালোচনা', 'display_name_en' => 'Review Lesson Plans', 'module' => 'lesson_plans'],
            ['name' => 'lesson_plans.approve', 'display_name_bn' => 'পাঠ পরিকল্পনা অনুমোদন', 'display_name_en' => 'Approve Lesson Plans', 'module' => 'lesson_plans'],
            ['name' => 'lesson_plans.return', 'display_name_bn' => 'সংশোধনের জন্য ফেরত পাঠান', 'display_name_en' => 'Return Lesson Plans', 'module' => 'lesson_plans'],
            ['name' => 'lesson_plans.reject', 'display_name_bn' => 'পাঠ পরিকল্পনা বাতিল', 'display_name_en' => 'Reject Lesson Plans', 'module' => 'lesson_plans'],
            ['name' => 'lesson_plans.archive', 'display_name_bn' => 'পাঠ পরিকল্পনা আর্কাইভ', 'display_name_en' => 'Archive Lesson Plans', 'module' => 'lesson_plans'],

            // Templates
            ['name' => 'templates.view', 'display_name_bn' => 'টেমপ্লেট দেখুন', 'display_name_en' => 'View Templates', 'module' => 'templates'],
            ['name' => 'templates.manage', 'display_name_bn' => 'টেমপ্লেট পরিচালনা', 'display_name_en' => 'Manage Templates', 'module' => 'templates'],

            // Reports
            ['name' => 'reports.view', 'display_name_bn' => 'প্রতিবেদন দেখুন', 'display_name_en' => 'View Reports', 'module' => 'reports'],
            ['name' => 'reports.export', 'display_name_bn' => 'প্রতিবেদন এক্সপোর্ট', 'display_name_en' => 'Export Reports', 'module' => 'reports'],

            // Notices & Announcements
            ['name' => 'notices.view', 'display_name_bn' => 'নোটিশ দেখুন', 'display_name_en' => 'View Notices', 'module' => 'notices'],
            ['name' => 'notices.create', 'display_name_bn' => 'নোটিশ তৈরি', 'display_name_en' => 'Create Notices', 'module' => 'notices'],
            ['name' => 'notices.edit', 'display_name_bn' => 'নোটিশ সম্পাদনা', 'display_name_en' => 'Edit Notices', 'module' => 'notices'],
            ['name' => 'notices.delete', 'display_name_bn' => 'নোটিশ মুছুন', 'display_name_en' => 'Delete Notices', 'module' => 'notices'],
            ['name' => 'notices.publish', 'display_name_bn' => 'নোটিশ প্রকাশ ও পিন', 'display_name_en' => 'Publish & Pin Notices', 'module' => 'notices'],

            // Settings & Audit Logs
            ['name' => 'settings.manage', 'display_name_bn' => 'সিস্টেম সেটিংস পরিচালনা', 'display_name_en' => 'Manage Settings', 'module' => 'settings'],
            ['name' => 'logs.view', 'display_name_bn' => 'অডিট লগ দেখুন', 'display_name_en' => 'View Audit Logs', 'module' => 'logs'],
        ];

        foreach ($permissions as $p) {
            Permission::updateOrCreate(['name' => $p['name']], $p);
        }

        // Roles
        $roles = [
            [
                'name' => 'super_admin',
                'display_name_bn' => 'সুপার অ্যাডমিন',
                'display_name_en' => 'Super Administrator',
                'description' => 'Full access to all system modules and settings.',
                'permissions' => Permission::pluck('name')->toArray(),
            ],
            [
                'name' => 'principal',
                'display_name_bn' => 'অধ্যক্ষ / প্রধান শিক্ষক',
                'display_name_en' => 'Principal / Head Teacher',
                'description' => 'Institution head with full approval, review, and report viewing authority.',
                'permissions' => [
                    'users.view', 'academic.view', 'academic.manage', 'academic.assign_teachers',
                    'lesson_plans.view', 'lesson_plans.create', 'lesson_plans.edit', 'lesson_plans.delete', 'lesson_plans.submit',
                    'lesson_plans.review', 'lesson_plans.approve', 'lesson_plans.return', 'lesson_plans.reject',
                    'lesson_plans.archive', 'templates.view', 'templates.manage',
                    'reports.view', 'reports.export', 'settings.manage',
                    'notices.view', 'notices.create', 'notices.edit', 'notices.delete', 'notices.publish',
                ],
            ],
            [
                'name' => 'academic_coordinator',
                'display_name_bn' => 'একাডেমিক সমন্বয়ক ও ভাইস প্রিন্সিপাল',
                'display_name_en' => 'Academic Coordinator & Vice Principal',
                'description' => 'Department/Academic coordinator & Vice Principals managing teachers, reviewing, and submitting lesson plans.',
                'permissions' => [
                    'users.view', 'academic.view', 'academic.assign_teachers',
                    'lesson_plans.view', 'lesson_plans.create', 'lesson_plans.edit', 'lesson_plans.delete', 'lesson_plans.submit',
                    'lesson_plans.review', 'lesson_plans.approve', 'lesson_plans.return',
                    'lesson_plans.reject', 'templates.view', 'templates.manage',
                    'reports.view', 'reports.export',
                    'notices.view', 'notices.create', 'notices.edit', 'notices.delete', 'notices.publish',
                ],
            ],
            [
                'name' => 'teacher',
                'display_name_bn' => 'বিষয় শিক্ষক',
                'display_name_en' => 'Teacher',
                'description' => 'Subject teacher creating, editing, and submitting lesson plans.',
                'permissions' => [
                    'academic.view', 'lesson_plans.view', 'lesson_plans.create',
                    'lesson_plans.edit', 'lesson_plans.delete', 'lesson_plans.submit',
                    'templates.view', 'reports.view',
                    'notices.view',
                ],
            ],
        ];

        foreach ($roles as $rData) {
            $perms = $rData['permissions'];
            unset($rData['permissions']);

            $role = Role::updateOrCreate(['name' => $rData['name']], $rData);
            $permissionIds = Permission::whereIn('name', $perms)->pluck('id');
            $role->permissions()->sync($permissionIds);
        }
    }
}