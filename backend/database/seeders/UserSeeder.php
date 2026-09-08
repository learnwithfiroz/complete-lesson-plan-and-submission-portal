<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $defaultPassword = Hash::make('Password123!');

        $sciDept = Department::where('code', 'SCI')->first();
        $mathDept = Department::where('code', 'MATH')->first();
        $engDept = Department::where('code', 'ENG')->first();
        $banDept = Department::where('code', 'BAN')->first();
        $ictDept = Department::where('code', 'ICT')->first();

        // 1. Super Admin
        $adminRole = Role::where('name', 'super_admin')->first();
        $admin = User::updateOrCreate(
            ['email' => 'admin@bsisc.edu.bd'],
            [
                'name' => 'System Administrator',
                'password' => $defaultPassword,
                'phone' => '+880 1711-000001',
                'designation' => 'Lead Systems Engineer',
                'is_active' => true,
            ]
        );
        $admin->roles()->sync([$adminRole->id]);

        // 2. Principal / Head Teacher
        $principalRole = Role::where('name', 'principal')->first();
        $principal = User::updateOrCreate(
            ['email' => 'principal@bsisc.edu.bd'],
            [
                'name' => 'Brigadier General (Retd.) Dr. M. Rahman',
                'password' => $defaultPassword,
                'phone' => '+880 1711-000002',
                'designation' => 'Principal & Head of Institution',
                'is_active' => true,
            ]
        );
        $principal->roles()->sync([$principalRole->id]);

        // 3. Academic Coordinator
        $coordinatorRole = Role::where('name', 'academic_coordinator')->first();
        $coordinator = User::updateOrCreate(
            ['email' => 'coordinator@bsisc.edu.bd'],
            [
                'name' => 'Prof. Shamima Nasrin',
                'password' => $defaultPassword,
                'phone' => '+880 1711-000003',
                'designation' => 'Academic Coordinator (Secondary & College)',
                'department_id' => $sciDept?->id,
                'is_active' => true,
            ]
        );
        $coordinator->roles()->sync([$coordinatorRole->id]);

        // 4. Five Teachers
        $teacherRole = Role::where('name', 'teacher')->first();

        $teachers = [
            [
                'email' => 'teacher1@bsisc.edu.bd',
                'name' => 'Mohammad Tanvir Ahmed',
                'phone' => '+880 1711-000004',
                'designation' => 'Senior Teacher (Mathematics)',
                'department_id' => $mathDept?->id,
            ],
            [
                'email' => 'teacher2@bsisc.edu.bd',
                'name' => 'Farhana Yasmin',
                'phone' => '+880 1711-000005',
                'designation' => 'Assistant Teacher (English)',
                'department_id' => $engDept?->id,
            ],
            [
                'email' => 'teacher3@bsisc.edu.bd',
                'name' => 'Kazi Nazmul Huda',
                'phone' => '+880 1711-000006',
                'designation' => 'Senior Teacher (Physics & Science)',
                'department_id' => $sciDept?->id,
            ],
            [
                'email' => 'teacher4@bsisc.edu.bd',
                'name' => 'Nusrat Jahan',
                'phone' => '+880 1711-000007',
                'designation' => 'Assistant Teacher (Bangla)',
                'department_id' => $banDept?->id,
            ],
            [
                'email' => 'teacher5@bsisc.edu.bd',
                'name' => 'Mahbubur Rahman',
                'phone' => '+880 1711-000008',
                'designation' => 'Lecturer (ICT)',
                'department_id' => $ictDept?->id,
            ],
        ];

        foreach ($teachers as $tData) {
            $t = User::updateOrCreate(
                ['email' => $tData['email']],
                array_merge($tData, [
                    'password' => $defaultPassword,
                    'is_active' => true,
                ])
            );
            $t->roles()->sync([$teacherRole->id]);
        }
    }
}