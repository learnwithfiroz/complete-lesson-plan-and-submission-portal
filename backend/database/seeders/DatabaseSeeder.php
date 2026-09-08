<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleAndPermissionSeeder::class,
            DepartmentSeeder::class,
            UserSeeder::class,
            StaffAndTeacherSeeder::class,
            SettingSeeder::class,
            AcademicSeeder::class,
            LessonPlanSeeder::class,
            NoticeSeeder::class,
            FormSchemaSeeder::class,
        ]);
    }
}